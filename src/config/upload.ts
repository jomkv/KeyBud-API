import multer from "multer";
import BadRequestError from "../errors/BadRequestError";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: any, cb: any) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/svg+xml" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Invalid image file"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10mb
  },
});

export default upload;
