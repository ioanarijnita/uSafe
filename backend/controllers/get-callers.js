const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const clients = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})

exports.getCaller = async (req, res) => {
    const { phone } = req.body;

    try {
        const getCaller = await clients.api.accounts(TWILIO_ACCOUNT_SID).outgoingCallerIds.list({ phoneNumber: phone });
        res.status(200).send(`${JSON.stringify(getCaller[0])}`)
    } catch (e) {
        res.status(400).send(e);
    }
}
