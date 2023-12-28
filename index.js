const express = require('express');
const bodyParser = require('body-parser');
const { sendMail } = require('./services');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

function runInterval() {
    const delay = Math.floor(70000 + Math.random() * 10000);

    setTimeout(function () {
        sendMail();
        runInterval();
    }, delay);
}

runInterval();

app.listen(5000, () => {
    console.log("Server is running on PORT 5000")
})