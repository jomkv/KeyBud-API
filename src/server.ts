import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRouter from "./routes/user.route";
import postsRouter from "./routes/posts.route";
import errorHandler from "./middlewares/error.middleware";

dotenv.config();
const app: Application = express();
const port: Number = Number(process.env.PORT);

app.use(express.urlencoded({ extended: false })); // allow destructuring of req.body

app.use("/api/auth", userRouter);
app.use("/api/posts", postsRouter);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Connected successfully on port ${port}`);
  });
});
