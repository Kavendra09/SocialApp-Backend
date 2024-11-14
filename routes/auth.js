import express from 'express'
import User  from "../models/User.js";
import { genSalt, hash, compare } from "bcrypt";

const router = express.Router()

// register

router.post("/register", async (req, res) => {
  try {
    const salt = await genSalt(10);
    const hashedPassword = await hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      emailId: req.body.emailId,
      mobile: req.body.mobile,
      gender: req.body.gender,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.body.emailId });
    !user && res.status(200).json({ status: false, message: "User not Found" });
    if (user) {
      const validPassword = await compare(
        req.body.password,
        user.password
      );
      if (validPassword) {
        res.status(200).json({
          status: true,
          message: "User found successfully",
          data: user,
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Wrong Password",
        });
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
