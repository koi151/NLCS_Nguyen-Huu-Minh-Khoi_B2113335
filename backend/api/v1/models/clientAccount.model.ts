import mongoose from 'mongoose';
import { statusValues } from '../../../commonTypes';

const clientAccountSchema = new mongoose.Schema(
  {
    userName: String,
    fullName: String,
    password: String,
    email: String,
    phone: String,
    avatar: String,
    status: {
      type: String,
      enum: statusValues
    }, 
    social: {
      zaloLink: String,
    },
    postList: [String],
    favoritePosts: [String],
    wallet: {
      balance: Number,  
    },
    createdAt: Date,
    updatedAt: Date,
    deleted: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

const ClientAccount = mongoose.model("clientAccount", clientAccountSchema, "client-accounts");

export default ClientAccount;


