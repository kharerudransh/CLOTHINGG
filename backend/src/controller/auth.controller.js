import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config/config.js";
import sendMail from "../services/mail.service.js";


async function createAndSendToken(user, res, purpose = "session") {
    const expiryMap = {
        "session": "10d",
        "verify-email": "1h",
        "reset-password": "15m"
    };
    const token = jwt.sign({
        id: user._id,
        role: user.role,
        email: user.email,
        purpose
    }, CONFIG.JWT_TOKEN, { expiresIn: expiryMap[purpose] || "10d" });
    return token;
}


/*
routes:-/api/auth/register
method:-POST
request body:- 
{firstName,lastName,email,password,contactNo,isSeller,line1,line2,city,state,pincode}
description:-Register new user and create a verification token and send email with verification link
*/
export const UserRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, contactNo, isSeller ,address} = req.body;
        const { line1, line2, city, state, pincode } = address || {};
        const alreadyExists = await userModel.findOne({
            $or: [{ email }, { contactNo }]
        })
        if (alreadyExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const user = await userModel.create({
            firstName,
            lastName,
            email,
            password,
            contactNo,
            role: isSeller ? "Seller" : "Buyer",
            address: { line1, line2, city, state, pincode }
        })
        const validationToken = await createAndSendToken(user, res, "verify-email");

        const verificationUrl = `http://localhost:5173/verify?token=${validationToken}`;

        //Sending Mail With Verification Link
        try {
            await sendMail({
                to: user.email,
                subject: "Verify your email | Clothingg",
                html: `
                <!DOCTYPE html>
                <html>
                <body style="
                    margin:0;
                    padding:40px 20px;
                    background:#f5f3ef;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#171717;
                ">

                <div style="
                    max-width:600px;
                    margin:auto;
                    background:#ffffff;
                    border:1px solid #e5e1da;
                ">

                    <div style="
                        padding:40px;
                        text-align:center;
                        border-bottom:1px solid #e8e5df;
                    ">
                        <div style="
                            font-size:28px;
                            font-weight:bold;
                            letter-spacing:7px;
                        ">
                            CLOTHINGG
                        </div>

                        <div style="
                            margin-top:10px;
                            font-size:10px;
                            letter-spacing:3px;
                            color:#999;
                        ">
                            TIMELESS · REFINED · YOURS
                        </div>
                    </div>

                    <div style="padding:50px 45px;text-align:center;">

                        <p style="
                            font-size:11px;
                            letter-spacing:3px;
                            color:#999;
                            text-transform:uppercase;
                        ">
                            Welcome to Clothingg
                        </p>

                        <h1 style="
                            font-family:Georgia,serif;
                            font-size:34px;
                            font-weight:400;
                            margin:15px 0;
                        ">
                            Verify your email
                        </h1>

                        <p style="
                            color:#666;
                            font-size:15px;
                            line-height:1.8;
                        ">
                            Thank you for joining Clothingg.
                            Please verify your email address to activate
                            your account and continue shopping with us.
                        </p>

                        <a href="${verificationUrl}" style="
                            display:inline-block;
                            margin:30px 0;
                            padding:17px 40px;
                            background:#111;
                            color:#fff;
                            text-decoration:none;
                            font-size:12px;
                            font-weight:bold;
                            letter-spacing:2px;
                            text-transform:uppercase;
                        ">
                            VERIFY MY EMAIL
                        </a>

                        <p style="
                            font-size:11px;
                            color:#999;
                            line-height:1.7;
                        ">
                            If you did not create a Clothingg account,
                            you can safely ignore this email.
                        </p>

                    </div>

                    <div style="
                        background:#111;
                        color:#fff;
                        text-align:center;
                        padding:30px;
                    ">
                        <div style="
                            font-size:18px;
                            letter-spacing:5px;
                            font-weight:bold;
                        ">
                            CLOTHINGG
                        </div>

                        <p style="
                            font-size:10px;
                            color:#888;
                            margin-top:15px;
                        ">
                            Timeless style. Made for you.
                        </p>

                        <p style="
                            font-size:10px;
                            color:#666;
                        ">
                            © ${new Date().getFullYear()} Clothingg
                        </p>
                    </div>

                </div>

                </body>
                </html>
            `,

                text: `
        Welcome to Clothingg.

        Please verify your email using the link below:

        ${verificationUrl}

        If you did not create a Clothingg account, you can safely ignore this email.

        © ${new Date().getFullYear()} Clothingg
            `
            });
        } catch (error) {
            console.log("error", error);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                address: {
                    line1: user.address.line1,
                    line2: user.address.line2,
                    city: user.address.city,
                    state: user.address.state,
                    pincode: user.address.pincode
                }
            }
        });


    } catch (error) {
        console.log("error", error);
        return res.status(400).json({
            success: false,
            message: "Internal server error",

        });
    }
}

/*
routes:-/api/auth/verify
method:-GET
request query parameter:- 
{token}
description:-Verify user email and create a cookie with token
*/
export const UserVerify = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token not found",

            })
        }
        const decodeToken = jwt.verify(token, CONFIG.JWT_TOKEN);

        if (decodeToken.purpose !== "verify-email") {
            return res.status(400).json({ success: false, message: "Invalid" });
        }


        const user = await userModel.findOne({ email: decodeToken.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User already verified",

            })
        }
        user.isVerified = true;
        await user.save();

        const newToken = await createAndSendToken(user, res);
        res.cookie("jwt", newToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,//7 days
            httpOnly: true,
        });

        console.log(user.isVerified, user.email)


        return res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            }
        });

    }
    catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",

        });
    }
}
/*
routes:-/api/auth/login
method:-POST
request body:-
{email,password}
description:-Login user and create a cookie with token
*/
export const UserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",

            })
        }
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first",
            })
        }

        const matchPassword = await user.comparePassword(password);
        if (!matchPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials",
            })
        }
        const token = await createAndSendToken(user, res);
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,//7 days
            httpOnly: true,
        });
        return res.status(201).json({
            success: true,
            message: "User logged in successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            }
        });


    }
    catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",

        });
    }
}

/*
routes:-/api/auth/forgot-password
method:-POST
request body:-
{email}
description:-Forgot password and create a cookie with token
*/
export const UserForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            })
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If this email exists and is verified, a reset link has been sent",
            })
        }
        if (!user.isVerified) {
            return res.status(200).json({
                success: true,
                message: "If this email exists and is verified, a reset link has been sent",
            })
        }
        const token = await createAndSendToken(user, res, "reset-password");
        const forgotPassUrl = `http://localhost:5173/reset-password?token=${token}`;
        //sending mail with forgot password link
        try {
            await sendMail({
                to: user.email,
                subject: "Reset your password | Clothingg",
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="
                        margin:0;
                        padding:40px 20px;
                        background:#f5f3ef;
                        font-family:Arial,Helvetica,sans-serif;
                        color:#171717;
                    ">

                    <div style="
                        max-width:600px;
                        margin:auto;
                        background:#ffffff;
                        border:1px solid #e5e1da;
                    ">

                        <div style="
                            padding:40px;
                            text-align:center;
                            border-bottom:1px solid #e8e5df;
                        ">
                            <div style="
                                font-size:28px;
                                font-weight:bold;
                                letter-spacing:7px;
                            ">
                                CLOTHINGG
                            </div>

                            <div style="
                                margin-top:10px;
                                font-size:10px;
                                letter-spacing:3px;
                                color:#999;
                            ">
                                TIMELESS · REFINED · YOURS
                            </div>
                        </div>

                        <div style="padding:50px 45px;text-align:center;">

                            <p style="
                                font-size:11px;
                                letter-spacing:3px;
                                color:#999;
                                text-transform:uppercase;
                            ">
                                Password Reset
                            </p>

                            <h1 style="
                                font-family:Georgia,serif;
                                font-size:34px;
                                font-weight:400;
                                margin:15px 0;
                            ">
                                Reset your password
                            </h1>

                            <p style="
                                color:#666;
                                font-size:15px;
                                line-height:1.8;
                            ">
                                We received a request to reset your password.
                                Click the button below to set a new one.
                                This link will expire in 15 minutes.
                            </p>

                            <a href="${forgotPassUrl}" style="
                                display:inline-block;
                                margin:30px 0;
                                padding:17px 40px;
                                background:#111;
                                color:#fff;
                                text-decoration:none;
                                font-size:12px;
                                font-weight:bold;
                                letter-spacing:2px;
                                text-transform:uppercase;
                            ">
                                RESET PASSWORD
                            </a>

                            <p style="
                                font-size:11px;
                                color:#999;
                                line-height:1.7;
                            ">
                                If you did not request a password reset,
                                you can safely ignore this email.
                            </p>

                        </div>

                        <div style="
                            background:#111;
                            color:#fff;
                            text-align:center;
                            padding:30px;
                        ">
                            <div style="
                                font-size:18px;
                                letter-spacing:5px;
                                font-weight:bold;
                            ">
                                CLOTHINGG
                            </div>

                            <p style="
                                font-size:10px;
                                color:#888;
                                margin-top:15px;
                            ">
                                Timeless style. Made for you.
                            </p>

                            <p style="
                                font-size:10px;
                                color:#666;
                            ">
                                © ${new Date().getFullYear()} Clothingg
                            </p>
                        </div>

                    </div>

                    </body>
                    </html>
                `,

                text: `
            Reset your password.

            We received a request to reset your password.
            Use the link below (valid for 15 minutes):

            ${forgotPassUrl}

            If you did not request this, you can safely ignore this email.

            © ${new Date().getFullYear()} Clothingg
                `
            });
        }
        catch (error) {
            console.log("error", error);
        }
        return res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
            user: {
                _id: user._id,
                email: user.email,
            }
        });


    }
    catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",

        });
    }
}

/*
routes:-/api/auth/reset-password?token=xyz
*/
export const UserResetPassword=async(req,res)=>{
    try{
        const {token}=req.query;
        if(!token){
            return res.status(400).json({
                success:false,
                message:"Token is required",
            });
        }
        const decodeToken=jwt.verify(token,CONFIG.JWT_TOKEN);
        if (!decodeToken) {
            return res.status(400).json({
                success:false,
                message:"Invalid token",
            });
        }
        //if token has purpose=reset-password
        if(decodeToken.purpose !== "reset-password"){
            return res.status(400).json({
                success:false,
                message:"Invalid token",
            });
        }
        const user=await userModel.findById(decodeToken.id);
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found",
            });
        } 

        const {newPassword}=req.body;
        if(!newPassword){
            return res.status(400).json({
                success:false,
                message:"Password is required",
            });
        }
        user.password=newPassword;
        await user.save();
        return res.status(200).json({
            success:true,
            message:"Password reset successfully",
            user:{
                _id:user._id,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                role:user.role,
                contactNo:user.contactNo
            }
        });

    }
    catch(error){
    console.log("error", error);
    if (error.name === "TokenExpiredError") {
        return res.status(400).json({ success: false, message: "Reset link expired, please request a new one" });
    }
    if (error.name === "JsonWebTokenError") {
        return res.status(400).json({ success: false, message: "Invalid reset link" });
    }
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
}

/*
routes:-/api/auth/google
method:-GET
response body:-
description:-Google signin callback
*/
export const googleCallBack=async (req,res)=>{
    try{
        const{id, name,emails}=req.user;
        const firstName=name.givenName;
        const lastName=name.familyName;
        const email=emails[0].value;
        


        let user=await userModel.findOne({email:email});
        //register
        if(!user){
            user=await userModel.create({
                firstName,
                lastName,
                email,
                googleId:id,
                isVerified:true,
                role:"Buyer",
            });
            const token=await createAndSendToken(user);

            res.cookie("jwt",token,{
                maxAge:7*24*60*60*1000,
                httpOnly:true,
            });

            return res.redirect(`http://localhost:5173/`);
        }
        //login
        else{
            if(!user.isVerified){
                return res.status(400).json({
                    success:false,
                    message:"User not verified",
                });
            }

            if(!user.googleId){
                user.googleId=id;
                await user.save();
            }

            const token=await createAndSendToken(user);
            res.cookie("jwt",token,{
                maxAge:7*24*60*60*1000,
                httpOnly:true,
            });
            return res.redirect(`http://localhost:5173/`);
        }
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

/*
routes:-/api/auth/me
method:-GET
response body:-
description:-Get current user
*/
export const getMe=async(req,res)=>{
    try{
        const user=req.user;
        if(!user){
            return res.status(400).json({
                success:false,
                message:"You are not logged in",
            });
        }
        const verifiedUser=await userModel.findById(user.id).select("-password");
        return res.status(200).json({
            success:true,
            message:"User found",
            user:verifiedUser,
        });
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


/*
routeL:/api/auth/logout
method:-GET
response body:-
description Logout
*/
export const userLogout=(async(req,res)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({
                success:false,
                message:"You are not logged in",
            });
        }

        res.clearCookie("jwt");
        return res.status(200).json({
            success:true,
            message:"Logout successfully",
        });
    }
    catch(error){
        console.log("error",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        });
    }
})


