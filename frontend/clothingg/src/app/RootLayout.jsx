// app/RootLayout.jsx

//GET ME REHYDRATION 
import { Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useEffect } from "react";

const RootLayout = () => {
    const { handleGetMe } = useAuth();

    useEffect(() => {
        handleGetMe();
    }, []);

    return <Outlet />;
}

export default RootLayout;