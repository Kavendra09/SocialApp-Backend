import express from "express";
import Post from "../models/Post.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "public", "uploads");
    cb(null, uploadDir); // Set destination folder for file upload
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName); // Set filename for the uploaded file
  },
});

const upload = multer({ storage: storage }); // Multer middleware

cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.Api_Key,
  api_secret: process.env.Api_Secret,
});

// Function to upload file to Cloudinary and delete local file
const uploadFileAndDeleteLocal = (filePath) => {
  return cloudinary.uploader
    .upload(filePath, { folder: "posts" })
    .then((result) => {
      // If the upload is successful, delete the local file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting the file:", err);
        } else {
          console.log(`Successfully deleted local file: ${filePath}`);
        }
      });
      return result.secure_url; // Return the Cloudinary URL of the uploaded file
    })
    .catch((error) => {
      console.error("Error uploading file to Cloudinary:", error);
      throw error; // Propagate the error if upload fails
    });
};

// Post route to handle file upload and save post data
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { caption, userId, username } = req.body;
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      req.file.filename
    );

    // Upload to Cloudinary and get the URL
    const imageUrl = await uploadFileAndDeleteLocal(filePath);

    // Create a new post (Save to your database, assuming you have a Post model)
    const post = new Post({
      caption,
      userId,
      username,
      imageUrl,
    });

    await post.save();

    res.status(200).json({ message: "Post submitted successfully", post });
  } catch (error) {
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
