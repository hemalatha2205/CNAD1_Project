import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, ExternalLink, Clock } from "lucide-react";
import { getOrder } from "../../api/orderApi";
import { getShipmentByOrderId } from "../../api/deliveryApi";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const orderData = await getOrder(id);
        setOrder(orderData);
        try {
          const shipmentData = await getShipmentByOrderId(id);
          setShipment(shipmentData);
        } catch {
          // 404 means no shipment yet — handled in the UI, not an error
          setShipment(null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px", width: "100%" }}>
        <div style={{ height: "400px", backgroundColor: "#f3f4f6", borderRadius: "16px", animation: "pulse 1.5s infinite" }}></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px", width: "100%", textAlign: "center" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "#ef4444" }}>{error || "Order not found"}</h2>
        <Link to="/customer/orders" style={{ textDecoration: "none", color: "#3867ff", fontWeight: 600 }}>Back to Orders</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
      <Link
        to="/customer/orders"
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#6b7280", textDecoration: "none", marginBottom: "30px", fontWeight: 500 }}
      >
        <ArrowLeft size={18} /> Back to Orders
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "8px" }}>Order #{order.id}</h1>
          <div style={{ color: "#6b7280", fontSize: "15px" }}>
            Placed by {order.customerName}
          </div>
        </div>
        <div style={{
          backgroundColor: "#eff6ff", color: "#2563eb", padding: "8px 16px",
          borderRadius: "20px", fontSize: "14px", fontWeight: 700
        }}>
          {order.status}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }} className="order-details-grid">

        {/* Left Column - Items */}
        <div>
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={20} color="#3867ff" /> Items Ordered
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px", borderBottom: idx !== order.items.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ width: "60px", height: "60px", backgroundColor: "#f9fafb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f3f4f6", overflow: "hidden" }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Package size={24} color="#d1d5db" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
                        {item.productName || `Product #${item.productId}`}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6b7280" }}>Qty: {item.quantity} &times; ${item.price?.toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#111827" }}>
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={20} color="#3867ff" /> Order Summary
            </h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "#4b5563" }}>
              <span>Subtotal</span>
              <span>${order.totalAmount?.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "#4b5563" }}>
              <span>Shipping</span>
              <span>$0.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #e5e7eb", fontWeight: 700, fontSize: "18px", color: "#111827" }}>
              <span>Total</span>
              <span>${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={20} color="#3867ff" /> Delivery Address
            </h2>
            <p style={{ color: "#4b5563", lineHeight: 1.6, fontSize: "15px", whiteSpace: "pre-line" }}>
              {order.deliveryAddress || "Default Delivery Address"}
            </p>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={20} color="#3867ff" /> Shipment
            </h2>

            {shipment ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>Tracking No.</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>{shipment.trackingNumber}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>Status</span>
                    <span style={{
                      backgroundColor: shipment.status === "DELIVERED" ? "#ecfdf5" : "#eff6ff",
                      color: shipment.status === "DELIVERED" ? "#059669" : "#2563eb",
                      padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 700
                    }}>
                      {shipment.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>Updated</span>
                    <span style={{ fontSize: "13px", color: "#374151" }}>
                      {new Date(shipment.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/customer/orders/${order.id}/tracking`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding: "12px", backgroundColor: "#111827", color: "white",
                    textDecoration: "none", borderRadius: "10px", fontWeight: 600, fontSize: "14px"
                  }}
                >
                  <ExternalLink size={16} /> Track Shipment
                </Link>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px" }}>
                <Clock size={20} color="#9ca3af" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px", lineHeight: 1.6 }}>
                  Shipment information will appear here once your order has been processed and a shipment is created.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .order-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
