require('dotenv')

const auth = {
    type: 'OAuth2',
    user: 'abhisheksavaliya555@gmail.com',
    clientId: process.env.CLIENT_ID,
    ClientSecret: process.env.CLIENT_SECRET,
    refreshToken : process.env.REFRESH_TOKEN
}

const mailOptions = {
    from : 'abhisheksavaliya555@gmail.com',
    to : 'abhisheksavaliya666@gmail.com',
    subject : 'Gmail API Using Node.js'
}

module.exports = {
    auth,
    mailOptions
}