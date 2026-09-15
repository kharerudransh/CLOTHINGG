import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,"First name is required"],
        trim:true
    },
    lastName:{
        type:String,
        required:[true,"Last name is required"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true, 
        unique:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true,
        select:false
    },
    contactNo:{
        type:String,
        required:[true,"Contact number is required"],
        trim:true,
        unique:true
    },
    role:{
        type:String,
        enum:["Seller","Buyer"],
        default:"Buyer",
        required:[true,"Role is required"]
    },
    isVerified:{
        type:Boolean,
        default:false,
    }

});

userSchema.pre("save",async function(){
    if(!this.isModified("password")) return;
    this.password=await bcrypt.hash(this.password,10);
})


userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);  
}

const userModel=mongoose.model("user",userSchema);

export default userModel;