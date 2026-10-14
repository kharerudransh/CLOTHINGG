import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
});

// Add to Cart
export const addToCart = async ({ productId, variantId, quantity }) => {
    const endpoint = (variantId && variantId !== "undefined" && variantId !== "null")
        ? `/add/${productId}/${variantId}`
        : `/add/${productId}`;
    const response = await cartApiInstance.post(endpoint, { quantity });
    return response.data;
};

// Get Cart
export const getCart = async () => {
    const response = await cartApiInstance.get("/get");
    return response.data;
};
