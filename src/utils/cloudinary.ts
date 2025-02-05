import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";
import IPhoto from "../@types/photoType";
import BadRequestError from "../errors/BadRequestError";
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
            throw new BadRequestError(
              "Something went wrong while uploading image"
            );
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
    throw new BadRequestError("Something went wrong while uploading image");
  }
};

export const uploadImages = async (
  images: Express.Multer.File[]
): Promise<IPhoto[]> => {
  return await Promise.all(
    images.map(async (image: Express.Multer.File) => uploadImage(image.buffer))
  );
};

export const deleteImages = async (images: IPhoto[]): Promise<void> => {
  try {
    const public_ids: string[] = images.map((image) => image.id);

    await cloudinary.api.delete_resources(public_ids);
  } catch (err) {
    // do nothing if error
  }
};

export const getImageInfo = async (publicId: string) => {};
