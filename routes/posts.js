import express from "express";
import pkg from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from "multer";
import Post from "../models/Post.js";
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router();
const { v2: cloudinary } = pkg;

cloudinary.config({
  cloud_name: "dmmtivqan",
  api_key: "161289169244717",
  api_secret: process.env.Cloudnary_Secret_Key,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts", 
    format: async () => "png", 
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});

const upload = multer({ storage });

// add post
router.post("/add", upload.single("imageUrl"), async (req, res) => {
  try {
    const { userId, username, caption } = req.body;

    if (!userId || !username) {
      return res.status(400).json({
        status: false,
        message: "Username and userId are required fields.",
      });
    }

    const newPost = new Post({
      userId,
      username,
      caption,
      imageUrl: req.file?.path,
    });

    await newPost.save();
    res.status(200).json({ status: true, message: "Post added successfully" });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json(error);
  }
});

// update post

router.post("/update/:id", async (req, res) => {
  try {
    const post = await findById(req.params.id);
    if (!post) {
      res.status(200).json({ status: false, message: "Post is not found" });
    }
    if (!req.body.caption) {
      res.status(200).json({ status: false, message: "Caption is required" });
    }
    if (req.body.caption === post.caption) {
      return res.status(400).json({ message: "Caption has not changed" });
    }
    post.caption = req.body.caption;
    await post.save();

    res
      .status(200)
      .json({ status: true, message: "Post updated successfully", data: post });
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete post

router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedPost = await findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      res.status(200).json({ status: true, message: "Post is not found " });
    }
    res.status(200).json({ status: true, message: "Post is deleted" });
  } catch (error) {
    res.status(200).json({ status: true, message: "Post is deleted" });
  }
});
// get post details by id

router.get("/postById/:id", async (req, res) => {
  try {
    const postId = await findById(req.params.id);
    const post = await findOne(req.body);
    if (!postId) {
      res.status(200).json({ status: false, message: "Post is not found" });
    }

    res.status(200).json({ status: true, data: post });
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all posts

router.get("/get", (req, res) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        status: true,
        message: "posts fetched successfully!",
        data: posts,
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// like post
router.put("/like/:id", async (req, res) => {
  try {
    const post = await findOne({ _id: req.params.id });
    let isLiked = false;
    post.likes.map((item) => {
      if (item == req.body.userId) {
        isLiked = true;
      }
    });

    if (isLiked) {
      const res1 = await updateOne(
        { _id: req.params.id },
        { $pull: { likes: req.body.userId } }
      );
      res
        .status(200)
        .json({ status: true, message: "like removed successfully" });
    } else {
      const res1 = await updateOne(
        { _id: req.params.id },
        { $push: { likes: req.body.userId } }
      );
      res
        .status(200)
        .json({ status: true, message: " post like successfully" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// comment

export default router;
