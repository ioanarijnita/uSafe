const e = require("express");
const client = require("../configs/database");

exports.getnotifications = async (req, res) => {
    const { } = req.body;
    try {
        const data = await client.query(`SELECT * FROM notifications;`, [])
        const notif = data.rows;
        res.status(200).json({
            notifications: notif
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error!",
        });
    };
};
