import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/auth.slice.js";
import productReducer from "../features/products/state/product.slice.js";
import cartReducer from "../features/Cart/state/cart.slice.js";

export const store=configureStore({

    reducer:{
        //reducers
        auth:authReducer,
        product:productReducer,
        cart:cartReducer
    }
})

