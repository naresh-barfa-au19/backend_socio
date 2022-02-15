const mongoose = require("mongoose")

const forgetPasswaord = new mongoose.Schema({
    otp:{type:String},
    expiration_time:{type:Date},
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
    },
    cloudinaryId:{
        type:String,
    },
    forgetPasswaord:forgetPasswaord,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    },
})



module.exports = mongoose.model("UserModel", userSchema);