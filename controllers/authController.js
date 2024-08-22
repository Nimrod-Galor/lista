import createError from 'http-errors'
import passport from 'passport'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { createRow, deleteRow, deleteRows, findUnique, updateRow } from '../db.js'


/** API login */
export function api_login(req, res, next){
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: info ? info.message : 'Login failed' })
    }

    const token = jwt.sign({ id: user.id, username: user.userName, roleId: user.roleId }, process.env.JWT_SECRET, { expiresIn: '1h' })
    return res.json({ token })
  })(req, res, next)
}


/*  Login POST  */
export function auth_post_login(req, res, next){
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      //  Set alert message
      req.session.messages = [info.message]
      req.session.messageType = 'warning'
      req.session.messageTitle = 'Alert'
      return res.redirect('/login')
    }

    try{
      // Clear all old tokens for this user before generating a new one
      deleteRows('RememberMeToken', { userId: user.id })
    }catch(err){
      return next(err)
    }
      
    req.logIn(user, async (err) => {
      if (err) {
        return next(err)
      }

      // set jwt token
      // const jwtToken = jwt.sign({ id: user.id, username: user.userName, roleId: user.roleId }, process.env.JWT_SECRET, { expiresIn: '15m' })
      // // res.cookie('jwt', jwtToken, { path: '/', maxAge: 59 * 60 * 1000 }); // 59 minute

      // // Send the JWT as an HttpOnly cookie
      // res.cookie('jwt', token, {
      //   httpOnly: true,     // Prevents access via JavaScript
      //   secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
      //   maxAge: 15 * 60 * 1000,  // 15 minutes in milliseconds
      //   sameSite: 'strict'  // CSRF protection
      // });

      // refresh token
      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,      // Prevents access by JavaScript
        secure: process.env.NODE_ENV === 'production',  // Use Secure in production
        sameSite: 'Strict',  // Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
      })

      if (req.body.remember) {  
        try{
          // remember me
          const token = crypto.randomBytes(32).toString('hex')
          await createRow('RememberMeToken', { token, userId: req.user.id })
          res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 14 * 24 * 60 * 60 * 1000 }); // 14 days
        }catch(err){
          return next(err)
        }
      }

      // Redirect to the my lists page
      return res.redirect('/mylists')
    })
  })(req, res, next)
}

/*  Logout  */
export async function auth_logout(req, res, next) {
  // clear remember me coockie
  res.clearCookie('remember_me')
  try{
    // delete remember me token
    await deleteRow('RememberMeToken', {userId: req.user.id})
  }catch(err){
    // no token do nothing
  }
  finally{
    req.logout(function(err) {
      if (err) {
        return next(err)
      }
      res.redirect('/')
    })
  }
}

/*  Signup POST */
export async function auth_post_singup(req, res, next) {
  try{
    if(req.crud_response.messageType === 'success'){
      // user creater successfuly
      req.session.messages = [req.crud_response.messageBody]
      req.session.messageType = req.crud_response.messageType
      req.session.messageTitle = req.crud_response.messageTitle
      res.redirect('/login')
    }else{
      // error
      res.locals.messages = [req.crud_response.messageBody]
      res.locals.messageType = req.crud_response.messageType
      res.locals.messageTitle = req.crud_response.messageTitle
      res.render('signup')
    }
  }catch(err){
    return next(err)
  }
}

/*  verify Email*/
export async function verifyEmail(req, res, next){
  try {
    const { token } = req.params;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUnique('user', { email: decoded.email });

    if (!user || user.verificationToken !== token || user.verificationTokenExpires < Date.now()) {
      return next( createError(400, 'Invalid or expired token') )
    }

    const tmpUser = {
      emailVerified: true,
      verificationToken: undefined,
      verificationTokenExpires: undefined
    }

    await updateRow('user', {id: user.id}, tmpUser)

    // Send Success json
    req.crud_response = {messageBody: `Email verified successfully!`, messageTitle: 'Email Verification', messageType: 'success'}
    next()
  } catch (error) {
    next( createError(500, 'Server error') );
  }
}