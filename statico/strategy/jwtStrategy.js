import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { findUnique } from '../../db.js'

// jws
const jwsOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

passport.use(new JwtStrategy(jwsOpts, async (jwt_payload, done) => {
    try {
        const user = await findUnique('user', {id: jwt_payload.id } )
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}))

export default passport