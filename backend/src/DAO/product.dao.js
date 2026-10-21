import productModel from "../model/product.model.js";
//returnig the stock of the products varriant 

export const stockOfVariants = async (productId, variantId) => {
    const product = await productModel.findOne(
        variantId
            ? { _id: productId, "variants._id": variantId }
            : { _id: productId }
    );
    if (!product) return null;

    return variantId
        ? product.variants.id(variantId)?.stock ?? null
        : product.stock ?? null;
};