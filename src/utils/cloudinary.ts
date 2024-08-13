import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";
import DatabaseError from "../errors/DatabaseError";
import IPhoto from "../@types/photoType";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // use https
});

export const uploadImage = async (imageBuffer: Buffer): Promise<IPhoto> => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    // Upload using buffer
    return await new Promise((resolve, reject) =>
      // * TODO: apply options
      cloudinary.uploader
        .upload_stream((error, res: UploadApiResponse) => {
          if (error) {
            throw new DatabaseError();
          }

          const photo: IPhoto = {
            url: res.url,
            id: res.public_id,
          };

          return resolve(photo);
        })
        .end(imageBuffer)
    );
  } catch (err) {
    throw new DatabaseError();
  }
};

export const getImageInfo = async (publicId: string) => {};
