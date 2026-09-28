import{body,validationResult} from "express-validator";

function validate(req,res,next){
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    next();
}

export const validateAddProduct=[
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("priceAmount").notEmpty().withMessage("Price amount is required"),
    body("priceCurrency").notEmpty().withMessage("Price currency is required"),
    validate
] 