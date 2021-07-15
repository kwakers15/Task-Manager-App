const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'minjunkwak@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'minjunkwak@gmail.com',
        subject: "We're sorry to see you go!",
        text: `Hey, ${name}. We wanted to ask you about what we could have done better to make you stay.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}