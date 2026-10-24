import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { Truck, Search, UserCheck, Send, CheckCircle, AlertCircle, X, RefreshCw } from "lucide-react";

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shipmentsRes, driversRes] = await Promise.all([
        adminApi.getShipments(),
        adminApi.getDeliveryPersons().catch(() => ({ data: [] }))
      ]);
      setShipments(shipmentsRes.data || []);
      setDeliveryPersons(driversRes.data || []);
    } catch (err) {
      console.error("Error loading shipments data:", err);
      setToast({ type: "error", message: "Failed to load shipments." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvedDrivers = deliveryPersons.filter(d => d.verificationStatus === "APPROVED");

  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!selectedShipment || !selectedDriverId) {
      alert("Please select a delivery driver.");
      return;
    }

    setDispatchLoading(true);
    try {
      await adminApi.assignShipment(
        selectedShipment.id,
        selectedDriverId,
        selectedShipment.trackingNumber
      );
      setToast({
        type: "success",
        message: `Shipment #${selectedShipment.id} successfully assigned to driver #${selectedDriverId}`
      });
      setSelectedShipment(null);
      setSelectedDriverId("");
      loadData();
    } catch (err) {
      console.error("Manual assign error:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || err.response?.data?.error || "Failed to assign shipment."
      });
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleAutoAssign = async (shipment) => {
    if (!window.confirm(`Auto-assign shipment #${shipment.id} (${shipment.trackingNumber}) to an available driver?`)) {
      return;
    }

    setDispatchLoading(true);
    try {
      await adminApi.autoAssignShipment(shipment.id, shipment.trackingNumber);
      setToast({
        type: "success",
        message: `Shipment #${shipment.id} auto-assigned successfully.`
      });
      loadData();
    } catch (err) {
      console.error("Auto assign error:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || err.response?.data?.error || "Auto-assign failed. Ensure approved delivery drivers are available."
      });
    } finally {
      setDispatchLoading(false);
    }
  };

  const filtered = shipments.filter(s =>
    s.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.orderId?.toString().includes(searchTerm) ||
    s.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 1000,
          backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
          color: "white", padding: "14px 20px", borderRadius: "10px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "10px"
        }}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 600, fontSize: "14px" }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", marginLeft: "10px" }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="text-blue-600" /> Global Shipments & Dispatch ({shipments.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor real-time fulfillment, tracking numbers, and driver dispatching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tracking, order, customer..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-72 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-6 py-4">Shipment</th>
                <th className="px-6 py-4">Tracking Number</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer & Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">Loading shipments...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No shipments found.</td>
                </tr>
              ) : (
                filtered.map(shipment => (
                  <tr key={shipment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">#{shipment.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        {shipment.trackingNumber || "PENDING"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">#{shipment.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{shipment.customerName}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate" title={shipment.deliveryAddress}>
                        {shipment.deliveryAddress || "Address on file"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800 border border-green-200' :
                        shipment.status === 'OUT_FOR_DELIVERY' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        shipment.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        shipment.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        shipment.status === 'PACKED' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {shipment.updatedAt ? new Date(shipment.updatedAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {shipment.status === "DELIVERED" ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md">
                          Completed
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedShipment(shipment)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                            title="Assign to specific driver"
                          >
                            <Send size={13} /> Assign
                          </button>
                          <button
                            onClick={() => handleAutoAssign(shipment)}
                            disabled={dispatchLoading}
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Auto-assign to available driver"
                          >
                            Auto
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Dispatch Assignment Modal */}
      {selectedShipment && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "16px", padding: "28px", maxWidth: "520px", width: "100%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                <Send size={18} className="text-blue-600" /> Dispatch Assignment
              </h3>
              <button onClick={() => setSelectedShipment(null)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#64748b" }}>Shipment ID:</span>
                <strong style={{ color: "#0f172a" }}>#{selectedShipment.id}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#64748b" }}>Tracking Number:</span>
                <strong style={{ fontFamily: "monospace", color: "#0f172a" }}>{selectedShipment.trackingNumber}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#64748b" }}>Customer:</span>
                <strong style={{ color: "#0f172a" }}>{selectedShipment.customerName}</strong>
              </div>
              <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #cbd5e1" }}>
                <span style={{ color: "#64748b", display: "block" }}>Destination:</span>
                <span style={{ color: "#334155" }}>{selectedShipment.deliveryAddress}</span>
              </div>
            </div>

            <form onSubmit={handleManualAssign}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                  Select Verified Delivery Driver
                </label>
                {approvedDrivers.length > 0 ? (
                  <select
                    required
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db",
                      fontSize: "14px", outline: "none", backgroundColor: "white"
                    }}
                  >
                    <option value="">-- Choose an approved driver --</option>
                    {approvedDrivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.fullName} ({driver.email}) - Driver #{driver.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: "12px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "8px", fontSize: "13px" }}>
                    No approved delivery drivers found. Please verify driver profiles in the Deliveries fleet tab first.
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  style={{
                    padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white",
                    fontSize: "14px", fontWeight: 600, color: "#374151", cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchLoading || approvedDrivers.length === 0}
                  style={{
                    padding: "10px 20px", borderRadius: "8px", border: "none",
                    backgroundColor: dispatchLoading ? "#9ca3af" : "#2563eb",
                    color: "white", fontSize: "14px", fontWeight: 700, cursor: dispatchLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {dispatchLoading ? "Assigning..." : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
