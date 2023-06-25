const client = require("../configs/database");

exports.updatepersonalinfo = async (req, res) => {
    const { id, firstname, lastname, phonenumber, birthdate } = req.body;
    try {
        const data = await client.query(`SELECT * FROM users WHERE id= $1;`, [id]) //Verifying if the user exists in the database
        const user = data.rows;
        if (user.length === 0) {
            res.status(500).json({
                error: "User does not exist!",
            });
        }
        else {
            await client.query(`UPDATE users SET firstname=$1, lastname=$2, phonenumber=$3, birthdate=$4 WHERE id=$5;`, [firstname, lastname, phonenumber, birthdate, id]);
            const tenPercentConditionsLength = [!!(user[0].firstname && user[0].lastname && user[0].phonenumber && user[0].birthdate), (user[0].image !== null && user[0].image !== "null")].filter(c => c === true).length;
            const twentyPercentConditionsLength = [!!user[0].bloodtype, (user[0].allergies.food !== null && user[0].allergies.medication !== null), !!user[0].contacts.length, !!user[0].restrictedcontacts.length].filter(c => c === true).length;
            res.status(200).json({
                message: "User signed in!",
                firstName: firstname,
                lastName: lastname,
                email: user[0].email,
                bloodType: user[0].bloodtype,
                birthDate: birthdate,
                phoneNumber: phonenumber,
                gender: user[0].gender,
                id: user[0].id,
                image: user[0].image,
                allergies: user[0].allergies,
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
