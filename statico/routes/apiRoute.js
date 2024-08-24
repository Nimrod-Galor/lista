import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { deleteValidation, listValidation, inviteSendValidation, roleValidation } from '../controllers/formValidations.js'
import  { listContent, createList, editList, deleteList, setSessionMessages, inviteUser,
            listRoles, editeRole
 } from '../controllers/crudController.js'
import {ensureAuthorized, filterByPermissions} from '../permissions/permissions.js'
import { api_login, refreshToken } from '../../controllers/authController.js'


const router = express.Router()


// login
router.post('/login', api_login)


router.post('/refresh-token', refreshToken)


/*  list    */
// List lists
router.get(["/lists", "lists?/*"], passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'list'), filterByPermissions('list'), listContent('list'), (req, res) => {
    res.json(req.crud_response)
})
//  Create list
router.post("/create/list", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'create'), listValidation(), createList, setSessionMessages, (req, res) => {
    if(req.crud_response. messageType === 'success'){
        res.json({messageBody: `/list/${req.newListId}`, messageTitle: 'List Created', messageType: 'redirect'})
    }else{
        res.json(req.crud_response)
    }
})
//  Edit list
router.post("/edit/list", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'edit'), listValidation(), editList, (req, res) => {
    res.json(req.crud_response)
})
//  Delete list
router.delete("/delete/list", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'delete'), deleteValidation(), deleteList, (req, res) => {
    res.json(req.crud_response)
})

// Invite viewer
router.post('/invite', passport.authenticate('jwt', { session: false }), inviteSendValidation(), inviteUser, (req, res) => {
    res.json(req.crud_response)
})

/*  Role    */
// List Roles
router.get("/roles", passport.authenticate('jwt', { session: false }), ensureAuthorized('role', 'list'), filterByPermissions('role'), listRoles, (req, res, next) => {
    res.json(req.crud_response)
})

// update role
router.post("/edit/role", passport.authenticate('jwt', { session: false }), ensureAuthorized('role', 'edit'), roleValidation(), editeRole, (req, res, next) => {
    res.json(req.crud_response)
})

export default router