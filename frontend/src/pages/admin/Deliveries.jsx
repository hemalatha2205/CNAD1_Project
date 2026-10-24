import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import {
  Bike, Search, CheckCircle, XCircle, Eye, FileText, ExternalLink, X,
  ShieldCheck, AlertTriangle, AlertCircle, Clock, RefreshCw, Car, CreditCard,
  UserCheck, PauseCircle, PlayCircle
} from "lucide-react";

const STATUS_BADGES = {
  PENDING_VERIFICATION: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending Verification" },
  UNDER_REVIEW: { bg: "bg-blue-100", text: "text-blue-800", label: "Under Review" },
  ADDITIONAL_INFORMATION_REQUIRED: { bg: "bg-orange-100", text: "text-orange-800", label: "Action Required" },
  APPROVED: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
  REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
  SUSPENDED: { bg: "bg-rose-900", text: "text-rose-100", label: "Suspended" }
};

export default function Deliveries() {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverAuditLogs, setDriverAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Decision handling
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Document preview lightbox
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDeliveries = () => {
    setLoading(true);
    adminApi.getDeliveryPersons()
      .then(res => setDeliveryPersons(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const openDriverModal = async (driver) => {
    setSelectedDriver(driver);
    setDecisionNotes("");
    setActionError("");
    setActionSuccess("");
    setDriverAuditLogs([]);
    setAuditLoading(true);

    try {
      const res = await adminApi.getDeliveryAuditLogs(driver.id);
      setDriverAuditLogs(res.data || []);
    } catch (err) {
      console.warn("Could not load driver audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    setActionError("");
    setActionSuccess("");

    // Enforce mandatory notes for rejection, additional info, suspension
    if (['REJECTED', 'ADDITIONAL_INFORMATION_REQUIRED', 'SUSPENDED'].includes(decision)) {
      if (!decisionNotes.trim()) {
        setActionError(`Mandatory: Please provide explanation/notes for decision "${decision.replace(/_/g, ' ')}".`);
        return;
      }
    }

    try {
      setDecisionLoading(true);
      await adminApi.reviewDeliveryDecision(selectedDriver.id, {
        decision,
        notes: decisionNotes.trim()
      });

      setActionSuccess(`Application successfully updated to ${decision.replace(/_/g, ' ')}`);
      setDecisionNotes("");

      // Refresh driver list
      fetchDeliveries();

      // Refresh modal driver & audit logs
      const updatedList = await adminApi.getDeliveryPersons();
      const updatedDriver = (updatedList.data || []).find(d => d.id === selectedDriver.id);
      if (updatedDriver) {
        setSelectedDriver(updatedDriver);
      }
      const logsRes = await adminApi.getDeliveryAuditLogs(selectedDriver.id);
      setDriverAuditLogs(logsRes.data || []);

    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.error || err.message || "Failed to submit decision.");
    } finally {
      setDecisionLoading(false);
    }
  };

  // Helper to calculate age
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isLicenceExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry <= today;
  };

  // Filter drivers
  const filtered = deliveryPersons.filter(d => {
    const matchesSearch =
      d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone?.includes(searchTerm) ||
      d.drivingLicenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.identityDocumentNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || d.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countByStatus = (status) => deliveryPersons.filter(d => d.verificationStatus === status).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bike className="text-orange-600" /> Delivery Fleet & KYC Management ({deliveryPersons.length})
          </h2>
          <p className="text-sm text-gray-500">Verify identity documents, enforce driving licences, and manage dispatch permissions.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, ID, licence..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none w-72 text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`p-3 rounded-xl border text-left transition-all ${statusFilter === "ALL" ? "border-orange-500 bg-orange-50/50 shadow-sm" : "border-gray-200 bg-white"}`}
        >
          <div className="text-xs font-semibold text-gray-500">Total Fleet</div>
          <div className="text-xl font-bold text-gray-900 mt-1">{deliveryPersons.length}</div>
        </button>

        <button
          onClick={() => setStatusFilter("PENDING_VERIFICATION")}
          className={`p-3 rounded-xl border text-left transition-all ${statusFilter === "PENDING_VERIFICATION" ? "border-yellow-500 bg-yellow-50/50 shadow-sm" : "border-gray-200 bg-white"}`}
        >
          <div className="text-xs font-semibold text-yellow-700">Pending Review</div>
          <div className="text-xl font-bold text-yellow-900 mt-1">{countByStatus("PENDING_VERIFICATION")}</div>
        </button>

        <button
          onClick={() => setStatusFilter("UNDER_REVIEW")}
          className={`p-3 rounded-xl border text-left transition-all ${statusFilter === "UNDER_REVIEW" ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-gray-200 bg-white"}`}
        >
          <div className="text-xs font-semibold text-blue-700">Under Review</div>
          <div className="text-xl font-bold text-blue-900 mt-1">{countByStatus("UNDER_REVIEW")}</div>
        </button>

        <button
          onClick={() => setStatusFilter("ADDITIONAL_INFORMATION_REQUIRED")}
          className={`p-3 rounded-xl border text-left transition-all ${statusFilter === "ADDITIONAL_INFORMATION_REQUIRED" ? "border-orange-500 bg-orange-50/50 shadow-sm" : "border-gray-200 bg-white"}`}
        >
          <div className="text-xs font-semibold text-orange-700">Action Required</div>
          <div className="text-xl font-bold text-orange-900 mt-1">{countByStatus("ADDITIONAL_INFORMATION_REQUIRED")}</div>
        </button>

        <button
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-3 rounded-xl border text-left transition-all ${statusFilter === "APPROVED" ? "border-green-500 bg-green-50/50 shadow-sm" : "border-gray-200 bg-white"}`}
        >
          <div className="text-xs font-semibold text-green-700">Approved Active</div>
          <div className="text-xl font-bold text-green-900 mt-1">{countByStatus("APPROVED")}</div>
        </button>

        <button
          onClick={() => setStatusFilter("SUSPENDED")}
          className={`p-3 rounded-xl border text-left transition-all ${statusFilter === "SUSPENDED" ? "border-rose-900 bg-rose-50 shadow-sm" : "border-gray-200 bg-white"}`}
        >
          <div className="text-xs font-semibold text-rose-800">Suspended / Rejected</div>
          <div className="text-xl font-bold text-rose-900 mt-1">{countByStatus("SUSPENDED") + countByStatus("REJECTED")}</div>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Age / Location</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">KYC Credentials</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading fleet...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No delivery personnel match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map(person => {
                  const badge = STATUS_BADGES[person.verificationStatus] || STATUS_BADGES.PENDING_VERIFICATION;
                  const age = calculateAge(person.dateOfBirth);
                  const expired = isLicenceExpired(person.drivingLicenseExpiryDate);

                  return (
                    <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {person.profilePhotoUrl ? (
                            <img
                              src={person.profilePhotoUrl}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                              {person.fullName ? person.fullName.charAt(0) : "D"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{person.fullName}</div>
                            <div className="text-xs text-gray-500">Profile #{person.id} • User #{person.userId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-gray-900">{person.email}</div>
                        <div className="text-xs text-gray-500">{person.phone || "No phone"}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">
                          {age !== null ? (
                            <span className={age >= 18 ? "text-green-700" : "text-red-600 font-bold"}>
                              {age} yrs old
                            </span>
                          ) : (
                            <span className="text-gray-400">DOB unverified</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{person.city || "Bangalore"}, {person.address || ""}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{person.vehicleType || "Motorcycle"}</div>
                        <div className="text-xs text-gray-500 font-mono">{person.vehicleRegistrationNumber || "No Reg #"}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className="text-gray-700">
                            <strong>{person.identityDocumentType || "ID"}:</strong> {person.identityDocumentNumber || "N/A"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-700"><strong>DL:</strong> {person.drivingLicenseNumber || "N/A"}</span>
                            {person.drivingLicenseExpiryDate && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${expired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {expired ? "Expired" : "Valid"}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDriverModal(person)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye size={14} /> Review KYC
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver KYC Review & Decision Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                {selectedDriver.profilePhotoUrl ? (
                  <img src={selectedDriver.profilePhotoUrl} alt="Photo" className="w-12 h-12 rounded-full object-cover border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-lg">
                    {selectedDriver.fullName ? selectedDriver.fullName.charAt(0) : "D"}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDriver.fullName}</h3>
                  <p className="text-xs text-gray-500">
                    KYC Profile #{selectedDriver.id} • Registered: {selectedDriver.createdAt ? new Date(selectedDriver.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Alert Banner */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Verification Status</div>
                  <div className="text-lg font-bold text-gray-900 flex items-center gap-2 mt-0.5">
                    {selectedDriver.verificationStatus}
                  </div>
                  {selectedDriver.adminNotes && (
                    <div className="text-xs text-gray-600 mt-1 italic">
                      Notes: "{selectedDriver.adminNotes}"
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div><strong>Review SLA:</strong> 1-3 Business Days</div>
                  {selectedDriver.reviewedBy && <div>Reviewed by: {selectedDriver.reviewedBy}</div>}
                  {selectedDriver.resubmittedAt && <div>Resubmitted: {new Date(selectedDriver.resubmittedAt).toLocaleString()}</div>}
                </div>
              </div>

              {/* Applicant Personal & Vehicle Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/70 p-4 rounded-xl text-sm border border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 block">Date of Birth & Age</span>
                  <span className="font-semibold text-gray-900">
                    {selectedDriver.dateOfBirth || "N/A"}
                    {calculateAge(selectedDriver.dateOfBirth) !== null && ` (${calculateAge(selectedDriver.dateOfBirth)} yrs)`}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Contact Phone</span>
                  <span className="font-semibold text-gray-900">{selectedDriver.phone || "On file"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">City / Address</span>
                  <span className="font-semibold text-gray-900">{selectedDriver.city || "Bangalore"}, {selectedDriver.address || ""}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Vehicle</span>
                  <span className="font-semibold text-gray-900">{selectedDriver.vehicleType || "Motorcycle"} ({selectedDriver.vehicleRegistrationNumber || "N/A"})</span>
                </div>
              </div>

              {/* Document Inspection Cards */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-orange-600" /> Submitted Identity Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Government ID */}
                  <div className="p-4 border rounded-xl flex flex-col justify-between bg-white shadow-sm">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">{selectedDriver.identityDocumentType || "Aadhaar Card"}</span>
                        <CreditCard size={16} className="text-gray-400" />
                      </div>
                      <div className="text-base font-bold text-gray-900 mt-1">{selectedDriver.identityDocumentNumber || "Number Not Provided"}</div>
                    </div>
                    {selectedDriver.identityDocumentUrl ? (
                      <button
                        onClick={() => setPreviewDoc({ title: `${selectedDriver.identityDocumentType || 'Government ID'} Document`, src: selectedDriver.identityDocumentUrl })}
                        className="mt-4 text-xs font-semibold text-orange-600 hover:text-orange-800 flex items-center justify-center gap-1.5 bg-orange-50 hover:bg-orange-100 py-2 rounded-lg transition-colors"
                      >
                        <Eye size={14} /> Inspect Government ID
                      </button>
                    ) : (
                      <div className="mt-4 text-xs text-gray-400 bg-gray-50 py-2 rounded text-center">Electronic Record</div>
                    )}
                  </div>

                  {/* Driving Licence */}
                  <div className="p-4 border rounded-xl flex flex-col justify-between bg-white shadow-sm">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">Driving Licence</span>
                        <Car size={16} className="text-gray-400" />
                      </div>
                      <div className="text-base font-bold text-gray-900 mt-1">{selectedDriver.drivingLicenseNumber || "Licence Not Provided"}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span>Expires: {selectedDriver.drivingLicenseExpiryDate || "N/A"}</span>
                        {selectedDriver.drivingLicenseExpiryDate && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isLicenceExpired(selectedDriver.drivingLicenseExpiryDate) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {isLicenceExpired(selectedDriver.drivingLicenseExpiryDate) ? "EXPIRED" : "VALID"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {selectedDriver.drivingLicenseFrontUrl ? (
                        <button
                          onClick={() => setPreviewDoc({ title: "Driving Licence Front", src: selectedDriver.drivingLicenseFrontUrl })}
                          className="flex-1 text-xs font-semibold text-orange-600 hover:text-orange-800 flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 py-2 rounded-lg"
                        >
                          <Eye size={13} /> DL Front
                        </button>
                      ) : null}
                      {selectedDriver.drivingLicenseBackUrl ? (
                        <button
                          onClick={() => setPreviewDoc({ title: "Driving Licence Back", src: selectedDriver.drivingLicenseBackUrl })}
                          className="flex-1 text-xs font-semibold text-orange-600 hover:text-orange-800 flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 py-2 rounded-lg"
                        >
                          <Eye size={13} /> DL Back
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Decision Panel */}
              <div className="p-5 border-2 border-orange-100 bg-orange-50/30 rounded-xl space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <ShieldCheck size={18} className="text-orange-600" /> Compliance Reviewer Decision
                </h4>

                {actionError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
                    {actionError}
                  </div>
                )}
                {actionSuccess && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200">
                    {actionSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Reviewer Notes / Feedback (Mandatory for Action Required, Rejection, and Suspension)
                  </label>
                  <textarea
                    rows={2}
                    value={decisionNotes}
                    onChange={e => setDecisionNotes(e.target.value)}
                    placeholder="Enter explicit feedback for the applicant or reason for decision..."
                    className="w-full p-2.5 text-xs border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Mark Under Review */}
                  {selectedDriver.verificationStatus === 'PENDING_VERIFICATION' && (
                    <button
                      onClick={() => handleDecision('UNDER_REVIEW')}
                      disabled={decisionLoading}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Clock size={14} /> Start Review (Under Review)
                    </button>
                  )}

                  {/* Approve */}
                  {selectedDriver.verificationStatus !== 'APPROVED' && (
                    <button
                      onClick={() => handleDecision('APPROVED')}
                      disabled={decisionLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle size={14} /> Approve Driver
                    </button>
                  )}

                  {/* Request Info */}
                  {['PENDING_VERIFICATION', 'UNDER_REVIEW'].includes(selectedDriver.verificationStatus) && (
                    <button
                      onClick={() => handleDecision('ADDITIONAL_INFORMATION_REQUIRED')}
                      disabled={decisionLoading}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <AlertTriangle size={14} /> Request Information
                    </button>
                  )}

                  {/* Reject */}
                  {['PENDING_VERIFICATION', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED'].includes(selectedDriver.verificationStatus) && (
                    <button
                      onClick={() => handleDecision('REJECTED')}
                      disabled={decisionLoading}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle size={14} /> Reject Application
                    </button>
                  )}

                  {/* Suspend */}
                  {selectedDriver.verificationStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleDecision('SUSPENDED')}
                      disabled={decisionLoading}
                      className="px-3.5 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <PauseCircle size={14} /> Suspend Driver
                    </button>
                  )}

                  {/* Reinstate */}
                  {selectedDriver.verificationStatus === 'SUSPENDED' && (
                    <button
                      onClick={() => handleDecision('APPROVED')}
                      disabled={decisionLoading}
                      className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <PlayCircle size={14} /> Reinstate Driver
                    </button>
                  )}
                </div>
              </div>

              {/* Audit Trail History */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
                  <Clock size={14} /> Review Audit History
                </h4>

                {auditLoading ? (
                  <p className="text-xs text-gray-400">Loading audit trail...</p>
                ) : driverAuditLogs.length === 0 ? (
                  <p className="text-xs text-gray-400">No audit logs recorded for this driver.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {driverAuditLogs.map(log => (
                      <div key={log.id} className="text-xs bg-white p-2.5 rounded-lg border border-gray-200 flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-800">
                            {log.action.replace(/_/g, ' ')} {log.toStatus ? `→ ${log.toStatus}` : ''}
                          </div>
                          {log.notes && <div className="text-gray-600 italic mt-0.5">"{log.notes}"</div>}
                          <div className="text-[10px] text-gray-400 mt-0.5">By {log.actorEmail || 'System'}</div>
                        </div>
                        <div className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Lightbox Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h4 className="font-bold text-gray-900 text-sm">{previewDoc.title}</h4>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto flex items-center justify-center bg-gray-900/5">
              {previewDoc.src.startsWith("data:application/pdf") ? (
                <div className="text-center py-8">
                  <FileText size={48} className="text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800 mb-3">PDF Identity Document</p>
                  <a
                    href={previewDoc.src}
                    download="kyc_document.pdf"
                    className="text-xs bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold inline-block"
                  >
                    Download / Open Document
                  </a>
                </div>
              ) : (
                <img src={previewDoc.src} alt={previewDoc.title} className="max-h-[500px] w-auto rounded object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
