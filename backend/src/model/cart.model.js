import mongoose from "mongoose";
import priceSchema from "../model/price.schema.js";
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    items: [
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"product",
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
                default:1,
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product.variants"
            },
            price:{
                type:priceSchema,
            }
        }
    ]
})

const cartModel=mongoose.model("Cart",cartSchema);

export default cartModel;