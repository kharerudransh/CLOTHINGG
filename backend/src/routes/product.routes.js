import express from "express";
import multer from "multer";
import { authenticateSeller } from "../middleware/auth.middleware.js";
import {addProduct,getAllProducts,getMe,deleteProduct,gellALLProducts,getDetailedProduct} from "../controller/product.controller.js";
import { validateAddProduct } from "../validation/product.validation.js";

const upload=multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:1024*1024*5,//5MB
    }
})

const productRouter=express.Router();
//Add new product route
productRouter.post("/add",authenticateSeller ,upload.array("images"),validateAddProduct,addProduct)

//Get AllProducts route
productRouter.get("/sellerProduct",authenticateSeller,getAllProducts);

//GetMe
productRouter.get("/getMe",authenticateSeller,getMe);

//DeleteProduct
productRouter.delete("/delete",authenticateSeller,deleteProduct);



/*
For:Buyer
Public:route:/api/products/getAllProducts
description:Get all products for buyer
method:GET
*/
productRouter.get("/getAllProducts", gellALLProducts);

/**
 For:Buyer
 Public:route:/api/products/DetailedProduct/:productId
 description:Get product details
 method:GET
 */
productRouter.get("/DetailedProduct/:productId", getDetailedProduct);


export default productRouter;
