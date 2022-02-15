const express = require("express")
const router = express.Router()
const uploadPic = require("../Configs/multer")
const { authorizationMiddleware,
    getAllPostData,
    getPostByUser,
    createPost,
    updatePost,
    deletePost,
    updateLike,
    createComment } = require("../Controllers/postController")


// router for posts
router.get("/home",authorizationMiddleware,  getAllPostData)
router.get("/profile", authorizationMiddleware, getPostByUser)
// router for creating post
router.post("/upload", authorizationMiddleware,uploadPic.single("myPost"), createPost);
// router for updating post
router.post("/upload/:postId", authorizationMiddleware, updatePost)
// router for deleting post
router.delete("/delete/:cloudinaryId",authorizationMiddleware,deletePost)
// router for like the post
router.get("/like/:postId",authorizationMiddleware,updateLike)
// router for comment on post
router.post("/comment/:postId",authorizationMiddleware,createComment);


module.exports = router