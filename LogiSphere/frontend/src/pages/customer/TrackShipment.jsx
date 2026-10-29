import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Package, CheckCircle, Clock, RefreshCw, Truck, AlertCircle } from "lucide-react";
import { getOrder } from "../../api/orderApi";
import { getShipmentByOrderId } from "../../api/deliveryApi";
import { useAuth } from "../../context/AuthContext";

const STAGES = [
  { key: "CREATED",          label: "Order Received",    desc: "Your order has been received and is being prepared." },
  { key: "PACKED",           label: "Packed",            desc: "Your items have been packed and are ready for pickup." },
  { key: "SHIPPED",          label: "Shipped",           desc: "Your package has been picked up by the carrier." },
  { key: "IN_TRANSIT",       label: "In Transit",        desc: "Your package is on the way." },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery",  desc: "Your package is out for delivery today." },
  { key: "DELIVERED",        label: "Delivered",         desc: "Your package has been delivered. Thank you!" },
];

const STAGE_KEYS = STAGES.map(s => s.key);

function StatusBadge({ status }) {
  const cfg = {
    DELIVERED:        { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" },
    OUT_FOR_DELIVERY: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    IN_TRANSIT:       { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    SHIPPED:          { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    PACKED:           { bg: "#fef3c7", text: "#d97706", border: "#fde68a" },
    CREATED:          { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
  }[status] || { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" };

  return (
    <span style={{
      backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
      padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 700,
      letterSpacing: "0.3px"
    }}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

export default function TrackShipment() {
  const { id: orderId } = useParams();
  const { user } = useAuth();

  const [order, setOrder]       = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [noShipment, setNoShipment] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Ownership check: confirm this order belongs to the logged-in customer
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const orderData = await getOrder(orderId);

      // Ownership guard: compare order's customerId to logged-in user
      if (String(orderData.customerId) !== String(user.userId)) {
        setError("You don't have permission to view this order.");
        setLoading(false);
        return;
      }

      setOrder(orderData);

      try {
        const shipmentData = await getShipmentByOrderId(orderId);
        setShipment(shipmentData);
        setNoShipment(false);
      } catch {
        // 404 = no shipment yet; not an error
        setShipment(null);
        setNoShipment(true);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
      setError("Failed to load tracking information.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, user.userId]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds — stops if shipment is DELIVERED
  useEffect(() => {
    if (shipment?.status === "DELIVERED") return; // no need to poll terminal state

    const timer = setInterval(() => fetchData(), 30_000);
    return () => clearInterval(timer);
  }, [fetchData, shipment?.status]);

  if (loading) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px", width: "100%" }}>
        <div style={{ height: "500px", backgroundColor: "#f3f4f6", borderRadius: "20px", animation: "pulse 1.5s infinite" }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px", width: "100%", textAlign: "center" }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "#111827" }}>{error}</h2>
        <Link to="/customer/orders" style={{ color: "#3867ff", fontWeight: 600, textDecoration: "none" }}>← Back to Orders</Link>
      </div>
    );
  }

  const currentIndex = STAGE_KEYS.indexOf(shipment?.status);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>

      {/* Back link */}
      <Link
        to={`/customer/orders/${orderId}`}
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#6b7280", textDecoration: "none", marginBottom: "30px", fontWeight: 500 }}
      >
        <ArrowLeft size={18} /> Back to Order #{orderId}
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "30px", letterSpacing: "-0.5px", marginBottom: "6px", color: "#111827" }}>
            Track Shipment
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px", margin: 0 }}>
            Order #{orderId}
            {shipment && <> &bull; <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#374151" }}>{shipment.trackingNumber}</span></>}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {lastRefreshed && !noShipment && (
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>
              Updated {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
              backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "8px",
              cursor: refreshing ? "not-allowed" : "pointer", color: "#374151",
              fontWeight: 600, fontSize: "14px", opacity: refreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* No shipment yet */}
      {noShipment ? (
        <div style={{ backgroundColor: "white", borderRadius: "20px", border: "1px solid #e5e7eb", padding: "48px 32px", textAlign: "center" }}>
          <Package size={56} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "22px", marginBottom: "12px", color: "#111827" }}>Shipment Not Yet Created</h2>
          <p style={{ color: "#6b7280", maxWidth: "400px", margin: "0 auto" }}>
            Shipment information will appear here once your order has been processed and a shipment is created.
            This page refreshes automatically every 30 seconds.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
              <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Current Status</div>
              <StatusBadge status={shipment.status} />
            </div>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
              <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Tracking Number</div>
              <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 700, color: "#111827" }}>{shipment.trackingNumber}</div>
            </div>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
              <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Shipment Created</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                {new Date(shipment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </div>
            </div>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
              <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Last Updated</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                {new Date(shipment.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          {/* Visual Timeline */}
          <div style={{ backgroundColor: "white", borderRadius: "20px", border: "1px solid #e5e7eb", padding: "32px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "32px", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={20} color="#3867ff" /> Delivery Progress
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {STAGES.map((stage, idx) => {
                const isCompleted = currentIndex >= idx;
                const isCurrent   = currentIndex === idx;
                const isUpcoming  = currentIndex < idx;
                const isLast      = idx === STAGES.length - 1;

                return (
                  <div key={stage.key} style={{ display: "flex", gap: "20px" }}>
                    {/* Left: dot + connector */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "28px", flexShrink: 0 }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                        backgroundColor: isCompleted ? (isCurrent && stage.key !== "DELIVERED" ? "#3867ff" : "#10b981") : "#e5e7eb",
                        border: isCurrent && stage.key !== "DELIVERED" ? "4px solid #bfdbfe" : "3px solid white",
                        boxShadow: isCurrent ? "0 0 0 3px rgba(56,103,255,0.15)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.3s"
                      }}>
                        {isCompleted && (
                          stage.key === "DELIVERED"
                            ? <CheckCircle size={16} color="white" />
                            : isCurrent
                              ? null
                              : <CheckCircle size={14} color="white" />
                        )}
                      </div>
                      {!isLast && (
                        <div style={{
                          width: "2px", flex: 1, minHeight: "32px",
                          backgroundColor: isCompleted && currentIndex > idx ? "#10b981" : "#e5e7eb",
                          transition: "background-color 0.3s"
                        }} />
                      )}
                    </div>

                    {/* Right: stage info */}
                    <div style={{ paddingBottom: isLast ? 0 : "28px", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: isCurrent ? "6px" : "2px" }}>
                        <span style={{
                          fontWeight: isCurrent || isCompleted ? 700 : 500,
                          fontSize: "16px",
                          color: isCompleted ? "#111827" : "#9ca3af"
                        }}>
                          {stage.label}
                        </span>
                        {isCurrent && (
                          <span style={{ backgroundColor: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700 }}>
                            CURRENT
                          </span>
                        )}
                        {stage.key === "DELIVERED" && isCompleted && (
                          <span style={{ backgroundColor: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700 }}>
                            COMPLETE
                          </span>
                        )}
                      </div>
                      {(isCurrent || (isCompleted && idx === currentIndex)) && (
                        <p style={{ margin: 0, color: "#4b5563", fontSize: "14px", lineHeight: 1.5 }}>
                          {stage.desc}
                        </p>
                      )}
                      {isUpcoming && (
                        <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Upcoming</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery address */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "#111827" }}>
              <MapPin size={18} color="#3867ff" /> Delivery Address
            </h2>
            <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.7, fontSize: "15px" }}>
              {shipment.deliveryAddress || "Not specified"}
            </p>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
