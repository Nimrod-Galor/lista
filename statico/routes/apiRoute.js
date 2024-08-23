import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { deleteValidation, listValidation } from '../controllers/formValidations.js'
import  { listContent, createList, editList, deleteList, setSessionMessages } from '../controllers/crudController.js'
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

export default router