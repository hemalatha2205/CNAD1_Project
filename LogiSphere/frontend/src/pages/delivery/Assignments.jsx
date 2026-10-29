import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, MapPin, ChevronRight, Package, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAssignmentsByUserId, getShipment, getDeliveryPersonByUserId } from "../../api/deliveryApi";

export default function Assignments() {
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let personProfile = null;
        try {
          personProfile = await getDeliveryPersonByUserId(user.userId);
          setPerson(personProfile);
        } catch (err) {
          console.warn("Could not load delivery person:", err);
        }

        if (personProfile && personProfile.verificationStatus !== 'APPROVED') {
          setAssignments([]);
          setLoading(false);
          return;
        }

        const assignmentsData = await getAssignmentsByUserId(user.userId);

        // Filter out completed ones
        const activeAssignments = (assignmentsData || []).filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED');

        // Fetch shipment details for each assignment
        const enrichedAssignments = await Promise.all(
          activeAssignments.map(async (assignment) => {
            try {
              const shipment = await getShipment(assignment.shipmentId);
              return { ...assignment, shipment };
            } catch (err) {
              console.error(`Failed to load shipment ${assignment.shipmentId}`, err);
              return { ...assignment, shipment: null };
            }
          })
        );

        // Sort by assigned date
        enrichedAssignments.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
        setAssignments(enrichedAssignments);

      } catch (err) {
        console.error(err);
        setError("Failed to load assignments.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.userId]);

  if (loading) {
    return (
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
        <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "32px" }}>Assigned Deliveries</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ height: "160px", backgroundColor: "#f3f4f6", borderRadius: "16px", animation: "pulse 1.5s infinite" }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
      <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "32px", color: "#111827" }}>Assigned Deliveries</h1>

      {error && (
        <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {person && person.verificationStatus !== 'APPROVED' ? (
        <div style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "#fffbeb", borderRadius: "16px", border: "1px solid #fde68a" }}>
          <AlertCircle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "22px", marginBottom: "8px", color: "#92400e" }}>
            Deliveries Restricted ({person.verificationStatus.replace(/_/g, " ")})
          </h2>
          <p style={{ color: "#b45309", maxWidth: "500px", margin: "0 auto 20px" }}>
            You cannot accept or manage active delivery assignments until your KYC verification is approved by LogiSphere Compliance.
          </p>
          <Link to="/delivery" style={{ display: "inline-block", padding: "10px 20px", background: "#3867ff", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "600" }}>
            Go to KYC Verification Portal
          </Link>
        </div>
      ) : assignments.length === 0 && !error ? (
        <div style={{ textAlign: "center", padding: "80px 24px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
          <Package size={64} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "#111827" }}>No active deliveries</h2>
          <p style={{ color: "#6b7280" }}>You don't have any pending delivery assignments right now.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }} className="assignments-grid">
          {assignments.map(assignment => (
            <Link
              key={assignment.id}
              to={`/delivery/assignments/${assignment.id}`}
              style={{
                backgroundColor: "white", padding: "24px", borderRadius: "16px",
                border: "1px solid #e5e7eb", textDecoration: "none", color: "inherit",
                display: "flex", flexDirection: "column", transition: "all 0.2s"
              }}
              className="assignment-card"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                    Tracking No.
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
                    {assignment.trackingNumber}
                  </div>
                </div>
                <div style={{ backgroundColor: "#eff6ff", color: "#2563eb", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}>
                  {assignment.shipment?.status || assignment.status}
                </div>
              </div>

              <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", marginBottom: "20px", flex: 1 }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <MapPin size={20} color="#6b7280" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Deliver to: {assignment.shipment?.customerName || "Customer"}</div>
                    <div style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.5 }}>
                      {assignment.shipment?.deliveryAddress || "Address not available"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                <div style={{ color: "#6b7280", fontSize: "13px" }}>
                  Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#3867ff", fontWeight: 600, fontSize: "14px" }}>
                  View Details <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .assignment-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border-color: #3867ff;
        }
        @media (max-width: 768px) {
          .assignments-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
