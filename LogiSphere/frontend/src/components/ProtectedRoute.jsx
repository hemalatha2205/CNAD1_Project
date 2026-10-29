import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_PATHS = {
  ADMIN: "/admin",
  SUPPLIER: "/supplier",
  CUSTOMER: "/customer",
  DELIVERY_PERSON: "/delivery",
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontSize: "16px",
        color: "#667085",
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const correctPath = ROLE_PATHS[user.role] || "/login";
    return <Navigate to={correctPath} replace />;
  }

  return children;
}
