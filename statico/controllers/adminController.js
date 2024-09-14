import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validationResult, matchedData } from 'express-validator'
import modelsInterface from '../interface/modelsInterface.js'
import { countsRows, createRow, readRow, readRows, updateRow, deleteRow, deleteRows, findUnique } from '../../db.js'
import { isAuthorized, getPermissionFilter } from '../permissions/permissions.js'

// get name of all models
const modelsName = Object.keys(modelsInterface)

/** Get Content */
export function admin_dashboard(contentType){
    return async function(req, res, next){
        // check for errors
        if(req.crud_response && req.crud_response.messageType != 'data'){
            res.locals.messages = [req.crud_response.messageBody];
            res.locals.messageTitle = req.crud_response.messageTitle
            res.locals.messageType = req.crud_response.messageType
            res.locals.hasMessages = true
        }

        // Count documents of every model
        const countModels = []
        const countSelectes = []
        for(let i = 0; i <modelsName.length; i++){
            if(isAuthorized(modelsName[i], 'list', req.user.roleId)){
                countModels.push(modelsName[i])
                countSelectes.push(getPermissionFilter(modelsName[i], 'list', req.user))
            }
        }
        const documentsCount = await countsRows(countModels, countSelectes)

        // update counts in models list
        for(let i=0; i< documentsCount.length; i++){
            modelsInterface[modelsName[i]].count = documentsCount[i]
        }

        // Set sidebat data
        const sidebarData = {}
        for (const [key, interFace] of Object.entries(modelsInterface)) {
            const tmpObj = (({ displayName, count, selectFields }) => ({ displayName, count, selectFields }))(interFace);
            // destruct nested fields
            if('destructur' in interFace){
                tmpObj.selectFields = interFace.destructur(tmpObj.selectFields)
            }
            tmpObj.selectFields = Object.keys(tmpObj.selectFields)
            tmpObj.selected = key === req.contentType
            sidebarData[key] = tmpObj
        }

        // Set locals variables to use in ejs
        res.locals.sidebarData = sidebarData
        res.locals.modelHeaders = req.selectedModel?.displayFields || []
        res.locals.modelsData = req.modelsData || []
        res.locals.contentType = req.contentType || contentType || ''
        res.locals.numberOfPages = (req.contentType in sidebarData) ? Math.ceil(sidebarData[req.contentType].count / 10) : 0
        res.locals.currentPage = parseInt(req.query.page) || 1

        next()
    }
}
/****************************************/
/** User                                */
/****************************************/

/** Create User */
export async function createUser(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // dont send varification Email
        req.sendVerificationMail = false
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    let { email, username, password, role, emailverified } = matchedData(req, { includeOptionals: true });

    // sendVerificationMail will determine if send verification 
    req.sendVerificationMail = emailverified ? true : false
    // in admin form user select "Send verification email". if selected emailverifed is false
    emailverified = emailverified ? false : true

    try{
        if(role == undefined){
            // no role selected, get default role
            const defaultRole = await readRow('role', {
                select: {id: true},
                where: {default: true}
            })
            
            role = defaultRole.id
        }

        // Hash passowrd
        const salt = crypto.randomBytes(16)
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

        // Create a verification token
        // we need this variable down in the sendmail middleware.
        req.verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token and expiration date
        const verificationTokenExpires = new Date(Date.now() + 3600000) // 1 hour
        
        //  Set new user object
        const tmpUser = {
          email,
          emailVerified: emailverified, 
          password: key.toString('hex'),
          salt: salt.toString('hex'),
          userName: username,
          role: {
            connect: {id: role}
          },
          verificationToken: req.verificationToken,
          verificationTokenExpires
        }

        // Create new user
        await createRow('user', tmpUser)

        // Set return message
        let msg = 'Your account has been successfully created.'
        if(!emailverified){
            msg += ' An email with a verification code was just sent to: ' + email
        }

        // Send Success json
        req.crud_response = {messageBody: msg, messageTitle: 'Success', messageType: 'success'}
    }catch(errorMsg){
        // dont send varification Email
        req.sendVerificationMail = false
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

export async function deleteUser(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    //  Get user data
    let { id, header } = matchedData(req, { includeOptionals: true })

    try{
        // get User email
        const userEmail = await findUnique('user', { id }, { email: true })
        // Delete pending invites
        const deletedPending = await deleteRows('invite', { recipientEmail: userEmail.email })
        
        // Delete invites senet
        const invitesSent = await deleteRows('invite', { authorId: id })

        // Delete all user Lists
        const deletedLists = await deleteRows('list', { authorId: id })

        //  Delete user
        const deletedUser = await deleteRow('user', { id })

        // Send Success json
        req.crud_response = {messageBody: `User "${header}", ${deletedPending.count} pending Invites, ${invitesSent.count} sent invites, ${deletedLists.count} user lists, was successfuly deleted`, messageTitle: 'User Delete', messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}



/****************************************/
/** Role                                */
/****************************************/

// List roles
export async function listRoles(req, res, next){
    try {
        //  Get roles
        const roles = await readRows('role', {select:{ id: true, name: true, description: true, default: true}})

        req.crud_response = {messageBody: roles, messageTitle: 'Count Comments', messageType: 'data'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

// Delete
export function bulkDelete(contentType){
    return async function(req, res, next){
        const result = validationResult(req);
        if (!result.isEmpty()) {
            //  Send Error json
            req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
            return next()
        }
        //  Get user data
        let {id, header} = matchedData(req, { includeOptionals: true });
        let messageBody = ''
        try{
            //  Delete
            // if(Array.isArray(id)){
            //     messageBody = []
            //     for(let i=0; i< id.length; i++){
            //         await deleteRow(contentType, { id: id[i] })
            //         messageBody.push(`${contentType} "${header[i]}" was successfuly deleted`)
            //     }
            // }else{
            //     await deleteRow(contentType, { id })
            //     messageBody = `${contentType} "${header}" was successfuly deleted`
            // }

            if(!Array.isArray(id)){
                id = [id]
                header = [header]
            }

            messageBody = []
            for(let i=0; i< id.length; i++){
                switch(contentType){
                    case 'list':
                        // Delete invites senet
                        const invites = await deleteRows('invite', { listId: id[i] })
                    break
                }
                await deleteRow(contentType, { id: id[i] })
                messageBody.push(`${contentType} "${header[i]}" was successfuly deleted`)
            }

            // Send Success json
            req.crud_response = { messageBody, messageTitle: `${contentType} Delete`, messageType: 'success' }
        }catch(errorMsg){
            // Send Error json
            req.crud_response = { messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger' }
        }
        finally{
            next()
        }
    }
}

/****************************************/
/** Bulk                                */
/****************************************/

// Update publish
export function bulkPublish(contentType, publish){
    return async function(req, res, next){
        const result = validationResult(req);
        if (!result.isEmpty()) {
            //  Send Error json
            req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
            return next()
        }
        //  Get user data
        let {id, header} = matchedData(req, { includeOptionals: true });
        let messageBody = ''
        try{
            let action
            let obj
            if(contentType === 'user'){
                action = req.originalUrl.includes('unpublish') ? 'Unverify' : 'Verify'
                obj = { emailVerified: publish }
            }else{
                action = req.originalUrl.includes('unpublish') ? 'Unpublish' : 'Publish'
                obj = { publish }
            }
            //  Publish
            if(Array.isArray(id)){
                messageBody = []
                for(let i=0; i< id.length; i++){
                    await updateRow(contentType, { id: id[i] }, obj)
                    messageBody.push(`${contentType} "${header[i]}" was successfuly ${action}`)
                }
            }else{
                await updateRow(contentType, { id: id }, obj)
                messageBody = `${contentType} "${header}" was successfuly ${action}`
            }

            // Send Success json
            req.crud_response = { messageBody, messageTitle: `${contentType} ${action}`, messageType: 'success' }
        }catch(errorMsg){
            // Send Error json
            req.crud_response = { messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger' }
        }
        finally{
            next()
        }
    }
}

// Bulk Delete user
export async function bulkDeleteUser(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    let {id, header} = matchedData(req, { includeOptionals: true });
    let messageBody = ''
    try{
        //  Delete
        if(!Array.isArray(id)){
            id = [id]
            header = [header]
        }
        messageBody = []
        for(let i=0; i< id.length; i++){
            // get User email
            const userEmail = await findUnique('user', { id }, { email: true })
            // Delete pending invites
            const deletedPending = await deleteRows('invite', { recipientEmail: userEmail.email })

            // Delete invites senet
            const invitesSent = await deleteRows('invite', { authorId: id })

            // Delete all users lists connections 

            // Delete all user Lists
            const deletedLists = await deleteRows('list', { authorId: id })

            //  Delete user
            const deletedUser = await deleteRow('user', { id })

            messageBody.push(`User "${header[i]}", ${deletedPending.count} pending Invites, ${invitesSent.count} sent invites, ${deletedLists.count} user lists, was successfuly deleted`)
        }
        // }else{
        //     // get User email
        //     const userEmail = await findUnique('user', { id }, { email: true })
        //     // Delete pending invites
        //     const deletedPending = await deleteRows('invite', { recipientEmail: userEmail.email })

        //     // Delete invites senet
        //     const invitesSent = await deleteRows('invite', { authorId: id })

        //     // Delete all users lists connections 

        //     // Delete all user Lists
        //     const deletedLists = await deleteRows('list', { authorId: id })

        //     //  Delete user
        //     const deletedUser = await deleteRow('user', { id })

        //     messageBody = `User "${header}", ${deletedPending} pending Invites, ${invitesSent} sent invites, ${deletedLists} user lists, was successfuly deleted`
        // }

        // Send Success json
        req.crud_response = { messageBody, messageTitle: `User Delete`, messageType: 'success' }
    }catch(errorMsg){
        // Send Error json
        req.crud_response = { messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger' }
    }
    finally{
        next()
    }
}
