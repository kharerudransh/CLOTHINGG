import { createBrowserRouter,Outlet } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import Login from "../features/auth/pages/Login";
import Verified from "../features/auth/pages/Verified";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import CreateProduct from "../features/products/page/CreateProduct";
import SelllerHomePage from "../features/products/page/SelllerHomePage";
import SeeAllProducts from "../features/products/page/SeeAllProducts";
import SellerProfile from "../features/products/page/SellerProfile";
import SellerLayout from "./SellerLayout";
import BuyerLayout from "../features/User/components/BuyerLayout";
import DetailedProduct from "../features/products/page/DetailedProduct";

import HomeRedirect from "./HomeRedirect";
import Protected from "../components/Protected";
import RootLayout from "./RootLayout";   
import UserHomePage from "../features/User/pages/UserHomePage"
import AllProductsPage from "../features/User/pages/AllProductsPage"
import UserProfile from "../features/User/pages/UserProfile"
export const routes = createBrowserRouter([
    {
        element: <RootLayout />,   // ← sabse bahar wrap, sirf ek jagah handleGetMe() chalega
        children: [
            {
                path: "/",
                element: (
                    <HomeRedirect>
                        <h1>HOME PAGE</h1>
                    </HomeRedirect>
                ),
            },
            { path: "/register", element: <Register /> },
            { path: "/verify-email", element: <VerifyEmail /> },
            { path: "/verify", element: <Verified /> },
            { path: "/login", element: <Login /> },
            { path: "/forgot-password", element: <ForgotPassword /> },
            { path: "/reset-password", element: <ResetPassword /> },
            { path: "/product/:productId", element: <DetailedProduct /> },
            {
                element: <Protected role="Seller"><Outlet /></Protected>,
                children: [
                    {
                        element: <SellerLayout />,
                        children: [
                            { path: "/seller-home",    element: <SelllerHomePage /> },
                            { path: "/add-product",    element: <CreateProduct /> },
                            { path: "/see-products",   element: <SeeAllProducts /> },
                            { path: "/seller-profile", element: <SellerProfile /> },
                            
                        ]
                    }
                ]
            },
            {
                element: <Protected role="Buyer"><Outlet /></Protected>,
                children: [
                    {
                        element: <BuyerLayout />,
                        children: [
                            { path: "/buyer-home",     element: <UserHomePage /> },
                            { path: "/buyer-products", element: <AllProductsPage /> },
                            { path: "/buyer-profile",  element: <UserProfile /> },
                            
                        ]
                    }
                ]
            },
        ]
    }   
]);