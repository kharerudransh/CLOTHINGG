import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Smart home redirect:
 * - Seller  → /seller-home
 * - Buyer / guest → shows the home page (children)
 */
const HomeRedirect = ({ children }) => {
  const user = useSelector((state) => state.auth?.user);

  if (user?.role === 'Seller') return <Navigate to="/seller-home" replace />;
  if(user?.role=="Buyer") return <Navigate to="/buyer-home" replace />;

  return children;
};

export default HomeRedirect;
