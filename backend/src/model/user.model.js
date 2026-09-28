import mongoose from "mongoose";
import bcrypt from "bcrypt";


const addressSchema = new mongoose.Schema({
    line1: { type: String, required: [true, "Address line 1 is required"], trim: true },
    line2: { type: String, default: "", trim: true },
    city: { type: String, required: [true, "City is required"], trim: true },
    state: { type: String, required: [true, "State is required"], trim: true },
    pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
        match: [/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"]
    }
}, { _id: false });



const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,"First name is required"],
        trim:true
    },
    lastName:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true, 
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:function(){
            return !this.googleId;
        },
        select:false
    },
    contactNo:{
        type:String,
        sparse:true,
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
    ,
    googleId:{
        type:String,
        sparse:true,
        unique:true
    },
    address:{
        required:function(){
            return !this.googleId;
        },
        type:addressSchema,
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