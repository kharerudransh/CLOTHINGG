import mongoose from "mongoose";

const priceSchema=new mongoose.Schema({
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        enum:["INR","USD"],
        default:"INR"
    }
},
{
    _id:false,
});

export default priceSchema;

