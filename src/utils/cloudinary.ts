import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import DatabaseError from "../errors/DatabaseError";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // use https
});

export const uploadImage = async (imagePath: string) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    // Make req to cloudinary's api to upload image
    const res = await cloudinary.uploader.upload(imagePath, options);
    return res.url;
  } catch (err) {
    throw new DatabaseError();
  }
};

export const getImageInfo = async (publicId: string) => {};
