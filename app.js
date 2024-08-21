import 'dotenv/config'
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import passport from 'passport'
import './statico/strategy/localStrategy.js';  // Import the Local strategy
import './statico/strategy/jwtStrategy.js';    // Import the JWT strategy
import { findUnique } from './db.js'
import cookieParser from 'cookie-parser'

import session from 'express-session'
import MongoStore from 'connect-mongo'
import logger  from 'morgan'
import { errorPage } from './controllers/pageController.js'

// routes
import pageRouter from './routes/pageRoute.js'
// import postRouter from './routes/postRoute.js'
import authRouter from './routes/authRoute.js'
import adminRouter from './statico/routes/adminRoute.js'
import apiRouter from './statico/routes/apiRoute.js'
// import jsonAlerts from './statico/routes/jsonalerts.js'

const app = express()

// view engine setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'statico/views')])
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// public static files
app.use(express.static(path.join(__dirname, 'public')))
// admin static files
app.use(express.static(path.join(__dirname, 'statico/theme')))

app.use(cookieParser())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
    cookie: { maxAge: 1000 * 60 * 90 } // 90 minutes session expiry by default
}))

app.use(passport.authenticate('session'))



// Remember me
app.use(async (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    const tokenCookie = req.cookies.remember_me;
    if (!tokenCookie) {
        return next();
    }

    try{
        const token = await findUnique('RememberMeToken',{ token: tokenCookie }, {userId: true})
        if(!token){
           return  next()
        }

        const user = await findUnique('user', { id: token.userId } )
        req.logIn(user, err => {
            if (err) {
                return next(err)
            }
            return next()
        })
    }catch(err){
        next(err)
    }
})



// Session-persisted message middleware
app.use(function(req, res, next) {
    var msgs = req.session.messages || [];
    var mtype = req.session.messageType || 'info'
    var title = req.session.messageTitle || ''
    res.locals.messages = msgs;
    res.locals.messageTitle = title
    res.locals.messageType = mtype
    res.locals.hasMessages = !! msgs.length
    req.session.messages = []
    req.session.messageTitle = ''
    next();
});

// Routes
app.use('/api', apiRouter)
app.use('/admin', adminRouter)
app.use('/', authRouter)
app.use('/', pageRouter)
// app.use('/', postRouter)
// app.use('/json-alert', jsonAlerts)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
})

// error handler
app.use(errorPage)

export default app
