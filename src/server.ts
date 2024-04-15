// * Third party dependencies
import express, { Application } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import cors from "cors";
// import multer from "multer";

// * Local Imports
import connectDB from "./config/db";
import errorHandler from "./middlewares/error";
import userRouter from "./routes/userRoute";
import postsRouter from "./routes/postsRoute";
import commentRouter from "./routes/commentRoutes";

// * App
dotenv.config();
const app: Application = express();
const port: Number = Number(process.env.PORT);

// * Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false })); // allow destructuring of req.body

// * Routes
app.use("/api/user", userRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comment", commentRouter);

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

// export default app;
