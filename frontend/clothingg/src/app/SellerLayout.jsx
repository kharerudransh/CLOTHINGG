import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../features/products/page/NavBar';

const SellerLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f5f3f0] font-[Montserrat]">
      <NavBar />
      {/*
        key={location.pathname} → React unmounts/remounts the Outlet
        on every route change, triggering animate-page-enter fresh each time.
      */}
      <div key={location.pathname} className="animate-page-enter">
        <Outlet />
      </div>
    </div>
  );
};

export default SellerLayout;
