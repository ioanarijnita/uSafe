const bcrypt = require("bcrypt");

const client = require("../configs/database");

//Registration Function
exports.register = async (req, res) => {
    const { firstname, lastname, email, phonenumber, password, birthdate, bloodtype, gender } = req.body;
    try {
        const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [email]); //Checking if user already exists
        const arr = data.rows;
        if (arr.length != 0) {
            return res.status(500).json({
                error: "Email already there, No need to register again.",
            });
        }
        else {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err)
                    res.status(err).json({
                        error: "Server error",
                    });
                const user = {
                    firstname,
                    lastname,
                    email,
                    phonenumber,
                    password: hash,
                    birthdate,
                    bloodtype,
                    gender
                };
                var flag = 1; //Declaring a flag

                client
                    .query(`INSERT INTO users (firstname, lastname, email, phonenumber, password, birthdate, bloodtype, gender) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`, [user.firstname, user.lastname, user.email, user.phonenumber, user.password, user.birthdate, user.bloodtype, user.gender], (err) => {

                        if (err) {
                            flag = 0;
                            console.error(err);
                            return res.status(500).json({
                                error: "Database error"
                            })
                        }
                        else {
                            flag = 1;
                            res.status(200).send({ message: 'User added to database, not verified' });
                        }
                    })
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Database error while registring user!", //Database connection error
        });
    };
}
