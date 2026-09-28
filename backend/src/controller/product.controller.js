import { uploadFile } from "../services/imageKit.service.js";
import productModel from "../model/product.model.js";
import userModel from "../model/user.model.js";

//Add new product
export const addProduct = async (req, res) => {
    try {
        const { title, description, priceAmount,priceCurrency } = req.body;
        const seller = req.user;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required",
            });
        }

        const image = await Promise.all(
            req.files.map(async(file) =>{
                return await uploadFile({ 
                    buffer:file.buffer,
                    fileName:file.originalname
                })
            }
            )
        );
        const images = image.map((result) => result.url);
    

        const product = await productModel.create({
            title,
            description,
            price: { amount: Number(priceAmount), currency:priceCurrency },
            seller: seller.id,
            images,
        });

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product,
        });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//Get all products of seller
export const getAllProducts=async(req,res)=>{
    try{
        const seller=req.user.id;
        const user=await userModel.findById(seller);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"Seller not found",
            });
        }
        if(!user.isVerified){
            return res.status(401).json({
                success:false,
                message:"Seller is not verified",
            });
        }
        
        const products=await productModel.find({seller});
        return res.status(200).json({
            success:true,
            message:"Products fetched successfully",
            products:products,
            total:products.length,  
            seller:user.email,
            image:products.image
        });
    }catch(error){
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
//GetMe
export const getMe=async(req,res)=>{
    try{
        const seller=req.user.id;
        const user=await userModel.findById(seller)
        if(!user){
            return res.status(404).json({
                success:false,
                message:"Seller not found",
            });

        }
        if(!user.isVerified){
            return res.status(401).json({
                success:false,
                message:"Seller is not verified",
            });
        }
        return res.status(200).json({
            success:true,
            message:"User fetched successfully",
            user:user,
        });
    }catch(error){
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

//DeleteProduct
export const deleteProduct=async(req,res)=>{
    try{
        const {deleteId}=req.body;
        const product = await productModel.findById(deleteId);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found",
            })
        }
        const seller=req.user;
        if(seller.role!=="Seller"){
            return res.status(401).json({
                success:false,
                message:"Unauthorized",
            })
        }
        const deletedProduct = await productModel.findByIdAndDelete(deleteId);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product: deletedProduct,
        });
    }catch(error){
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


//GetAllProducts
export const gellALLProducts=async(req,res)=>{
    try{
        const products=await productModel.find();
        return res.status(200).json({
            success:true,
            message:"Products fetched successfully",
            products:products,
            total:products.length,
        });
    }catch(error){
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

/**
 * Get Single Detailed Product 
 * route:/api/products/DetailedProduct/:productId
 * description:Get product details
 * method:GET
 * 
 */
export const getDetailedProduct=async(req,res)=>{
    try{
        const {productId}=req.params;
        if(!productId){
            return res.status(404).json({
                success:false,
                message:"Product not found",
            });
        }
        const product=await productModel.findById(productId).populate("seller", "firstName lastName email contactNo");
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found",
            });
        }
        return res.status(200).json({
            success:true,
            message:"Product details fetched successfully",
            product:product,
        });
    }
    catch(error){
        console.log("error", error);
        return res.status(400).json({
            success: false,
            message: "Invalid product",
        });
    }
}