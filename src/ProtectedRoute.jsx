import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, isTokenValid } from "./common/authContext";

const ProtectedRoute = ({ requiredPermission }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("Token");
  const userData = JSON.parse(localStorage.getItem("UserPermissions")) || {};

  if (!isAuthenticated() || !token || !isTokenValid(token)) {
    [
      "Token",
      "UserPermissions",
      "AdminData",
      "User",
      "Admin",
      "UserData",
      "adminData",
      "userName",
      "username",
      "name",
      "email",
    ].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!requiredPermission) {
    return <Outlet />;
  }

  if (userData.permissions && userData.permissions[requiredPermission]) {
    return <Outlet />;
  }

  return <Navigate to="/products" state={{ from: location }} replace />;
};

export default ProtectedRoute;
