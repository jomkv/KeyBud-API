import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError";

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.StatusCode).json(err.serialize());
  }
  // Default status code to 500 if non-existent
  let statusCode: number = res.statusCode ? res.statusCode : 500;

  return res.status(statusCode).json({
    message: err.message,
    stack: err.stack,
  });
};

export default errorHandler;
