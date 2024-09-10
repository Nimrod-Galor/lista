import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { 
    checkValidation,
    userValidation, 
    deleteValidation, 
    bulkValidation, 
    listValidation, 
    postValidation, 
    roleValidation
} from '../controllers/formValidations.js'

import  { 
    listContent,
    updateDataType, createDataType, deleteDataType,
    setSessionMessages
} from '../controllers/crudController.js'
import { initialize } from '../setup/initialize.js'
import { admin_dashboard,
     createUser, deleteUser,
     bulkDelete, bulkPublish, bulkDeleteUser } from '../controllers/adminController.js'
import { ensureAuthorized, filterByPermissions, allRolesPermissions, getRolePermissions } from '../permissions/permissions.js'
import { sendVerificationMailMiddleware } from '../controllers/mailController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()



/************/
/*  USER    */
/************/
// list Users
router.get(["/", "/user", "/user?/*"], ensureLoggedIn('/login'), ensureAuthorized('user', 'list'), filterByPermissions('user', 'list'), getRolePermissions, listContent('user'), getRolePermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/user`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
//  Create User
router.post("/create/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'create'), userValidation(), checkValidation, createUser, setSessionMessages, sendVerificationMailMiddleware, (req, res) => {
    res.redirect('/admin/user')
})
//  Edit User
router.post("/edit/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'edit'), userValidation(), checkValidation, updateDataType('user'), setSessionMessages, (req, res) => {
    res.redirect('/admin/user')
})
//  Delete User
router.post("/delete/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'delete'), deleteValidation(), checkValidation, deleteUser, setSessionMessages, (req, res) => {
    res.redirect('/admin/user')
})
// bulk delete
router.post("/user/bulk/delete", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('user', 'delete'), bulkValidation(), bulkDeleteUser, setSessionMessages, (req, res) => {
    res.redirect('/admin/user')
})
//bulk publish
router.post("/user/bulk/publish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('user', 'edit'), bulkValidation(), bulkPublish('user', true), setSessionMessages, (req, res) => {
    res.redirect('/admin/user')
})
//bulk unpublish
router.post("/user/bulk/unpublish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('user', 'edit'), bulkValidation(), bulkPublish('user', false), setSessionMessages, (req, res) => {
    res.redirect('/admin/user')
})


/************/
/*  PAGE    */
/************/
// list Pages
router.get(["/page", "/page?/*"], ensureLoggedIn('/login'), ensureAuthorized('page', 'list'), filterByPermissions('page', 'list'), listContent('page'), getRolePermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/page`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
//  Create Page
router.post("/create/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'create'), postValidation(), checkValidation, createDataType('page'), setSessionMessages, (req, res) => {
    res.redirect('/admin/page')
})
//  Edit Page
router.post("/edit/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'edit'), postValidation(), checkValidation, updateDataType('page'), setSessionMessages, (req, res) => {
    res.redirect('/admin/page')
})
//  Delete Page
router.post("/delete/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'delete'), deleteValidation(), checkValidation, deleteDataType('page'), setSessionMessages, (req, res) => {
    res.redirect('/admin/page')
})
// bulk delete
router.post("/page/bulk/delete", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('page', 'delete'), bulkValidation(), bulkDelete('page'), setSessionMessages, (req, res) => {
    res.redirect('/admin/page')
})
//bulk publish
router.post("/page/bulk/publish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('page', 'edit'), bulkValidation(), bulkPublish('page', true), setSessionMessages, (req, res) => {
    res.redirect('/admin/page')
})
//bulk unpublish
router.post("/page/bulk/unpublish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('page', 'edit'), bulkValidation(), bulkPublish('page', false), setSessionMessages, (req, res) => {
    res.redirect('/admin/page')
})

/************/
/*  LIST    */
/************/
// list Lists
router.get(["/list", "/list?/*"], ensureLoggedIn('/login'), ensureAuthorized('list', 'list'), filterByPermissions('list', 'list'), listContent('list'), getRolePermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/list`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
//  Edit list
router.post("/edit/list", ensureLoggedIn('/login'), ensureAuthorized('list', 'edit'), listValidation(), checkValidation, updateDataType('list'), setSessionMessages, (req, res) => {
    res.redirect('/admin/list')
})
//  Delete list
router.post("/delete/list", ensureLoggedIn('/login'), ensureAuthorized('list', 'delete'), deleteValidation(),  checkValidation, deleteDataType('list'), setSessionMessages, (req, res) => {
    res.redirect('/admin/list')
})
// bulk delete
router.post("/list/bulk/delete", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('list', 'delete'), bulkValidation(), bulkDelete('list'), setSessionMessages, (req, res) => {
    res.redirect('/admin/list')
})
//bulk publish
router.post("/list/bulk/publish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('list', 'edit'), bulkValidation(), bulkPublish('list', true), setSessionMessages, (req, res) => {
    res.redirect('/admin/list')
})
//bulk unpublish
router.post("/list/bulk/unpublish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('list', 'edit'), bulkValidation(), bulkPublish('list', false), setSessionMessages, (req, res) => {
    res.redirect('/admin/list')
})

/************/
/*  INVITE  */
/************/
// list invites
router.get(["/invite", "/invite?/*"], ensureLoggedIn('/login'), ensureAuthorized('invite', 'list'), filterByPermissions('invite', 'list'), listContent('invite'), getRolePermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/invite`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})

/************/
/*  ROLE    */
/************/
// list Roles
router.get(["/role", "/role?/*"], ensureLoggedIn('/login'), ensureAuthorized('role', 'list'), filterByPermissions('role', 'list'), listContent('role'), getRolePermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/role`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
// Edit Role
router.post("/edit/role", ensureLoggedIn('/login'), ensureAuthorized('role', 'edit'), roleValidation(), checkValidation, updateDataType('role'), setSessionMessages, (req, res) => {
    res.redirect('/admin/role')
})

/************/
/*  OTHER   */
/************/
// Permission Page
router.get("/permissions",  ensureLoggedIn('/login'), ensureAuthorized('permissions_page', 'view'), getRolePermissions, admin_dashboard('permissions'), allRolesPermissions, (req, res) => {
    res.render('permissions', {user: req.user, caption: '' })
})

// initial Setup
router.post("/setup", initialize, setSessionMessages, (req, res) => {
    res.redirect('/login')
})



export default router