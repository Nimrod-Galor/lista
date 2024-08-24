import createError from 'http-errors'
import he from 'he'
import { validationResult, matchedData } from 'express-validator'
import { findUnique, readRows, countRows } from '../db.js'
import { isAuthorized, getPermissionFilter } from '../statico/permissions/permissions.js'
import modelsInterface from '../statico/interface/modelsInterface.js'

export async function mylists(req, res, next){
    // check for errors
    if(req.crud_response && req.crud_response.messageType != 'data'){
        res.locals.messages = [req.crud_response.messageBody];
        res.locals.messageTitle = req.crud_response.messageTitle
        res.locals.messageType = req.crud_response.messageType
        res.locals.hasMessages = true
    }

    const numberOfDocuments = await countRows('list', getPermissionFilter('list', req.user))

    res.locals.modelHeaders = req.selectedModel?.displayFields || []
    res.locals.modelsData = req.modelsData || []
    // res.locals.contentType = req.contentType || contentType || ''
    res.locals.numberOfPages = numberOfDocuments ? Math.ceil(numberOfDocuments / 10) : 0
    res.locals.currentPage = parseInt(req.query.page) || 1
    res.locals.pendingInvitesRecived = req.pendingInvitesRecived
    next()
}

export async function search_controller(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return next(createError(result.errors.map(err => err.msg).join()))
    }

    //  Get user data
    let { search, page } = matchedData(req, { includeOptionals: true });

    try{
        const where = {
            OR: [
                { title: { contains: search } },
                { body: { contains: search } },
                { author: { 
                        userName: { contains: search } 
                    }
                }
            ]
        }

        const documentsCount = await countRows('post', where)
        const numberOfPages = Math.ceil(documentsCount / 10)
        if(page >= numberOfPages){
            page = numberOfPages
        }else if(page < 1){
            page = 1
        }
        const currentPage = parseInt(page) || 1

        const select = {
            id: true,
            createDate: true,
            slug: true,
            title: true,
            body: true,
            author: {
                select: {
                    userName: true
                }
            }
        }
    
        const query = {
            "skip": page ? (page - 1) * 10 : 0,
            "take": 10,
            where,
            select
        }

        let results = []
        if(documentsCount > 0){
            results = await readRows('post', query)
            for(let i=0; i < results.length; i++){
                if(results[i].title.includes(search) || results[i].title.includes(search)){
                    // result in title or author
                    results[i].body = he.decode(results[i].body).split('</p>')[0].substring(3)
                }else{
                    // result in body
                    results[i].body = he.decode(results[i].body).split('</p>').find(p => p.includes(search)).substring(3)
                }
            }
        }

        res.locals.permissions = {"admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

        res.render('search', { user: req.user, results, documentsCount, numberOfPages, currentPage, search })
    }catch(err){
        console.log(err.message)
        next(err)
    }
}

export async function getPage(req, res, next){
    
    try{
        //  Get page data
        const pageData = await findUnique('page', { slug: 'home' })
        if(!pageData){
            // page not found. move to next middleware and let post catch this slug.
            return next()
        }

        res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

        //unescape body
        pageData.body = he.decode(pageData.body)

        res.render('page', { user: req.user,  pageData })
    }catch(err){
        console.log(err)
        // page not found
        return next(err);
    }
}

export async function getList(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return next(createError(result.errors.map(err => err.msg).join()))
    }

    //  Get user data
    const { mode = 'show' } = matchedData(req, { includeOptionals: true });

    const id = req.params.id
    try{

        //  Get list data
        let listData = await findUnique('list', { id }, modelsInterface.list.selectFields)

        if(!listData){
            // list not found.
            return next(createError(404))
        }

        // destruct
        listData = modelsInterface.list.destructur(listData)


        res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

        //unescape body
        // listData.body = he.decode(listData.body)

        res.render('list', { user: req.user,  listData, mode })
    }catch(err){
        console.log(err)
        // page not found
        return next(err);
    }
}

export function errorPage(err, req, res, next){
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    if(req.originalUrl.includes('/api/')){
        // return json response
        res.json(err)
    }else{
        res.locals.permissions = {"admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }
        // render Error page
        res.render('error', { user: req.user });
    }
}

export async function profile(req, res, next){
    //  Get user data
    const userData = await findUnique('user', { id: req.user.id }, {
        id: true,
        userName: true,
        createDate: true,
        email: true,
        _count: {
            select: { 
                posts: true,
                comments: true
            }
        },
        role: {
            select: {
                id: true,
                name: true
            }
        }
    })
    if(!userData){
        // user not found.
        return next(createError(404))
    }

    res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }
    res.render('profile', { user: req.user, userData })
}
