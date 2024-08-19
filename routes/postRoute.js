import express from 'express'
import { get_index, get_postById, get_postBySlug } from '../controllers/postController.js'

const router = express.Router();

router.get('/post/:postId', get_postById)

router.get('/:slug', get_postBySlug)

router.get('/', get_index)

export default router