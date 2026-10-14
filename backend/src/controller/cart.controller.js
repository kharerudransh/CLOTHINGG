import cartModel from "../model/cart.model.js";
import productModel from "../model/product.model.js";
import { stockOfVariants } from "../DAO/product.dao.js";

/**
 * @function addCartItem
 * @routes /api/cart/add/:productId/:variantId
 * @description Add items to the cart
 * @access Private
 * @argument productId:product id
 * @argument variantId:variant id
 * @argument {quantity:number} req.body
 * @response {success:true,cartItem}
 * @error {success:false,message}
 */
export async function addCartItem(req,res){
    try{
        const {productId,variantId}=req.params;
        const {quantity}=req.body;

        if(!quantity || quantity<=0){
            return res.status(400).json({success:false,message:"Quantity must be greater than 0"});
        }

        let product = await productModel.findById(productId);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            });
        }

        let targetVariant = null;
        if (product.variants && product.variants.length > 0) {
            if (variantId && variantId !== "undefined" && variantId !== "default" && variantId !== "null") {
                targetVariant = product.variants.find(v => v._id.toString() === variantId);
            }
            // If specific variant not specified or not matched, use first variant
            if (!targetVariant && product.variants[0]) {
                targetVariant = product.variants[0];
            }
        }

        const effectiveVariantId = targetVariant ? targetVariant._id.toString() : null;
        const stock = targetVariant ? targetVariant.stock : 99;

        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        let cart = await cartModel.findOne({ user: userId });
        if(!cart){
            cart = await cartModel.create({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(
            (item) =>
                item.product?.toString() === productId &&
                (effectiveVariantId ? item.variant?.toString() === effectiveVariantId : true)
        );

        const newQuantity = (existingItem ? existingItem.quantity : 0) + Number(quantity);

        if (newQuantity > stock) {
            return res.status(400).json({
                success: false,
                message: `Quantity exceeds stock (available: ${stock})`
            });
        }

        // Sanitize price
        const rawPrice = targetVariant?.price || product.price;
        let itemPrice = undefined;
        if (rawPrice && rawPrice.amount !== undefined) {
            itemPrice = {
                amount: Number(rawPrice.amount),
                currency: rawPrice.currency || "INR"
            };
        } else if (typeof rawPrice === "number") {
            itemPrice = { amount: rawPrice, currency: "INR" };
        }

        if (existingItem) {
            existingItem.quantity = newQuantity;
            if (!existingItem.price && itemPrice) {
                existingItem.price = itemPrice;
            }
        } else {
            const newItem = {
                product: productId,
                quantity: Number(quantity)
            };
            if (effectiveVariantId) {
                newItem.variant = effectiveVariantId;
            }
            if (itemPrice) {
                newItem.price = itemPrice;
            }
            cart.items.push(newItem);
        }

        await cart.save();
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart
        });
        
    }   
    catch(error){
        console.error("addCartItem error:", error);
        res.status(500).json({success:false, message: error.message || "Failed to add item to cart"});
    } 
}
/**
 * @routes /api/cart/get
 * @description:Get all items in the cart
 * @method:GET
 * @access:Private
 * @response {success:true,cartItem}
 * @error {success:false,message}
 */
export async function getCartItem(req,res){
    try{
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        let cart = await cartModel.findOne({user:userId}).populate("items.product");
        if(!cart){
            return res.status(200).json({
                success: true,
                cart: { user: userId, items: [] }
            });
        }
        return res.status(200).json({success:true,cart});
    }catch(error){
        console.error("getCartItem error:", error);
        res.status(500).json({success:false, message: error.message || "Failed to fetch cart"});
    }
}   

    