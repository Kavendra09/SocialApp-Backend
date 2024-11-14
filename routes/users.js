import express from 'express';
import User from '../models/User.js';
import { genSalt, hash } from 'bcrypt';
import { isValidObjectId } from 'mongoose';

const router = express.Router();

// Update user
router.put('/update/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ status: false, message: 'Invalid ID format' });
    }

    if (req.body.password) {
      const salt = await genSalt(10);
      req.body.password = await hash(req.body.password, salt);
    }

    await User.findOneAndUpdate({ _id: req.params.id }, { $set: req.body });
    res.status(200).json({ status: true, message: 'User data successfully updated' });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete user
router.delete('/delete/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ status: false, message: 'Invalid ID format' });
    }

    const user = await User.findById(req.params.id);
    if (user) {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ status: true, message: 'User deleted' });
    } else {
      res.status(404).json({ status: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get all users
router.get('/get', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get user by ID
router.get('/getUser/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ status: false, message: 'Invalid ID format' });
    }

    const user = await User.findById(req.params.id);
    if (user) {
      res.status(200).json({
        status: true,
        message: 'User fetched successfully',
        data: user,
      });
    } else {
      res.status(404).json({ status: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Follow/Unfollow a user
router.put('/follow/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    const currentUser = await User.findOne({ _id: req.body.userId });

    let isFollowed = user.followers.includes(req.body.userId);

    if (isFollowed) {
      await User.updateOne(
        { _id: req.params.id },
        { $pull: { followers: req.body.userId } }
      );
      await User.updateOne(
        { _id: req.body.userId },
        { $pull: { following: req.params.id } }
      );
      res.status(200).json({ status: false, message: 'User unfollowed successfully' });
    } else {
      await User.updateOne(
        { _id: req.params.id },
        { $push: { followers: req.body.userId } }
      );
      await User.updateOne(
        { _id: req.body.userId },
        { $push: { following: req.params.id } }
      );
      res.status(200).json({ status: true, message: 'User followed successfully' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
