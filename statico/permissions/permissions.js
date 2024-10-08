import createError from 'http-errors'
import { readRows } from '../../db.js'
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

export function isAuthorized(contentType, key, roleId){
    try{
        return permissions[roleId][contentType][key].allow
    }catch(err){
        return false
    }
}

export function ensureAuthorized(contentType, key){
    return function(req, res, next){
        if(isAuthorized(contentType, key, req.user.roleId)){
            next()
        }else{
            next(createError(403, `You are not authorized to view this page! ("${req.originalUrl}")`, {messages: `You are not authorized to view this page! ("${req.originalUrl}")`, messageType: 'warning', messageTitle: 'Forbidden'}))
        }
    }
}

export function getPermissionFilter(contentType, permissionType, user){
    try{
        let where = {}
        if(permissions[user.roleId][contentType][permissionType].where.length === 1){
            where.authorId = user.id
        }else if(permissions[user.roleId][contentType][permissionType].where.length >= 2){
            where = { OR: [ { authorId: user.id }, { viewersIDs: { has: user.id } } ] }
        }

        return where
    }catch(err){
        return {id: "00a00000a00aa0aaaaa0000a"}
    }
}

export function filterByPermissions(contentType, permissionType){
    return function(req, res, next){
        try{
            req.where = getPermissionFilter(contentType, permissionType, req.user)
        }catch(err){
            req.where = {id: "00a00000a00aa0aaaaa0000a"}
        }
        finally{
            next()
        }
    }
}

export function getRolePermissions(req, res, next){
    // Get permissions
    const tmpPermissions = structuredClone(permissions[req.user.roleId])
    // update authorId -> user.id with current user id
    for (const [contentType, typePermissions] of Object.entries(tmpPermissions)) {
        for (const [key, operation] of Object.entries(typePermissions)) {
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

    // return tmpPermissions
    res.locals.permissions = tmpPermissions
    next()
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
    res.locals.adminRoleId = getAdminRoleId()
    next()
}

function getAdminRoleId(){
    let maxKeys = 0
    let objIndex = 0
    for(let i =0; i < permissions.length; i++){
        const objLength = Object.keys(permissions[i]).length
        if(objLength > maxKeys){
            maxKeys = objLength
            objIndex = 1
        }
    }

    return Object.keys(permissions)[objIndex]
}

export { permissions }