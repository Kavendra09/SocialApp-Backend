import { Schema, model } from "mongoose";

const CommentSchema = new Schema(
  {
    comment: {
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
    postId: {
        type: String,
        required: true
    }
    },
  { timestamps: true }
);

export default model("Comment", CommentSchema);
