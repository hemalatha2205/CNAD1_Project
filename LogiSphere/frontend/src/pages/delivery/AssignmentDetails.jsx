import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Truck, CheckSquare, Clock, Package, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAssignmentsByUserId, getShipment, updateShipmentStatus, getDeliveryPersonByUserId } from "../../api/deliveryApi";

export default function AssignmentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const STATUS_FLOW = [
    'CREATED',
    'PACKED',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
  ];

  const fetchDetails = async () => {
    try {
      try {
        const p = await getDeliveryPersonByUserId(user.userId);
        setPerson(p);
      } catch (e) {
        console.warn("Could not load delivery person:", e);
      }

      // Find assignment from the list
      const assignmentsData = await getAssignmentsByUserId(user.userId);
      const found = assignmentsData.find(a => a.id.toString() === id);

      if (!found) {
        setError("Assignment not found or you don't have access.");
        setLoading(false);
        return;
      }

      setAssignment(found);

      // Fetch shipment details
      const shipmentData = await getShipment(found.shipmentId);
      setShipment(shipmentData);

    } catch (err) {
      console.error(err);
      setError("Failed to load assignment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user.userId]);

  const handleStatusUpdate = async (nextStatus) => {
    if (person && person.verificationStatus !== 'APPROVED') {
      setToast({ type: 'error', message: `Delivery actions locked: Account status is ${person.verificationStatus}` });
      return;
    }
    setUpdateLoading(true);
    setToast(null);
    try {
      await updateShipmentStatus(shipment.id, nextStatus);
      setToast({ type: 'success', message: `Status updated to ${nextStatus}` });
      await fetchDetails();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: "Failed to update status. Please try again." });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px", width: "100%" }}>
        <div style={{ height: "400px", backgroundColor: "#f3f4f6", borderRadius: "16px", animation: "pulse 1.5s infinite" }}></div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px", width: "100%", textAlign: "center" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "#ef4444" }}>{error || "Not found"}</h2>
        <Link to="/delivery/assignments" style={{ color: "#3867ff", fontWeight: 600 }}>Back to Assignments</Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(shipment?.status);
  const nextStatus = currentStatusIndex !== -1 && currentStatusIndex < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentStatusIndex + 1]
    : null;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
      {toast && (
        <div style={{
          position: "fixed", top: "100px", right: "24px", padding: "16px 24px", borderRadius: "12px", zIndex: 100,
          backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white',
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", display: "flex", alignItems: "center", gap: "12px",
          animation: "slideIn 0.3s ease-out"
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: 600 }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "white", marginLeft: "12px", cursor: "pointer", fontSize: "16px" }}>&times;</button>
        </div>
      )}

      <Link
        to="/delivery/assignments"
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#6b7280", textDecoration: "none", marginBottom: "30px", fontWeight: 500 }}
      >
        <ArrowLeft size={18} /> Back to Assignments
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "8px", color: "#111827", display: "flex", alignItems: "center", gap: "12px" }}>
            {assignment.trackingNumber}
            {shipment?.status === 'DELIVERED' && (
              <CheckCircle size={28} color="#10b981" />
            )}
          </h1>
          <div style={{ color: "#6b7280", fontSize: "15px", display: "flex", alignItems: "center", gap: "16px" }}>
            <span>Order #{shipment?.orderId}</span>
            <span>&bull;</span>
            <span>Assigned {new Date(assignment.assignedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={{ backgroundColor: shipment?.status === 'DELIVERED' ? "#ecfdf5" : "#eff6ff", color: shipment?.status === 'DELIVERED' ? "#059669" : "#2563eb", padding: "10px 20px", borderRadius: "12px", fontSize: "15px", fontWeight: 700, border: `1px solid ${shipment?.status === 'DELIVERED' ? "#a7f3d0" : "#bfdbfe"}` }}>
          Status: {shipment?.status || assignment.status}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }} className="details-grid">

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={20} color="#3867ff" /> Delivery Details
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Customer Name</div>
              <div style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>{shipment?.customerName || "Customer"}</div>
            </div>

            <div>
              <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Delivery Address</div>
              <div style={{ fontSize: "16px", color: "#374151", lineHeight: 1.6, backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                {shipment?.deliveryAddress || "Address not available"}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={20} color="#3867ff" /> Update Status
            </h2>

            {shipment?.status === 'DELIVERED' ? (
              <div style={{ backgroundColor: "#ecfdf5", padding: "20px", borderRadius: "12px", textAlign: "center", color: "#065f46" }}>
                <CheckCircle size={40} color="#10b981" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "18px", margin: "0 0 8px" }}>Delivery Completed</h3>
                <p style={{ margin: 0 }}>This shipment has been successfully delivered.</p>
              </div>
            ) : nextStatus ? (
              <div>
                <p style={{ color: "#4b5563", marginBottom: "24px" }}>
                  Current status is <strong>{shipment?.status}</strong>. The next step in the delivery process is:
                </p>
                <button
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={updateLoading}
                  style={{
                    width: "100%", padding: "16px", backgroundColor: "#111827", color: "white",
                    border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 600,
                    cursor: updateLoading ? "not-allowed" : "pointer", opacity: updateLoading ? 0.7 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "background-color 0.2s"
                  }}
                >
                  {updateLoading ? (
                    <>Updating...</>
                  ) : (
                    <>Update Status to {nextStatus} <ArrowLeft size={18} style={{ transform: "rotate(180deg)" }} /></>
                  )}
                </button>
              </div>
            ) : (
              <div style={{ padding: "16px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "12px" }}>
                Status flow unrecognized or manual intervention required.
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div>
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px", position: "sticky", top: "100px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={20} color="#3867ff" /> Status Timeline
            </h2>

            <div style={{ position: "relative", paddingLeft: "16px", marginLeft: "8px", borderLeft: "2px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "24px" }}>
              {STATUS_FLOW.map((status, index) => {
                const isCompleted = STATUS_FLOW.indexOf(shipment?.status) >= index;
                const isCurrent = shipment?.status === status;

                return (
                  <div key={status} style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: "-25px", top: "2px", width: "16px", height: "16px",
                      borderRadius: "50%", backgroundColor: isCurrent ? "#3867ff" : (isCompleted ? "#10b981" : "#e5e7eb"),
                      border: "4px solid white", boxShadow: isCurrent ? "0 0 0 3px rgba(56, 103, 255, 0.2)" : "none"
                    }}></div>
                    <div style={{ fontWeight: isCurrent ? 700 : (isCompleted ? 600 : 500), color: isCurrent || isCompleted ? "#111827" : "#9ca3af" }}>
                      {status.replace(/_/g, ' ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 900px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
