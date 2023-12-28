const axios = require('axios')
const { createConfig } = require('./util')
const nodemailer = require('nodemailer')
const CONSTANTS = require('./constant')
const { google } = require('googleapis')
require('dotenv').config();

const oAuthClient = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REFRESH_TOKEN
)

oAuthClient.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

exports.sendMail = async () => {
    try {
        await allEmailThread();
        return 'send response'
    } catch (error) {
        return 'Internal Server Error'
    }
};

const createLabel = async (labelName, token) => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/labels`;
    const config = createConfig(url, token);
    try {
        const label = await axios.post(url, { name: labelName }, config);
        return label.data;
    } catch (error) {
        console.log(error)
    }
};

const addLabelToEmail = async (emailId, labelName, token) => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`;
    const config = createConfig(url, token);
    try {
        const label = await axios.post(url, { addLabelIds: [labelName] }, config);
        return label.data;
    } catch (error) {
        console.log(error)
    }
};

const emailReply = async (toEmail, replyContent, token) => {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            ...CONSTANTS.auth,
            accessToken: token
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: 'abhisheksavaliya555@gmail.com',
        to: toEmail,
        subject: 'Replying to your email',
        text: replyContent
    };

    try {
        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.log(error)
    }
};

const allEmailThread = async () => {
    try {
        const { token } = await oAuthClient.getAccessToken();
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=5`;
        const config = createConfig(url, token);
        const response = await axios(config);
        const threads = response.data.threads || [];

        for (let thread of threads) {
            const threadId = thread.id;
            const emailMessages = await fetchEmailMessagesFromThread(threadId, token);

            let hasSentEmail = emailMessages.some(email => email.from === "abhisheksavaliya555@gmail.com");

            if (!hasSentEmail && emailMessages.length > 0) {
                const recipientEmail = emailMessages[0].from;
                const replyContent = "I will get back to you soon.";
                await emailReply(recipientEmail, replyContent, token);

                const labelName = "Abhishek";
                await createLabel(labelName, token);

                for (let email of emailMessages) {
                    await addLabelToEmail(email.id, labelName, token);
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
};

const fetchEmailMessagesFromThread = async (threadId, token) => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`;
    const config = createConfig(url, token);
    try {
        const response = await axios(config);
        const emailMessages = response.data.messages.map(message => ({
            id: message.id,
            from: message.payload.headers.find(header => header.name === 'From').value
        }));
        return emailMessages;
    } catch (error) {
        console.log(error)
    }
};