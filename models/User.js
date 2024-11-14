import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      max: 50,
      required: true,
    },
    emailId: {
      type: String,
      max: 50,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      max: 10,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      max: 50,
      required: true,
    },
    gender: {
      type: String,
      max: 50,
      required: true,
    },
    dob: {
      type: String,
      max: 50,
    },
    address: {
      type: String,
      max: 50,
    },
    profilePic: {
      type: String,
      default: "",
    },
    coverPic: {
      type: String,
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

export default model("User", UserSchema);
