import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config/config.js";
import sendMail from "../services/mail.service.js";


async function createAndSendToken(user,res){
    const token=jwt.sign({
        id:user._id,
        role:user.role,
        email:user.email
    },CONFIG.JWT_TOKEN,{expiresIn:"10d"});
    return token;
}



export const UserRegister=async (req,res)=>{
    try {
        const {firstName,lastName,email,password,contactNo,isSeller}=req.body;
        const alreadyExists=await userModel.findOne({
            $or:[{email},{contactNo}]
        })
        if(alreadyExists){
            return res.status(400).json({
                success:false,
                message:"User already exists",
            });
        }
        
        const user=await userModel.create({
            firstName,
            lastName,
            email,
            password,
            contactNo,
            role:isSeller?"Seller":"Buyer"
        })
        const validationToken=await createAndSendToken(user,res);
        
        const verificationUrl =`http://localhost:5173/verify?token=${validationToken}`;

        //Sending Mail With Verification Link
        try{
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
        }catch(error){
            console.log("error",error);
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
            }
        });


    } catch (error) {
        console.log("error",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            
        });
    }
}
export const UserVerify=async(req,res)=>{
    try{
        const token=req.query.token;
        if(!token){
            return res.status(400).json({
                success:false,
                message:"Token not found",
                
            })
        }
        const decodeToken=jwt.verify(token,CONFIG.JWT_TOKEN);
        const user=await userModel.findOne({email:decodeToken.email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }
        if(user.isVerified){
            return res.status(400).json({
                success:false,
                message:"User already verified",
                
            })
        }
        user.isVerified=true;
        await user.save();
        
        const newToken=await createAndSendToken(user,res);
        res.cookie("jwt",newToken,{
            maxAge:7*24*60*60*1000,//7 days
            httpOnly:true,
        });

        console.log(user.isVerified,user.email)
    
        
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
    catch(error){
        console.log("error",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            
        });
    }
}
export const UserLogin=async (req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const user=await userModel.findOne({email}).select("+password");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
                
            })
        }
        if(!user.isVerified){
            return res.status(403).json({
                success:false,
                message:"Please verify your email first",
            })
        }
        
        const matchPassword=await user.comparePassword(password);
        if(!matchPassword){
            return res.status(401).json({
                success:false,
                message:"Invalid Credentials",
            })
        }
        const token=await createAndSendToken(user,res);
        res.cookie("jwt",token,{
            maxAge:7*24*60*60*1000,//7 days
            httpOnly:true,
        });
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            }
        });
        

    }
    catch(error){
        console.log("error",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            
        });
    }
}

// to be added 
export const UserForgotPassword=async(req,res)=>{
    try{
        const {email}=req.body;
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is required",
            })
        }
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }
        if(!user.isVerified){
            return res.status(400).json({
                success:false,
                message:"Please verify your email first",
            })
        }
        const token=await createAndSendToken(user,res);
        
        
    }
    catch(error){
        console.log("error",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            
        });
    }
}

