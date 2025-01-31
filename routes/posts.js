import express from "express";
import Post from "../models/Post.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const router = express.Router();

// add post
cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.Api_Key,
  api_secret: process.env.Api_Secret,
});

router.post("/add", async (req, res) => {
  try {
    const { image, caption, userId, username } = req.body;

    // Upload the base64 image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${image}`,
      {
        folder: "posts",
      }
    );

    // Save the post in your database (make sure to include the image URL)
    const post = new Post({
      caption,
      userId,
      username,
      imageUrl: result.secure_url, // URL returned by Cloudinary
    });

    await post.save();
    res.status(200).json({ message: "Post submitted successfully", post });
  } catch (error) {
    console.error("❌ Error uploading post:", error);
    res
      .status(500)
      .json({ error: "Error submitting post", details: error.message });
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
