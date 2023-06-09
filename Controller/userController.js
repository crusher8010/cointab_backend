const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let prev = null;

exports.Register = (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        bcrypt.hash(password, 5, async (err, cpassword) => {
            if (err) {
                res.status(400).json({
                    status: "fail",
                    message: "Something Went Wrong"
                })
            } else {
                let newUser = await User.create({ fullname, email, password: cpassword });

                res.status(201).json({
                    status: "success",
                    newUser
                })
            }
        })

    } catch (err) {
        res.status(400).json({
            status: "fail",
            "message": err.message
        })
    }
}


exports.Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.find({ email });

        if (prev !== user[0].email) {
            let temp = await User.find({ email: prev });

            if (temp.length > 0 && temp[0].consecutiveAttempts < 5) {
                temp[0].consecutiveAttempts = 0;
                await temp[0].save();
            }
        }

        prev = user[0].email;

        let diff1 = (new Date(user[0].blockEndTime).getTime() - new Date(Date.now()).getTime())
        let stamp1 = diff1 / (60 * 60 * 1000)
        console.log(stamp1)
        if (stamp1 < 0 && user[0].consecutiveAttempts == 5) {
            user[0].consecutiveAttempts = 0;
            user[0].blockEndTime = null;
            user[0].blocked = false;
            await user[0].save();
        }

        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: 'Invalid email or password'
            })
        }

        const codeMatch = await bcrypt.compare(password, user[0].password);

        if (!codeMatch) {
            if (user[0].consecutiveAttempts < 5) {
                user[0].consecutiveAttempts++;

                await user[0].save();

                if (user[0].consecutiveAttempts >= 5) {
                    user[0].blocked = true;
                    user[0].blockEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
                    await user[0].save();

                    return res.status(401).json({
                        status: "fail",
                        message: 'Your account has been blocked. Please try again after 24 hours.'
                    })
                }

                return res.status(401).json({
                    status: "fail",
                    message: 'Invalid email or password'
                })
            }
        }

        let diff = (new Date(user[0].blockEndTime).getTime() - new Date(Date.now()).getTime())
        let stamp = diff / (60 * 60 * 1000)

        if (stamp > 0 && stamp < 24 && user[0].consecutiveAttempts >= 5) {

            res.status(401).json({
                status: "fail",
                stamp,
                message: `Your account has been blocked. Please try again after ${Math.round(stamp)} hours.`
            });

        } else if (stamp < 0 && user[0].consecutiveAttempts >= 5) {
            user[0].consecutiveAttempts = 0;
            user[0].blocked = false;
            user[0].blockEndTime = null;
            await user[0].save();

            let pe = user[0]

            let token = jwt.sign({ pe }, process.env.Key)

            return res.status(200).json({
                status: "success",
                message: 'Login Successful',
                pe,
                token
            })
        } else {
            user[0].consecutiveAttempts = 0;
            await user[0].save();
            let pe = user[0]

            let token = jwt.sign({ pe }, process.env.Key)

            return res.status(200).json({
                status: "success",
                message: 'Login Successful',
                pe,
                token
            })
        }

    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: "Internal server error"
        })
    }
}