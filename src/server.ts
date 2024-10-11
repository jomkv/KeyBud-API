// * Third party dependencies
import express, { Application } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { io } from "./config/socket";

// * Local Imports
import connectDB from "./config/db";
import errorHandler from "./middlewares/error";
import userRouter from "./routes/userRoute";
import postsRouter from "./routes/postsRoute";
import commentRouter from "./routes/commentRoute";
import messageRouter from "./routes/messageRoute";
import searchRouter from "./routes/searchRoute";

// * App
dotenv.config();
const app: Application = express();
const port: Number = Number(process.env.PORT);

// * Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", String(process.env.CLIENT_URL)],
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false })); // allow destructuring of req.body
app.use(express.json());

app.use(cookieParser());

// * Routes
app.use("/api/user", userRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comment", commentRouter);
app.use("/api/message", messageRouter);
app.use("/api/search", searchRouter);

app.all(
  "*",
  asyncHandler(() => {
    throw new Error("This endpoint does not exist");
  })
);

app.use(errorHandler);

connectDB().then(() => {
  const server = app.listen(port, () => {
    console.log(`Connected successfully on port ${port}`);
  });
  io.attach(server);
  app.set("io", io);
});

// export default app;
