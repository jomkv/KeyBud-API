import passport, { DoneCallback } from "passport";
import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { IUser, IUserPayload } from "../@types/userType";
import User from "../models/User";
import dotenv from "dotenv";
import cookieExtractor from "../utils/cookieExtractor";

dotenv.config();

const opts: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  new JwtStrategy(opts, async (payload: IUserPayload, done: DoneCallback) => {
    try {
      const user: IUser | null = await User.findById(payload.id);

      return done(null, user ? user : false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
