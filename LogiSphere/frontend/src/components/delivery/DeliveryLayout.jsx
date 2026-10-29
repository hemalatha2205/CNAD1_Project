import { Outlet, Link, useLocation } from "react-router-dom";
import { Truck, CheckSquare, UserCircle, LogOut, PackageSearch, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DeliveryLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const navItems = [
    { path: "/delivery", label: "Dashboard", icon: <PackageSearch size={20} /> },
    { path: "/delivery/assignments", label: "Assigned Deliveries", icon: <Truck size={20} /> },
    { path: "/delivery/completed", label: "Completed", icon: <CheckSquare size={20} /> },
    { path: "/delivery/settings", label: "Settings", icon: <Settings size={20} /> }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <header style={{ backgroundColor: "#1f2937", borderBottom: "1px solid #374151", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <Link to="/delivery" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
              <div style={{ width: "36px", height: "36px", backgroundColor: "#3867ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Truck size={20} color="white" />
              </div>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>LogiSphere</span>
            </Link>

            <nav style={{ display: "flex", gap: "8px" }} className="desktop-nav">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    padding: "10px 16px", textDecoration: "none", borderRadius: "8px", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: "8px", fontSize: "15px",
                    backgroundColor: location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/delivery") ? "#374151" : "transparent",
                    color: location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/delivery") ? "white" : "#9ca3af"
                  }}
                  className="nav-link"
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "white" }}>
              <UserCircle size={32} color="#9ca3af" />
              <div style={{ display: "flex", flexDirection: "column", display: "none" }} className="desktop-user">
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{user?.name || user?.email}</span>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>Delivery Partner</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: "transparent", border: "1px solid #4b5563", color: "#d1d5db", padding: "8px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 500, fontSize: "14px" }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

        </div>
      </header>

      <main style={{ flex: 1, position: "relative" }}>
        <Outlet />
      </main>

      <style>{`
        .nav-link:hover {
          background-color: #374151 !important;
          color: white !important;
        }
        @media (min-width: 768px) {
          .desktop-user {
            display: flex !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
