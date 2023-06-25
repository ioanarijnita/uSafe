const bcrypt = require("bcrypt");

const client = require("../configs/database");

const jwt = require("jsonwebtoken");

//Login Function
exports.login = async (req, res) => {
    const { phonenumber, password } = req.body;
    try {
        const data = await client.query(`SELECT * FROM users WHERE phonenumber= $1;`, [phonenumber]) //Verifying if the user exists in the database
        const user = data.rows;
        if (user.length === 0) {
            res.status(500).json({
                error: "User is not registered, Sign Up first",
            });
        }
        else {
            bcrypt.compare(password, user[0].password, (err, result) => { //Comparing the hashed password
                if (err) {
                    res.status(500).json({
                        error: "Server error",
                    });
                } else if (result === true) { //Checking if credentials match
                    const token = jwt.sign(
                        {
                            phonenumber: phonenumber,
                        },
                        process.env.SECRET_KEY
                    );
                    const tenPercentConditionsLength = [!!(user[0].firstname && user[0].lastname && user[0].phonenumber && user[0].birthdate), (user[0].image !== null && user[0].image !== "null")].filter(c => c === true).length;
                    const twentyPercentConditionsLength = [!!user[0].bloodtype, (user[0].allergies.food !== null && user[0].allergies.medication !== null), !!user[0].contacts.length, !!user[0].restrictedcontacts.length].filter(c => c === true).length;
                    res.status(200).json({
                        message: "User signed in!",
                        token: token,
                        firstName: user[0].firstname,
                        lastName: user[0].lastname,
                        email: user[0].email,
                        bloodType: user[0].bloodtype,
                        birthDate: user[0].birthdate,
                        phoneNumber: user[0].phonenumber,
                        gender: user[0].gender,
                        id: user[0].id,
                        progress: (tenPercentConditionsLength * 10 + twentyPercentConditionsLength * 20),
                        image: user[0].image,
                        allergies: user[0].allergies,
                        contacts: user[0].contacts,
                        restrictedContacts: user[0].restrictedcontacts
                    });
                }
                else {
                    //Declaring the errors
                    if (result != true)
                        res.status(400).json({
                            error: "Enter correct password!",
                        });
                }
            })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error occurred while signing in!", //Database connection error
        });
    };
};
