import express from 'express'
import passport from 'passport'
import ensureLogIn from 'connect-ensure-login'
import {
    deleteValidation,
    listValidation,
    roleValidation
} from '../controllers/formValidations.js'

import  { 
    listContent, 
    createDataType, updateDataType, deleteList,
    setSessionMessages
 } from '../controllers/crudController.js'
import { listRoles } from '../controllers/adminController.js'
import {ensureAuthorized, filterByPermissions} from '../permissions/permissions.js'
import { api_login, refreshToken } from '../../controllers/authController.js'

// const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()


// login
router.post('/login', api_login)


router.post('/refresh-token', ensureLogIn.ensureLoggedIn('/login'), refreshToken)


/************/
/*  LIST    */
/************/
// List lists
router.get(["/lists", "lists?/*"], ensureLogIn.ensureLoggedIn('/login'), passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'list'), filterByPermissions('list', 'list'), listContent('list'), (req, res) => {
    res.json(req.crud_response)
})
//  Create list
router.post("/list/create",ensureLogIn.ensureLoggedIn('/api/notloggedin'), passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'create'), listValidation(), createDataType('list'), setSessionMessages, (req, res) => {
    if(req.crud_response. messageType === 'success'){
        res.json({messageBody: `/list/${req.newObjectId}`, messageTitle: 'List Created', messageType: 'redirect'})
    }else{
        res.json(req.crud_response)
    }
})
//  Edit list
router.post("/list/edit",ensureLogIn.ensureLoggedIn('/api/notloggedin'), passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'edit'), listValidation(), filterByPermissions('list', 'edit'), updateDataType('list'), (req, res) => {
    res.json(req.crud_response)
})
//  Delete list
router.delete("/list/delete",ensureLogIn.ensureLoggedIn('/api/notloggedin'), passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'delete'), deleteValidation(), deleteList, (req, res) => {
    res.json(req.crud_response)
})

/************/
/*  ROLE    */
/************/
// List Roles
router.get("/roles", ensureLogIn.ensureLoggedIn('/login'), passport.authenticate('jwt', { session: false }), ensureAuthorized('role', 'list'), filterByPermissions('role', 'list'), listRoles, (req, res, next) => {
    res.json(req.crud_response)
})

// update role
router.post("/edit/role",ensureLogIn.ensureLoggedIn('/api/notloggedin'), passport.authenticate('jwt', { session: false }), ensureAuthorized('role', 'edit'), roleValidation(), updateDataType('role'), (req, res, next) => {
    res.json(req.crud_response)
})

router.get('/notloggedin', (req, res, next) => {
    res.json({messageBody: 'you are trying to access a login-protected page when not logged in', messageTitle: '401 Unauthorized', messageType: 'danger'})
})

export default router