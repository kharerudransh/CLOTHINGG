import mongoose from "mongoose";
import  priceSchema  from "./price.schema.js";

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
        type:priceSchema,
        required:true
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
    variants: {
    type: [
        {
            images: [{ url: { type: String, required: true } }],
            stock: { type: Number, required: true, min: 1 },
            attributes: { type: Map, of: String },
            price: { type: priceSchema, required: true },
        },
    ],
    validate: [(v) => v.length > 0, "A product needs at least one variant"],
},
},{timestamps:true})

const productModel=mongoose.model("product",productSchema);
export default productModel;