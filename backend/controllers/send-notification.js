const client = require("../configs/database");

exports.sendnotification = async (req, res) => {
    const { id, latitude, longitude, address, firstname, lastname, email, phonenumber, birthdate, bloodtype, gender, notificationid, definedmessage, notificationtype, image, allergies, contacts, restrictedcontacts, crimetype } = req.body;

    try {
        console.log("all: ", latitude, longitude, address, firstname, lastname, email, phonenumber, birthdate, bloodtype, gender, image, allergies, contacts, restrictedcontacts, notificationid)
        client.query(`INSERT INTO notifications (firstname, lastname, email, phonenumber, birthdate, bloodtype, gender, latitude, longitude, address, notificationid, definedmessage, notificationtype, crimetype, allergies, contacts, restrictedcontacts, image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18);`,
            [firstname, lastname, email, phonenumber, birthdate, bloodtype, gender, latitude, longitude, address, notificationid, definedmessage, notificationtype, crimetype, allergies, JSON.stringify(contacts), JSON.stringify(restrictedcontacts), image], (err) => {
                if (err) {
                    console.log("err: ", err);
                    res.status(500).json({
                        message: "Error sending the notification!, error: " + err
                    })
                } else {
                    console.log("notif: ", notificationid)
                    res.status(200).json({
                        message: "Notification send to authorities!",
                        notificationid: notificationid
                    });
                }
            })
    } catch (err) {
        console.log("catch err: ", err);
        res.status(500).json({
            error: "Database error occurred while signing in! " + err.message, //Database connection error
        });
    };
};
