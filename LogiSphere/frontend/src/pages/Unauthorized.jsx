import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldOff } from "lucide-react";

const ROLE_PATHS = {
  ADMIN: "/admin",
  SUPPLIER: "/supplier",
  CUSTOMER: "/customer",
  DELIVERY_PERSON: "/delivery",
};

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    if (isAuthenticated && user?.role) {
      navigate(ROLE_PATHS[user.role] || "/");
    } else {
      navigate("/login");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: "16px",
      color: "#344054",
    }}>
      <ShieldOff size={48} color="#d92d20" />
      <h2>Access Denied</h2>
      <p style={{ color: "#667085" }}>
        You do not have permission to access this page.
      </p>
      <button
        onClick={handleGoBack}
        style={{
          padding: "12px 24px",
          background: "#3867ff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}
