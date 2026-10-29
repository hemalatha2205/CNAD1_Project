import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, Truck } from "lucide-react";

export default function OrderSuccess() {
  const location = useLocation();
  const orderDetails = location.state;

  if (!orderDetails) {
    return <Navigate to="/customer" replace />;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "60px auto", padding: "40px 24px", width: "100%" }}>
      <div style={{ backgroundColor: "white", padding: "48px", borderRadius: "24px", border: "1px solid #e5e7eb", textAlign: "center", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>

        <div style={{ display: "inline-flex", padding: "20px", backgroundColor: "#ecfdf5", borderRadius: "50%", marginBottom: "24px" }}>
          <CheckCircle size={64} color="#10b981" />
        </div>

        <h1 style={{ fontSize: "36px", letterSpacing: "-1px", marginBottom: "16px", color: "#111827" }}>
          Order Confirmed!
        </h1>

        <p style={{ color: "#4b5563", fontSize: "18px", marginBottom: "40px", maxWidth: "500px", margin: "0 auto 40px" }}>
          Thank you for your purchase. Your order has been successfully placed and is now being processed for shipment.
        </p>

        <div style={{ backgroundColor: "#f9fafb", borderRadius: "16px", padding: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", textAlign: "left", marginBottom: "40px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Order ID</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>#{orderDetails.orderId}</div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Date</div>
            <div style={{ fontSize: "18px", fontWeight: 500, color: "#111827" }}>
              {new Date(orderDetails.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Total Amount</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>${orderDetails.totalAmount?.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Status</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#eff6ff", color: "#2563eb", padding: "6px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: 600 }}>
              <Truck size={16} /> Processing Shipment
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link to="/customer/orders" style={{
            padding: "14px 28px", backgroundColor: "#111827", color: "white",
            textDecoration: "none", borderRadius: "12px", fontWeight: 600, fontSize: "16px",
            display: "flex", alignItems: "center", gap: "8px"
          }}>
            <Package size={18} /> View My Orders
          </Link>
          <Link to="/customer/products" style={{
            padding: "14px 28px", backgroundColor: "white", color: "#374151",
            textDecoration: "none", borderRadius: "12px", fontWeight: 600, fontSize: "16px",
            border: "1px solid #d1d5db", display: "flex", alignItems: "center", gap: "8px"
          }}>
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}
