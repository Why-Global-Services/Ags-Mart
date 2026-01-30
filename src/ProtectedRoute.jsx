import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ requiredPermission }) => {
  const location = useLocation();
  const token = localStorage.getItem("Token");
  const userData = JSON.parse(localStorage.getItem("UserPermissions")) || {};

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!requiredPermission) {
    return <Outlet />;
  }

  if (userData.permissions && userData.permissions[requiredPermission]) {
    return <Outlet />;
  }

  return <Navigate to="/dashboard" state={{ from: location }} replace />;
};

export default ProtectedRoute;
