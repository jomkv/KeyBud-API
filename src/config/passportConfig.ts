import passport, { DoneCallback } from "passport";
import {
  Strategy as JwtStrategy,
  StrategyOptions as JwtStrategyOpts,
} from "passport-jwt";
import {
  Strategy as GoogleStrategy,
  StrategyOptions as GoogleStrategyOpts,
} from "passport-google-oauth20";
import { IUserDocument, IUserPayload } from "../@types/userType";
import User from "../models/User";
import dotenv from "dotenv";
import cookieExtractor from "../utils/cookieExtractor";
import { Request } from "express";

dotenv.config();

const jwtStrategyOpts: JwtStrategyOpts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET as string,
  passReqToCallback: true,
};

passport.use(
  new JwtStrategy(
    jwtStrategyOpts,
    async (req: Request, payload: IUserPayload, done: DoneCallback) => {
      try {
        const user: IUserDocument | null = await User.findById(payload.id);

        if (user) {
          req.kbUser = user;
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

const googleStrategyOpts: GoogleStrategyOpts = {
  clientID: process.env.OAUTH2_CLIENT_ID as string,
  clientSecret: process.env.OAUTH2_CLIENT_SECRET as string,
  callbackURL: `${process.env.BASE_URL as string}/api/auth/redirect/google`,
};

passport.use(
  new GoogleStrategy(
    googleStrategyOpts,
    async (token, refreshToken, profile, done) => {
      try {
        const { emails, id } = profile;
        const email = emails?.[0].value;

        // Find user from google id or by email
        let user = await User.findOne().or([{ googleId: id }, { email }]);

        if (!user) {
          user = new User({
            googleId: id,
            email,
            icon: profile.photos?.[0].value,
          });

          await user.save();
        }

        done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
