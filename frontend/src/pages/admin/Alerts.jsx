import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { Bell, AlertTriangle, Clock, Archive } from "lucide-react";
import { Link } from "react-router-dom";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getSuppliers(),
      adminApi.getDeliveryPersons(),
      adminApi.getInventory(),
      adminApi.getShipments()
    ]).then(([supRes, delRes, invRes, shipRes]) => {
      const generatedAlerts = [];

      // Pending Suppliers
      const pendingSuppliers = supRes.data.filter(s => s.verificationStatus === 'PENDING' || !s.verificationStatus);
      if (pendingSuppliers.length > 0) {
        generatedAlerts.push({
          id: 'sup-pending',
          type: 'warning',
          icon: <Clock className="text-yellow-600" />,
          title: 'Pending Supplier Approvals',
          message: `${pendingSuppliers.length} supplier(s) are awaiting verification.`,
          link: '/admin/suppliers',
          linkText: 'Review Suppliers'
        });
      }

      // Pending Deliveries
      const pendingDeliveries = delRes.data.filter(d => d.verificationStatus === 'PENDING' || d.verificationStatus === 'PENDING_VERIFICATION' || !d.verificationStatus);
      if (pendingDeliveries.length > 0) {
        generatedAlerts.push({
          id: 'del-pending',
          type: 'warning',
          icon: <Clock className="text-yellow-600" />,
          title: 'Pending Delivery Fleet Approvals',
          message: `${pendingDeliveries.length} delivery personnel are awaiting verification.`,
          link: '/admin/deliveries',
          linkText: 'Review Fleet'
        });
      }

      // Out of Stock
      const outOfStock = invRes.data.filter(i => i.quantity === 0);
      if (outOfStock.length > 0) {
        generatedAlerts.push({
          id: 'inv-out',
          type: 'critical',
          icon: <AlertTriangle className="text-red-600" />,
          title: 'Products Out of Stock',
          message: `${outOfStock.length} product(s) are completely out of stock.`,
          link: '/admin/inventory',
          linkText: 'View Inventory'
        });
      }

      // Low Stock
      const lowStock = invRes.data.filter(i => i.quantity > 0 && i.quantity < 20);
      if (lowStock.length > 0) {
        generatedAlerts.push({
          id: 'inv-low',
          type: 'warning',
          icon: <Archive className="text-orange-600" />,
          title: 'Low Stock Alerts',
          message: `${lowStock.length} product(s) have low stock (less than 20 units).`,
          link: '/admin/inventory',
          linkText: 'View Inventory'
        });
      }

      setAlerts(generatedAlerts);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="text-red-600" /> System Alerts
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Scanning system for alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-green-50 rounded-xl p-8 text-center border border-green-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={32} />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">All Clear</h3>
          <p className="text-green-600">There are no pending actions or system alerts requiring your attention.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-5 rounded-xl border flex items-start gap-4 ${
              alert.type === 'critical' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
            }`}>
              <div className={`p-2 rounded-lg ${
                alert.type === 'critical' ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                {alert.icon}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${
                  alert.type === 'critical' ? 'text-red-900' : 'text-orange-900'
                }`}>
                  {alert.title}
                </h4>
                <p className={`mt-1 text-sm ${
                  alert.type === 'critical' ? 'text-red-700' : 'text-orange-700'
                }`}>
                  {alert.message}
                </p>
              </div>
              <div>
                <Link
                  to={alert.link}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    alert.type === 'critical'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {alert.linkText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
