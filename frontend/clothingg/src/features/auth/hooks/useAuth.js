import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { register,UserVerify,userLogin } from "../services/auth.api.js";
import { setUser, setLoading, setError } from "../state/auth.slice.js";
import { toast } from 'react-hot-toast';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function handleRegister({firstName, lastName, email, password, contactNo, isSeller=false}) {
        try {
            dispatch(setLoading(true));
            const data = await register({firstName, lastName, email, password, contactNo, isSeller});
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

    async function handleLogin({email,password}){
        try{
            dispatch(setLoading(true));
            const data=await userLogin({email,password});
            dispatch(setUser(data.user));
            toast.success(data.message);
            navigate("/");
        }catch(error){
            console.log(error);
            const message = error?.response?.data?.message || error.message || "Login failed";
            toast.error(message);
            dispatch(setError(message));
        }finally{
            dispatch(setLoading(false));
        }
    }

    return { handleRegister,handleUserVerify,handleLogin };
}