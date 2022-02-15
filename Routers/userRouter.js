const express = require("express")
const router = express.Router()
const uploadPic = require("../Configs/multer")
// requiring express-validator
const { check, validationResult } = require("express-validator");
// getting method from user controller
const { signupController, 
    loginController ,
    profileEditController,
    deleteUserPic,
    forgetPassword,
    verifyOtp,
    changePassword} = require("../Controllers/userController");

const {authorizationMiddleware} = require("../Controllers/postController")


signUpValidationMiddlerware = async (req, res, next) => {
    const error = validationResult(req).formatWith((msg) => msg);
    const hasError = error.isEmpty();
    if (hasError) {
        next();
    } else {
        req.errorMsg = error;
        console.log(error)
        res.status(400).send(error);
    }
};

// POST route of signup page
router.post("/signup",
    [
        check("name")
            .not()
            .isEmpty()
            .withMessage("Please enter Name.")
            .trim()
            .isLength({ min: 4 })
            .withMessage("Name should be minimum 4 character long.")
            .not()
            .matches(/\d/)
            .withMessage("Name should not have number."),

        check("email")
            .not()
            .isEmpty()
            .withMessage("Please enter Email.")
            .trim()
            .isEmail()
            .withMessage("Email is not correct."),

        check("password")
            .not()
            .isEmpty()
            .withMessage("Please Enter password.")
            .trim()
            .isLength({ min: 5 })
            .withMessage("minimum password length should be 8 character.")
            .matches(/\d/)
            .withMessage("Password must contain a number.")
            .matches(/[$@*%!#]/)
            .withMessage("Password must contain any special character like $@*%!#"),

        // check("confirmPassword")
        //     .not()
        //     .isEmpty()
        //     .withMessage("Please Enter Confirm password.")
        //     .custom((value, { req }) => {
        //         if (value !== req.body.password) {
        //             throw new Error("Password does not match.");
        //         } else {
        //             return true;
        //         }
        //     }),
    ],
    signUpValidationMiddlerware,
    signupController);

// POST route for login page
router.post("/login",
    [
        check("email")
            .not()
            .isEmpty()
            .withMessage("Please enter Email.")
            .trim()
            .isEmail()
            .withMessage("Email is not correct."),

        check("password")
            .not()
            .isEmpty()
            .withMessage("Please Enter password.")
            
    ],
    signUpValidationMiddlerware,
    loginController)

// post route for profile-edit page
router.post("/profile-edit",authorizationMiddleware,uploadPic.single("myProfile"),profileEditController)

// route for removing pic
router.delete("/profile-delete",authorizationMiddleware,deleteUserPic)
// route for forget-password 
router.post("/forget-password",forgetPassword)
// route for verification of otp 
router.post("/forget-password/otp",verifyOtp)
// route for change password
router.post("/forget-password/changePassword",changePassword)

// exporting router from here
module.exports = router