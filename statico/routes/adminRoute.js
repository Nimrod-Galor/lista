import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { userValidation, deleteValidation, bulkValidation, postValidation, commentValidation, roleValidation, commentsListValidation } from '../controllers/formValidations.js'
import  { listContent,
    createUser, editUser, deleteUser,
    createPage, editPage, deletePage,
    createPost, editPost, deletePost,
    editComment, deleteComment,
    editeRole,
    bulkDelete, bulkPublish, bulkDeleteUser
} from '../controllers/crudController.js'
import { initialize } from '../setup/initialize.js'
import { admin_dashboard } from '../controllers/adminController.js'
import { ensureAuthorized, filterByPermissions, allRolesPermissions, setRoleLocalsPermissions } from '../permissions/permissions.js'
import { sendVerificationMailMiddleware } from '../controllers/mailController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn
const router = express.Router()

function setSessionMessages(req, res, next){
    //  Set alert message session
    req.session.messages = Array.isArray(req.crud_response.messageBody) ? req.crud_response.messageBody : [req.crud_response.messageBody]
    req.session.messageType = req.crud_response.messageType
    req.session.messageTitle = req.crud_response.messageTitle
    next()
}

    

// list Users
router.get(["/user", "/user?/*"], ensureLoggedIn('/login'), ensureAuthorized('user', 'list', '/'), filterByPermissions('user'), listContent('user'), setRoleLocalsPermissions, admin_dashboard(), (req, res) => {
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

// list Posts
router.get(["/", "/post", "/post?/*"], ensureLoggedIn('/login'), ensureAuthorized('post', 'list', '/'), filterByPermissions('post'), listContent('post'), setRoleLocalsPermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/post`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
//  Create Post
router.post("/create/post", ensureLoggedIn('/login'), ensureAuthorized('post', 'create'), postValidation(), createPost, setSessionMessages, (req, res) => {
    res.redirect('/admin/post')
})
//  Edit Post
router.post("/edit/post", ensureLoggedIn('/login'), ensureAuthorized('post', 'edit'), postValidation(), editPost, setSessionMessages, (req, res) => {
    res.redirect('/admin/post')
})
//  Delete Post
router.post("/delete/post", ensureLoggedIn('/login'), ensureAuthorized('post', 'delete'), deleteValidation(), deletePost, setSessionMessages, (req, res) => {
    res.redirect('/admin/post')
})
// bulk delete
router.post("/post/bulk/delete", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('post', 'delete'), bulkValidation(), bulkDelete('post'), setSessionMessages, (req, res) => {
    res.redirect('/admin/post')
})
//bulk publish
router.post("/post/bulk/publish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('post', 'edit'), bulkValidation(), bulkPublish('post', true), setSessionMessages, (req, res) => {
    res.redirect('/admin/post')
})
//bulk unpublish
router.post("/post/bulk/unpublish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('post', 'edit'), bulkValidation(), bulkPublish('post', false), setSessionMessages, (req, res) => {
    res.redirect('/admin/post')
})


// list Comments
router.get(["/comment", "/comment?/*"], ensureLoggedIn('/login'), ensureAuthorized('comment', 'list', '/'), filterByPermissions('comment'), commentsListValidation(), listContent('comment'), setRoleLocalsPermissions, admin_dashboard(), (req, res) => {
    const baseUrl = `${req.baseUrl}/comment`
    const path = req.path
    res.render('dashboard', {user: req.user, baseUrl, path , caption: '' })
})
// Edit Comment
router.post("/edit/comment", ensureLoggedIn('/login'), ensureAuthorized('comment', 'edit'), commentValidation(), editComment, setSessionMessages, (req, res) => {
    res.redirect('/admin/comment')
})
// Delete Comment
router.post("/delete/comment", ensureLoggedIn('/login'), ensureAuthorized('comment', 'delete'), deleteValidation(), deleteComment, setSessionMessages, (req, res) => {
    res.redirect('/admin/comment')
})
// bulk delete
router.post("/comment/bulk/delete", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('comment', 'delete'), bulkValidation(), bulkDelete('comment'), setSessionMessages, (req, res) => {
    res.redirect('/admin/comment')
})
//bulk publish
router.post("/comment/bulk/publish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('comment', 'edit'), bulkValidation(), bulkPublish('comment', true), setSessionMessages, (req, res) => {
    res.redirect('/admin/comment')
})
//bulk unpublish
router.post("/comment/bulk/unpublish", ensureLoggedIn('/login'), ensureAuthorized('bulk_operations', 'exe'), ensureAuthorized('comment', 'edit'), bulkValidation(), bulkPublish('comment', false), setSessionMessages, (req, res) => {
    res.redirect('/admin/comment')
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