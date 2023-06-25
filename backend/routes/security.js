const express = require('express');

const router = express.Router();

const { sendOTP } = require("../controllers/otp-send");
const { verifyOTP } = require("../controllers/otp-verify");
const { getCaller } = require("../controllers/get-callers");

router.post('/send', sendOTP);
router.post('/verify', verifyOTP);
router.post('/get-caller', getCaller);

module.exports = router;
