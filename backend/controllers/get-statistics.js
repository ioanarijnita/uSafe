
const e = require("express");
const client = require("../configs/database");

exports.getstatistics = async (req, res) => {
    const { } = req.body;
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    try {
        const crimeTypes = ['Assault', 'Theft', 'Violence', 'Harassment', 'Burglary'];
        const getStatisticsForCrimeType = async (crimeType) => {
            const data = await client.query(
                `
                SELECT * FROM (
                    SELECT *, point($1, $2) <@> (point(longitude, latitude)::point) as distance
                    FROM notifications
                    WHERE ((point($1,$2) <@> point(longitude, latitude)) * 1.60934) < 5
                    ORDER BY distance
                    ) AS nearby_crimes WHERE notificationtype='Crime report' AND $3 = ANY (crimetype);
                `, [longitude, latitude, crimeType])
            const notif = data.rows;
            return notif.length;
        }
        await Promise.all(crimeTypes.map(async (type) => await getStatisticsForCrimeType(type))).then((result) => {
            res.status(200).json({
                statistics: result
            });
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error!", //Database connection error
        });
    };
};
