import { useDispatch, useSelector } from "react-redux";
import { addToCart, getCart } from "../service/cart.API";
import { setItems } from "../state/cart.slice";
import { setLoading } from "../../auth/state/auth.slice";
import toast from "react-hot-toast";

export const useCart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart?.items || []);

    async function handleAddtoCart({ productId, variantId, quantity = 1 }) {
        try {
            
            const response = await addToCart({ productId, variantId, quantity });
            if (response?.cart?.items) {
                dispatch(setItems(response.cart.items));
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
            if (response?.cart?.items) {
                dispatch(setItems(response.cart.items));
            }
            return response;
        } catch (error) {
            console.log("Cart fetch error:", error);
            // Non-blocking for unauthenticated or initial loads
            return null;
        } 
    }

    return { handleAddtoCart, handleGetCart, cartItems };
};