const mongoose = require("mongoose")

const comment = new mongoose.Schema({
    userId:{type:String},
    postId:{type:String},
    email:{type:String},
    userName:{type:String},
    data:{type:String},
    createdAt:{
        type:Date,
        default: Date.now()
    },
})

const postSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    email: {
        type: String,
    },
    createdBy:{
        type:String,
        required:true,
    },
    caption:{
        type:String,
        required:true,
    },
    cloudinaryId:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    hashtags:[String],
    likes:[String],
    createdAt:{
        type:Date,
        default: Date.now()
    },
    comments:[comment],
    updatedAt:{
        type:Date,
        default: Date.now()
    },
})



module.exports = mongoose.model("PostModel",postSchema);