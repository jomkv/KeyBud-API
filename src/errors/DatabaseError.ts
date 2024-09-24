import CustomError from "./CustomError";

export default class DatabaseError extends CustomError {
  StatusCode = 500;
  constructor() {
    super("Database Error");
  }

  serialize() {
    return {
      message: "Database Error",
      stack: process.env.NODE_ENV === "production" ? "" : this.stack,
    };
  }
}
