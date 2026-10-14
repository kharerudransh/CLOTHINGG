import axios from "axios";

const productApiInstance=axios.create({
    baseURL:"/api/products",
    withCredentials:true,
});

//Creating new product
export async function createProduct(formData){
    const response=await productApiInstance.post("/add",formData);
    return response.data;
}

//Geting all the products of seller
export async function getsellerProduct(){
    const response=await productApiInstance.get("/sellerProduct");
    return response.data;
}

//GetMe
export async function getMe(){
    const response=await productApiInstance.get("/getMe");
    return response.data;
}

//DeleteProduct
export async function deleteProduct(deleteId){
    const response=await productApiInstance.delete("/delete",{ data: { deleteId } });
    return response.data;
}


//GetAllProducts
export async function getAllProduct(){
    const response=await productApiInstance.get("/getAllProducts");
    return response.data;
}
//GetDetailedProduct
export async function getDetailedProduct(productId){
    const response=await productApiInstance.get(`/DetailedProduct/${productId}`);
    return response.data;
}
//Add product variant
export async function addProductVariant(productId, newVariantData) {
    const formData = new FormData();
    newVariantData.images.forEach((image) => {
        formData.append("images", image.file);
    });
    formData.append("variant", JSON.stringify({
        price: newVariantData.price,
        stock: newVariantData.stock,
    }));
    formData.append("attributes", JSON.stringify(newVariantData.attributes));

    const response = await productApiInstance.post(`/${productId}/variants`, formData);
    return response.data;
}