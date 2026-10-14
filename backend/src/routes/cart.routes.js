import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { addCartItem,getCartItem } from "../controller/cart.controller.js";
const cartRouter=express.Router();


/**
 * @routes:/api/cart/add/:productId/:variantId
 * @description:Add items to the cart
 * @method:POST
 * @access:Private
 * @argument productId:product id
 * @argument variantId:variant id
 * @argument {quantity:number} req.body
 * @response: {success:true,cartItem}
 * @error:{success:false,message}
 */
cartRouter.post("/add/:productId/:variantId",authenticateUser,addCartItem);
cartRouter.post("/add/:productId",authenticateUser,addCartItem);

/*
 @routes:/api/cart/get
 @description:Get all items in the cart
 @method:GET
 @access:Private
 @response: {success:true,cartItem}
 @error:{success:false,message}
*/
cartRouter.get("/get",authenticateUser,getCartItem);

export default cartRouter;