import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { LineChart, BarChart2, PieChart } from "lucide-react";

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getOrders(),
      adminApi.getInventory(),
      adminApi.getShipments()
    ]).then(([ordRes, invRes, shipRes]) => {
      const orders = ordRes.data;
      const inventory = invRes.data;
      const shipments = shipRes.data;

      // Order Status Dist
      const orderStatus = {
        CREATED: orders.filter(o => !o.status || o.status === 'CREATED').length,
        SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
        DELIVERED: orders.filter(o => o.status === 'DELIVERED').length
      };

      // Inventory Dist
      const invStatus = {
        inStock: inventory.filter(i => i.quantity >= 20).length,
        lowStock: inventory.filter(i => i.quantity > 0 && i.quantity < 20).length,
        outOfStock: inventory.filter(i => i.quantity === 0).length
      };

      // Shipment Status
      const shipStatus = {
        CREATED: shipments.filter(s => s.status === 'CREATED').length,
        PACKED: shipments.filter(s => s.status === 'PACKED').length,
        SHIPPED: shipments.filter(s => s.status === 'SHIPPED').length,
        IN_TRANSIT: shipments.filter(s => s.status === 'IN_TRANSIT').length,
        OUT_FOR_DELIVERY: shipments.filter(s => s.status === 'OUT_FOR_DELIVERY').length,
        DELIVERED: shipments.filter(s => s.status === 'DELIVERED').length
      };

      setStats({
        orderStatus,
        invStatus,
        shipStatus,
        totalOrders: orders.length,
        totalInventory: inventory.length,
        totalShipments: shipments.length
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 p-8 text-center">Loading analytics data...</div>;

  const orderTotal = stats.totalOrders || 1;
  const invTotal = stats.totalInventory || 1;
  const shipTotal = stats.totalShipments || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LineChart className="text-blue-600" /> Operational Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieChart className="text-blue-500" size={20} /> Order Status Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Created / Pending</span>
                <span className="font-bold">{stats.orderStatus.CREATED}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(stats.orderStatus.CREATED / orderTotal) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Shipped</span>
                <span className="font-bold">{stats.orderStatus.SHIPPED}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.orderStatus.SHIPPED / orderTotal) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Delivered</span>
                <span className="font-bold">{stats.orderStatus.DELIVERED}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.orderStatus.DELIVERED / orderTotal) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart2 className="text-purple-500" size={20} /> Inventory Health
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Healthy Stock (&gt;= 20)</span>
                <span className="font-bold">{stats.invStatus.inStock}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.invStatus.inStock / invTotal) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Low Stock (&lt; 20)</span>
                <span className="font-bold">{stats.invStatus.lowStock}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(stats.invStatus.lowStock / invTotal) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Out of Stock (0)</span>
                <span className="font-bold">{stats.invStatus.outOfStock}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.invStatus.outOfStock / invTotal) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <LineChart className="text-teal-500" size={20} /> Shipment Lifecycle Progress
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
             {[
               { label: 'Created', val: stats.shipStatus.CREATED, color: 'text-gray-600', bg: 'bg-gray-100' },
               { label: 'Packed', val: stats.shipStatus.PACKED, color: 'text-indigo-600', bg: 'bg-indigo-50' },
               { label: 'Shipped', val: stats.shipStatus.SHIPPED, color: 'text-blue-600', bg: 'bg-blue-50' },
               { label: 'In Transit', val: stats.shipStatus.IN_TRANSIT, color: 'text-purple-600', bg: 'bg-purple-50' },
               { label: 'Out for Del', val: stats.shipStatus.OUT_FOR_DELIVERY, color: 'text-orange-600', bg: 'bg-orange-50' },
               { label: 'Delivered', val: stats.shipStatus.DELIVERED, color: 'text-green-600', bg: 'bg-green-50' },
             ].map(s => (
               <div key={s.label} className={`${s.bg} p-4 rounded-lg`}>
                 <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                 <div className="text-xs text-gray-600 font-medium uppercase mt-1">{s.label}</div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
