import createError from 'http-errors'
import he from 'he'
import { findUnique } from '../db.js'
import { isAuthorized } from '../statico/permissions/permissions.js'

export function get_index(req, res){
    const postData = {}
    res.render('index', { user: req.user, postData })
}

export async function get_postById(req, res, next){
    const postId = req.params.postId

    try{
        //  Get post data by id
        const postData = await findUnique('post', {id: postId})
        if(!postData){
            // post not found
            return next(createError(404, 'Resource not found'));
        }

        postData.body = he.decode(postData.body)

        res.render('post', { user: req.user, postData })
    }catch(err){
        return next(err);
    }

}

export async function get_postBySlug(req, res, next){
    const slug = req.params.slug

    try{
        //  Get post data by slug
        const postData = await findUnique('post', {slug})
        if(!postData){
            // post not found
            return next(createError(404, 'Resource not found'));
        }

        res.locals.permissions = {"admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

        postData.body = he.decode(postData.body)
        res.render('post', { user: req.user, postData })
    }catch(err){
        return next(err);
    }
}

