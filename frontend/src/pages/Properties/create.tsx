import { Button, Card, Col, Form, Input, InputNumber, Radio, Row, Segmented, Select, message } from "antd";
import React, { useState } from "react";
import { Editor } from '@tinymce/tinymce-react';
import { SegmentedValue } from "antd/es/segmented";

import propertiesService from "../../services/admin/properties.service";
import { Link } from "react-router-dom";
import './create.scss'
import GetAddress from "../../components/getAddress/getAddress";

const CreateProperty: React.FC = () => {
  const [postType, setPostType] = useState<string>('sell');
  const [propertyWidth, setPropertyWidth] = useState<number | null>(null);
  const [propertyLength, setPropertyLength] = useState<number | null>(null);
  const [priceMultiplier, setPriceMultiplier] = useState<number>(1);
  const [editorContent, setEditorContent] = useState<string>("");
  
  const propertyCategoryOptions = [
    { value: 'townHouse', label: 'Town house' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
  ]

  // const cityOptions = [
  //   { value: 'anGiang', label: 'An Giang' },
  //   { value: 'bacGiang', label: 'Bac Giang' },
  //   { value: 'bacKan', label: 'Bac Kan' },
  //   { value: 'bacLieu', label: 'Bac Lieu' },
  //   { value: 'bacNinh', label: 'Bac Ninh' },
  //   { value: 'benThuy', label: 'Ben Thuy' },
  //   { value: 'benTre', label: 'Ben Tre' },
  //   { value: 'bienHoa', label: 'Bien Hoa' },
  //   { value: 'buonMeThuot', label: 'Buon Me Thuot' },
  //   { value: 'caMau', label: 'Ca Mau' },
  //   { value: 'canTho', label: 'Can Tho' },
  //   { value: 'caoBang', label: 'Cao Bang' },
  //   { value: 'chiLinh', label: 'Chi Linh' },
  //   { value: 'daLat', label: 'Da Lat' },
  //   { value: 'daNang', label: 'Da Nang' },
  //   { value: 'dienBienPhu', label: 'Dien Bien Phu' },
  //   { value: 'dongHa', label: 'Dong Ha' },
  //   { value: 'giaNghia', label: 'Gia Nghia' },
  //   { value: 'haLong', label: 'Ha Long' },
  //   { value: 'haiDuong', label: 'Hai Duong' },
  //   { value: 'haiPhong', label: 'Hai Phong' },
  //   { value: 'hoaBinh', label: 'Hoa Binh' },
  //   { value: 'hoChiMinhCity', label: 'Ho Chi Minh City' },
  //   { value: 'hoiAn', label: 'Hoi An' },
  //   { value: 'hungYen', label: 'Hung Yen' },
  //   { value: 'konTum', label: 'Kon Tum' },
  //   { value: 'laGi', label: 'La Gi' },
  //   { value: 'laiChau', label: 'Lai Chau' },
  //   { value: 'langSon', label: 'Lang Son' },
  //   { value: 'longXuyen', label: 'Long Xuyen' },
  //   { value: 'mongCai', label: 'Mong Cai' },
  //   { value: 'myTho', label: 'My Tho' },
  //   { value: 'namDinh', label: 'Nam Dinh' },
  //   { value: 'nhaTrang', label: 'Nha Trang' },
  //   { value: 'ninhBinh', label: 'Ninh Binh' },
  //   { value: 'phanRang', label: 'Phan Rang' },
  //   { value: 'phanThiet', label: 'Phan Thiet' },
  //   { value: 'pleiku', label: 'Pleiku' },
  //   { value: 'quiNhon', label: 'Qui Nhon' },
  //   { value: 'quangBinh', label: 'Quang Binh' },
  //   { value: 'quangNgai', label: 'Quang Ngai' },
  //   { value: 'rachGia', label: 'Rach Gia' },
  //   { value: 'saDec', label: 'Sa Dec' },
  //   { value: 'saPa', label: 'Sa Pa' },
  //   { value: 'socTrang', label: 'Soc Trang' },
  //   { value: 'sonLa', label: 'Son La' },
  //   { value: 'songCau', label: 'Song Cau' },
  //   { value: 'tanAn', label: 'Tan An' },
  //   { value: 'tayNinh', label: 'Tay Ninh' },
  //   { value: 'thaiBinh', label: 'Thai Binh' },
  //   { value: 'thaiNguyen', label: 'Thai Nguyen' },
  //   { value: 'thanhHoa', label: 'Thanh Hoa' },
  //   { value: 'thuDauMot', label: 'Thu Dau Mot' },
  //   { value: 'traVinh', label: 'Tra Vinh' },
  //   { value: 'tuyenQuang', label: 'Tuyen Quang' },
  //   { value: 'tuyHoa', label: 'Tuy Hoa' },
  //   { value: 'vietTri', label: 'Viet Tri' },
  //   { value: 'vinh', label: 'Vinh' },
  //   { value: 'vinhLong', label: 'Vinh Long' },
  //   { value: 'vinhYen', label: 'Vinh Yen' },
  //   { value: 'vungTau', label: 'Vung Tau' },
  //   { value: 'yenBai', label: 'Yen Bai' },
  //   { value: 'yenVinh', label: 'Yen Vinh' },
  // ];  

  const handlePropertyLengthChange = (value: number | null) => {
    setPropertyLength(value);
  };

  const handlePropertyWidthChange  = (value: number | null) => {
    setPropertyWidth(value);
  };

  const handlePriceUnitChange = (value: string) => {
    setPriceMultiplier(value === 'million' ? 1 : 1000);
  };

  const selectPriceUnit = (
    <Select defaultValue="million" onChange={handlePriceUnitChange}>
      <Select.Option value="million">million</Select.Option>
      <Select.Option value="billion">billion</Select.Option>
    </Select>
  );

  const handleChangeListingType = (value: SegmentedValue) => {
    const formatedValue = value = "For sale" ? 'sell' : "hire"
    setPostType(formatedValue)
  }

  const handleEditorChange = (content: any, editor: any) => {
    const contentString = typeof content === 'string' ? content : '';
    setEditorContent(contentString);
  };

  const onFinishForm = async (data: any) => {
    try {
      data["location"] = {
        city: data.city,
        district: data.district,
        address: data.address
      }
      delete data.city;
      delete data.district;
      delete data.address;

      data["area"] = {
        propertyWidth: data.propertyWidth,
        propertyLength: data.propertyLength,
      }
      delete data.width;
      delete data.length;

      data['propertyDetails'] = {
        propertyType: data.propertyType
      }
      delete data.propertyType;

      data['description'] = editorContent;
      data.price = priceMultiplier * data.price;
      
      // etc: For rent => forRent
      const words = data.listingType.split(' ');
      data.listingType = `${words[0].charAt(0).toLowerCase()}${words[0].slice(1)}${words[1].charAt(0).toUpperCase()}${words[1].slice(1)}`;

      const response = await propertiesService.createProperty(data);
      
      if (response.code === 200) {
        message.success("Property created successfully !", 3);
      } else {
        message.error(response.message, 3)
      }

    } catch (error) {
      message.error("Error occured while creating new property.")
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center">
      <Card 
        title="Create Property"
        className="custom-card" 
        extra={<Link to="/admin/properties">Back</Link>}
      >
        <Form layout="vertical" onFinish={onFinishForm} >
          <Row gutter={16}>
            <Col span={24} className="mb-5">
              <Form.Item 
                label='Choose listing type' 
                name='listingType' 
                initialValue={'For sale'}
                style={{height: "4.5rem"}}
              >
                <Segmented 
                  options={['For sale', 'For rent']} 
                  block 
                  className="custom-segmented"
                  onChange={handleChangeListingType}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item 
                label={<span>Post title <b className="required-txt">- required:</b></span>}
                name='title'
              >
                <Input type="text" id="title" required />
              </Form.Item>
            </Col>

            <Col span={24}>
              <GetAddress />
            </Col>

            <Col sm={24} md={12} lg={8} xl={8} xxl={8}>
              <Form.Item label='Property length' name='propertyLength'>
                <InputNumber 
                  type="number" min={0} 
                  onChange={handlePropertyLengthChange}
                  className="custom-number-input" 
                  placeholder="Enter length of property"
                />
              </Form.Item>
            </Col>
            <Col sm={24} md={12} lg={8} xl={8} xxl={8}>
              <Form.Item label='Property width' name='propertyWidth'>
                <InputNumber 
                  type="number" min={0} 
                  className="custom-number-input" 
                  onChange={handlePropertyWidthChange}
                  placeholder="Enter width of property"
                />
              </Form.Item>
            </Col>
            <Col sm={24} md={12} lg={8} xl={8} xxl={8}>
              <Form.Item label='Area'>
                <InputNumber 
                  disabled 
                  type="number" min={0} 
                  className="custom-number-input" 
                  placeholder="Enter width and height"
                  value={propertyLength && propertyWidth && propertyLength * propertyWidth}
                />
              </Form.Item>
            </Col>

            <Col sm={24} md={12} lg={12} xl={12} xxl={12}>
              <Form.Item label='Property type' name='propertyType'>
                <Select
                  placeholder='Please select property type'
                  style={{ width: "100%" }}
                  options={propertyCategoryOptions}
                />
              </Form.Item> 
            </Col>
            <Col sm={24} md={12} lg={12} xl={12} xxl={12}>
              <Form.Item label={`Property ${postType} price`} name='price'>
                <Input 
                  addonAfter={selectPriceUnit} 
                  placeholder={`Please select property ${postType} price`} 
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item label={`Property ${postType}ing description:`}>
                <Editor
                  id="description" 
                  value={editorContent}
                  onEditorChange={handleEditorChange}
                  apiKey='zabqr76pjlluyvwebi3mqiv72r4vyshj6g0u07spd34wk1t2' // hide
                  init={{
                    toolbar_mode: 'sliding', 
                    plugins: ' anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount', 
                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat', 
                    tinycomments_mode: 'embedded', tinycomments_author: 'Author name', mergetags_list: [ { value: 'First.Name', title: 'First Name' }, { value: 'Email', title: 'Email' }, ], 
                  }}
                />
              </Form.Item>
            </Col>
            <Col sm={24} md={24} lg={12} xl={12} xxl={12}>
              <Form.Item label="Post type:" name='postType' initialValue={'default'}>
                <Radio.Group>
                  <Radio value="default"> Default </Radio>
                  <Radio value="preminum"> Preminum </Radio>
                  <Radio value="featured"> Featured </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col sm={24} md={24} lg={12} xl={12} xxl={12}>
              <Form.Item label="Property status:" name='status' initialValue={'active'}>
                <Radio.Group>
                  <Radio value="active">Active</Radio>
                  <Radio value="inactive">Inactive</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col sm={24} md={24}  lg={12} xl={12} xxl={12}>
              <Form.Item label="Post expire after:" name='expireAt' initialValue={''}>
                <Radio.Group>
                  <Radio value="day">1 day</Radio>
                  <Radio value="week">1 week</Radio>
                  <Radio value="month">1 month</Radio>
                  <Radio value="">None</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col sm={24} md={24}  lg={12} xl={12} xxl={12}>
              <Form.Item label="Post position:" name='position'>
                <InputNumber 
                  type="number"
                  id="position" 
                  min={0} 
                  className="custom-number-input position-input"
                  placeholder='Auto increase by default'
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}

export default CreateProperty;