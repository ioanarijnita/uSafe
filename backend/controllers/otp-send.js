const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})

exports.sendOTP = async (req, res) => {
    const { phone } = req.body;
    try {
        const callers = await client.api.accounts(TWILIO_ACCOUNT_SID).outgoingCallerIds.list({ phoneNumber: phone });
        if (callers.length > 0) {
            const otpResponse = await client.verify.v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    "to": phone,
                    "channel": `sms`
                });
            res.status(200).send(`${JSON.stringify(otpResponse)}`)
        } else {
            res.send(`Phone number is not registered in the system`)
        }
    } catch (e) {
        res.status(400).send(e);
    }
    console.log(res);
}
