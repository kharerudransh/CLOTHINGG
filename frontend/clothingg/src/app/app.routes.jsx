import { createBrowserRouter } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import Login from "../features/auth/pages/Login";
import Verified from "../features/auth/pages/Verified";


export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>HOME PAGE</h1>,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/verify-email",
        element: <VerifyEmail />,
    },
    {
        path: "/verify",
        element: <Verified />,
    },
    {
        path:"/login",
        element:<Login />
    }
]);
