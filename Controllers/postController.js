require("dotenv").config()
const PostModel = require("../Models/postModel")
const UserModel = require("../Models/userModel")
const jwt = require("jsonwebtoken")
const cloudinary = require("../Configs/cloudinary")

// middleware for checking jwt token
exports.authorizationMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.token;
        token = token.split(" ")
        const decoded = await jwt.verify(token[1], process.env.TOKEN_SECRET_KEY)
        req.userData = decoded;
        next()
    } catch (err) {
        res.send({
            success: false,
            data: "notToken"
        })
    }
}

// get route --> getting all the posts 
exports.getAllPostData = async (req, res) => {
    const user = req.userData
    try {
        const postData = await PostModel.aggregate([{
            $lookup: {
                from: "usermodels", // collection name in db
                localField: "email",
                foreignField: "email",
                as: "userInfo"
            }
        }, { $sort: { createdAt: -1 } }])
        // console.log("--->",postData)
        // const postData = await PostModel.find({}).lean()
        // if (!postData[0] && postData.length == 0) {
        //     res.status(400).send({
        //         success: false,
        //         data: "No data found. Please upload post."
        //     })
        // }
        res.status(200).send({
            success: true,
            data: postData,
            user:user,
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "No data found. Please upload post."
        })
    }
}

// get route --> get post by id
exports.getPostByUser = async (req, res) => {
    try {
        const user = req.userData;
        const postData = await UserModel.aggregate([
            { $match: { email: user.email } },
            {
                $lookup: {
                    from: 'postmodels',
                    as: 'posts',
                    let: { email: '$email' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$email', '$$email'] }
                                    ]
                                }
                            }
                        }, {
                            $sort: { createdAt: -1 }
                        }
                    ]
                }
            },
        ])
        if (!!postData) {
            res.status(200).send({
                success: true,
                data: postData[0],
            })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send({
            success: false,
            data: "Something went wrong. "
        })
    }
}

// post route --> creating post for user
exports.createPost = async (req, res) => {
    try {
        const user = req.userData
        const { caption } = req.body
        const uploadImageToCloudinary = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
            overwrite: true,
        });
        // console.log("uploadImageToCloudinary",uploadImageToCloudinary)
        if (!!uploadImageToCloudinary && uploadImageToCloudinary.url) {
            const sendData = {
                userId: user.userId,
                email: user.email,
                createdBy: user.name,
                caption: caption,
                cloudinaryId: uploadImageToCloudinary.public_id,
                url: uploadImageToCloudinary.url,
            }
            const insertData = await PostModel.insertMany([sendData])

            res.status(200).send({
                success: true,
                data: insertData
            })

        } else {
            res.status(400).send({
                success: false,
                data: "Post is not uploaded. "
            })
        }

    } catch (err) {
        res.send({
            success: false,
            data: "Something went wrong.",
        })
    }
}

// post route --> update post for user
exports.updatePost = async (req, res) => {
    try {
        const user = req.userData
        const postId = req.params.postId
        const inputData = req.body
        // const data = await PostModel.findOneAndUpdate({ _id: postId, userId: user.userId }, { $set: inputData })
        res.status(200).send({
            success: true,
            data: data
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong."
        })
    }
}

// delete route --> delete post for user
exports.deletePost = async (req, res) => {
    try {
        const user = req.userData
        const cloudinaryId = req.params.cloudinaryId
        await PostModel.deleteOne({ cloudinaryId: cloudinaryId, userId: user.userId })
        await cloudinary.uploader.destroy(cloudinaryId);
        res.status(200).send({
            success: true,
            data: "Post deleted successfully. "
        })

    } catch (err) {
        res.status(400).send({
            success: false,
            data: "Something went wrong. "
        })
    }
}

// post --> updating like to post
exports.updateLike = async (req, res) => {
    const user = req.userData
    const postId = req.params.postId
    let data
    try {
        const fetchPost = await PostModel.findOne({ _id: postId })
        let newLike = [...fetchPost.likes]
        const index = newLike.indexOf(user.userId)
        if (index == -1) {
            newLike.push(user.userId)
            data = await PostModel.findOneAndUpdate({ _id: postId }, { $set: { likes: newLike } })
        } else {
            newLike.splice(index, 1)
            data = await PostModel.findOneAndUpdate({ _id: postId }, { $set: { likes: newLike } })
        }
        res.status(200).send({
            success: true,
            data: data.likes
        })

    } catch (err) {
        console.log(err)
        res.status(400).send({
            success: false,
            data: "Something went wrong. "
        })
    }
}


// post --> creating comment on post by postId

exports.createComment = async (req,res) =>{
    const comment = req.body.comment
    const postId = req.params.postId
    const user = req.userData
    try{

        const fetchPost = await PostModel.findOne({ _id: postId })
        let newComment = [...fetchPost.comments]
        if(!!comment){
            const commentData ={
                userId:user.userId,
                email:user.email,
                postId:postId,
                userName:user.name,
                data:comment
            }
            newComment.push(commentData)
            data = await PostModel.findOneAndUpdate({ _id: postId }, { $set: { comments: newComment } })
        }

        res.status(200).send({
            success:true,
            data:data
        })
    }catch(err){
        res.status(400).send({
            success:false,
            data:"Something went wrong."
        })
    }
}
