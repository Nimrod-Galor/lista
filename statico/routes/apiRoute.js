import express from 'express'
import passport from 'passport'
import { userValidation, deleteValidation, bulkValidation, postValidation, commentValidation, roleValidation, commentsListValidation, postIdValidation } from '../controllers/formValidations.js'
import  {   listContent, createUser, editUser, deleteUser,
            createPage, editPage, deletePage,
            createPost, editPost, deletePost,
            countComments, listComments, createComment, editComment, deleteComment, likeComment, dislikeComment,
            listRoles, editeRole
        } from '../controllers/crudController.js'
import {ensureAuthorized, filterByPermissions} from '../permissions/permissions.js'
import { api_login } from '../../controllers/authController.js'


const router = express.Router()


// login
router.post('/login', api_login)

/*  User    */
// List users
router.get(["/users", "users?/*"], (req, res, next)=>{
    console.log("Iam In!")
    next()
}, passport.authenticate('jwt', { session: false }), ensureAuthorized('user', 'list'), filterByPermissions('user'), listContent('user'), (req, res, next) => {
    res.json(req.crud_response)
})
//  Create User
router.post("/create/user", passport.authenticate('jwt', { session: false }), ensureAuthorized('user', 'create'), userValidation(), createUser, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit User
router.post("/edit/user", passport.authenticate('jwt', { session: false }), ensureAuthorized('user', 'edit'), userValidation(), editUser, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete User
router.delete("/delete/user", passport.authenticate('jwt', { session: false }), ensureAuthorized('user', 'delete'), deleteValidation(), deleteUser, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Page    */
// List pages
router.get(["/pages", "pages?/*"], passport.authenticate('jwt', { session: false }), ensureAuthorized('page', 'list'), filterByPermissions('page'), listContent('page'), (req, res, next) => {
    res.json(req.crud_response)
})
//  Create Page
router.post("/create/page", passport.authenticate('jwt', { session: false }), ensureAuthorized('page', 'create'), postValidation(), createPage, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit Page
router.post("/edit/post", passport.authenticate('jwt', { session: false }), ensureAuthorized('page', 'edit'), postValidation(), editPage, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete Page
router.delete("/delete/page", passport.authenticate('jwt', { session: false }), ensureAuthorized('page', 'delete'), deleteValidation(), deletePage, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Post    */
// List posts
router.get(["/posts", "posts?/*"], passport.authenticate('jwt', { session: false }), ensureAuthorized('post', 'list'), filterByPermissions('post'), listContent('post'), (req, res, next) => {
    res.json(req.crud_response)
})
//  Create Post
router.post("/create/post", passport.authenticate('jwt', { session: false }), ensureAuthorized('post', 'create'), postValidation(), createPost, (req, res, next) => {
    res.json(req.crud_response)
})
//  Edit Post
router.post("/edit/post", passport.authenticate('jwt', { session: false }), ensureAuthorized('post', 'edit'), postValidation(), editPost, (req, res, next) => {
    res.json(req.crud_response)
})
//  Delete Post
router.delete("/delete/post", passport.authenticate('jwt', { session: false }), ensureAuthorized('post', 'delete'), deleteValidation(), deletePost, (req, res, next) => {
    res.json(req.crud_response)
})

/*  Comment    */
// Count Comments
router.post("/count/comments", postIdValidation(), countComments, (req, res, next) => {
    res.json(req.crud_response)
})
// List Comments
router.post("/comments", commentsListValidation(), listComments, (req, res, next) => {
    res.json(req.crud_response)
})
// Create Comment
router.post("/create/comment", passport.authenticate('jwt', { session: false }), ensureAuthorized('comment', 'create'), commentValidation(), createComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Edit Comment
router.post("/edit/comment", passport.authenticate('jwt', { session: false }), ensureAuthorized('comment', 'edit'), commentValidation(), editComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Delete Comment
router.post("/delete/comment", passport.authenticate('jwt', { session: false }), ensureAuthorized('comment', 'delete'), deleteValidation(), deleteComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Like Comment
router.post("/like/comment", passport.authenticate('jwt', { session: false }), postIdValidation(), likeComment, (req, res, next) => {
    res.json(req.crud_response)
})
// Dislike Comment
router.post("/dislike/comment", passport.authenticate('jwt', { session: false }), postIdValidation(), dislikeComment, (req, res, next) => {
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