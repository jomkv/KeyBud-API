import { CustomError } from "../utils/CustomError";

export default class DatabaseError extends CustomError {
  StatusCode = 500;
  constructor() {
    super("Database Error");
  }

  serialize() {
    return { message: "Database Error", stack: this.stack };
  }
}
