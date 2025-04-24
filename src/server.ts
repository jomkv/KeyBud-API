// * Third party dependencies
import express, { Application, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

// * Config
import { io } from "./config/socket";
import passport from "./config/passportConfig";

// * Local Imports
import connectDB from "./config/db";
import errorHandler from "./middlewares/error";
import userRouter from "./routes/userRoute";
import postsRouter from "./routes/postsRoute";
import commentRouter from "./routes/commentRoute";
import messageRouter from "./routes/messageRoute";
import searchRouter from "./routes/searchRoute";
import authRouter from "./routes/authRoute";

// * App
const app: Application = express();
const port: Number = Number(process.env.PORT);
//app.set("trust proxy", 1);

// * Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://keybud.jomkv.tech",
      "https://www.keybud.jomkv.tech",
      "https://keybud-4vxei3fof-jomkvs-projects.vercel.app",
    ],
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false })); // allow destructuring of req.body
app.use(express.json());

app.use(cookieParser());
app.use(passport.initialize());

// * Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Hello Keyboard Warrior!");
});
app.use("/api/user", userRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comment", commentRouter);
app.use("/api/message", messageRouter);
app.use("/api/search", searchRouter);
app.use("/api/auth", authRouter);

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
