import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  Package, ShoppingCart, User, LogOut,
  Search, Home, LayoutList, ClipboardList, Settings
} from "lucide-react";

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/customer", icon: Home },
    { name: "Products", path: "/customer/products", icon: Package },
    { name: "Categories", path: "/customer/products?view=categories", icon: LayoutList },
    { name: "Search", path: "/customer/products?view=search", icon: Search },
    { name: "My Orders", path: "/customer/orders", icon: ClipboardList },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f9fafb" }}>
      <header style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto", padding: "0 24px",
          height: "70px", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <Link to="/customer" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#111827", fontWeight: 800, fontSize: "22px" }}>
            <div style={{ backgroundColor: "#3867ff", padding: "8px", borderRadius: "8px", color: "white" }}>
              <Package size={24} />
            </div>
            LogiSphere
          </Link>

          <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path && !item.path.includes("?");
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    textDecoration: "none",
                    color: isActive ? "#3867ff" : "#4b5563",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "15px",
                    transition: "color 0.2s"
                  }}
                >
                  <Icon size={18} />
                  <span className="hide-on-mobile">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link to="/customer/cart" style={{ position: "relative", color: "#4b5563", textDecoration: "none" }}>
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: "-8px", right: "-10px",
                  backgroundColor: "#d92d20", color: "white",
                  fontSize: "11px", fontWeight: "bold",
                  height: "20px", minWidth: "20px",
                  borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 6px"
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "15px", borderLeft: "1px solid #e5e7eb", paddingLeft: "20px" }}>
              <Link
                to="/customer/settings"
                style={{ display: "flex", alignItems: "center", gap: "8px", color: "#374151", textDecoration: "none" }}
                title="Account Settings"
              >
                <div style={{ backgroundColor: "#eff4ff", color: "#3867ff", padding: "6px", borderRadius: "50%" }}>
                  <User size={16} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 500 }} className="hide-on-mobile">{user?.name}</span>
              </Link>
              <Link
                to="/customer/settings"
                style={{ color: "#6b7280", display: "flex", alignItems: "center" }}
                title="Account Settings"
              >
                <Settings size={18} />
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "transparent", border: "none", color: "#6b7280",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                  fontSize: "14px", fontWeight: 500
                }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>

      <footer style={{ backgroundColor: "#111827", color: "#9ca3af", padding: "40px 24px", marginTop: "auto" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "white", fontWeight: 800 }}>
            <Package size={24} color="#3867ff" />
            LogiSphere
          </div>
          <p style={{ fontSize: "14px" }}>© 2026 LogiSphere. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
