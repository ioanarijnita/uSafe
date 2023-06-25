const express = require('express');

const router = express.Router();

const { verifyToken } = require("../auth");
const { register } = require("../controllers/register");
const { login } = require("../controllers/login");

const { updatepersonalinfo } = require("../controllers/update-personal-info");
const { updatebloodtype } = require("../controllers/update-blood-type");
const { sendnotification } = require("../controllers/send-notification");
const { updateprofileimage } = require("../controllers/updateprofileimage");
const { video } = require("../controllers/video");
const { updateallergies } = require('../controllers/update-allergies');
const { editquickcontact } = require('../controllers/edit-quick-contact');
const { updatecontactphoto } = require('../controllers/update-contact-photo');
const { loginwithgoogle } = require('../controllers/login-with-google');
const { getProfile } = require('../controllers/get-profile');

router.post('/register', register);
router.post('/login', login);
router.put('/updatepersonalinfo', verifyToken, updatepersonalinfo);
router.put('/updatebloodtype', verifyToken, updatebloodtype);
router.post('/sendnotificationtest', verifyToken, sendnotification);
router.post('/updateprofileimage', verifyToken, updateprofileimage);
router.put('/updateallergies', verifyToken, updateallergies);
router.put('/editquickcontact', verifyToken, editquickcontact);
router.put('/updatecontactphoto', verifyToken, updatecontactphoto);
router.post('/loginwithgoogle', loginwithgoogle);
router.post('/getprofile', verifyToken, getProfile);
router.post('/video', verifyToken, video)

module.exports = router;
