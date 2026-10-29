import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { Link } from "react-router-dom";
import {
  Users, Building2, Package, Archive,
  ShoppingCart, Truck, Bike, Bell
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getUsers(),
      adminApi.getSuppliers(),
      adminApi.getProducts(),
      adminApi.getInventory(),
      adminApi.getOrders(),
      adminApi.getShipments(),
      adminApi.getDeliveryPersons()
    ]).then(([uRes, supRes, pRes, iRes, oRes, sRes, dRes]) => {

      const suppliers = supRes.data;
      const deliveries = dRes.data;
      const inventory = iRes.data;
      const shipments = sRes.data;

      setStats({
        users: uRes.data.length,
        suppliers: suppliers.length,
        products: pRes.data.length,
        orders: oRes.data.length,
        shipments: shipments.length,
        deliveries: deliveries.length,

        pendingSuppliers: suppliers.filter(s => s.verificationStatus === 'PENDING' || !s.verificationStatus).length,
        pendingDeliveries: deliveries.filter(d => d.verificationStatus === 'PENDING' || d.verificationStatus === 'PENDING_VERIFICATION' || !d.verificationStatus).length,
        lowStock: inventory.filter(i => i.quantity > 0 && i.quantity < 20).length,
        activeShipments: shipments.filter(s => s.status !== 'DELIVERED').length
      });
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading control panel metrics...</div>;

  const statCards = [
    { title: "Total Users", value: stats.users, icon: <Users size={24} />, bg: "bg-blue-50", color: "text-blue-600", link: "/admin/users" },
    { title: "Total Suppliers", value: stats.suppliers, icon: <Building2 size={24} />, bg: "bg-purple-50", color: "text-purple-600", link: "/admin/suppliers" },
    { title: "Global Products", value: stats.products, icon: <Package size={24} />, bg: "bg-indigo-50", color: "text-indigo-600", link: "/admin/products" },
    { title: "Total Orders", value: stats.orders, icon: <ShoppingCart size={24} />, bg: "bg-emerald-50", color: "text-emerald-600", link: "/admin/orders" },
    { title: "Total Shipments", value: stats.shipments, icon: <Truck size={24} />, bg: "bg-cyan-50", color: "text-cyan-600", link: "/admin/shipments" },
    { title: "Delivery Fleet", value: stats.deliveries, icon: <Bike size={24} />, bg: "bg-orange-50", color: "text-orange-600", link: "/admin/deliveries" },
  ];

  const alerts = [
    { label: "Pending Supplier Approvals", value: stats.pendingSuppliers, link: "/admin/suppliers" },
    { label: "Pending Delivery Approvals", value: stats.pendingDeliveries, link: "/admin/deliveries" },
    { label: "Low Stock Products", value: stats.lowStock, link: "/admin/inventory" },
    { label: "Active Shipments in Transit", value: stats.activeShipments, link: "/admin/shipments" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Overview</h2>
        <p className="text-gray-500">Real-time statistics across the LogiSphere network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <Link key={idx} to={card.link} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-3xl font-black text-gray-900">{card.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-red-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
          <Bell className="text-red-600" size={20} />
          <h3 className="font-bold text-red-900">Action Items & Alerts</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {alerts.map((alert, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between">
              <span className="text-gray-700 font-medium">{alert.label}</span>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  alert.value > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {alert.value}
                </span>
                <Link to={alert.link} className="text-sm text-blue-600 hover:underline">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
