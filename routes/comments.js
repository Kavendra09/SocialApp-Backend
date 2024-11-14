import Comment from "../models/Comment.js";
import express from 'express'

const router = express.Router()

// add comment
router.post("/add", async (req, res) => {
  try {
    const newComment = new Comment({
      comment: req.body.comment,
      userId: req.body.userId,
      postId: req.body.postId,
      username: req.body.username,
    });
    await newComment.save();
    res
      .status(200)
      .json({ status: true, message: "comment added successfully" });
  } catch (error) {
    res.status(500).json(err);
  }
});

// delete comment

router.delete("/delete/:id", async (req, res) => {
  try {
    const comment = await findOne({ _id: req.params.id });
    if (comment) {
      findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res
            .status(200)
            .json({ status: true, message: "comment deleted successfully" });
        })
        .catch((err) => {
          res.status(201).json(err);
        });
    } else {
      res.status(201).json({ status: false, message: "no comment found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all comment by post

router.get("/get/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await find({ postId });
    if (!postId) {
      res.status(200).json({ status: false, message: "Post is not found" });
    }
    if (comments.length === 0) {
      res
        .status(404)
        .json({ staus: false, message: "No comments found for this user" });
    }
    res.status(200).json({
      status: true,
      message: "Posts fetched succesfully",
      data: comments,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// update comment

router.put("/update/:id", async (req, res) => {
  try {
    findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }).then(
      () => {
        res
          .status(200)
          .json({
            status: true,
            message: "Comment updated successfully",
          });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
