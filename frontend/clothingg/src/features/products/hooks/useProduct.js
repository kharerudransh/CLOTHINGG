import {useDispatch, useSelector} from "react-redux";
import {createProduct ,getsellerProduct,getMe,deleteProduct, getAllProduct,getDetailedProduct} from "../services/product.api.service.js";
import {setSellerProducts,setLoading,setError, removeProduct, setAllProducts} from "../state/product.slice.js";
import toast from "react-hot-toast";
import{setUser} from "../../auth/state/auth.slice.js";
import { useNavigate } from "react-router-dom";


export const useProduct=()=>{
    const navigate=useNavigate();
    const dispatch=useDispatch();
    async function handleCreateProduct(formData){
        try{
            dispatch(setLoading(true));
            const response=await createProduct(formData);
            navigate("/see-products");
            return response.product;
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Failed to Add Product";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }
    async function handleGetsellerProduct(){
        try{
            dispatch(setLoading(true));
            const response=await getsellerProduct();
            dispatch(setSellerProducts(response.products));
            return response.products;
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Failed to Get Seller Products";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe(){
        try{
            dispatch(setLoading(true));
            const response=await getMe();
            dispatch(setUser(response.user));
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Failed to Get Profile";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }

    async function handleDeleteProduct(deleteId) {
        try{
            dispatch(setLoading(true));
            const response=await deleteProduct(deleteId);
            dispatch(removeProduct(deleteId));
            toast.success(response.message || "Product deleted successfully!");
            navigate("/see-products");
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Failed to Delete Product";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }

    async function handleGetAllProducts(){
        try{
            dispatch(setLoading(true));
            const response=await getAllProduct();
            dispatch(setAllProducts(response.products));
            return response.products;
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Failed to Get All Products";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }

    async function handleGetDetailedProduct(productId){
        try{
            const data=await getDetailedProduct(productId);
            return data.product;
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Failed to Get Product";
            toast.error(message);
            dispatch(setError(message));
        }
    }

    return{
        handleCreateProduct,
        handleGetsellerProduct,
        handleGetMe,
        handleDeleteProduct,
        handleGetAllProducts,
        handleGetDetailedProduct
    }
}