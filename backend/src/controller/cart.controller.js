import cartModel from "../model/cart.model.js";
import productModel from "../model/product.model.js";
import { stockOfVariants } from "../DAO/product.dao.js";
import mongoose from "mongoose";
import { createOrder } from "../services/payment.service.js";
import { CONFIG } from "../config/config.js";


async function getCartDetails(userId) {
  const [cart] = await cartModel.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$items' },
    { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'items.product' } },
    { $unwind: '$items.product' },
    { $unwind: '$items.product.variants' },
    { $match: { $expr: { $eq: ['$items.variant', '$items.product.variants._id'] } } },
    { $addFields: {
        itemPrice: {
          price: { $multiply: ['$items.quantity', '$items.product.variants.price.amount'] },
          currency: '$items.product.variants.price.currency'   // live variant, not the cart snapshot
        }
    }},
    { $group: {
        _id: '$_id',
        totalCartPrice: { $sum: '$itemPrice.price' },
        currencies: { $addToSet: '$itemPrice.currency' },
        items: { $push: '$items' }
    }},
    { $addFields: { currency: { $arrayElemAt: ['$currencies', 0] } } }
  ]);
  return cart ?? null;
}


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
export async function addCartItem(req, res) {
    try {
        const { productId, variantId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
        }

        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
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
        if (!cart) {
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
    catch (error) {
        console.error("addCartItem error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to add item to cart" });
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
export async function getCartItem(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        // getCartItem
        const cart = await getCartDetails(userId);
        if (!cart) {
            return res.status(200).json({ success: true, cart: { user: userId, items: [], totalCartPrice: 0 } });
        }
        return res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error("getCartItem error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch cart" });
    }
}

/**
 * @routes /api/cart/quantity/increment/:productId/:variantId
 * @desc increment the quantity in cart by one 
 * @method PATCH
 * @access Private
 * @argument productId:product id
 * @argument variantId:variant id
 * @response {success:true,cartItem}
 * @error {success:false,message}
 */
export async function increaseCartItemQuantity(req, res) {
    try {
        const { productId, variantId } = req.params;
        const userId = req.user?.id;

        const product = await productModel.findOne(
            variantId
                ? { _id: productId, "variants._id": variantId }
                : { _id: productId }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const stock = variantId
            ? product.variants.id(variantId)?.stock
            : product.stock;
        if (stock === undefined || stock === null) {
            return res.status(404).json({ success: false, message: "Stock not found" });
        }

        const cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const cartItem = cart.items.find(
            (item) =>
                item.product.toString() === productId &&
                (variantId ? item.variant?.toString() === variantId : !item.variant)
        );
        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        if (cartItem.quantity + 1 > stock) {
            return res.status(400).json({
                success: false,
                message: stock === 0
                    ? "This product is out of stock"
                    : `You can only add ${stock} items of this product`
            });
        }

        const updatedCart = await cartModel
            .findOneAndUpdate(
                {
                    user: userId,
                    items: {
                        $elemMatch: {
                            product: productId,
                            variant: variantId ?? null,
                            quantity: { $lt: stock }
                        }
                    }
                },
                { $inc: { "items.$.quantity": 1 } },
                { new: true }
            )
            .populate("items.product");

        if (!updatedCart) {
            return res.status(400).json({
                success: false,
                message: `You can only add ${stock} items of this product`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item quantity increased",
            cart: updatedCart
        });
    } catch (error) {
        console.error("increaseCartItemQuantity error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to increase item quantity" });
    }
}

/** 
*@routes: /api/cart/quantity/decrement/:productId/:variantId
*@desc: decrement the quantity in cart by one 
*@method: PATCH
*@access: Private
*@argument productId:product id
*@argument variantId:variant id
*@response {success:true,cartItem}
*@error {success:false,message}
*/
export async function decreaseCartItemQuantity(req, res) {
    try {
        const { productId, variantId } = req.params;
        const userId = req.user?.id;

        const cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const cartItem = cart.items.find(
            (item) =>
                item.product.toString() === productId &&
                (variantId ? item.variant?.toString() === variantId : !item.variant)
        );
        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        if (cartItem.quantity <= 1) {
            return res.status(400).json({ success: false, message: "Quantity is already 1" });
        }

        const updatedCart = await cartModel
            .findOneAndUpdate(
                {
                    user: userId,
                    items: {
                        $elemMatch: {
                            product: productId,
                            variant: variantId ?? null,
                            quantity: { $gt: 1 }
                        }
                    }
                },
                { $inc: { "items.$.quantity": -1 } },
                { new: true }
            )
            .populate("items.product");

        if (!updatedCart) {
            return res.status(400).json({ success: false, message: "Quantity is already 1" });
        }

        return res.status(200).json({
            success: true,
            message: "Item quantity decreased",
            cart: updatedCart
        });
    } catch (error) {
        console.error("decreaseCartItemQuantity error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to decrease item quantity" });
    }
}


/**
 *@route: /api/cart/remove/:productId/:variantId
 *@desc: remove items from the cart
 *@method: DELETE
 *@access: Private
 *@argument productId:product id
 *@argument variantId:variant id
 *@response {success:true,cartItem}
 *@error {success:false,message}
 */
export async function removeCartItem(req , res){
    try{
        const{productId, variantId}=req.params;
        const product=await productModel.findOne({
            _id:productId,
            "variants._id":variantId
        })
        if(!product){
            return res.status(404).json({
                success:false,
                message:"product not found"
            })
        }
        const cart=await cartModel.findOneAndUpdate(
                {
                    user: req.user.id,
                    items: {
                        $elemMatch: {
                            product: productId,
                            variant: variantId ?? null  
                        }
                    }
                },
                {
                    $pull: {
                        items: { product: productId, variant: variantId ?? null }
                    }
                },
                { new: true }
            )
            .populate("items.product");
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Item removed from cart",
            cart:cart
        })
        
    }
    catch (error) {
        console.error("removeCartItem error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to remove cart item"
        });
    }
}


export async function createOrderController(req,res){
    try {
        const userId=req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        // createOrderController
        const cart = await getCartDetails(userId);
        if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
        }
        if (cart.currencies.length > 1) {
        return res.status(409).json({ success: false, message: "Cart has mixed currencies" });
        }
        const outOfStock = cart.items.find(i => i.quantity > i.product.variants.stock);
        if (outOfStock) {
        return res.status(400).json({ success: false, message: `Not enough stock for ${outOfStock.product.title}` });
        }
        const order = await createOrder({
        amount: cart.totalCartPrice,
        currency: cart.currency,
        receipt: `rcpt_${cart._id}_${Date.now()}`
        });
        return res.status(200).json({
            success:true,
            message:"Order created successfully",
            order:order
        })
    } catch (error) {
        console.error("createOrderController error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create order"
        });
    }
}