import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { userValidation } from '../statico/controllers/formValidations.js'
import { createUser } from '../statico/controllers/crudController.js'
import { auth_post_login, auth_logout, auth_post_singup, verifyEmail } from '../controllers/authController.js'
import { sendVerificationMailMiddleware } from '../statico/controllers/mailController.js'


const router = express.Router();

//  Set alert message
function setSessionMessages(req, res, next){
    req.session.messages = Array.isArray(req.crud_response.messageBody) ? req.crud_response.messageBody : [req.crud_response.messageBody]
    req.session.messageType = req.crud_response.messageType
    req.session.messageTitle = req.crud_response.messageTitle
    next()
}

/** GET /login  */
router.get('/login', ensureLogIn.ensureLoggedOut('/'), (req, res, next) => {
    res.render('login', { user: null })
})

/** POST /login */
router.post('/login', auth_post_login)
  
/** POST /logout */
router.get('/logout', auth_logout)

/** GET /signup  */
router.get('/signup', ensureLogIn.ensureLoggedOut('/'), (req, res, next) => {
    res.render('signup')
})

/* POST /signup */
router.post('/signup',(req, res, next) => {
    req.body.emailverified = true
    next()
}, userValidation(), createUser, sendVerificationMailMiddleware, auth_post_singup)

/*  Email verification  */
router.get('/verify/:token', verifyEmail, setSessionMessages, (req, res, next) => {
    res.redirect('/login')
})

export default router