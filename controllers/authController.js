import createError from 'http-errors'
import passport from 'passport'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validationResult, matchedData } from 'express-validator'
import { createRow, deleteRow, deleteRows, findUnique, updateRow } from '../db.js'
import { sendResetPasswordMail } from '../statico/controllers/mailController.js'

export function refreshToken(req, res){
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
      return res.status(401).send('Unauthorized');
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, user) => {

      if (err) {
          return res.status(403).send('Invalid refresh token')
      }

      // Generate new access and refresh tokens
      const newAccessToken = jwt.sign({ id: user.id, username: user.userName, roleId: user.roleId }, process.env.JWT_SECRET, { expiresIn: '15m' })
      const newRefreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' })

      // Store new refresh token (replace old one)
      res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,      // Prevents access by JavaScript
          secure: process.env.NODE_ENV === 'production',  // Use Secure in production
          sameSite: 'Strict',  // Prevents CSRF attacks
          maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
      })

      res.json({ accessToken: newAccessToken })
  })
}

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

      let expiresIn = '90m'
      let maxAge =  1000 * 60 * 90  // 90 minutes session expiry by default
      if (req.body.remember) {  
        try{
          // remember me
          expiresIn = '14d'
          maxAge =  14 * 24 * 60 * 60 * 1000 // 14 days
          const token = crypto.randomBytes(32).toString('hex')
          await createRow('RememberMeToken', { token, userId: req.user.id })
          res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge });
        }catch(err){
          return next(err)
        }
      }

      // refresh token
      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,      // Prevents access by JavaScript
        secure: process.env.NODE_ENV === 'production',  // Use Secure in production
        sameSite: 'Strict',  // Prevents CSRF attacks
        maxAge
      })

      res.cookie('userId', req.user.id, {
        httpOnly: false,
        sameSite: 'Strict',  // Prevents CSRF attacks
        maxAge
      })

      // Redirect to the my lists page
      return res.redirect('/mylists')
    })
  })(req, res, next)
}

/*  Logout  */
export async function auth_logout(req, res, next) {
  try{
    // delete remember me token
    await deleteRow('RememberMeToken', {userId: req.user.id})
  }catch(err){
    // no token do nothing
  }finally{
    req.logout((err) => {
      if (err) {
        return next(err)
      }
      req.session.destroy((err) => {
        if (err) {
          return next(err)
        }
        // clear remember me coockie
        res.clearCookie('remember_me')
        res.clearCookie('refreshToken')
        res.clearCookie('connect.sid') // Clear session cookie
        res.redirect('/')
      })
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
      res.locals.hasMessages = true
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

/*  forgot password */
export async function forgotPassword(req, res, next){
  const result = validationResult(req);
  if (!result.isEmpty()) {
    //  Send Error json
    req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
    return next()
  }
  //  Get user data
  const {email} = matchedData(req, { includeOptionals: true });

  try{
    const user = await findUnique('user', { email })

    if(!user){
      req.crud_response = {messageBody: 'Incorrect E-mail addres', messageTitle: 'User not found', messageType: 'danger'}
      return next()
    }

    // Generate JWT token with expiration
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    // Send email with reset link containing the token
    sendResetPasswordMail(user.email, user.userName, resetToken, req.hostname)

    req.crud_response = {messageBody: `Password reset email sent to: "${user.email}"`, messageTitle: 'Email sent', messageType: 'success'}
    next()
  }catch(err){
    next( createError(500, 'Server error') );
  }
}

/* Reset Password */
export async function resetPassword(req, res, next){
  const result = validationResult(req);
  if (!result.isEmpty()) {
    //  Send Error json
    req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
    return next()
  }
  //  Get user data
  const { password } = matchedData(req, { includeOptionals: true })
  const { token } = req.params;

  try{
    // Verify token without needing to check a database
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by ID
    const user = await findUnique('user', { id: userId } )
    if (!user) {
      req.crud_response = {messageBody: 'User not found', messageTitle: 'User not found', messageType: 'danger'}
      return next()
    }

    // Hash passowrd
    const salt = crypto.randomBytes(16)
    const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

    //  Set new user object
    const tmpUser = {
      password: key.toString('hex'),
      salt: salt.toString('hex')
    }

    //  Update user
    await updateRow('user', { id: userId }, tmpUser)

    // Send Success json
    req.crud_response = {messageBody: `Password ${user.userName} was successfuly updated`, messageTitle: 'Password Updated', messageType: 'success'}
    next()
  }catch(err){
    next( createError(500, 'Server error') );
  }
}