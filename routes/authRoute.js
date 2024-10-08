import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { userValidation, emailValidation, resetPasswordValidation } from '../statico/controllers/formValidations.js'
import { setSessionMessages } from '../statico/controllers/crudController.js'
import { createUser } from '../statico/controllers/adminController.js'
import { auth_post_login, auth_logout, auth_post_singup, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController.js'
import { sendVerificationMailMiddleware } from '../statico/controllers/mailController.js'

const router = express.Router();

// login GET
router.get('/login', ensureLogIn.ensureLoggedOut('/logout'), (req, res, next) => {
    res.render('login', { user: null })
})

// login POST
router.post('/login', ensureLogIn.ensureLoggedOut('/login'), auth_post_login)
  
// logout POST
router.get('/logout', ensureLogIn.ensureLoggedIn('/login'), auth_logout)

// signup GET
router.get('/signup', ensureLogIn.ensureLoggedOut('/signup'), (req, res, next) => {
    res.render('signup')
})

// signup POST
router.post('/signup', ensureLogIn.ensureLoggedOut('/signup'), (req, res, next) => {
    req.body.emailverified = true
    next()
}, userValidation(), createUser, sendVerificationMailMiddleware, auth_post_singup)

// Email verification GET
router.get('/verify/:token', verifyEmail, setSessionMessages, (req, res, next) => {
    res.redirect('/login')
})

/* Forgot Password */
router.get('/forgot-password', (req, res, next) => {
    res.render('forgotpass')
})

router.post('/forgot-password', emailValidation(), forgotPassword, setSessionMessages, (req, res, next) => {
    res.redirect('/home')
})

/* Reset Password */
router.get('/reset-password/:token', (req, res, next) => {
    res.render('resetpass')
})

router.post('/reset-password/:token', resetPasswordValidation(), resetPassword, setSessionMessages, (req, res, next) => {
    res.redirect('/login')
})

export default router