import express from 'express'
import passport from 'passport'
import ensureLogIn from 'connect-ensure-login'
import { deleteValidation, listValidation, roleValidation } from '../controllers/formValidations.js'
import  { listContent, createList, editList, deleteList, setSessionMessages,
            listRoles, editeRole
 } from '../controllers/crudController.js'
import {ensureallowed, filterByPermissions} from '../permissions/permissions.js'
import { api_login, refreshToken } from '../../controllers/authController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()


// login
router.post('/login', api_login)


router.post('/refresh-token', ensureLoggedIn('/login'), refreshToken)


/*  list    */
// List lists
router.get(["/lists", "lists?/*"], ensureLoggedIn('/login'), passport.authenticate('jwt', { session: false }), ensureallowed('list', 'list'), filterByPermissions('list'), listContent('list'), (req, res) => {
    res.json(req.crud_response)
})
//  Create list
router.post("/create/list", ensureLoggedIn('/login'), passport.authenticate('jwt', { session: false }), ensureallowed('list', 'create'), listValidation(), createList, setSessionMessages, (req, res) => {
    if(req.crud_response. messageType === 'success'){
        res.json({messageBody: `/list/${req.newListId}`, messageTitle: 'List Created', messageType: 'redirect'})
    }else{
        res.json(req.crud_response)
    }
})
//  Edit list
router.post("/edit/list", ensureLoggedIn('/login'), passport.authenticate('jwt', { session: false }), ensureallowed('list', 'edit'), listValidation(), editList, (req, res) => {
    res.json(req.crud_response)
})
//  Delete list
router.delete("/delete/list", ensureLoggedIn('/login'), passport.authenticate('jwt', { session: false }), ensureallowed('list', 'delete'), deleteValidation(), deleteList, (req, res) => {
    res.json(req.crud_response)
})

/*  Role    */
// List Roles
router.get("/roles", ensureLoggedIn('/login'), passport.authenticate('jwt', { session: false }), ensureallowed('role', 'list'), filterByPermissions('role'), listRoles, (req, res, next) => {
    res.json(req.crud_response)
})

// update role
router.post("/edit/role", ensureLoggedIn('/login'), passport.authenticate('jwt', { session: false }), ensureallowed('role', 'edit'), roleValidation(), editeRole, (req, res, next) => {
    res.json(req.crud_response)
})

export default router