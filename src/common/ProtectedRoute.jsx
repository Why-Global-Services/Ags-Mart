import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading, permissions } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if the current path is allowed based on permissions
  const pathPermissions = {
    "/dashboard": true,
    "/products": permissions?.products,
    "/products/add": permissions?.products,
    "/products/edit/:id": permissions?.products,
    "/categories": permissions?.category,
    "/categories/add": permissions?.category,
    "/categories/edit/:id": permissions?.category,
    "/subcategories": permissions?.subCategory,
    "/subcategories/add": permissions?.subCategory,
    "/subcategories/edit/:id": permissions?.subCategory,
    "/orders": permissions?.orders,
    "/customers": permissions?.customers,
    "/reviews": permissions?.reviews,
    "/offers": permissions?.offers,
    "/offers/create": permissions?.offers,
    "/offers/:id": permissions?.offers,
    "/offers/offerDetails/:id": permissions?.offers,
    "/offers/offerDetails/:id/assignProducts": permissions?.offers,
    "/offers/offerDetails/:id/:offerProductid": permissions?.offers,
    "/brand": permissions?.brands,
    "/brand/edit/:id": permissions?.brands,
    "/brand/add": permissions?.brands,
    "/coupons": true,
    "/coupons/add": true,
    "/coupons/edit/:id": true,
    "/featuredproducts": true,
    "/featuredproducts/add": true,
    "/featuredproducts/:id": true,
    "/featuredproducts/featuredDetails/:id": true,
    "/featuredproducts/featuredDetails/:id/assignProducts": true,
    "/websetting": true,
    "/report": permissions?.reports,
    "/profile": permissions?.profile,
    "/systemUser": permissions?.systemUser,
    "/systemUser/add": permissions?.systemUser,
    "/systemUser/edit/:id": permissions?.systemUser,
    "/setting": permissions?.settings,
    "/notification": permissions?.notifications,
    "/notifications/add": permissions?.notifications,
    "/userqueries": true,
    "/topbar": true,

    // Settings sub-routes
    "/setting/storesetting": true,
    "/setting/emailsetting": true,
    "/setting/paymethods": true,
    "/setting/paymethods/razorpay": true,
    "/setting/paymethods/stripe": true,
    "/setting/paymethods/phonePay": true,
    "/setting/paymethods/paytm": true,
    "/setting/paymethods/payPal": true,
    "/setting/paymethods/instamojo": true,
    "/setting/paymethods/googlePay": true,
    "/setting/paymethods/cod": true,
    "/setting/paymethods/BankTransfer": true,
    "/setting/shippingmethods": true,
    "/setting/timeslots": true,
    "/setting/contactus": true,
    "/setting/aboutus": true,
    "/setting/privacy&policy": true,
    "/setting/terms&conditions": true,
    "/setting/moduleManager": true,
    "/setting/returnpolicy": true,
    "/setting/shippingpolicy": true,
    "/setting/adminpolicy": true,
    "/setting/deliverypolicy": true,
    "/setting/systemregistration": true,
    // "/setting/faq": true,
  };

  // Match dynamic routes
  const isAllowed = Object.keys(pathPermissions).some((pattern) => {
    const regexPattern = pattern.replace(/:[^\s/]+/g, "([^\\s/]+)");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(location.pathname) && pathPermissions[pattern];
  });

  if (!isAllowed) {
    return <Navigate to="/not-found" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
