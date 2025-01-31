import express, { json } from "express";
import bodyParser from "body-parser";
const app = express();

import morgan from "morgan";
import { config } from "dotenv";
import { connect } from "mongoose";
import helmet from "helmet";
import userRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import postRouter from "./routes/posts.js";
import commentRouter from "./routes/comments.js";
import cors from "cors";

config();
const allowedOrigins = [
  "http://localhost:8200", // Localhost for development
  "https://socialapp-backend-s2ic.onrender.com", // Production domain on Render
];

// Enable CORS for specific origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        // Allow requests with no origin (e.g. mobile apps or Postman)
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

connect(process.env.BASE_URL).then(() => {
  console.log("mongo db database is connected  ✅✅✅");
});
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(json());
app.use(helmet());
app.use(morgan("common"));

app.use("/socialApp/api/users", userRouter);

app.use("/socialApp/api/auth", authRouter);

app.use("/socialApp/api/post", postRouter);

app.use("/socialApp/api/post/comment", commentRouter);

app.listen(8200, () => {
  console.log("app is running on " + 8200);
});
