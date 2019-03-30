const sgMail = require('@sendgrid/mail')

//we send an email send grid will know it's associated with our account and down below we do that using sgmail.send.
//This allows us to send an individual email and we pass to it an object. And on this object we specify everything about the email
// who it's to who it's from the subject of the email and the actual text content right here.

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to:'ankitsrivastava21598@gmail.com',
//     from:'ankitsrivastava21598@example.com',
//     subject:'This is my first creation',
//     text:'I hope this one works'
// })
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'ankit21598@example.com',
        subject:'Thanks for joining!',
        text:`welcome to the app,${name}`
    })
}
const sendByeEmail = (email,name) => {
    sgMail.send({
        to:email,
        from:'ankit21598@example.com',
        subject:'Sad to see you going!!!',
        text:`Good Bye ${name} , Hope to see you soon.`
    })
}

module.exports= {
    sendWelcomeEmail,         //as object as we will exports mul function from this file.
    sendByeEmail
}
