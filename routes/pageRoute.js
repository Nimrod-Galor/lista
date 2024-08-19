import express from 'express'
import ensureLogIn from 'connect-ensure-login'
import { searchValidation } from '../statico/controllers/formValidations.js'

import { search_controller, getPage, profile } from '../controllers/pageController.js'

const ensureLoggedIn = ensureLogIn.ensureLoggedIn

const router = express.Router();

router.get('/search', searchValidation(), search_controller)

router.get('/profile', ensureLoggedIn('/login'), profile)

router.get(['/', '/home', '/:slug'],  getPage)

export default router