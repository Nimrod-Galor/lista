import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { deleteValidation, listValidation } from '../controllers/formValidations.js'
import  { listContent, createList, editList, deleteList } from '../controllers/crudController.js'
import {ensureAuthorized, filterByPermissions} from '../permissions/permissions.js'
import { api_login } from '../../controllers/authController.js'


const router = express.Router()


// login
router.post('/login', api_login)


router.post('/refresh-token', (req, res) => {
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
})


/*  list    */
// List lists
router.get(["/lists", "lists?/*"], passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'list'), filterByPermissions('list'), listContent('list'), (req, res, next) => {
    res.json(req.crud_response)
})
//  Create list
router.post("/create/list", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'create'), listValidation(), createList, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit list
router.post("/edit/list", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'edit'), listValidation(), editList, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete list
router.delete("/delete/list", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'delete'), deleteValidation(), deleteList, (req, res, next) => {
    res.json(req.crud_response)
})

export default router