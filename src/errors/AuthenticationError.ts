import { CustomError } from "../utils/CustomError";

export default class AuthenticationError extends CustomError {
  StatusCode = 401;
  constructor() {
    super("User not authorized");
  }

  serialize() {
    return { message: "User not authorized", stack: this.stack };
  }
}
