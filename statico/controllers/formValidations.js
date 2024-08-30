import { body, query, validationResult, matchedData } from 'express-validator'
import { findUnique } from '../../db.js'

/*  Global  */

export const deleteValidation = () => [
    body('id')
        .trim()
        .notEmpty().withMessage('ID can not be empty.')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('header')
        .trim()
        .notEmpty().withMessage('Header can not be empty.')
        .isLength({ min: 3, max: 128 }).withMessage('Header must be at 3 to 128 characters.')
]

export const bulkValidation = () => [
    // Custom sanitizer to ensure 'ids' is always an array
    body('id').customSanitizer(value => {
            // Coerce to an array if it's a single value
            if (!Array.isArray(value)) {
                return [value];
            }
            return value;
        }),
    body('id.*')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    // Custom sanitizer to ensure 'headers' is always an array
    body('header').customSanitizer(value => {
            // Coerce to an array if it's a single value
            if (!Array.isArray(value)) {
                return [value];
            }
            return value;
        }),
    // body('header.*')
    //     .isAlphanumeric().withMessage('Header must be Alphanumeric')
]

export const postIdValidation = () => [
    body('id')
        .trim()
        .notEmpty().withMessage('ID can not be empty.')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId')
]

/*  User    */
export const userValidation = () => [
    body('id')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('email')
        // .if((value, { req }) => !req.body.id)  // Only validate if id is empty
        .isEmail().withMessage('Enter a valid email address')
        // .normalizeEmail()
        .custom(async ( value, { req }) => {
            // Check if user exists
            const existingUser = await findUnique('user', { email: value })
            if(existingUser && existingUser.id != req.body.id){
                throw new Error('An account with that email address already exists')
            }
        })
        .normalizeEmail(),
    body('emailverified')
        .optional(),
    body('password')
        .if((value, { req }) => !req.body.id || value != '')  // Only validate password if id is empty (create user) OR password is not empty (edit user)
        .trim()
        .isStrongPassword().withMessage('Password must contain at least one number and one special character and one uppercase and lowercase letter, and at least 8 or more characters')//minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
        .escape(),
    body('username')
        .trim()
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .escape(),
    body('role')
        .optional()
        .custom(async value => {
            // check role exists
            const roleExists = await findUnique('role', { id: value })
            if(!roleExists){
                throw new Error('Role not exists')
            }
        })    
]

/*  Post    */
export const postValidation = () => [
    body('id')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('title')
        .trim()
        .isLength({ min: 3, max: 128 }).withMessage('Title must be at least 3 characters and max 128.')
        .escape(),
    body('body')
        .trim()
        .notEmpty().withMessage('Body can not be empty.')
        .escape(),
    body('publish')
        .optional(),
    body('slug')
        .optional({ checkFalsy: true })
        .trim()
        .isSlug().withMessage('Invalid Slug'),
    body('metatitle')
        .optional({ checkFalsy: true }),
    body('metadescription')
        .optional({ checkFalsy: true })
]


/*  List    */
export const listValidation = () => [
    body('id')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('dir')
        .custom(async value => {
            const dirEnum = ['ltr', 'rtl']
            if(!dirEnum.includes(value)){
                throw new Error('Bad Lang Direction')
            }
        }),
    body('title')
        .trim()
        .isLength({ min: 3, max: 128 }).withMessage('Title must be at least 3 characters and max 128.')
        .escape(),
    body('body')
        // .isJSON({ allow_primitives: true }).withMessage('Body is not JSON.'),
        // .trim()
        .notEmpty().withMessage('Body can not be empty.'),
        // .escape(),
    body('description')
        .optional()
        .trim()
        .escape(),
    body('publish')
        .optional(),
    body('viewPermission')
        .optional({ checkFalsy: true }),
    body('editPermission')
        .optional({ checkFalsy: true })
]

export const commentsListValidation = () => [
    body('post')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('page')
        .isNumeric().withMessage('Page must be Numeric'),
    body('order')
        .isString().withMessage('Order must be String')
]

export const inviteSendValidation = () => [
    body('email')
        .isEmail().withMessage('Enter a valid email address')
        .custom(async ( value, { req }) => {
            // Check if user exists
            const existingUser = await findUnique('user', { email: value })
            if(!existingUser){
                throw new Error(`An account with email "${value}" could not be found.`)
            }
            // Check user not already a viewer
            if(existingUser.viewableListsIDs.includes(req.body.listId)){
                throw new Error(`Account with email "${value}" is already a viewer to this list.`)
            }
        })
        .normalizeEmail(),
    body('listId')
    .isMongoId().withMessage('ID must be a valid MongoDB ObjectId')
]

export const acceptInviteidValidation = () => [
    body('inviteid')
        .isMongoId().withMessage('inviteID must be a valid MongoDB ObjectId'),
    body('listid')
        .isMongoId().withMessage('listID must be a valid MongoDB ObjectId')
]

export const cancelInviteidValidation = () => [
    body('inviteid')
        .isMongoId().withMessage('inviteID must be a valid MongoDB ObjectId')
]

export const removeViewerValidation = () => [
    body('listid')
        .isMongoId().withMessage('listID must be a valid MongoDB ObjectId'),
    body('userid')
        .isMongoId().withMessage('userID must be a valid MongoDB ObjectId'),
    body('header')
        .optional()
        .trim()
        .notEmpty().withMessage('Header can not be empty.')
]

/*  Role    */
export const roleValidation = () => [
    body('id')
        .isMongoId().withMessage('ID must be a valid MongoDB ObjectId'),
    body('name')
        .trim()
        .isLength({ min: 3 }).withMessage('Role name must be at least 3 characters.')
        .isAlphanumeric().withMessage('Role name must be Alphanumeric.'),
    body('description')
        .trim()
        .isLength({ min: 3 }).withMessage('Role description must be at least 3 characters.')
        // .isAlphanumeric().withMessage('Role description must be Alphanumeric.')
]

/*  Search  */
export const searchValidation = () => [
    query('search')
        .trim()
        .notEmpty().withMessage('Search can not be empty string.')
        .isAlphanumeric().withMessage('Search must be Alphanumeric.'),
    query('page')
        .optional()
        .trim()
        .isNumeric().withMessage('Invalid Page number.')
        
]

export const modeValidation = () => [
    query('mode')
        .optional()
        .trim()
        .notEmpty().withMessage('mode cannot be empty string.')
        .custom(async value => {
            const modeEnum = ['create', 'show', 'edit']
            if(!modeEnum.includes(value)){
                throw new Error('Mode not exists')
            }
        }) 
]

export function checkValidation(req, res, next){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        //  Send Error json
        req.crud_response = {messageBody: result.errors.map(err => err.msg), messageTitle: 'Error', messageType: 'danger'}
        return next()
    }
    //  Get user data
    req.objectData = matchedData(req, { includeOptionals: true });

    next()
    // Convert publish checkbox to boolean
    // publish = publish ? true : false
}

// export {deleteValidation, userValidation, bulkValidation, listValidation, roleValidation,
//         commentsListValidation, postIdValidation, searchValidation, postValidation, modeValidation,
//         inviteSendValidation, acceptInviteidValidation, cancelInviteidValidation, removeViewerValidation }