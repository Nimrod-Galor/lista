import nodemailer from 'nodemailer'
import { matchedData } from 'express-validator'

const transporter = nodemailer.createTransport({
    host: "email-smtp.eu-central-1.amazonaws.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
})

async function sendMail(from, to, subject, text, html){
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from,       // sender address: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
        to,         // list of receivers: "bar@example.com, baz@example.com", 
        subject,    // Subject line: "Hello ✔",
        text,       // plain text body: "Hello world?",
        html        // html body: "<b>Hello world?</b>",
    });

    console.log("Message sent: %s", info.messageId);
}

export function sendVerificationMailMiddleware(req, res, next){
    if(req.sendVerificationMail === true){
        //  Get user data
        let { email, username } =  matchedData(req, { includeOptionals: true })
        const verificationToken = req.verificationToken
        const host = req.host
        sendVerificationMail(email, username, host, verificationToken)
    }
    next()
}

// export function sendVerificationMail(req, res, next){
export function sendVerificationMail(email, username, host, verificationToken){
    const from = '"Lista Admin" <info@listnow.net>'
    const to = email
    const subject = "Lista Email verification"
    const text = `Hello ${username}
                You registered an account on Lista, before being able to use your account you need to verify that this is your email address here: ${host}/verify/${verificationToken}
                Kind Regards, Lista`
    const html = `Hello ${username}
    You registered an account on Lista, before being able to use your account you need to verify that this is your email address by clicking <a href="${host}/verify/${verificationToken}">here</a>
    Kind Regards, Lista`

    sendMail(from, to, subject, text, html)
}

export function sendResetPasswordMail(email, username, resetToken, host){
    const from = '"Lista Admin" <info@listnow.net>'
    const to = email
    const subject = "Lista Reset Password"
    const text = `Hi ${username},
                    There was a request to change your ListNow password!
                    If you did not make this request then please ignore this email.
                    Otherwise, please click this link to change your password: ${host}/reset-password/${resetToken}`
    const html = `Hi ${username},
                    There was a request to change your ListNow password!
                    If you did not make this request then please ignore this email.
                    Otherwise, please click this link to change your password: <a href="${host}/reset-password/${resetToken}">Reset Password</a>`

    sendMail(from, to, subject, text, html)
}