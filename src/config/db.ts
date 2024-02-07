import mongoose, { ConnectOptions } from "mongoose";

const connectDB = async (): Promise<void> => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGO_URI) {
    console.log("MongoDB connection string not found");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`DB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export default connectDB;
