const client = require("../configs/database");

exports.updatecontactphoto = async (req, res) => {
    const file = req.files.file;
    const { id, contactId, type } = req.body;

    if (!file) return res.sendStatus(400);
    const fileName = file.name;
    file.mv('public/contact-photos/' + file.name);
    const contactIdInt = parseInt(contactId);
    try {
        const isQuickContacts = type === "quick";

        const userData = await client.query(`SELECT * FROM users WHERE id= $1;`, [id]) //Verifying if the user exists in the database
        const user = userData.rows;
        if (user.length === 0) {
            res.status(500).json({
                error: "User does not exist!",
            });
        } else {
            const contacts = isQuickContacts ? user[0].contacts : user[0].restrictedcontacts
            const contactIndex = contacts.map(c => c.id).indexOf(contactIdInt);
            const oldContact = contacts.find(c => c.id == contactIdInt);
            const intermediaryArray = [...contacts];
            if (contactIndex !== -1) {
                intermediaryArray.splice(contactIndex, 1, { ...oldContact, photo: fileName });
            } else {
                intermediaryArray.push({ ...oldContact, photo: fileName });
            }
            if (isQuickContacts) {
                await client.query(`UPDATE users SET contacts=$1 WHERE id=$2;`, [JSON.stringify(intermediaryArray), id]);
            } else {
                await client.query(`UPDATE users SET restrictedcontacts=$1 WHERE id=$2;`, [JSON.stringify(intermediaryArray), id]);
            }
            const tenPercentConditionsLength = [!!(user[0].firstname && user[0].lastname && user[0].phonenumber && user[0].birthdate), (user[0].image !== null && user[0].image !== "null")].filter(c => c === true).length;
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
                image: user[0].image,
                allergies: user[0].allergies,
                contacts: isQuickContacts ? intermediaryArray : user[0].contacts,
                restrictedContacts: isQuickContacts ? user[0].restrictedcontacts : intermediaryArray,
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
