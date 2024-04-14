import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // use https
});

export const uploadImage = async (imagePath: string) => {
  try {
    // Make req to cloudinary's api to upload image
    const res = await cloudinary.uploader.upload(imagePath);
    console.log(res);
    return res.public_id;
  } catch (err) {
    return null;
  }
};
