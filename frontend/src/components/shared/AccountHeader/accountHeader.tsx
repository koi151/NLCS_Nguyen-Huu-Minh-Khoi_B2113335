import { Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { resetAdminUserState } from "../../../redux/reduxSlices/adminUserSlice";

import './accountHeader.scss'
import { resetClientUserState } from "../../../redux/reduxSlices/clientUserSlice";
import adminAuthorizationService from "../../../services/admin/authorization.service";
import clientAuthorizationService from "../../../services/client/authorization.service";
import { MdAttachMoney, MdLockOutline, MdLogout } from "react-icons/md";
import { FaRegHeart, FaRegUser } from "react-icons/fa";
import { LuNewspaper } from "react-icons/lu";
import { RootState } from "../../../redux/stores";

interface AccountHeaderProps {
  userType: 'admin' | 'client';
  navigateTo: string;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({ userType, navigateTo }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const avatarUrl = useSelector((state: any) =>
    userType === 'admin' ? state.adminUser.avatar : state.clientUser.avatar
  );

  const userName = useSelector((state: any) =>
    userType === 'admin' ? state.adminUser.fullName : state.clientUser.userName
  );

  const currentClientAccBalance = useSelector((state: any) =>
    userType !== 'admin' && state.clientUser.wallet?.balance
  );

  const handleLogoutClick = async () => {
    try {
      if (userType === 'admin') {
        await adminAuthorizationService.logout();
        dispatch(resetAdminUserState())

      } else {
        await clientAuthorizationService.logout();
        dispatch(resetClientUserState())
      }

      message.success('Account logout successful!', 3);
      navigate(navigateTo);

    } catch (err) {
      console.log("Error occurred:", err);
      message.error('Error occurred, cannot log out');
    }
  };

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  return (
    <div className="navigation">

      {/* <div className="button"> */}
        <img 
          className={`avatar-header ${userType === "admin" && 'avatar-header-custom'}`}
          src={avatarUrl ? avatarUrl : 'http://res.cloudinary.com/dd3xua0wu/image/upload/v1707278464/af49qenxpqoxdijei6s5.jpg'}
          alt='avatar-header'
        />
          <Select
            size="large"
            className={`logout ${userType === 'admin' ? 'mr-6' : ''}`}
            defaultValue={userName}
            style={{ width: "65rem", marginRight: "4rem"}}
            onChange={handleChange}
            options={[
              {
                label: <span>Account</span>,
                title: 'manager',
                options: [
                  { 
                    label: (
                      <Link to={`${userType === 'admin' ? '/admin/accounts/my-detail/edit' : '/accounts/my-detail/edit'}`} className="custom-link-wrap">
                        <span>Current balance</span>
                        <span>
                          {userType === 'admin' 
                            ? 'unlimited' 
                            : currentClientAccBalance && '$' + currentClientAccBalance.toFixed(0)
                          }
                        </span>
                      </Link>
                    ),
                    value: 'currentBalance',
                    disabled: true
                  },
                  { 
                    label: (
                      <Link to={`${userType === 'admin' ? '/admin/accounts/my-detail/edit' : '/accounts/my-detail/edit'}`} className="custom-link-wrap">
                        <span>Personal info</span>
                        <FaRegUser className="custom-icon-nav" style={{fontSize: "1.3rem"}}/>
                      </Link>
                    ),
                    value: 'personalInfo' 
                  },
                  { 
                    label: (
                      <Link to={`${userType === 'admin' ? '/admin/deposit' : '/deposit'}`}  className="custom-link-wrap">
                        <span>Deposit money</span>
                        <MdAttachMoney className="custom-icon-nav" style={{fontSize: "1.6rem"}}/>
                      </Link>
                    ),
                    value: 'deposit' 
                  },
                  { 
                    label: (
                      <div className="d-flex justify-content-between align-items-center" style={{width: "100%"}}>
                        <span>Change password</span>
                        <MdLockOutline className="custom-icon-nav" style={{fontSize: "1.5rem"}}/>
                      </div>
                    ),
                    value: 'changePassword' 
                  },
                ],
              },
              {
                label: <span>Posts management</span>,
                title: 'manager',
                options: [
                  { 
                    label: (
                      <Link to={`${userType === 'admin' ? '/admin/properties/my-properties' : '/properties/my-properties'}`} className="custom-link-wrap">
                        <span>Current posts</span>
                        <LuNewspaper className="custom-icon-nav"/>
                      </Link>
                    ),
                    value: 'currentPosts' 
                  },
                  { 
                    label: (
                      <Link to={`${userType === 'admin' ? '/admin/properties/my-favorites' : '/properties/my-favorites'}`} className="custom-link-wrap">
                        <span>Favorited posts</span>
                        <FaRegHeart className="custom-icon-nav"/>
                      </Link>
                    ),
                    value: 'favoritePosts' 
                  },
                ],
              },
              {
                label: <span>Login</span>,
                title: 'engineer',
                options: [
                  { 
                    label: (
                      <div 
                        onClick={handleLogoutClick}
                        className="d-flex justify-content-between align-items-center" 
                        style={{width: "100%"}}
                      >
                        <span>Logout</span>
                        <MdLogout className="custom-icon-nav"/>
                      </div>
                    ), 
                    value: 'Chloe' 
                  },
                ],
              },
            ]}
          />

      {/* </div> */}
    </div>
  )
}

export default AccountHeader;