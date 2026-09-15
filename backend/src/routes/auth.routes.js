import { Router } from "express";
import { UserRegister,UserVerify,UserLogin } from "../controller/auth.controller.js";
import { validateUserRegister, validateUserLogin} from "../validation/auth.validation.js";

const router=Router();


router.post("/register",validateUserRegister,UserRegister);
router.get("/verify",UserVerify);
router.post("/login",validateUserLogin,UserLogin);


export default router;