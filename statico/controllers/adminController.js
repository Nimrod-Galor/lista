import modelsInterface from '../interface/modelsInterface.js'
import { countsRows } from '../../db.js'
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
                countSelectes.push(getPermissionFilter(modelsName[i], req.user))
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
        res.locals.permissions = req.session.userPermissions
        
        next()
    }
}
