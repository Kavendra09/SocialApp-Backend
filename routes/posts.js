import express from "express";
import Post from "../models/Post.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cors from "cors";

dotenv.config();

const router = express.Router();

router.use(cors());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.Api_Key,
  api_secret: process.env.Api_Secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts",
    format: async (req, file) => "jpeg", 
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

const upload = multer({ storage: storage });

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { caption, userId, username } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imageUrl = req.file.path; // Cloudinary URL

    const newPost = new Post({
      caption,
      userId,
      username,
      imageUrl,
      likes: [],
      comments: [],
      createdAt: new Date(),
    });

    await newPost.save();

    res.status(201).json({ message: "Post added successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update post

router.post("/update/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
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
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
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
    const postId = await Post.findById(req.params.id);
    const post = await Post.findOne(req.body);
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
    const post = await Post.findOne({ _id: req.params.id });
    let isLiked = false;
    post.likes.map((item) => {
      if (item == req.body.userId) {
        isLiked = true;
      }
    });

    if (isLiked) {
      const res1 = await Post.updateOne(
        { _id: req.params.id },
        { $pull: { likes: req.body.userId } }
      );
      res
        .status(200)
        .json({ status: true, message: "like removed successfully" });
    } else {
      const res1 = await Post.updateOne(
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
