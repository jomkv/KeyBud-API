import CustomError from "./CustomError";

export default class AuthenticationError extends CustomError {
  StatusCode = 401;
  constructor() {
    super("User not authorized");
  }

  serialize() {
    return {
      message: "User not authorized",
      stack: process.env.NODE_ENV === "production" ? "" : this.stack,
    };
  }
}
