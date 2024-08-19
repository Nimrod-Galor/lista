import createError from 'http-errors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs, { unlink } from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { updatePermissions } from '../permissions/permissions.js'
import { sendVerificationMail } from '../controllers/mailController.js'

const prisma = new PrismaClient()

export async function initialize(req, res, next){
    
    let {email, emailverified, password, username} = req.body
    const progress = []
    
    // check for defaul roles
    await prisma.role.count()
    .then(async (roles) => {
        // console.log('roles', roles)
        if(roles > 0){
            // throw new Error('Installation has already been completed', "")
            // return next(createError(406))
            throw createError(406, 'Installation has already been completed')
        }
    }).then(async () => {// ****  Create Roles
        // Update Progress
        progress.push('Subscriber Role Created.', 'Contributer Role Created.', 'Author Role Created.', 'Editor Role Created.', 'Admin Role Created.')

        // Role defenition
        const roles = [
            {
                name: 'subscriber',
                description: 'Somebody who can only manage their profile.',
                default: true
            },
            {
                name: 'contributor',
                description: 'Somebody who can write and manage their own posts but cannot publish them.'
            },
            {
                name: 'author',
                description: 'Somebody who can publish and manage their own posts.'
            },
            {
                name: 'editor',
                description: 'Somebody who can publish and manage posts including the posts of other users.'
            },
            {
                name: 'admin',
                description: 'Somebody who has access to all the administration features within a single site.'
            }
        ]

        // create roles
        const rolesPromise = []
        for(let i=0; i<roles.length; i++){
            rolesPromise.push(prisma.role.create({ data: roles[i]} ) )
        }

        const rolesCreated = await Promise.all(rolesPromise)

        return rolesCreated
    })
    .then(async (rolesCreated) => {// ****  Update permissions
        // Update Progress
        progress.push('Updated permissions.')

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const defaultfilePath = path.join( __dirname, '..', 'permissions', 'default.permissions.json')
        // read permissions file
        let permissionsString = await fs.readFile(defaultfilePath, { encoding: 'utf8' });
        //  for each role replase role name with role id
        for(let i = 0; i < rolesCreated.length; i++){
            const regex = new RegExp(`"${rolesCreated[i].name}"`, "g")
            permissionsString = permissionsString.replace(regex, `"${rolesCreated[i].id}"`)
        }
        // create new file with updated permissions
        const filePath = path.join( __dirname, '..', 'permissions', 'permissions.json')
        // update permissions JSON file
        await fs.writeFile(filePath, permissionsString)

        // update permision app Variable
        updatePermissions(JSON.parse(permissionsString))
        
        const adminRole = rolesCreated[4]
        // return admin role to create admin user
        return adminRole
    })
    .then(async (adminRole) => {// ****  Create Admin user
        // Update Progress
        progress.push(`Admin user (${username}) Created.`)

        // send verification Email
        emailverified = emailverified ? false : true

        // Create a verification token
        const verificationToken = !emailverified ? jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' }) : undefined

        // Set token and expiration date
        const verificationTokenExpires = !emailverified ? new Date(Date.now() + 3600000) : undefined // 1 hour

        // // hash passowrd
        const salt = crypto.randomBytes(16)
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    
        // create admin user
        const adminUser = {
            email,
            emailVerified : emailverified,
            password: key.toString('hex'),
            salt: salt.toString('hex'),
            userName: username,
            role: {
                connect: {id: adminRole.id}
                },
            verificationToken,
            verificationTokenExpires
        }
    
        await prisma.user.create({data: adminUser})
        // Verification mail
        if(!emailverified){
            const host = req.host
            sendVerificationMail(email, username, host, verificationToken)
            progress.push(`Email verification code sent to: ${email}.`)
        }
    })
    .then(async () => {// ****  Create Default Pages
        // Update Progress
        progress.push('Default Home page Created.')
        
        // Create Default home page
        const homePage = {
            metatitle:  "Statico Default Home Page",
            metadescription:  "Statico Default Home Page",
            slug:   "home",
            title:  "Statico Default Home Page",
            body:  "Statico Default Home Page",
            publish: true
        }
        await prisma.page.create({data: homePage})
        // return
    })
    .then(async () => {// ****  Create Default Features page
        // Update Progress
        progress.push('Default Features page Created.')
        
        const featuresPage = {
            metatitle:  "Statico Default Features Page",
            metadescription:  "Statico Default Features Page",
            slug:   "features",
            title:  "Statico Default Features Page",
            body:  "Statico Default Features Page",
            publish: true
        }
        await prisma.page.create({data: featuresPage})
        // return
    })
    .then(async () => {// ****  Create Default Pricing page
        // Update Progress
        progress.push('Default Home pricing Created.')
        
        const pricingPage = {
            metatitle:  "Statico Default Pricing Page",
            metadescription:  "Statico Default Pricing Page",
            slug:   "pricing",
            title:  "Statico Default Pricing Page",
            body:  "Statico Default Pricing Page",
            publish: true
        }
        await prisma.page.create({data: pricingPage})
        // return
    })
    .then(async () => {// ****  Create Default FAQ page
        // Update Progress
        progress.push('Default FAQ page Created.')
        
        const faqPage = {
            metatitle:  "Statico Default FAQ Page",
            metadescription:  "Statico Default FAQ Page",
            slug:   "faq",
            title:  "Statico Default FAQ Page",
            body:  "Statico Default FAQ Page",
            publish: true
        }
        await prisma.page.create({data: faqPage})
        // return
    })
    .then(async () => {// ****  Create Default About page
        // Update Progress
        progress.push('Default About page Created.')
        
        const aboutPage = {
            metatitle:  "Statico Default About Page",
            metadescription:  "Statico Default About Page",
            slug:   "about",
            title:  "Statico Default About Page",
            body:  "Statico Default About Page",
            publish: true
        }
        await prisma.page.create({data: aboutPage})
        // return
    })
    .then(async () => {
        // Update Progress
        progress.push('Setup completed successfully.')
        
        //  if we got up to heare with no errors, delete setup (index) file from public folder.
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join( __dirname, '..', '..', 'public', 'index.html')
        await unlink(filePath)


        // Send Success json
        req.crud_response = {messageBody: progress, messageTitle: 'Success', messageType: 'success'}

        next()
    })
    .catch((err) => {
        //  Send Error json
        // req.crud_response = {messageBody: err.message, messageTitle: 'Error', messageType: 'danger'}
        // next(createError(500, err.message))
        next(err)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
}
