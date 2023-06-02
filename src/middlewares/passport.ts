import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { checkExistingUser } from '../controllers/members-controllers';

const config = {
    clientID: "176418337321-nlsk84qeitsk1d5r4ssl2indih8sea5t.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/auth/google/callback"
};

export interface User {
    email: string | undefined;
    shortId: string;
}

passport.use(
    new GoogleStrategy(
        config,
        async (accessToken, refreshToken, profile, done) => {
            const { email } = profile._json;
            const processedEmail = email ? email : '';

            try {
                const user = await checkExistingUser(processedEmail);
                done(null, user.user); // user.user로 변경하여 user 객체만 저장
                console.log(user.user.email);
            } catch (e) {
                const error = new Error('An error occurred');
                console.log(e);
                done(error, undefined);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: User, done) => {
    done(null, user)
});

export default passport;