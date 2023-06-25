const express = require("express");
const cors = require("cors");
const app = express();
const fileUpload = require('express-fileupload')
require("dotenv").config();
require("./configs/dotenv");
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.static('public'))
app.use(express.json());
app.use(cors());

const client = require("./configs/database");

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Engines started at ${port}.`);
})

client.connect((err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Data logging initiated!");
    }

});

const user = require("./routes/users");
const notifications = require("./routes/notifications");
const security = require("./routes/security");

app.use("/user", user);
app.use("/notifications", notifications);
app.use("/otp", security);
