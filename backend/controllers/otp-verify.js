const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const jwt = require("jsonwebtoken");
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})

/**
* @param {*} req
* @param {*} res
* @param {*} next
*/

exports.verifyOTP = async (req, res, next) => {
    const { phone, otp } = req.body;
    try {
        const verifiedResponse = await client.verify.v2
            .services(TWILIO_SERVICE_SID).verificationChecks
            .create({
                to: phone,
                code: otp
            });
        const token = jwt.sign(
            {
                otp: otp,
            },
            process.env.SECRET_KEY
        );
        if (verifiedResponse.status === "approved")
            res.status(200).json(JSON.parse(JSON.stringify({ accountSid: verifiedResponse.accountSid, token: token })))
        else res.send("Invalid code");
    } catch (e) {
        res.json({ err: e.message });
    }
}
