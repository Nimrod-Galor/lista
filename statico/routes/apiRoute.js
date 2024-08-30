import express from 'express'
import passport from 'passport'
import { 
    checkValidation,
    deleteValidation,
    listValidation,
    roleValidation
} from '../controllers/formValidations.js'

import  { 
    listContent, 
    createDataType, updateDataType, deleteDataType,
    setSessionMessages,
    listRoles
 } from '../controllers/crudController.js'
 
import {ensureAuthorized, filterByPermissions} from '../permissions/permissions.js'
import { api_login, refreshToken } from '../../controllers/authController.js'


const router = express.Router()


// login
router.post('/login', api_login)


router.post('/refresh-token', refreshToken)


/************/
/*  LIST    */
/************/
// List lists
router.get(["/lists", "lists?/*"], passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'list'), filterByPermissions('list'), listContent('list'), (req, res) => {
    res.json(req.crud_response)
})
//  Create list
router.post("/create/list", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'create'), listValidation(),  checkValidation, createDataType('list'), setSessionMessages, (req, res) => {
    if(req.crud_response. messageType === 'success'){
        res.json({messageBody: `/list/${req.newListId}`, messageTitle: 'List Created', messageType: 'redirect'})
    }else{
        res.json(req.crud_response)
    }
})
//  Edit list
router.post("/edit/list", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'edit'), listValidation(), checkValidation, updateDataType('list'), (req, res) => {
    res.json(req.crud_response)
})
//  Delete list
router.delete("/list/delete", passport.authenticate('jwt', { session: false }), ensureAuthorized('list', 'delete'), deleteValidation(),  checkValidation, deleteDataType('list'), (req, res) => {
    res.json(req.crud_response)
})

/************/
/*  ROLE    */
/************/
// List Roles
router.get("/roles", passport.authenticate('jwt', { session: false }), ensureAuthorized('role', 'list'), filterByPermissions('role'), listRoles, (req, res, next) => {
    res.json(req.crud_response)
})

// update role
router.post("/edit/role", passport.authenticate('jwt', { session: false }), ensureAuthorized('role', 'edit'), roleValidation(), checkValidation, updateDataType('role'), (req, res, next) => {
    res.json(req.crud_response)
})

export default router