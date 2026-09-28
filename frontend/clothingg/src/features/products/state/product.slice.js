import {createSlice} from "@reduxjs/toolkit";

const productSlice=createSlice({
    name:"product",
    initialState:{
        sellerProducts:[],
        loading:false,
        error:null,
        getAllProducts:[]
    },
    reducers:{
        setSellerProducts:(state,action)=>{
            state.sellerProducts=action.payload;
        },
        setLoading:(state,action)=>{
            state.loading=action.payload;
        },
        setError:(state,action)=>{
            state.error=action.payload;
        },
        removeProduct:(state,action)=>{
            state.sellerProducts = state.sellerProducts.filter(
                (product) => product._id !== action.payload
            );
        },
        setAllProducts:(state,action)=>{
            state.getAllProducts=action.payload;
        }
    }
});
export const {setSellerProducts,setLoading,setError,removeProduct,setAllProducts}=productSlice.actions;
export default productSlice.reducer