const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'
sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to: email,
        from: 'asifkhanhkkb@gmail.com',
        subject: 'Welcome to the app',
        text: `Hello, ${name},welcomen to this app`
    })
}

const sendCancelationEmail = (email,name)=>{
    sgMail.send({
        to: email,
        from: 'asifkhanhkkb@gmail.com',
        subject: 'can you help us to emprove',
        text: `Hello, ${name}, can we help you for something`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}