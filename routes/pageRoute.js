import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { searchValidation, modeValidation, deleteValidation } from '../statico/controllers/formValidations.js'
import { listContent, deleteList, setSessionMessages } from '../statico/controllers/crudController.js'
import { filterByPermissions, setRoleLocalsPermissions, ensureAuthorized } from '../statico/permissions/permissions.js'
import { search_controller, getPage, getList, mylists, profile } from '../controllers/pageController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn

const router = express.Router();

router.get('/search', searchValidation(), search_controller)

router.get('/mylists', ensureLoggedIn('/login'), filterByPermissions('page'), listContent('list'), setRoleLocalsPermissions, mylists, (req, res) => {
    const baseUrl = `${req.baseUrl}/page`
    const path = req.path
    res.render('mylists', {user: req.user, baseUrl, path })
})

router.get("/create", ensureLoggedIn('/login'), setRoleLocalsPermissions, (req, res) => {
    
    const listData = {
        "title": "",
        "description": "",
        "body": {
            "id": (Math.random()*10000000).toString(16).split('.')[0],
            "type": "ul",
            "items": []
        }
    }

    res.render('list', {user: req.user, listData, mode: 'create'})
})

router.get('/profile', ensureLoggedIn('/login'), profile)

router.get(['/', '/home'],  getPage)

router.get('/list/:id', modeValidation(), getList)

router.post('/delete/list', ensureLoggedIn('/login'), ensureAuthorized('list', 'delete'), deleteValidation(),  deleteList, setSessionMessages, (req, res) => {
    res.redirect('/mylists')
})

export default router