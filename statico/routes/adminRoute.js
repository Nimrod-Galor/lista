import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { userValidation, deleteValidation, bulkValidation, listValidation, postValidation, roleValidation } from '../controllers/formValidations.js'
import  { listContent,
    createUser, editUser, deleteUser,
    createPage, editPage, deletePage,
    createList, editList, deleteList,
    editeRole,
    bulkDelete, bulkPublish, bulkDeleteUser,
    setSessionMessages
} from '../controllers/crudController.js'
import { initialize } from '../setup/initialize.js'
import { admin_dashboard } from '../controllers/adminController.js'
import { ensureAuthorized, filterByPermissions, allRolesPermissions, setRoleLocalsPermissions } from '../permissions/permissions.js'
import { sendVerificationMailMiddleware } from '../controllers/mailController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()



    

// list Users
router.get(["/", "/user", "/user?/*"], ensureLoggedIn('/login'), ensureAuthorized('user', 'list', '/'), filterByPermissions('user'), listContent('user'), setRoleLocalsPermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/user`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
//  Create User
router.post("/create/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'create'), userValidation(), createUser, setSessionMessages, sendVerificationMailMiddleware, (req, res) => {
    res.redirect('/admin/user')
})
//  Edit User
router.post("/edit/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'edit'), userValidation(), editUser, setSessionMessages, (req, res) => {
    res.redirect('/admin/user')
})
//  Delete User
router.post("/delete/user", ensureLoggedIn('/login'), ensureAuthorized('user', 'delete'), deleteValidation(), deleteUser, setSessionMessages, (req, res) => {
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


// list Pages
router.get(["/page", "/page?/*"], ensureLoggedIn('/login'), ensureAuthorized('page', 'list', '/'), filterByPermissions('page'), listContent('page'), setRoleLocalsPermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/page`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
//  Create Page
router.post("/create/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'create'), postValidation(), createPage, setSessionMessages, (req, res) => {
    res.redirect('/admin/page')
})
//  Edit Page
router.post("/edit/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'edit'), postValidation(), editPage, setSessionMessages, (req, res) => {
    res.redirect('/admin/page')
})
//  Delete Page
router.post("/delete/page", ensureLoggedIn('/login'), ensureAuthorized('page', 'delete'), deleteValidation(), deletePage, setSessionMessages, (req, res) => {
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

// list Lists
router.get(["/list", "/list?/*"], ensureLoggedIn('/login'), ensureAuthorized('list', 'list', '/'), filterByPermissions('list'), listContent('list'), setRoleLocalsPermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/list`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
//  Create list
router.post("/create/list", ensureLoggedIn('/login'), ensureAuthorized('list', 'create'), listValidation(), createList, setSessionMessages, (req, res) => {
    res.redirect('/admin/list')
})
//  Edit list
router.post("/edit/list", ensureLoggedIn('/login'), ensureAuthorized('list', 'edit'), listValidation(), editList, setSessionMessages, (req, res) => {
    res.redirect('/admin/list')
})
//  Delete list
router.post("/delete/list", ensureLoggedIn('/login'), ensureAuthorized('list', 'delete'), deleteValidation(), deleteList, setSessionMessages, (req, res) => {
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

// list Roles
router.get(["/role", "/role?/*"], ensureLoggedIn('/login'), ensureAuthorized('role', 'list', '/'), filterByPermissions('role'), listContent('role'), setRoleLocalsPermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/role`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
// Edit Role
router.post("/edit/role", ensureLoggedIn('/login'), ensureAuthorized('role', 'edit'), roleValidation(), editeRole, setSessionMessages, (req, res) => {
    res.redirect('/admin/role')
})

// Permission Page
router.get("/permissions",  ensureLoggedIn('/login'), ensureAuthorized('permissions_page', 'view'), setRoleLocalsPermissions, admin_dashboard('permissions'), allRolesPermissions, (req, res) => {
    res.render('permissions', {user: req.user, caption: '' })
})

// initial Setup
router.post("/setup", initialize, setSessionMessages, (req, res) => {
    res.redirect('/login')
})

export default router