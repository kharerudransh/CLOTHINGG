import { useDispatch, useSelector } from "react-redux";
import { addToCart, getCart, increaseCartItemQuantity, decreaseCartItemQuantity, removeCartItem, createOrderApi } from "../service/cart.API";
import { setItems, incrementQuantity, decrementQuantity } from "../state/cart.slice";
import { setLoading } from "../../auth/state/auth.slice";
import toast from "react-hot-toast";

const extractItems = (data) => {
    if (!data) return [];
    const cart = Array.isArray(data.cart) ? data.cart[0] : (data.cart || data);
    return Array.isArray(cart?.items) ? cart.items : [];
};

export const useCart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart?.items || []);

    async function handleAddtoCart({ productId, variantId, quantity = 1 }) {
        try {
            const response = await addToCart({ productId, variantId, quantity });
            const items = extractItems(response);
            if (items) {
                dispatch(setItems(items));
            }
            toast.success(response?.message || "Added to cart successfully!");
            return response;
        } catch (error) {
            console.error("Cart add error:", error);
            const msg = error?.response?.data?.message || error.message || "Failed to add to cart";
            toast.error(msg);
            throw error;
        } 
    }

    async function handleGetCart() {
        try {
            const response = await getCart();
            const items = extractItems(response);
            if (items) {
                dispatch(setItems(items));
            }
            return response;
        } catch (error) {
            console.log("Cart fetch error:", error);
            // Non-blocking for unauthenticated or initial loads
            return null;
        } 
    }

    async function handleIncrementCartItem({ productId, variantId }) {
        try {
            dispatch(setLoading(true));
            const data = await increaseCartItemQuantity({ productId, variantId });
            dispatch(incrementQuantity({ productId, variantId }));
            return data;
        } catch (err) {
            console.log("cart increment error:", err);
            const msg = err?.response?.data?.message || err.message || "Failed to increment cart item";
            toast.error(msg);
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleDecrementCartItem({ productId, variantId }) {
        try {
            dispatch(setLoading(true));
            const data = await decreaseCartItemQuantity({ productId, variantId });
            const items = extractItems(data);
            dispatch(setItems(items));
            return data;
        } catch (err) {
            console.log("cart decrement error:", err);
            const msg = err?.response?.data?.message || err.message || "Failed to decrement cart item";
            toast.error(msg);
        } finally {
            dispatch(setLoading(false));
        }
    }

    // Deleting the product from cart 
    async function handleDelete({ productId, variantId }) {
        try {
            dispatch(setLoading(true));
            const data = await removeCartItem({ productId, variantId });
            const items = extractItems(data);
            dispatch(setItems(items));
            return data;
        } catch (err) {
            console.log("cart delete error:", err);
            const msg = err?.response?.data?.message || err.message || "Failed to delete cart item";
            toast.error(msg);
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleCreateOrder({ amount, currency, receipt } = {}) {
        try {
            dispatch(setLoading(true));
            const data = await createOrderApi({amount,currency,receipt});
            return data.order;
        } catch (err) {
            console.log("cart create order error:", err);
            const msg = err?.response?.data?.message || err.message || "Failed to create order";
            toast.error(msg);
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    return { handleAddtoCart, handleGetCart, cartItems, handleIncrementCartItem, handleDecrementCartItem, handleDelete,handleCreateOrder };
};