import{body,validationResult} from "express-validator";

function validate(req,res,next){
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    next();
}


export const validateUserRegister = [
    body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

    body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),

    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min:6})
    .withMessage("Password must be at least 6 characters long"),

    body("contactNo")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required")
    .isNumeric()
    .withMessage("Contact number must contain only digits")
    .isLength({ min: 10, max: 10 })
    .withMessage("Contact number must be 10 digits long"),


    body("isSeller")
    .isBoolean()
    .withMessage("isSeller is required")
    .toBoolean()
    .optional(),


    body("address")
    .isObject()
    .withMessage("Address must be an object"),

    body("address.line1")
    .trim()
    .notEmpty()
    .withMessage("Address line 1 is required"),

    body("address.line2")
    .optional()
    .trim(),


    body("address.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

    body("address.state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),

    body("address.pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Pincode must be 6 digits long and contain only digits"),


    validate
]

export const validateUserLogin = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),

    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min:6})
    .withMessage("Password must be at least 6 characters long"),

    validate
]

export const validateForgotPassword = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),

    validate
]
export const validateUserResetPassword = [
    body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min:6})
    .withMessage("Password must be at least 6 characters long"),

    validate
]
