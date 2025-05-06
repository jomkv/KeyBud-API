import CustomError from "./CustomError";

export default class ServerError extends CustomError {
  StatusCode = 500;
  constructor() {
    super("Internal Server Error");
  }

  serialize() {
    return {
      message: "Internal Server Error",
      stack: process.env.NODE_ENV === "production" ? "" : this.stack,
    };
  }
}
