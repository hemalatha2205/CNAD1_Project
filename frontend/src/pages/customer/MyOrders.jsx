import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, Truck, CheckCircle, Clock } from "lucide-react";
import { getCustomerOrders } from "../../api/orderApi";
import { useAuth } from "../../context/AuthContext";

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCustomerOrders(user.userId)
      .then(data => {
        // Sort orders by ID descending (newest first)
        setOrders(data.sort((a, b) => b.id - a.id));
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load your orders.");
      })
      .finally(() => setLoading(false));
  }, [user.userId]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'DELIVERED': return <CheckCircle size={20} color="#10b981" />;
      case 'SHIPPED': return <Truck size={20} color="#3867ff" />;
      default: return <Clock size={20} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return { bg: "#ecfdf5", text: "#059669" };
      case 'SHIPPED': return { bg: "#eff6ff", text: "#2563eb" };
      case 'CANCELLED': return { bg: "#fef2f2", text: "#dc2626" };
      default: return { bg: "#fef3c7", text: "#d97706" };
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px", width: "100%" }}>
        <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "32px" }}>My Orders</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ height: "120px", backgroundColor: "#f3f4f6", borderRadius: "16px", animation: "pulse 1.5s infinite" }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
      <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "32px" }}>My Orders</h1>

      {error && (
        <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "12px", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div style={{ textAlign: "center", padding: "80px 24px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
          <Package size={64} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>No orders yet</h2>
          <p style={{ color: "#6b7280", marginBottom: "32px" }}>You haven't placed any orders. Start shopping to see your orders here.</p>
          <Link to="/customer/products" style={{ padding: "14px 28px", backgroundColor: "#3867ff", color: "white", textDecoration: "none", borderRadius: "12px", fontWeight: 600 }}>
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map(order => {
            const statusStyle = getStatusColor(order.status);

            return (
              <Link
                key={order.id}
                to={`/customer/orders/${order.id}`}
                style={{
                  backgroundColor: "white", padding: "24px", borderRadius: "16px",
                  border: "1px solid #e5e7eb", textDecoration: "none", color: "inherit",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "box-shadow 0.2s"
                }}
                className="order-card"
              >
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                  <div style={{ width: "64px", height: "64px", backgroundColor: "#f9fafb", borderRadius: "12px", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Package size={32} color="#9ca3af" />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "18px", margin: 0, fontWeight: 700 }}>Order #{order.id}</h3>
                      <span style={{
                        backgroundColor: statusStyle.bg, color: statusStyle.text,
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                        fontWeight: 600, display: "flex", alignItems: "center", gap: "4px"
                      }}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "14px" }}>
                      {order.items?.length || 0} items &bull; Total: <strong style={{ color: "#111827" }}>${order.totalAmount?.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ color: "#9ca3af", display: "flex", alignItems: "center" }}>
                  <ChevronRight size={24} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .order-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
