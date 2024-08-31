import createError from 'http-errors'
import { readRows } from '../../db.js'
// import permissions from './permissions.json' assert { type: "json" }
import { readFile } from 'fs/promises';

var permissions = {}
await readFile("./statico/permissions/permissions.json", "utf8")
.then(data => {
    permissions = JSON.parse(data)
})
.catch(err => {
    console.log(err)
})

export function updatePermissions(newPermissionsObj){
    permissions = newPermissionsObj
}

export function isAuthorized(req, data){
    if(req.session.userPermissions.list.edit.allow === true 
        || ("authorId" in req.session.userPermissions.list.edit.where && req.session.userPermissions.list.edit.where.authorId === data.authorId)
        || ("viewers" in req.session.userPermissions.list.edit.where && data.viewers.includes(req.user.id) )
    ){
        return true
    }
    return false
}
// export function isAuthorized(contentType, key, roleId){
//     export function isAuthorized(permission, author, viewers){
//     try{
//         if(permission.allow === false){
//             return false
//         }

//         if("where" in permission){
//             if("authorId" in permission.where && permission.where != user.id){
//                 return false
//             }
//             if("viewers" in permission.where && permission.viewers != user.id){
//                 return false
//             }
//         }

//         return true
//     }catch(err){
//         return false
//     }
// }

export function isAllowed(contentType, key, roleId){
    try{
        return permissions[roleId][contentType][key].allow
    }catch(err){
        return false
    }
}

<<<<<<< HEAD
export function ensureallowed(contentType, key, redirect = '/'){
=======
export function ensureAuthorized(contentType, key){
>>>>>>> simple
    return function(req, res, next){
        if(isAllowed(contentType, key, req.user.roleId)){
            next()
        }else{
            next(createError(403, `You are not authorized to view this page! ("${req.originalUrl}")`, {messages: `You are not authorized to view this page! ("${req.originalUrl}")`, messageType: 'warning', messageTitle: 'Forbidden'}))
        }
    }
}

export function getPermissionFilter(contentType, user){
    // let where = permissions[user.roleId][contentType].list.where
    try{
    //     if("authorId" in permissions[user.roleId][contentType].list.where){
    //         where.authorId = user.id
    //     }
        
    //     if("viewers" in permissions[user.roleId][contentType].list.where){
    //         where = { OR: [ { authorId: user.id }, { viewersIDs: { has: user.id } } ] }
    //     }
        let where = {}
        if(permissions[user.roleId][contentType].list.where.length === 1){
            where.authorId = user.id
        }else if(permissions[user.roleId][contentType].list.where.length >= 2){
            where = { OR: [ { authorId: user.id }, { viewersIDs: { has: user.id } } ] }
        }

        return where
    }catch(err){
        return {id: "00a00000a00aa0aaaaa0000a"}
    }
}

export function filterByPermissions(contentType){
    return function(req, res, next){
        try{
            req.where = getPermissionFilter(contentType, req.user)
        }catch(err){
            req.where = {id: "00a00000a00aa0aaaaa0000a"}
        }
        finally{
            next()
        }
    }
}

<<<<<<< HEAD

export function setRolePermissions(req, res, next){
=======
export function getRolePermissions(req, res, next){
>>>>>>> simple
    // Get permissions
    const tmpPermissions = structuredClone(permissions[req.user.roleId])
    // update authorId -> user.id with current user id
    for (const [contentType, typePermissions] of Object.entries(tmpPermissions)) {
        for (const [key, operation] of Object.entries(typePermissions)) {
            // if("where" in operation && "authorId" in operation.where){
            //     operation.where.authorId = req.user.id
            // }
            // if("where" in operation && "viewers" in operation.where){
            //     operation.where.viewers = req.user.id
            // }
            if("where" in operation){
                for(let i=0; i< operation.where.length; i++){
                    if(operation.where[i] === "authorId"){
                        operation.where.authorId = req.user.id
                    }else if(operation.where[i] === "viewers"){
                        operation.where.viewers = req.user.id
                    }
                }
            }
        }
    }

<<<<<<< HEAD
    return tmpPermissions
=======
    // return tmpPermissions
    res.locals.permissions = tmpPermissions
    next()
>>>>>>> simple
}

export async function allRolesPermissions(req, res, next){
    const rolesOrder = {
        "admin": 0,
        "editor": 1,
        "author": 2,
        "contributor": 3,
        "subscriber": 4,
    }
    // get roles
    const roles = await readRows('role', {select: {id: true, name: true, description: true}})
    res.locals.roles = roles.sort((a,b) => rolesOrder[a.name] < rolesOrder[b.name] ? -1 : 1)
    res.locals.permissions = permissions
    
    // set admin role id
    res.locals.adminRoleId = roles.filter((role) => role.name === 'admin')[0].id
    next()
}

// function getAdminRoleId(){
//     let maxKeys = 0
//     let objIndex = 0
//     for(let i =0; i < permissions.length; i++){
//         const objLength = Object.keys(permissions[i]).length
//         if(objLength > maxKeys){
//             maxKeys = objLength
//             objIndex = 1
//         }
//     }

//     return Object.keys(permissions)[objIndex]
// }

export { permissions }