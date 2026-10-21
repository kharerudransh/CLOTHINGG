import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { addCartItem,getCartItem ,increaseCartItemQuantity ,decreaseCartItemQuantity,removeCartItem,createOrderController} from "../controller/cart.controller.js";
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
/**
 * @routes PATCH /api/cart/quantity/increment/:productId/:varriantId
 * @desc increment the quantity in cart by one 
 * @method PATCH
 * @access Private
 * @argument productId:product id
 * @argument variantId:variant id
 * @response {success:true,cartItem}
 * @error {success:false,message}
 */
cartRouter.patch("/quantity/increase/:productId/:variantId", authenticateUser, increaseCartItemQuantity);
cartRouter.patch("/quantity/increase/:productId", authenticateUser, increaseCartItemQuantity);

/**
 * @routes PATCH /api/cart/quantity/decrement/:productId/:varriantId
 * @desc decrement the quantity in cart by one 
 * @method PATCH
 * @access Private
 * @argument productId:product id
 * @argument variantId:variant id
 * @response {success:true,cartItem}
 * @error {success:false,message}
 */
   cartRouter.patch("/quantity/decrease/:productId/:variantId", authenticateUser, decreaseCartItemQuantity);
   cartRouter.patch("/quantity/decrease/:productId", authenticateUser, decreaseCartItemQuantity);

/**
 * @routes DELETE /api/cart/remove/:productId/:variantId
 * @desc remove items from the cart
 * @method DELETE
 * @access Private
 * @argument productId:product id
 * @argument variantId:variant id
 * @response {success:true,cartItem}
 * @error {success:false,message}
 */
cartRouter.delete("/remove/:productId/:variantId", authenticateUser, removeCartItem);
cartRouter.delete("/remove/:productId", authenticateUser, removeCartItem);


cartRouter.post("/payment/create/order",authenticateUser,createOrderController);


export default cartRouter;