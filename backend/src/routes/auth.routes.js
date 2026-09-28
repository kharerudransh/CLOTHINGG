import { Router } from "express";
import { UserRegister,UserVerify,UserLogin,UserForgotPassword ,UserResetPassword,googleCallBack,getMe,userLogout} from "../controller/auth.controller.js";
import { validateUserRegister, validateUserLogin,validateForgotPassword,validateUserResetPassword} from "../validation/auth.validation.js";
import passport from "passport";
import {authenticateUser} from "../middleware/auth.middleware.js";

const router=Router();

//routes for user register
router.post("/register", validateUserRegister, UserRegister);

//routes for user verifyEamil
router.get("/verify", UserVerify);


//routes for user login
router.post("/login", validateUserLogin, UserLogin);


//routes for user forgot password
router.post("/forgot-password", validateForgotPassword, UserForgotPassword);

//route to reset user password
router.post("/reset-password", validateUserResetPassword , UserResetPassword);

//auth
router.get("/getMe",authenticateUser,getMe);




//Google signin
router.get("/google",passport.authenticate("google",{scope:["profile","email"]}));//will go to google signin page 

router.get("/google/callback",
    passport.authenticate("google",{failureRedirect:"/register",session:false}),//this line takes users data in req.user in response to auth code 
    googleCallBack
);


//Routes for userLogout
router.post("/logout",authenticateUser,userLogout);


//Routes for user profile
router.get("/profile",authenticateUser,getMe);

export default router;