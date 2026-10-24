import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Package, ChevronRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAssignmentsByUserId, getShipment } from "../../api/deliveryApi";

export default function Completed() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignmentsData = await getAssignmentsByUserId(user.userId);

        // Filter only completed ones
        const completedAssignments = assignmentsData.filter(a => a.status === 'COMPLETED' || a.status === 'DELIVERED');

        // Fetch shipment details for each assignment
        const enrichedAssignments = await Promise.all(
          completedAssignments.map(async (assignment) => {
            try {
              const shipment = await getShipment(assignment.shipmentId);
              // if backend status didn't sync perfectly but shipment is delivered
              return { ...assignment, shipment };
            } catch (err) {
              return { ...assignment, shipment: null };
            }
          })
        );

        // Sort by updated date
        enrichedAssignments.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setAssignments(enrichedAssignments);

      } catch (err) {
        console.error(err);
        setError("Failed to load completed deliveries.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.userId]);

  if (loading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
        <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "32px" }}>Completed Deliveries</h1>
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
      <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "32px", color: "#111827" }}>Completed Deliveries</h1>

      {error && (
        <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {assignments.length === 0 && !error ? (
        <div style={{ textAlign: "center", padding: "80px 24px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
          <CheckSquare size={64} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "24px", marginBottom: "16px", color: "#111827" }}>No completed deliveries</h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>You haven't completed any deliveries yet.</p>
          <Link to="/delivery/assignments" style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "#111827", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: 600 }}>
            View Active Assignments
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {assignments.map(assignment => (
            <Link
              key={assignment.id}
              to={`/delivery/assignments/${assignment.id}`}
              style={{
                backgroundColor: "white", padding: "24px", borderRadius: "16px",
                border: "1px solid #e5e7eb", textDecoration: "none", color: "inherit",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "box-shadow 0.2s"
              }}
              className="completed-card"
            >
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <div style={{ width: "64px", height: "64px", backgroundColor: "#ecfdf5", borderRadius: "12px", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckSquare size={32} color="#10b981" />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "18px", margin: 0, fontWeight: 700 }}>{assignment.trackingNumber}</h3>
                    <span style={{
                      backgroundColor: "#ecfdf5", color: "#059669",
                      padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                      fontWeight: 600, border: "1px solid #a7f3d0"
                    }}>
                      DELIVERED
                    </span>
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>
                    Delivered to: <strong style={{ color: "#374151" }}>{assignment.shipment?.customerName || "Customer"}</strong> &bull; On {new Date(assignment.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ color: "#9ca3af", display: "flex", alignItems: "center" }}>
                <ChevronRight size={24} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .completed-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
