// * Third party dependencies
import express, { Application, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import cors from "cors";

// * Local Imports
import connectDB from "./config/db";
import userRouter from "./routes/user.route";
import postsRouter from "./routes/posts.route";
import errorHandler from "./middlewares/error.middleware";

dotenv.config();
const app: Application = express();
const port: Number = Number(process.env.PORT);

app.use(cors());
app.use(express.urlencoded({ extended: false })); // allow destructuring of req.body

app.use("/api/auth", userRouter);
app.use("/api/posts", postsRouter);

app.all(
  "*",
  asyncHandler(() => {
    throw new Error("This endpoint does not exist");
  })
);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Connected successfully on port ${port}`);
  });
});

export default app;
