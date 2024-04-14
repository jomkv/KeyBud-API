import multer from "multer";
import BadRequestError from "../errors/BadRequestError";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    // set file name to curr date + original file name
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req: Request, file: any, cb: any) => {
  // TODO: check for other images instead of just jpeg
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new BadRequestError("Invalid image file"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export default upload;
