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
//increment the stock 
export const increaseCartItemQuantity = async ({ productId, variantId }) => {
    const endpoint = (variantId && variantId !== "undefined" && variantId !== "null")
        ? `/quantity/increase/${productId}/${variantId}`
        : `/quantity/increase/${productId}`;
    const response = await cartApiInstance.patch(endpoint);
    return response.data;
};
//decrement the stock 
export const decreaseCartItemQuantity = async ({ productId, variantId }) => {
    const endpoint = (variantId && variantId !== "undefined" && variantId !== "null")
        ? `/quantity/decrease/${productId}/${variantId}`
        : `/quantity/decrease/${productId}`;
    const response = await cartApiInstance.patch(endpoint);
    return response.data;
};

//REMOVING THE ITEM FROM CART 
export const removeCartItem=async({productId,variantId})=>{
    const endpoint = (variantId && variantId !== "undefined" && variantId !== "null")
        ? `/remove/${productId}/${variantId}`
        : `/remove/${productId}`;
    const response=await cartApiInstance.delete(endpoint);
    return response.data;
}

//create order for payment 
export const createOrderApi=async({amount,currency,receipt})=>{
    const response=await cartApiInstance.post("/payment/create/order",{amount,currency,receipt});
    return response.data;
}
