import createError from 'http-errors'
import he from 'he'
import { findUnique, countRows } from '../db.js'
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

    const numberOfDocuments = await countRows('list', req.where)

    res.locals.modelHeaders = req.selectedModel?.displayFields || []
    res.locals.modelsData = req.modelsData || []
    // res.locals.contentType = req.contentType || contentType || ''
    res.locals.numberOfPages = numberOfDocuments ? Math.ceil(numberOfDocuments / 10) : 0
    res.locals.currentPage = parseInt(req.query.page) || 1
    // res.locals.permissions = req.session.userPermissions
    res.locals.pendingInvitesRecived = req.pendingInvitesRecived
    // res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }

    next()
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
    const { mode = 'show' } = req.objectData
    
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

        res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) }, 
                                     "list": { "edit": isAuthorized("list", "edit", req.user?.roleId) && (listData.authorId == req.user.id || listData.viewersIDs.includes(req.user.id)) } }

        res.render('list', { user: req.user,  listData, mode })
    }catch(err){
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

// export async function profile(req, res, next){
//     //  Get user data
//     const userData = await findUnique('user', { id: req.user.id }, {
//         id: true,
//         userName: true,
//         createDate: true,
//         email: true,
//         _count: {
//             select: { 
//                 posts: true,
//                 comments: true
//             }
//         },
//         role: {
//             select: {
//                 id: true,
//                 name: true
//             }
//         }
//     })
//     if(!userData){
//         // user not found.
//         return next(createError(404))
//     }

//     res.locals.permissions = { "admin_page": { "view": isAuthorized("admin_page", "view", req.user?.roleId) } }
//     res.render('profile', { user: req.user, userData })
// }
