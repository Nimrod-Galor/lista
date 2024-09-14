import { validationResult, matchedData } from 'express-validator'
import createError from 'http-errors'
import crypto from 'crypto'
import { findUnique, readRow, readRows, updateRow, createRow, deleteRow, deleteRows } from '../../db.js'
import { isAuthorized } from '../permissions/permissions.js'
import modelsInterface from '../interface/modelsInterface.js'



// Create
export function createDataType(dataType){
    return async function(req, res, next){
        const result = validationResult(req);
        if (!result.isEmpty()) {
            //  Send Error json
            req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
            return next()
        }
        //  Get user data
        const objectData = matchedData(req, { includeOptionals: true })

        switch(dataType){
            case 'list':
                // Convert publish checkbox to boolean
                objectData.publish = objectData.publish ? true : false
                objectData.author = { connect: { id: req.user.id } }
                break
            case 'page':
                if(objectData.slug != ''){
                    // check if slug exist
                    const pageWithSlug = await findUnique('page', { slug: objectData.slug })
                    if(pageWithSlug){
                        // page with same slug exist
                        req.crud_response = {messageBody: 'page with the same slug already been taken.', messageTitle: 'Alert', messageType: 'warning'}
                        return next()
                    }
                }
            break
        }

        try{
            // Create Object
            const newObject = await createRow(dataType, objectData)

            req.newObjectId = newObject.id

            // Send Success json
            req.crud_response = {messageBody: `${dataType} was created successfuly`, messageTitle: `${dataType} Created`, messageType: 'success'}
        }catch(errorMsg){
            //  Send Error json
            req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
        }finally{
            next()
        }
    }
}

// Update
export function updateDataType(dataType){
    return async function(req, res, next){
        const result = validationResult(req);
        if (!result.isEmpty()) {
            //  Send Error json
            req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
            return next()
        }
        //  Get user data
        const objectData = matchedData(req, { includeOptionals: true })

        switch(dataType){
            case 'user':
                // Convert emailverified checkbox to boolean
                objectData.emailVerified = objectData.emailverified ? true : false
                delete objectData.emailverified
                objectData.userName = objectData.username
                delete objectData.username
                objectData.role = { connect: { id: objectData.role }}
                if(objectData.password === ''){
                    delete objectData.password
                }else{
                    // Hash passowrd
                    const salt = crypto.randomBytes(16)
                    const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        
                    objectData.password = key.toString('hex')
                    objectData.salt = salt.toString('hex')
                }
            break
            case 'list':
                // Convert publish checkbox to boolean
                objectData.publish = objectData.publish ? true : false
                // check if user have publisg permission
                if(!isAuthorized('publish_list', req.user.roleId)){
                    delete objectData.publish
                }
            break
        }
    
        try{
            const query = { id: objectData.id, AND: req.where }
            
            delete objectData.id
            
            //  Update data type
            await updateRow(dataType, query, objectData)
    
            // Send Success json
            req.crud_response = {messageBody: `${dataType} was successfuly updated`, messageTitle: `${dataType} Updated`, messageType: 'success'}
        }catch(errorMsg){
            // Send Error json
            req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
        }
        finally{
            next()
        }
    }
}

// Delete
export function deleteDataType(dataType){
    return async function(req, res, next){
        const result = validationResult(req);
        if (!result.isEmpty()) {
            //  Send Error json
            req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
            return next()
        }
        //  Get user data
        const { id } = matchedData(req, { includeOptionals: true })

        try{
             //  Delete List
            await deleteRow(dataType, { id })

            // Send Success json
            req.crud_response = {messageBody: `${dataType} was successfuly deleted`, messageTitle: `${dataType} Deleted`, messageType: 'success'}
        }catch(errorMsg){
            // Send Error json
            req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
        }
        finally{
            next()
        }
    }
}

/*  List content  */
export function listContent(contentType){
    return async function(req, res, next){
        try{
            // get selected content type name
            contentType = contentType || req.params.contentType || Object.keys(modelsInterface)[0]
            
            // get selected model
            const selectedModel = modelsInterface[contentType]
        
            // check we didnt get here by mistake
            if(selectedModel === undefined){
                return next(createError(404, 'Resource not found'))
            }
        
            // build models data query string
            const where = req.where || {}
            const orderBy = {}
            if(req.params[0]){
                // check for extra parmas
                const paramsArr = req.params[0].split('/')
                for(let i=0; i<paramsArr.length;i++){
                    const param = paramsArr[i]
                    // check if param of type sort
                    if(param === 'desc' || param === 'asc'){
                        // let filterOn = paramsArr[++i]
                        let filterOn = paramsArr[++i]
                        
                        // check if field is relation table
                        if(!selectedModel.selectFields[filterOn]){// count
                            orderBy[filterOn] = {
                                "_count" : param
                            }
                        }else if(typeof selectedModel.selectFields[filterOn] === 'object'){// relation
                            const field = selectedModel.displayFields.find(field => field.key === filterOn)
                            orderBy[field.sortRelation]= {
                                [field.sortKey] : param
                            }
                        }else{
                            switch(filterOn){// some fields are computed by prisma. see db.js
                                case 'createDate':
                                    filterOn = 'createdAt'
                                break
                                case 'updated':
                                    filterOn = 'updatedAt'
                                break
                            }
                            orderBy[filterOn] = param
                        }

                        continue
                    }

                    // check if param of type filter 
                    const filter = selectedModel.filters.find(f => f.name == param)
                    if(filter){
                        let filterOn = paramsArr[++i]
                        // check if filteron is valid
                        if(isValid(filterOn, filter.type)){
                            if(filter.type === "BooleanString"){
                                filterOn = stringToBoolean(filterOn)
                            }
                            // set filter
                            where[filter.key] = filterOn
                        }
                    }
                }
            }
        
            const query = {
                "skip": req.query.page ? (req.query.page - 1) * 10 : 0,
                "take": 10,
                where,
                "select": selectedModel.selectFields,
                orderBy
            }
            //  Get models data
            let modelsData = await readRows(contentType, query)
            
            // destruct nested fields
            if('destructur' in selectedModel){
                modelsData = modelsData.map(selectedModel.destructur)
            }

            req.contentType = contentType
            req.selectedModel = selectedModel
            req.modelsData = modelsData
            // response for api
            req.crud_response = {messageBody: modelsData, messageTitle: 'Success', messageType: 'data'}
        }catch(errorMsg){
            //  Send Error json
            req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
        }
        finally{
            next()
        }
    }
}

/****************************************/
/** List                                */
/****************************************/

export async function deleteList(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    const { id, header } = matchedData(req, { includeOptionals: true })

    try{
        // Delete invites senet
        const invites = await deleteRows('invite', { listId: id })

        //  Delete List
        await deleteRow('list', { id })

        // Send Success json
        req.crud_response = {messageBody: `List "${header}", ${invites.count} invites was successfuly deleted`, messageTitle: `List Deleted`, messageType: 'success'}
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

/****************************************/
/** Invite                                */
/****************************************/

// list pending recived invites
export async function pendingInvitesRecived(req, res, next){
    try{
        const where = { recipientEmail: req.user.email }
        const select = {
            id: true,
            author: {
                select:{
                    email: true,
                    userName: true
                }
            },
            list: {
                select: {
                    id: true,
                    title: true
                }
            }
        }

        const pendingInvitesRecived = await readRows('invite', {where, select})

        req.pendingInvitesRecived = pendingInvitesRecived
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

// Accept Invite
export async function acceptInvite(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    //  Get user data
    let { inviteid, listid } = matchedData(req, { includeOptionals: true })

    try{
        // add  user to list viewer
        await updateRow('list', { id: listid }, {
            viewers: {
                connect: { id: req.user.id }
            }
        })

        //delete invite
        await deleteRow('invite', {id: inviteid } )

        // Send Success json
        req.crud_response = {messageBody: `invitation was accepted. list is part of "my lists".`, messageTitle: 'Invitation Accepted', messageType: 'success'}
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

// Decline Invite
export async function declineInvite(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    //  Get user data
    let { inviteid } = matchedData(req, { includeOptionals: true })

    try{
        //delete invite
        await deleteRow('invite', { id: inviteid } )

        // Send Success json
        req.crud_response = {messageBody: `invitation was declined`, messageTitle: 'Invitation Declined', messageType: 'success'}
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

// Cancel Invite
export async function cancelInvite(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    //  Get user data
    let { inviteid } = matchedData(req, { includeOptionals: true })

    try{
        //delete invite
        await deleteRow('invite', { id: inviteid } )

        // Send Success json
        req.crud_response = {messageBody: `invitation was canceled`, messageTitle: 'Invitation Canceled', messageType: 'success'}
    }catch(errorMsg){
        //  Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
        next()
    }
}

// Send Invite to user
export async function inviteUser(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }

    //  Get user data
    let { listId, email } = matchedData(req, { includeOptionals: true })

    // check intivitaion is not already open.
    try{
        const openInvite = await readRow('invite', {
            select: {id: true},
            where: { listId, recipientEmail: email }
        })
        if(openInvite){
            req.crud_response = {messageBody: `Invitation already exists`, messageTitle: 'Invitation Exists', messageType: 'warning'}
            return next()
        }

    }catch(err){
        if (!err.name === "NotFoundError") {
            req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
            return next()
        }
    }

    try{
        // Set new Invite object
        const tmpInvite = {
            list: {
                connect: {id: listId}
            },
            recipient: {
                connect: { email }
            },
            author: {
                connect: { id: req.user.id }
            }
        }

        // Create Invite
        const newInvite = await createRow('invite', tmpInvite)

        // Send Success json
        req.crud_response = {messageBody: `Invitation Sent to "${email}"`, messageTitle: 'Invitation Created', messageType: 'success'}
        
    }catch(errorMsg){
         // Send Error json
         req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
     }
     finally{
        next()
    }
}

// Rmove viewer from list
export async function removeViewer(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    
    //  Get user data
    let { listid, userid, header } = matchedData(req, { includeOptionals: true })

    try{
        // Update the list to disconnect the user from the viewLists relation
        await updateRow('list', { id: listid }, { viewers: {
                disconnect: { id: userid }
            }
        } )

        // Send Success json
        if(header){
            req.crud_response = {messageBody: `List "${header} was removed from "My Lists".`, messageTitle: 'List removed', messageType: 'success'}
        }else{
            req.crud_response = {messageBody: `User removed from list`, messageTitle: 'Viewer removed', messageType: 'success'}
        }
    }catch(errorMsg){
        // Send Error json
        req.crud_response = {messageBody: errorMsg.message, messageTitle: 'Error', messageType: 'danger'}
    }
    finally{
       next()
   }
}

export function setSessionMessages(req, res, next){
    //  Set alert message session
    req.session.messages = Array.isArray(req.crud_response.messageBody) ? req.crud_response.messageBody : [req.crud_response.messageBody]
    req.session.messageType = req.crud_response.messageType
    req.session.messageTitle = req.crud_response.messageTitle
    next()
}