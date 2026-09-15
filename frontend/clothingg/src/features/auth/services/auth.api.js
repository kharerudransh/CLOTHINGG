import axios from "axios";

const authApiInstance=axios.create({
    baseURL:"http://localhost:3000/api/auth/",
    withCredentials:true,
    headers:{
        "Content-Type":"application/json"
    }
});

export async function register({firstName,lastName,email,password,contactNo,isSeller}){
    const response=await authApiInstance.post("register",{firstName,lastName,email,password,contactNo,isSeller});
    return response;
}
export async function UserVerify(token) {
    const response = await authApiInstance.get("verify", {
        params: { token }
    });
    return response.data;  
}
export async function userLogin({email, password}){
    const response=await authApiInstance.post("login",{email,password});
    return response.data;
}