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

export function isAuthorized(contentType, key, roleId){
    try{
        return permissions[roleId][contentType][key].allow
    }catch(err){
        return false
    }
}

export function ensureAuthorized(contentType, key, redirect = '/'){
    return function(req, res, next){
        if(isAuthorized(contentType, key, req.user.roleId)){
            next()
        }else{
            next(createError(403, `You are not authorized to view this page! ("${req.originalUrl}")`, {messages: `You are not authorized to view this page! ("${req.originalUrl}")`, messageType: 'warning', messageTitle: 'Forbidden'}))
        }
    }
}

export function getPermissionFilter(contentType, user){
    let where = permissions[user.roleId][contentType].list.where
    try{
        if("authorId" in permissions[user.roleId][contentType].list.where){
            where.authorId = user.id
        }
        
        if("viewersIDs" in permissions[user.roleId][contentType].list.where){
            // where.viewersIDs = { has: user.id }
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

export function setRoleLocalsPermissions(req, res, next){
    // Get permissions
    const tmpPermissions = structuredClone(permissions[req.user.roleId])
    // update authorId -> user.id with current user id
    for (const [contentType, typePermissions] of Object.entries(tmpPermissions)) {
        for (const [key, operation] of Object.entries(typePermissions)) {
            if("where" in operation && "authorId" in operation.where){
                operation.where.authorId = req.user.id
            }
        }
    }

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