import { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {
    caption: {
      type: String,
      max: 200,
    },
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

export default model("Post", PostSchema);
