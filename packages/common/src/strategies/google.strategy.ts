/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { v4 as uuidv4 } from 'uuid';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.FRONTEND_URL}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { id, name, emails, photos } = profile;
    const user = {
      userId: uuidv4(),
      provider: 'GOOGLE',
      providerId: id,
      email: emails?.[0]?.value || null,
      name: name?.givenName || null,
      picture: photos?.[0]?.value || null,
    };
    done(null, user);
  }
}
