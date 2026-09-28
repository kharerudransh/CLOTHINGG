import jwt from "jsonwebtoken";
import {CONFIG} from "../config/config.js";
import userModel from "../model/user.model.js"

export const authenticateSeller=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unauthorized:No token provided"
            })
        }
        const decode=jwt.verify(token,CONFIG.JWT_TOKEN);
        req.user=decode;
        
        const user=await userModel.findById(decode.id);
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Unauthorized:User not found"
            })
        }
        if (decode.purpose !== "session") {
            return res.status(403).json({
                success: false,
                message: "Forbidden:Invalid token type",
            });
        }
        if(!user.isVerified){
            return res.status(401).json({
                success:false,
                message:"Unauthorized:You are not a verified user"
            })
        }

        if(user.role!=="Seller"){
            return res.status(403).json({
                success:false,
                message:"Forbidden:You are not a seller"
            })
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token"
        });
    }
}
export const authenticateUser=async(req, res, next)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({
                success:false,
                message:"User Unauthorized"
            })
        }
        const decode=jwt.verify(token,CONFIG.JWT_TOKEN);
        const user=await userModel.findById(decode.id);
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User not found"
            })
        }
        if(!user.isVerified){
            return res.status(401).json({
                success:false,
                message:"User not verified"
            })
        }
        req.user=decode;
        next();
    }
    catch(err){
        console.log(err);
        return res.status(401).json({
            success:false,
            message:"Invalid or expired token"
        })
    }
}