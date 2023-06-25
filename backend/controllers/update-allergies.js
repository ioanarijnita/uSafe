const client = require("../configs/database");

exports.updateallergies = async (req, res) => {
    const { id, allergies } = req.body;
    try {
        const data = await client.query(`SELECT * FROM users WHERE id= $1;`, [id]) //Verifying if the user exists in the database
        const user = data.rows;
        if (user.length === 0) {
            res.status(500).json({
                error: "User does not exist!",
            });
        }
        else {
            await client.query(`UPDATE users SET allergies=$1 WHERE id=$2;`, [allergies, id]);
            const tenPercentConditionsLength = [!!(user[0].firstname && user[0].lastname && user[0].phonenumber && user[0].birthdate), (user[0].image !== null && user[0].image !== "null")].filter(c => c === true).length;
            const twentyPercentConditionsLength = [!!user[0].bloodtype, (allergies.food !== null && allergies.medication !== null), !!user[0].contacts.length, !!user[0].restrictedcontacts.length].filter(c => c === true).length;
            res.status(200).json({
                message: "User signed in!",
                firstName: user[0].firstname,
                lastName: user[0].lastname,
                email: user[0].email,
                bloodType: user[0].bloodtype,
                birthDate: user[0].birthdate,
                phoneNumber: user[0].phonenumber,
                gender: user[0].gender,
                id: user[0].id,
                image: user[0].image,
                allergies: allergies,
                contacts: user[0].contacts,
                restrictedContacts: user[0].restrictedcontacts,
                progress: (tenPercentConditionsLength * 10 + twentyPercentConditionsLength * 20)
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error occurred while signing in!", //Database connection error
        });
    };
};
