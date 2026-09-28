import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { register,UserVerify,userLogin,forgotPassword,ResetPassword, getMe, userLogout, userProfile } from "../services/auth.api.js";
import { setUser, setLoading, setError } from "../state/auth.slice.js";
import { toast } from 'react-hot-toast';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //Handle Register
    async function handleRegister({firstName, lastName, email, password, contactNo, isSeller=false,address:{line1,line2,city,state,pincode}}) {
        try {
            dispatch(setLoading(true));
            const data = await register({firstName, lastName, email, password, contactNo, isSeller,address:{line1,line2,city,state,pincode}});
            dispatch(setUser(data.user));
            toast.success(data.message);
            navigate("/verify-email");
        } catch (error) {
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Registration failed";
            toast.error(message);
            dispatch(setError(message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    //Handle User Verify
    async function handleUserVerify(token) {
        try {
            dispatch(setLoading(true));
            const data = await UserVerify(token);
            dispatch(setUser(data.user));
            toast.success(data.message || "Email verified successfully!");
            navigate("/login");
        } catch (error) {
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Verification failed";
            toast.error(message);
            dispatch(setError(message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    //Handle Login
    async function handleLogin({email,password}){
        try{
            dispatch(setLoading(true));
            const data=await userLogin({email,password});
            dispatch(setUser(data.user));
            toast.success(data.message);
            navigate("/");
            return data.user;
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Login failed";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }

    //Handle ForgotPassword
    async function handleForgotPassword({email}){
        dispatch(setLoading(true));

        try{
            const data=await forgotPassword({email});
            toast.success(data.message);
            navigate("/verify-email");
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Forgot Password failed";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }

    //Handle ResetPassword
    async function handleResetPassword({token,newPassword}){
        try{
            dispatch(setLoading(true));
            const data=await ResetPassword({token,newPassword});
            toast.success(data.message);
            navigate("/login");
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Reset Password failed";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }
    //GetMe
    async function handleGetMe(){
        try{
            dispatch(setLoading(true));
            const data=await getMe();
            dispatch(setUser(data.user));
        }catch(error){
            console.log(error);
            dispatch(setUser(null));
        }finally{
            dispatch(setLoading(false));
        }
    }

    //LogOut
    async function handleLogOut(){
        try{
            dispatch(setLoading(true));
            const data=await userLogout();
            dispatch(setUser(null));
            navigate("/login");
            toast.success(data.message);
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Logout failed";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }

    //UserProfile
    async function handleUserProfile(){
        try{
            const data=await userProfile();
            dispatch(setUser(data.user));
        }
        catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Profile fetch failed";
            toast.error(message);
            dispatch(setError(message));
        }
    }
    return { handleRegister,handleUserVerify,handleLogin,handleForgotPassword,handleResetPassword,handleGetMe,handleLogOut,handleUserProfile };
}