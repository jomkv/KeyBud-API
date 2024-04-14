import { CustomError } from "../utils/customError";

export default class BadRequestError extends CustomError {
  StatusCode = 400;
  constructor(public message: string) {
    super(message);
  }

  serialize() {
    return { message: this.message, stack: this.stack };
  }
}
