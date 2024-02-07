import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRouter from "./routes/user.route";

dotenv.config();
const app: Application = express();
const port: Number = Number(process.env.PORT);

connectDB();

app.use(express.urlencoded({ extended: false })); // allow destructuring of req.body

app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Connected successfully on port ${port}`);
});
