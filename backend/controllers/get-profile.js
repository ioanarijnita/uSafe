const client = require("../configs/database");

exports.getProfile = async (req, res) => {
    const { phonenumber } = req.body;
    try {
        const data = await client.query(`SELECT * FROM users WHERE phonenumber= $1;`, [phonenumber]) //Verifying if the user exists in the database
        const user = data.rows;
        if (user.length === 0) {
            res.status(500).json({
                error: "User is not registered, Sign Up first",
            });
        }
        else {
            const tenPercentConditionsLength = [!!(user[0].firstname && user[0].lastname && user[0].phonenumber && user[0].birthdate), (user[0].image !== null && user[0].image !== "null")].filter(c => c === true).length;
            const twentyPercentConditionsLength = [!!user[0].bloodtype, (user[0].allergies.food !== null && user[0].allergies.medication !== null), !!user[0].contacts.length, !!user[0].restrictedcontacts.length].filter(c => c === true).length;
            res.status(200).json({
                firstName: user[0].firstname,
                lastName: user[0].lastname,
                bloodType: user[0].bloodtype,
                birthDate: user[0].birthdate,
                phoneNumber: user[0].phonenumber,
                gender: user[0].gender,
                progress: (tenPercentConditionsLength * 10 + twentyPercentConditionsLength * 20),
                image: user[0].image,
                allergies: user[0].allergies,
                contacts: user[0].contacts,
                restrictedContacts: user[0].restrictedcontacts
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error occurred while getting profile!", //Database connection error
        });
    };
};
