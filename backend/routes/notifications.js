const express = require('express');

const router = express.Router();

const { verifyToken } = require("../auth");

const { sendnotification } = require("../controllers/send-notification");
const { updatenotification } = require("../controllers/update-notification");
const { getnotifications } = require("../controllers/get-notifications");
const { updatenotificationlocation } = require("../controllers/update-notification-location");
const { getstatistics } = require('../controllers/get-statistics');

router.post('/sendnotification', verifyToken, sendnotification);
router.put('/updatenotification', verifyToken, updatenotification);
router.put('/updatenotificationlocation', verifyToken, updatenotificationlocation);
router.get('/getnotifications', verifyToken, getnotifications);
router.get('/getstatistics', verifyToken, getstatistics);

module.exports = router;
