import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Building2, Package, Archive,
  ShoppingCart, Truck, Bike, Bell, LineChart, LogOut, Settings
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-slate-800 text-white shadow-sm"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Dark theme for Admin */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-black">L</span>
            </div>
            LogiSphere
          </h1>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-2 ml-10">
            Control Panel
          </p>
        </div>

        <div className="p-4 flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-4">Overview</div>
          <NavLink to="/admin" end className={navItemClass}>
            <LayoutDashboard size={18} /><span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/analytics" className={navItemClass}>
            <LineChart size={18} /><span>Analytics</span>
          </NavLink>
          <NavLink to="/admin/alerts" className={navItemClass}>
            <Bell size={18} /><span>Alerts</span>
          </NavLink>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-4">Network</div>
          <NavLink to="/admin/users" className={navItemClass}>
            <Users size={18} /><span>Users</span>
          </NavLink>
          <NavLink to="/admin/suppliers" className={navItemClass}>
            <Building2 size={18} /><span>Suppliers</span>
          </NavLink>
          <NavLink to="/admin/deliveries" className={navItemClass}>
            <Bike size={18} /><span>Delivery Fleet</span>
          </NavLink>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-4">Operations</div>
          <NavLink to="/admin/products" className={navItemClass}>
            <Package size={18} /><span>Global Catalog</span>
          </NavLink>
          <NavLink to="/admin/inventory" className={navItemClass}>
            <Archive size={18} /><span>Inventory</span>
          </NavLink>
          <NavLink to="/admin/orders" className={navItemClass}>
            <ShoppingCart size={18} /><span>Orders</span>
          </NavLink>
          <NavLink to="/admin/shipments" className={navItemClass}>
            <Truck size={18} /><span>Shipments</span>
          </NavLink>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-4">System</div>
          <NavLink to="/admin/settings" className={navItemClass}>
            <Settings size={18} /><span>Account Settings</span>
          </NavLink>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600 shadow-inner">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-lg text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen pb-12">
        <div className="sticky top-0 z-0 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-8 justify-between">
          <div className="text-sm font-medium text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="font-medium text-gray-700">All Systems Operational</span>
            </div>
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
