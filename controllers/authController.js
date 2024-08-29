import createError from 'http-errors'
import passport from 'passport'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { createRow, deleteRow, deleteRows, findUnique, updateRow } from '../db.js'



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
  try{
    // delete remember me token
    await deleteRow('RememberMeToken', {userId: req.user.id})
  }catch(err){
    // no token do nothing
  }
  finally{



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





    // req.session.destroy(function(err) {
      // cannot access session here
    //   if (err) {
    //     next(err)
    //   } else {
    //     // clear remember me coockie
    //     res.clearCookie('remember_me')
    //     res.clearCookie('refreshToken')
    //     // Clear the cookie manually
    //     res.clearCookie('connect.sid', { path: '/' });
    //     res.redirect('/')
    //   }
    // })

    // req.logout(function(err) {
    //   if (err) {
    //     return next(err)
    //   }
    // })
     

  
    
    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    // req.session.user = null
    // req.session.save(function (err) {
    //   if (err){
    //     next(err)
    //   }

    //     // regenerate the session, which is good practice to help
    //     // guard against forms of session fixation
    //   req.session.regenerate(function (err) {
    //     if (err){
    //       next(err)
    //     }
    //   // res.redirect('/')
    //     req.logout(function(err) {
    //       if (err) {
    //         return next(err)
    //       }
    
    //       res.redirect('/')
    //     })

    //   })
    // })



    // req.logout(function(err) {
    //   if (err) {
    //     return next(err)
    //   }

    //   res.redirect('/')
    // })
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