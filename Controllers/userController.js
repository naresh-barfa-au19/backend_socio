require('dotenv').config()
const UserModel = require("../Models/userModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const cloudinary = require("../Configs/cloudinary");
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');


const emailSender = async (email, message) => {
    const transporter = nodemailer.createTransport({
        host: "fullstackcoder403@gmail.com", // your email 
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: 'fullstackcoder403@gmail.com', // your email 
            pass: 'noel@888' // your email id password
        }
    });

    const mailOptions = {
        from: 'fullstackcoder403@gmail.com', // your email 
        to: email,          // email of client
        subject: 'Welcome to SociO',
        text: message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            return info.response
        }
    });
}


// post method for sign up page --> name email password
exports.signupController = async (req, res) => {
    const { name, email, password } = req.body
    let data = "User signup done"
    let success = true
    try {
        const userData = await UserModel.findOne({ email: email });
        if (!userData) {
            const hashPassword = await bcrypt.hash(password, 10)
            const inputData = {
                name: name,
                email: email,
                password: hashPassword,
            };
            const userCreated = await UserModel.insertMany([inputData])
        } else {
            success = false
            data = "User already exits."
        }

        res.status(200).send({
            success: success,
            data: data
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

// post method for login page --> email, password
exports.loginController = async (req, res) => {
    const { email, password } = req.body
    let data = "User login done"
    let success = true
    try {
        const userData = await UserModel.findOne({ email: email });
        if (!!userData) {
            const matchPassword = await bcrypt.compare(password, userData.password);
            if (!!matchPassword) {
                const payload = {
                    name: userData.name,
                    userId: userData._id,
                    email: userData.email,
                }
                const token = await jwt.sign(payload, process.env.TOKEN_SECRET_KEY);
                const message = `Hi ${payload.name}, 
                                    welcome to SociO application. Your new account has created. 
                                Thank you`
                await emailSender(payload.email, message)
                success = true;
                data = "Bearer " + token
            } else {
                success = false;
                data = "Password incorrect.";
            }

        } else {
            success = false
            data = "User does not exits."
        }
        res.status(200).send({
            success: success,
            data: data
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

// post method for profile edit --> myProfile , name
exports.profileEditController = async (req, res) => {
    const user = req.userData
    let success = true
    let data = "Profile edited successfully."
    try {
        const fetchUser = await UserModel.findOne({ _id: user.userId });
        if (fetchUser.profilePic && fetchUser.cloudinaryId) {
            await cloudinary.uploader.destroy(fetchUser.cloudinaryId);
        }
        const uploadImageToCloudinary = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
            overwrite: true,
        });
        if (!!uploadImageToCloudinary && uploadImageToCloudinary.url) {
            const updateProfile = {
                name: req.body.name,
                profilePic: uploadImageToCloudinary.url,
                cloudinaryId: uploadImageToCloudinary.public_id,
                updatedAt: Date.now()
            }
            await UserModel.findByIdAndUpdate({ _id: user.userId }, { $set: updateProfile })
        }

        res.status(200).send({
            success: success,
            data: data
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

// delete route --> delete profile pic 
exports.deleteUserPic = async (req, res) => {
    const user = req.userData
    try {
        const fetchUser = await UserModel.findOne({ _id: user.userId });
        if (fetchUser && fetchUser.profilePic && fetchUser.cloudinaryId) {
            await cloudinary.uploader.destroy(fetchUser.cloudinaryId);
            await UserModel.findByIdAndUpdate({ _id: user.userId }, { $set: { profilePic: "", cloudinaryId: "" } })
            res.status(400).send({
                success: true,
                data: "Profile pic removed successfully."
            })
        }
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

// post route for forget-password
exports.forgetPassword = async (req, res) => {
    const email = req.body.email;
    try {
        const fetchUser = await UserModel.findOne({ email: email });
        if (!!fetchUser) {
            const otp = await otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
            const now = new Date();
            const expiration_time = AddMinutesToDate(now, 5);
            const message = `hello ${fetchUser.name},
                                You requested for forget password.
                                here is otp : ${otp} . It it expire in 5 mint.
                            Thank you.`
            console.log("otp -->", otp, expiration_time)
            await emailSender(email, message)
            await UserModel.findOneAndUpdate({ email: email }, { $set: { forgetPasswaord: { otp: otp, expiration_time: expiration_time } } })
        } else {
            res.status(400).send({
                success: false,
                data: "User email not found."
            })
        }

        res.status(200).send({
            success: true,
            data: "OTP sent to your email."
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

// post route for verify otp
exports.verifyOtp = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp
    try {
        const fetchUser = await UserModel.findOne({ email: email });
        const now = new Date();
        if (!!fetchUser) {
            if (otp == fetchUser.forgetPasswaord.otp && now < fetchUser.forgetPasswaord.expiration_time) {
                res.status(200).send({
                    success: true,
                    data: "OTP Matched successfully."
                })
            } else {
                res.status(400).send({
                    success: false,
                    data: "Otp Not Match"
                })
            }
        } else {
            res.status(400).send({
                success: false,
                data: "User email not found."
            })
        }


    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

// post route for changePassword
exports.changePassword = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password
    try {
        const fetchUser = await UserModel.findOne({ email: email });
        if (!!fetchUser) {
            const hashPassword = await bcrypt.hash(password, 10)
            await UserModel.findOneAndUpdate({ email: email },
                { $set: { forgetPasswaord: { otp: "", expiration_time: "" }, password: hashPassword } })
            res.status(200).send({
                success: true,
                data: "Password change successfully"
            })
        } else {
            res.status(400).send({
                success: false,
                data: "User email not found."
            })
        }
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}
