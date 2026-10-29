import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supplierApi } from "../../api/supplierApi";
import { ShoppingCart, Package } from "lucide-react";

export default function SupplierOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await supplierApi.getOrders(user.userId);
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.userId]);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Orders</h1>
        <p className="text-gray-500 mt-1">Orders containing your supplied products.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {orders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Order #{order.id}</h2>
                    <p className="text-sm text-gray-500 mt-1">Customer: {order.customerName}</p>
                    <p className="text-sm text-gray-500">Destination: {order.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase tracking-wider">
                      {order.status}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package size={16} /> Order Items
                  </h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-900 font-medium">Product ID: {item.productId}</span>
                        <span className="text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <ShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-900">No orders found</p>
            <p className="mt-1">Orders containing your products will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
