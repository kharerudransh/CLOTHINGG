import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";

export const cartSlice=createSlice({
    name:"cart",
    initialState:{
        items:[]
    },
    reducers:{
        setItems:(state,action)=>{
            state.items = Array.isArray(action.payload) ? action.payload : (action.payload?.items || []);
        },
        addItem:(state,action)=>{
            if (!action.payload) return;
            const payloadProdId = action.payload.product?._id || action.payload.product;
            const existingItem = state.items.find((item) => {
                const itemProdId = item.product?._id || item.product;
                return itemProdId === payloadProdId && String(item.variant) === String(action.payload.variant);
            });
            if(existingItem){
                existingItem.quantity += (action.payload.quantity || 1);
            }
            else{
                state.items.push(action.payload);
            }
        },
        incrementQuantity: (state, action) => {
            const { productId, variantId } = action.payload;
            const item = state.items.find(
                (item) => item.product._id === productId && item.variant === variantId
            );
            if (item) {
                item.quantity += 1;
            }
        }
        ,
        decrementQuantity:(state,action)=>{
            const{productId,variantId}=action.payload;
            const item=state.items.find(
                (item)=>item.product._id===productId && item.variant===variantId
            );
            if(item){
                item.quantity-=1;
            }
        }
    }
})

export const {setItems,addItem,incrementQuantity,decrementQuantity}=cartSlice.actions;
export default cartSlice.reducer;