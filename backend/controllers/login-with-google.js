const bcrypt = require("bcrypt");
const client = require("../configs/database");
const jwt = require("jsonwebtoken");

exports.loginwithgoogle = async (req, res) => {
    const { email, firstname, lastname, id } = req.body;

    const login = async () => {
        const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [email]); //Checking if user already exists
        const user = data.rows;
        if (user.length != 0) {
            bcrypt.compare(id, user[0].password, (err, result) => { //Comparing the hashed password
                if (err) {
                    res.status(500).json({
                        error: "Server error",
                    });
                } else if (result === true) { //Checking if credentials match
                    const token = jwt.sign(
                        {
                            email: email,
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
                            error: "Enter correct id!",
                        });
                }
            })
        }
        else {
            bcrypt.hash(id, 10, async (err, hash) => {
                if (err)
                    res.status(err).json({
                        error: "Server error",
                    });
                const user = {
                    firstname,
                    lastname,
                    email,
                    password: hash,
                };
                var flag = 1; //Declaring a flag

                //Inserting data into the database
                client
                    .query(`INSERT INTO users (firstname, lastname, email, password) VALUES ($1,$2,$3,$4);`, [user.firstname, user.lastname, user.email, user.password], async (err) => {
                        if (err) {
                            flag = 0; //If user is not inserted to database assigning flag as 0/false.
                            console.error(err);
                            return res.status(500).json({
                                error: "Database error"
                            })
                        }
                        else {
                            await login();
                            flag = 1;
                        }
                    })
            });
        }
    }

    try {
        await login();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error while registring user!", //Database connection error
        });
    };
}
