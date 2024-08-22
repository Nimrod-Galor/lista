import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { searchValidation, modeValidation } from '../statico/controllers/formValidations.js'
import { listContent } from '../statico/controllers/crudController.js'
import { filterByPermissions, setRoleLocalsPermissions } from '../statico/permissions/permissions.js'
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
            "id": (Math.random()*100000000000000000).toString(16),
            "type": "ul",
            "items": []
        }
    }

    res.render('list', {user: req.user, listData, mode: 'Create'})
})

router.get('/profile', ensureLoggedIn('/login'), profile)

router.get(['/', '/home'],  getPage)

router.get('/list/:id', modeValidation(), getList)

export default router