import mongoose from "mongoose";

const productSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
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
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    images: {
        type: [String],
        required: [true, "At least one product image is required"],
},
},{timestamps:true})

const productModel=mongoose.model("product",productSchema);
export default productModel;