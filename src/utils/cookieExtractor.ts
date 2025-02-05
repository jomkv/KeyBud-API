import { Request } from "express";

// * From: https://www.passportjs.org/packages/passport-jwt/
const cookieExtractor = (req: Request): string | null => {
  let token = null;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  return token;
};

export default cookieExtractor;
