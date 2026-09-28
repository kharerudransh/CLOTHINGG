import axios from "axios";
import { setUser } from "../state/auth.slice";
import { useDispatch } from "react-redux";

const authApiInstance=axios.create({
    baseURL:"/api/auth/",
    withCredentials:true,
    headers:{
        "Content-Type":"application/json"
    }
});

//User Register
export async function register({firstName,lastName,email,password,contactNo,isSeller,address:{
    line1,
    line2,
    city,
    state,
    pincode
}}){
    const response=await authApiInstance.post("register",{firstName,lastName,email,password,contactNo,isSeller,address:{line1,line2,city,state,pincode}});
    return response.data;
}

//User Verify
export async function UserVerify(token) {
    const response = await authApiInstance.get("verify", {
        params: { token }
    });
    return response.data;  
}

//User Login
export async function userLogin({email, password}){
    const response=await authApiInstance.post("login",{email,password});
    return response.data;
}

//User Forgot Password
export async function forgotPassword({email}){
    const response = await authApiInstance.post("forgot-password",{email});
    return response.data;
}

//ResetPassword
export async function ResetPassword({token, newPassword}) {
    const response = await authApiInstance.post(
        "reset-password",       // 1. URL
        { newPassword },        // 2. BODY — ye backend ke req.body mein jayega
        { params: { token } }   // 3. CONFIG — params yahan se query string bante hain (?token=xyz)
    );
    return response.data;
}

//Get Me
export async function getMe(){
    const response=await authApiInstance.get("getMe");
    return response.data;
}

//UserLogout
export async function userLogout(){
    try{
        const response=await authApiInstance.post("logout");
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

//UserProfile
export async function userProfile(){
    const response=await authApiInstance.get("profile");
    return response.data;
}