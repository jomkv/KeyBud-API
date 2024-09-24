abstract class CustomError extends Error {
  constructor(message: string) {
    super(message); // Error breaks the prototype chain

    // The following 2 lines will restore the protype chain
    const actualProto = new.target.prototype;
    Object.setPrototypeOf(this, actualProto);
  }

  abstract StatusCode: number;
  abstract serialize(): { message: string; stack?: string };
}

export default CustomError;
