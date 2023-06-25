const client = require("../configs/database");

exports.updateprofileimage = async (req, res) => {
    const file = req.files.file;
    const { id } = req.body;

    if (!file) return res.sendStatus(400);
    const fileName = file.name;
    file.mv('public/profile/' + file.name);

    try {
        const userData = await client.query(`SELECT * FROM users WHERE id= $1;`, [id]) //Verifying if the user exists in the database
        const user = userData.rows;
        if (user.length === 0) {
            res.status(500).json({
                error: "User does not exist!",
            });
        } else {
            const data = await client.query(`UPDATE users SET image=$1 WHERE id=$2;`, [fileName, id]);
            const tenPercentConditionsLength = [!!(user[0].firstname && user[0].lastname && user[0].phonenumber && user[0].birthdate), fileName !== null].filter(c => c === true).length;
            const twentyPercentConditionsLength = [!!user[0].bloodtype, (user[0].allergies.food !== null && user[0].allergies.medication !== null), !!user[0].contacts.length, !!user[0].restrictedcontacts.length].filter(c => c === true).length;
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
                image: file.name,
                allergies: user[0].allergies,
                contacts: user[0].contacts,
                restrictedContacts: user[0].restrictedcontacts,
                progress: (tenPercentConditionsLength * 10 + twentyPercentConditionsLength * 20)
            });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error!", //Database connection error
        });
    };
};
