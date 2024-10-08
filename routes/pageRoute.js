import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import {
    modeValidation,
    deleteValidation,
    inviteSendValidation,
    acceptInviteidValidation,
    cancelInviteidValidation,
    removeViewerValidation
} from '../statico/controllers/formValidations.js'

import {    
    listContent,
    deleteDataType,
    setSessionMessages,
    deleteList,
    pendingInvitesRecived,
    acceptInvite,
    declineInvite,
    cancelInvite,
    inviteUser,
    removeViewer
} from '../statico/controllers/crudController.js'

import {    
    getRolePermissions,
    ensureAuthorized,
    isAuthorized
} from '../statico/permissions/permissions.js'

import {
    getPage,
    getList,
    mylists
} from '../controllers/pageController.js'


const router = express.Router();



/************/
/*  LIST    */
/************/
function filterMyLists(req, res, next){
    // this function will filter only my lists (even for admin)
    req.where = { OR: [ { authorId: req.user.id }, { viewersIDs: { has: req.user.id } } ] }
    next()
}

router.get(['/mylists', "/mylists?/*"], ensureLogIn.ensureLoggedIn('/login'), ensureAuthorized('list', 'list'), filterMyLists, getRolePermissions, listContent('list'), pendingInvitesRecived, mylists, (req, res) => {
    const baseUrl = `${req.baseUrl}/mylists`
    const path = req.path
    res.render('mylists', {user: req.user, baseUrl, path })
})

// create GET
router.get("/list/create", ensureLogIn.ensureLoggedIn('/login'), ensureAuthorized('list', 'create'), (req, res) => {
    const listData = {
        "title": "",
        "description": "",
        "body": {
            "id": (Math.random()*10000000).toString(16).split('.')[0],
            "type": "ul",
            "items": []
        },
        "viewers": [],
        "pendingInvites": [],
        "dir": "ltr"
    }

    res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) },
                                 "list": { "edit": isAuthorized("list", "edit", req.user?.roleId) } }

    res.render('list', {user: req.user, listData, mode: 'create'})
})

// delete list
router.post('/list/delete', ensureLogIn.ensureLoggedIn('/login'), ensureAuthorized('list', 'delete'), deleteValidation(), deleteList, setSessionMessages, (req, res) => {
    res.redirect('/mylists')
})

// read list
router.get('/list/:id', modeValidation(), getList)

// remove list from my lists
router.post('/list/remove',  ensureLogIn.ensureLoggedIn('/login'), ensureAuthorized('list', 'delete'), removeViewerValidation(), removeViewer, setSessionMessages, (req, res) => {
    res.redirect('back')
})
// remove Viewer form list
router.post('/list/remove/viewer', ensureLogIn.ensureLoggedIn('/login'), ensureAuthorized('invite', 'edit'), removeViewerValidation(), removeViewer, setSessionMessages, (req, res) => {
    res.redirect('back')
})

/************/
/*  INVITE  */
/************/

// Invite viewer
router.post('/invite/create', ensureLogIn.ensureLoggedIn('/login'), ensureAuthorized('invite', 'create'), inviteSendValidation(), inviteUser, setSessionMessages, (req, res) => {
    res.redirect('back')
})
// Accept Invite
router.post('/invite/accept', ensureLogIn.ensureLoggedIn('/login'), ensureAuthorized('list', 'edit'), acceptInviteidValidation(), acceptInvite, setSessionMessages, (req, res) => {
    res.redirect('back')
})
// Decline Invite
router.post('/invite/decline', ensureLogIn.ensureLoggedIn('/login'), cancelInviteidValidation(), declineInvite, setSessionMessages, (req, res) => {
    res.redirect('back')
})
// Cancel Invite
router.post('/invite/cancel', ensureLogIn.ensureLoggedIn('/login'), ensureAuthorized('invite', 'create'), cancelInviteidValidation(), cancelInvite, setSessionMessages, (req, res) => {
    res.redirect('back')
})


/************/
/*  PAGES   */
/************/

router.get(['/', '/home'],  getPage)

export default router