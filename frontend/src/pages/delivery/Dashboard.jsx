import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Truck, CheckSquare, Clock, PackageSearch, AlertCircle, ArrowRight,
  ShieldCheck, AlertTriangle, FileText, UserCheck, RefreshCw, Eye, Calendar,
  CreditCard, Car, ChevronRight, X, Upload
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getDeliveryPersonByUserId,
  getAssignmentsByUserId,
  getDeliveryAuditLogs,
  resubmitDeliveryKyc
} from "../../api/deliveryApi";

const STATUS_CONFIG = {
  PENDING_VERIFICATION: {
    label: "Pending Verification",
    badgeBg: "#fef3c7",
    badgeColor: "#d97706",
    bannerBg: "#fffbeb",
    borderColor: "#fde68a",
    icon: Clock,
    title: "Application Received — Verification Pending",
    description: "Your KYC details and documents have been received and are queued for compliance review. Review target: 1 to 3 business days."
  },
  UNDER_REVIEW: {
    label: "Under Review",
    badgeBg: "#eff6ff",
    badgeColor: "#2563eb",
    bannerBg: "#f0f9ff",
    borderColor: "#bae6fd",
    icon: ShieldCheck,
    title: "KYC Documents Under Review",
    description: "An administrator is actively reviewing your submitted documents and vehicle details. You will be notified once a decision is made."
  },
  ADDITIONAL_INFORMATION_REQUIRED: {
    label: "Action Required",
    badgeBg: "#fff7ed",
    badgeColor: "#ea580c",
    bannerBg: "#fff7ed",
    borderColor: "#fed7aa",
    icon: AlertTriangle,
    title: "Additional Information Required",
    description: "The compliance reviewer requires you to correct or resubmit some documents or information before your account can be approved."
  },
  APPROVED: {
    label: "Verified Partner",
    badgeBg: "#ecfdf5",
    badgeColor: "#059669",
    bannerBg: "#f0fdf4",
    borderColor: "#bbf7d0",
    icon: CheckSquare,
    title: "KYC Verified & Approved",
    description: "Your profile is fully verified. You are active and eligible to receive and fulfill deliveries."
  },
  REJECTED: {
    label: "Application Rejected",
    badgeBg: "#fef2f2",
    badgeColor: "#dc2626",
    bannerBg: "#fef2f2",
    borderColor: "#fecaca",
    icon: AlertCircle,
    title: "KYC Application Rejected",
    description: "Your delivery registration was not approved. Review the feedback below and rectify your documents to resubmit."
  },
  SUSPENDED: {
    label: "Account Suspended",
    badgeBg: "#fef2f2",
    badgeColor: "#991b1b",
    bannerBg: "#450a0a",
    borderColor: "#7f1d1d",
    icon: AlertCircle,
    title: "Delivery Account Suspended",
    description: "Your delivery privileges have been temporarily suspended by an administrator. Please review the reason below."
  }
};

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Resubmission modal state
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitLoading, setResubmitLoading] = useState(false);
  const [resubmitError, setResubmitError] = useState("");
  const [resubmitSuccess, setResubmitSuccess] = useState("");

  // Resubmission form fields
  const [resubmitDob, setResubmitDob] = useState("");
  const [resubmitAddress, setResubmitAddress] = useState("");
  const [resubmitCity, setResubmitCity] = useState("");
  const [resubmitIdType, setResubmitIdType] = useState("Aadhaar");
  const [resubmitIdNumber, setResubmitIdNumber] = useState("");
  const [resubmitIdUrl, setResubmitIdUrl] = useState("");
  const [resubmitDlNumber, setResubmitDlNumber] = useState("");
  const [resubmitDlExpiry, setResubmitDlExpiry] = useState("");
  const [resubmitDlFrontUrl, setResubmitDlFrontUrl] = useState("");
  const [resubmitDlBackUrl, setResubmitDlBackUrl] = useState("");
  const [resubmitProfilePhotoUrl, setResubmitProfilePhotoUrl] = useState("");
  const [resubmitVehicleType, setResubmitVehicleType] = useState("Motorcycle");
  const [resubmitVehicleReg, setResubmitVehicleReg] = useState("");
  const [resubmitNotes, setResubmitNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);

    let currentPerson = null;
    try {
      currentPerson = await getDeliveryPersonByUserId(user.userId);
      setPerson(currentPerson);
    } catch (err) {
      console.warn("Could not load delivery person profile:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.response?.data?.error || "Authorization error. Please log in again.");
        setLoading(false);
        return;
      }
      currentPerson = {
        fullName: user.name || user.email,
        verificationStatus: 'PENDING_VERIFICATION'
      };
      setPerson(currentPerson);
    }

    if (currentPerson?.id) {
      try {
        const logs = await getDeliveryAuditLogs(currentPerson.id);
        setAuditLogs(logs || []);
      } catch (err) {
        console.warn("Could not load KYC audit logs:", err);
      }
    }

    // Load assignments (only if approved)
    try {
      const assignmentsData = await getAssignmentsByUserId(user.userId);
      setAssignments(assignmentsData || []);
    } catch (err) {
      // If unapproved, backend may return 403 or empty array
      console.warn("Could not load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      loadData();
    }
  }, [user.userId]);

  const openResubmitModal = () => {
    if (!person) return;
    setResubmitDob(person.dateOfBirth || "");
    setResubmitAddress(person.address || "");
    setResubmitCity(person.city || "");
    setResubmitIdType(person.identityDocumentType || "Aadhaar");
    setResubmitIdNumber(person.identityDocumentNumber || "");
    setResubmitIdUrl(person.identityDocumentUrl || "");
    setResubmitDlNumber(person.drivingLicenseNumber || "");
    setResubmitDlExpiry(person.drivingLicenseExpiryDate || "");
    setResubmitDlFrontUrl(person.drivingLicenseFrontUrl || "");
    setResubmitDlBackUrl(person.drivingLicenseBackUrl || "");
    setResubmitProfilePhotoUrl(person.profilePhotoUrl || "");
    setResubmitVehicleType(person.vehicleType || "Motorcycle");
    setResubmitVehicleReg(person.vehicleRegistrationNumber || "");
    setResubmitNotes("");
    setResubmitError("");
    setResubmitSuccess("");
    setShowResubmitModal(true);
  };

  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be under 2MB for browser preview.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResubmitSubmit = async (e) => {
    e.preventDefault();
    setResubmitError("");

    if (!resubmitNotes || !resubmitNotes.trim()) {
      setResubmitError("Please enter notes explaining the changes or corrections you made.");
      return;
    }

    if (resubmitDlExpiry) {
      const expiry = new Date(resubmitDlExpiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry <= today) {
        setResubmitError("Driving licence expiry date must be in the future.");
        return;
      }
    }

    try {
      setResubmitLoading(true);
      const payload = {
        dateOfBirth: resubmitDob || null,
        address: resubmitAddress,
        city: resubmitCity,
        identityDocumentType: resubmitIdType,
        identityDocumentNumber: resubmitIdNumber,
        identityDocumentUrl: resubmitIdUrl,
        drivingLicenseNumber: resubmitDlNumber,
        drivingLicenseExpiryDate: resubmitDlExpiry || null,
        drivingLicenseFrontUrl: resubmitDlFrontUrl,
        drivingLicenseBackUrl: resubmitDlBackUrl,
        profilePhotoUrl: resubmitProfilePhotoUrl,
        vehicleType: resubmitVehicleType,
        vehicleRegistrationNumber: resubmitVehicleReg,
        resubmissionNotes: resubmitNotes
      };

      await resubmitDeliveryKyc(person.id, payload);
      setResubmitSuccess("KYC documents resubmitted successfully. Your status is now PENDING_VERIFICATION.");
      setTimeout(() => {
        setShowResubmitModal(false);
        loadData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setResubmitError(err.response?.data?.error || err.message || "Failed to resubmit KYC documents.");
    } finally {
      setResubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ height: "400px", backgroundColor: "white", borderRadius: "16px", animation: "pulse 1.5s infinite" }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <AlertCircle size={20} /> {error}
        </div>
      </div>
    );
  }

  const statusKey = person?.verificationStatus || 'PENDING_VERIFICATION';
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING_VERIFICATION;
  const StatusIcon = statusCfg.icon;

  const activeAssignments = assignments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED');
  const completedAssignments = assignments.filter(a => a.status === 'COMPLETED');
  const isApproved = person?.verificationStatus === 'APPROVED';

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "6px", color: "#111827" }}>
            Delivery Partner Portal
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px" }}>
            Welcome, <strong>{person?.fullName}</strong> ({user?.email})
          </p>
        </div>
        <div>
          <span style={{
            backgroundColor: statusCfg.badgeBg,
            color: statusCfg.badgeColor,
            padding: "8px 18px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: `1px solid ${statusCfg.borderColor}`
          }}>
            <StatusIcon size={16} /> {statusCfg.label}
          </span>
        </div>
      </div>

      {/* KYC Status & Transparency Card */}
      <div style={{
        backgroundColor: statusCfg.bannerBg,
        border: `1px solid ${statusCfg.borderColor}`,
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "32px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: statusCfg.badgeBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <StatusIcon size={24} color={statusCfg.badgeColor} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
                  {statusCfg.title}
                </h3>
                <p style={{ color: "#4b5563", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                  {statusCfg.description}
                </p>
              </div>

              {/* Action Buttons for Resubmission */}
              {(statusKey === 'ADDITIONAL_INFORMATION_REQUIRED' || statusKey === 'REJECTED') && (
                <button
                  onClick={openResubmitModal}
                  style={{
                    backgroundColor: "#ea580c",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <RefreshCw size={16} /> Resubmit Documents
                </button>
              )}
            </div>

            {/* Admin Feedback Box */}
            {person?.adminNotes && (
              <div style={{
                marginTop: "16px",
                backgroundColor: "white",
                border: "1px solid #fed7aa",
                borderRadius: "8px",
                padding: "14px 16px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "#c2410c", marginBottom: "4px" }}>
                  Compliance Reviewer Feedback
                </div>
                <div style={{ fontSize: "14px", color: "#1f2937", fontStyle: "italic" }}>
                  "{person.adminNotes}"
                </div>
                {person?.reviewedBy && (
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>
                    Reviewed by {person.reviewedBy} on {person.reviewedAt ? new Date(person.reviewedAt).toLocaleString() : "Recently"}
                  </div>
                )}
              </div>
            )}

            {/* Application Meta details */}
            <div style={{ display: "flex", gap: "24px", marginTop: "16px", fontSize: "12px", color: "#6b7280", flexWrap: "wrap" }}>
              <div>
                <strong>Profile ID:</strong> #{person?.id}
              </div>
              <div>
                <strong>Review Target:</strong> 1–3 Business Days
              </div>
              {person?.resubmittedAt && (
                <div>
                  <strong>Resubmitted:</strong> {new Date(person.resubmittedAt).toLocaleString()}
                </div>
              )}
              {person?.createdAt && (
                <div>
                  <strong>Registered On:</strong> {new Date(person.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* If APPROVED: Show Active Workload & Assignments */}
      {isApproved ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "40px" }}>
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", backgroundColor: "#eff6ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={24} color="#3867ff" />
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: 600 }}>Active Deliveries</div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "#111827" }}>{activeAssignments.length}</div>
                </div>
              </div>
              <Link to="/delivery/assignments" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#3867ff", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}>
                View assigned deliveries <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", backgroundColor: "#ecfdf5", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckSquare size={24} color="#10b981" />
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: 600 }}>Completed Deliveries</div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "#111827" }}>{completedAssignments.length}</div>
                </div>
              </div>
              <Link to="/delivery/completed" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#10b981", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}>
                View completed history <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "40px" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <PackageSearch size={20} color="#6b7280" /> Recent Assignments
              </h2>
            </div>

            {assignments.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280" }}>
                <Truck size={48} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
                <p>You have no deliveries at the moment.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb", color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      <th style={{ padding: "16px 24px", fontWeight: 600 }}>Tracking No.</th>
                      <th style={{ padding: "16px 24px", fontWeight: 600 }}>Status</th>
                      <th style={{ padding: "16px 24px", fontWeight: 600 }}>Assigned On</th>
                      <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.slice(0, 5).map(assignment => (
                      <tr key={assignment.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "16px 24px", fontWeight: 600, color: "#111827" }}>
                          {assignment.trackingNumber}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span style={{
                            backgroundColor: assignment.status === 'COMPLETED' ? "#ecfdf5" : "#eff6ff",
                            color: assignment.status === 'COMPLETED' ? "#059669" : "#2563eb",
                            padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600
                          }}>
                            {assignment.status === 'COMPLETED' ? 'DELIVERED' : assignment.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", color: "#4b5563", fontSize: "14px" }}>
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                          <Link to={`/delivery/assignments/${assignment.id}`} style={{ color: "#3867ff", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* If NOT approved: Show Delivery Restriction Notice */
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <AlertCircle size={22} color="#dc2626" />
          <div style={{ fontSize: "14px", color: "#991b1b" }}>
            <strong>Delivery Dispatch Locked:</strong> You cannot accept active orders or automatic delivery dispatches until your identity, age, and licence documents are approved.
          </div>
        </div>
      )}

      {/* KYC Profile & Submitted Documents Section */}
      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={20} color="#3867ff" /> Verified Identity & KYC Credentials
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>

          {/* Identity Info */}
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CreditCard size={14} /> Government Identity
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
              {person?.identityDocumentType || "Identity Document"}: {person?.identityDocumentNumber || "Provided"}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              DOB: {person?.dateOfBirth || "On File"}
            </div>
            {person?.identityDocumentUrl && (
              <button
                onClick={() => setPreviewDoc({ title: `${person.identityDocumentType} Document`, src: person.identityDocumentUrl })}
                style={{ marginTop: "10px", fontSize: "12px", color: "#2563eb", background: "#eff6ff", border: "none", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                View ID Document
              </button>
            )}
          </div>

          {/* Driving Licence */}
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Car size={14} /> Driving Licence
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
              Licence: {person?.drivingLicenseNumber || "Provided"}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Expiry: {person?.drivingLicenseExpiryDate || "Not recorded"}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              {person?.drivingLicenseFrontUrl && (
                <button
                  onClick={() => setPreviewDoc({ title: "Driving Licence Front", src: person.drivingLicenseFrontUrl })}
                  style={{ fontSize: "11px", color: "#2563eb", background: "#eff6ff", border: "none", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  Front
                </button>
              )}
              {person?.drivingLicenseBackUrl && (
                <button
                  onClick={() => setPreviewDoc({ title: "Driving Licence Back", src: person.drivingLicenseBackUrl })}
                  style={{ fontSize: "11px", color: "#2563eb", background: "#eff6ff", border: "none", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  Back
                </button>
              )}
            </div>
          </div>

          {/* Vehicle Info */}
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Truck size={14} /> Assigned Vehicle
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
              {person?.vehicleType || "Motorcycle"}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Reg: {person?.vehicleRegistrationNumber || "N/A"}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
              City: {person?.city || "Bangalore"}, {person?.address || ""}
            </div>
          </div>

          {/* Profile Photo */}
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
            {person?.profilePhotoUrl ? (
              <img
                src={person.profilePhotoUrl}
                alt="Profile"
                style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
              />
            ) : (
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                <UserCheck size={28} />
              </div>
            )}
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{person?.fullName}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{person?.phone || "Phone verified"}</div>
              <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: "600", marginTop: "2px" }}>KYC Profile #{person?.id}</div>
            </div>
          </div>

        </div>
      </div>

      {/* KYC Review Audit History Timeline */}
      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock size={20} color="#64748b" /> Verification History & Audit Timeline
        </h3>

        {auditLogs.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>
            No audit log entries recorded yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "12px 16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  borderLeft: "4px solid #3867ff"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                    {log.toStatus && (
                      <span style={{ fontSize: "11px", background: "#e2e8f0", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                        → {log.toStatus}
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "4px" }}>
                      "{log.notes}"
                    </div>
                  )}
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
                    By {log.actorEmail || "System"}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", maxWidth: "600px", width: "100%", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>{previewDoc.title}</h4>
              <button onClick={() => setPreviewDoc(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto", textAlign: "center" }}>
              {previewDoc.src.startsWith("data:application/pdf") ? (
                <div style={{ padding: "20px" }}>
                  <p>PDF Document Attached.</p>
                  <a href={previewDoc.src} download="kyc_document.pdf" style={{ color: "#3867ff", fontWeight: "600" }}>
                    Download / Open Document
                  </a>
                </div>
              ) : (
                <img src={previewDoc.src} alt={previewDoc.title} style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain", borderRadius: "8px" }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resubmit KYC Documents Modal */}
      {showResubmitModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", maxWidth: "680px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "white", zIndex: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                  Resubmit Delivery KYC Documents
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                  Update any required fields and provide resubmission notes.
                </p>
              </div>
              <button onClick={() => setShowResubmitModal(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResubmitSubmit} style={{ padding: "24px" }}>
              {resubmitError && (
                <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                  {resubmitError}
                </div>
              )}
              {resubmitSuccess && (
                <div style={{ padding: "12px", background: "#f0fdf4", color: "#15803d", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                  {resubmitSuccess}
                </div>
              )}

              {/* Explanatory Notes */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                  Resubmission Notes / Explanation *
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain what was updated (e.g., Uploaded clearer DL front image, renewed expiry date)..."
                  value={resubmitNotes}
                  onChange={(e) => setResubmitNotes(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", outline: "none" }}
                />
              </div>

              {/* Driving Licence Updates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Driving Licence #
                  </label>
                  <input
                    type="text"
                    value={resubmitDlNumber}
                    onChange={(e) => setResubmitDlNumber(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Licence Expiry Date
                  </label>
                  <input
                    type="date"
                    value={resubmitDlExpiry}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setResubmitDlExpiry(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>

              {/* DL Images */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#4b5563", marginBottom: "4px" }}>
                    New DL Front Photo
                  </label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setResubmitDlFrontUrl)} style={{ fontSize: "11px" }} />
                  {resubmitDlFrontUrl && <span style={{ fontSize: "10px", color: "#16a34a" }}>Attached ✓</span>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#4b5563", marginBottom: "4px" }}>
                    New DL Back Photo
                  </label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setResubmitDlBackUrl)} style={{ fontSize: "11px" }} />
                  {resubmitDlBackUrl && <span style={{ fontSize: "10px", color: "#16a34a" }}>Attached ✓</span>}
                </div>
              </div>

              {/* ID Updates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Government ID Type
                  </label>
                  <select
                    value={resubmitIdType}
                    onChange={(e) => setResubmitIdType(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={resubmitIdNumber}
                    onChange={(e) => setResubmitIdNumber(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#4b5563", marginBottom: "4px" }}>
                  New ID Document File (Image/PDF)
                </label>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, setResubmitIdUrl)} style={{ fontSize: "11px" }} />
                {resubmitIdUrl && <span style={{ fontSize: "10px", color: "#16a34a" }}>Attached ✓</span>}
              </div>

              {/* Vehicle Updates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Vehicle Type
                  </label>
                  <select
                    value={resubmitVehicleType}
                    onChange={(e) => setResubmitVehicleType(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Electric Bike">Electric Bike (EV)</option>
                    <option value="Van">Delivery Van</option>
                    <option value="Car">Car</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Vehicle Registration #
                  </label>
                  <input
                    type="text"
                    value={resubmitVehicleReg}
                    onChange={(e) => setResubmitVehicleReg(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowResubmitModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", cursor: "pointer", fontSize: "14px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resubmitLoading}
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#3867ff", color: "white", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}
                >
                  {resubmitLoading ? "Submitting..." : "Submit Rectified KYC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
