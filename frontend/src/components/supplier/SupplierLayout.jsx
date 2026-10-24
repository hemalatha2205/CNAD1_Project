import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Package, LayoutDashboard, Archive, ShoppingCart, User, LogOut, Settings } from "lucide-react";

export default function SupplierLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">LogiSphere</h1>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
            Supplier Portal
          </p>
        </div>

        <div className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto">
          <NavLink to="/supplier" end className={navItemClass}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/supplier/products" className={navItemClass}>
            <Package size={20} />
            <span>My Products</span>
          </NavLink>
          <NavLink to="/supplier/inventory" className={navItemClass}>
            <Archive size={20} />
            <span>Inventory</span>
          </NavLink>
          <NavLink to="/supplier/orders" className={navItemClass}>
            <ShoppingCart size={20} />
            <span>Orders</span>
          </NavLink>
          <NavLink to="/supplier/profile" className={navItemClass}>
            <User size={20} />
            <span>Business Profile</span>
          </NavLink>
          <NavLink to="/supplier/settings" className={navItemClass}>
            <Settings size={20} />
            <span>Account Settings</span>
          </NavLink>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
