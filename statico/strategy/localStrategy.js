import passport from 'passport'
import LocalStrategy from 'passport-local'
import crypto from 'crypto'
import {findUnique} from '../../db.js'

async function authenticateUser(email, password, done) {
    try{
        const user = await findUnique('user', { email, emailVerified: true })
        if(!user || email != user.email) {
            return done(null, false, { message: 'Incorrect username or password.' })
        }

        const newPassword = crypto.pbkdf2Sync(password, Buffer.from(user.salt, 'hex'), 100000, 64, 'sha512')
        const oldPassword = Buffer.from(user.password, 'hex')
        if (!crypto.timingSafeEqual(oldPassword, newPassword)) {
            return done(null, false, { message: 'Incorrect username or password.' })
        }

        return done(null, user)
    }catch(err){//NotFoundError: No User found
        return done(null, false, { message: 'Incorrect username or password.' })
    }
}
  
passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.userName, email: user.email, roleId: user.roleId })
    })
})

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user)
    })
})

export default passport