import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User, Lock, ShieldAlert, CheckCircle2, AlertCircle,
  Building2, MapPin, Phone, Mail, Eye, EyeOff, Save, RefreshCw, LogOut
} from "lucide-react";
import {
  getUserProfile, updateUserProfile, changePassword, deactivateAccount
} from "../api/authApi";
import { getErrorMessage } from "../utils/errorHandler";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security' | 'danger'

  // Loading & Feedback states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' | 'error'

  // Profile Form Data
  const [profileData, setProfileData] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    role: "",
    active: true,
    // Supplier specific
    businessName: "",
    businessType: "",
    businessPhone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    latitude: "",
    longitude: "",
    verificationStatus: "",
    registrationNumber: "",
    licenseDetails: "",
    shopPhotoUrl: "",
    taxCertificateUrl: "",
    businessLicenseUrl: ""
  });

  // Password Change Data
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Deactivate Account Data
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateConfirmation, setDeactivateConfirmation] = useState("");
  const [showDeactivatePassword, setShowDeactivatePassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });
      const data = await getUserProfile();
      setProfileData({
        id: data.id || "",
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role || "",
        active: data.active !== undefined ? data.active : true,
        businessName: data.businessName || "",
        businessType: data.businessType || "",
        businessPhone: data.businessPhone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pinCode: data.pinCode || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        verificationStatus: data.verificationStatus || "",
        registrationNumber: data.registrationNumber || "",
        licenseDetails: data.licenseDetails || "",
        shopPhotoUrl: data.shopPhotoUrl || "",
        taxCertificateUrl: data.taxCertificateUrl || "",
        businessLicenseUrl: data.businessLicenseUrl || ""
      });
    } catch (err) {
      setMessage({ text: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e, resubmit = false) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setMessage({ text: "", type: "" });

      const payload = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        businessName: profileData.businessName,
        businessPhone: profileData.businessPhone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pinCode: profileData.pinCode,
        latitude: profileData.latitude ? parseFloat(profileData.latitude) : null,
        longitude: profileData.longitude ? parseFloat(profileData.longitude) : null,
        registrationNumber: profileData.registrationNumber,
        licenseDetails: profileData.licenseDetails,
        resubmitForApproval: resubmit
      };

      const updated = await updateUserProfile(payload);
      setMessage({
        text: resubmit
          ? "Profile resubmitted for admin review! Verification status changed to PENDING."
          : "Profile updated successfully!",
        type: "success"
      });
      // Refresh local view
      if (updated) {
        setProfileData(prev => ({
          ...prev,
          fullName: updated.fullName || prev.fullName,
          phone: updated.phone || prev.phone,
          verificationStatus: updated.verificationStatus || prev.verificationStatus
        }));
      }
    } catch (err) {
      setMessage({ text: getErrorMessage(err), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Client-side policy checks
    const hasMinLength = newPassword.length >= 12;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasMinLength || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setMessage({
        text: "New password does not meet the complexity requirements (12+ chars, uppercase, lowercase, number, special character).",
        type: "error"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: "New password and confirmation do not match.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setMessage({ text: "Password changed successfully! Keep your new credentials secure.", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ text: getErrorMessage(err), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDeactivation = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (deactivateConfirmation !== "DEACTIVATE") {
      setMessage({ text: "Please type 'DEACTIVATE' in capital letters to confirm.", type: "error" });
      return;
    }

    if (!deactivatePassword) {
      setMessage({ text: "Password is required to deactivate your account.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      await deactivateAccount({
        password: deactivatePassword,
        confirmation: deactivateConfirmation,
        confirmationText: deactivateConfirmation
      });
      alert("Your account has been deactivated. You will now be redirected to the sign-in page.");
      logout();
      window.location.href = "/login";
    } catch (err) {
      setMessage({ text: getErrorMessage(err), type: "error" });
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
          Account Settings
        </h1>
        <p style={{ color: "#6b7280", fontSize: "15px", margin: 0 }}>
          Manage your personal details, security credentials, and account preferences.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e5e7eb", marginBottom: "28px" }}>
        <button
          type="button"
          onClick={() => { setActiveTab("profile"); setMessage({ text: "", type: "" }); }}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "profile" ? "2px solid #3867ff" : "2px solid transparent",
            color: activeTab === "profile" ? "#3867ff" : "#4b5563",
            fontWeight: activeTab === "profile" ? 600 : 500,
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <User size={18} /> Profile & Details
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("security"); setMessage({ text: "", type: "" }); }}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "security" ? "2px solid #3867ff" : "2px solid transparent",
            color: activeTab === "security" ? "#3867ff" : "#4b5563",
            fontWeight: activeTab === "security" ? 600 : 500,
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Lock size={18} /> Password & Security
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("danger"); setMessage({ text: "", type: "" }); }}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "danger" ? "2px solid #dc2626" : "2px solid transparent",
            color: activeTab === "danger" ? "#dc2626" : "#6b7280",
            fontWeight: activeTab === "danger" ? 600 : 500,
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <ShieldAlert size={18} /> Danger Zone
        </button>
      </div>

      {/* Global Alert Notification */}
      {message.text && (
        <div style={{
          marginBottom: "24px",
          padding: "14px 18px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: message.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${message.type === "success" ? "#86efac" : "#fca5a5"}`,
          color: message.type === "success" ? "#166534" : "#991b1b"
        }}>
          {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontSize: "14px", fontWeight: 500 }}>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
          <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-blue-500" />
          <p>Loading profile information...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: PROFILE & DETAILS */}
          {activeTab === "profile" && (
            <div style={{ backgroundColor: "white", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <form onSubmit={(e) => handleProfileSubmit(e, false)}>

                {/* Account Overview Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "16px",
                      backgroundColor: "#eff4ff", color: "#3867ff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "22px"
                    }}>
                      {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                        {profileData.fullName || "User Profile"}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#6b7280" }}>
                        <span>Role: <strong style={{ color: "#374151" }}>{profileData.role}</strong></span>
                        <span>•</span>
                        <span>User ID: <strong style={{ color: "#374151" }}>#{profileData.id}</strong></span>
                        <span>•</span>
                        <span style={{ color: profileData.active ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                          {profileData.active ? "Active" : "Deactivated"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Verification Status Pill */}
                  {profileData.role === "SUPPLIER" && (
                    <div>
                      <span style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        backgroundColor:
                          profileData.verificationStatus === "APPROVED" ? "#ecfdf5" :
                          profileData.verificationStatus === "REJECTED" ? "#fef2f2" : "#fffbeb",
                        color:
                          profileData.verificationStatus === "APPROVED" ? "#065f46" :
                          profileData.verificationStatus === "REJECTED" ? "#991b1b" : "#92400e",
                        border: `1px solid ${
                          profileData.verificationStatus === "APPROVED" ? "#a7f3d0" :
                          profileData.verificationStatus === "REJECTED" ? "#fecaca" : "#fde68a"
                        }`
                      }}>
                        Status: {profileData.verificationStatus || "PENDING"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Primary User Fields */}
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>
                  Personal Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      required
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "8px",
                        border: "1px solid #d1d5db", fontSize: "14px", outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      Email Address (Primary Identity)
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "8px",
                        border: "1px solid #e5e7eb", backgroundColor: "#f9fafb",
                        color: "#6b7280", fontSize: "14px", cursor: "not-allowed"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      required
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "8px",
                        border: "1px solid #d1d5db", fontSize: "14px", outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Supplier Specific Profile Fields */}
                {profileData.role === "SUPPLIER" && (
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "24px", marginTop: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <Building2 size={18} className="text-blue-600" /> Store & Business Information
                      </h4>
                      {profileData.verificationStatus === "REJECTED" && (
                        <button
                          type="button"
                          onClick={(e) => handleProfileSubmit(e, true)}
                          disabled={saving}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#ea580c",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <RefreshCw size={14} /> Resubmit for Admin Approval
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          Store / Shop Name
                        </label>
                        <input
                          type="text"
                          value={profileData.businessName}
                          onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          Business Category
                        </label>
                        <input
                          type="text"
                          value={profileData.businessType}
                          disabled
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb", color: "#6b7280", fontSize: "14px" }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                        Store Address
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          City
                        </label>
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          State
                        </label>
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          PIN Code
                        </label>
                        <input
                          type="text"
                          value={profileData.pinCode}
                          onChange={(e) => setProfileData({ ...profileData, pinCode: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          Store GPS Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={profileData.latitude}
                          onChange={(e) => setProfileData({ ...profileData, latitude: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          Store GPS Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={profileData.longitude}
                          onChange={(e) => setProfileData({ ...profileData, longitude: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      </div>
                    </div>

                    {/* Tax & Verification info */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          GST / Registration Number
                        </label>
                        <input
                          type="text"
                          value={profileData.registrationNumber}
                          onChange={(e) => setProfileData({ ...profileData, registrationNumber: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          Trade License Details
                        </label>
                        <input
                          type="text"
                          value={profileData.licenseDetails}
                          onChange={(e) => setProfileData({ ...profileData, licenseDetails: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: "12px 28px",
                      backgroundColor: "#3867ff",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "15px",
                      cursor: saving ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <Save size={18} />
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PASSWORD & SECURITY */}
          {activeTab === "security" && (
            <div style={{ backgroundColor: "white", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "32px", maxWidth: "600px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
                  Change Account Password
                </h3>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                  Enter your current password and choose a secure replacement that satisfies the enterprise password policy.
                </p>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Current Password *
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                      style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    New Password *
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter at least 12 characters"
                      style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Real-time Password Checklist */}
                  <div style={{ marginTop: "12px", background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>
                      Security Requirements:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px" }}>
                      <span style={{ color: newPassword.length >= 12 ? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
                        {newPassword.length >= 12 ? "✓" : "•"} Minimum 12 characters
                      </span>
                      <span style={{ color: /[A-Z]/.test(newPassword) ? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
                        {/[A-Z]/.test(newPassword) ? "✓" : "•"} Uppercase letter (A-Z)
                      </span>
                      <span style={{ color: /[a-z]/.test(newPassword) ? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
                        {/[a-z]/.test(newPassword) ? "✓" : "•"} Lowercase letter (a-z)
                      </span>
                      <span style={{ color: /[0-9]/.test(newPassword) ? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
                        {/[0-9]/.test(newPassword) ? "✓" : "•"} Numeric digit (0-9)
                      </span>
                      <span style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "#16a34a" : "#94a3b8", gridColumn: "span 2", display: "flex", alignItems: "center", gap: "5px" }}>
                        {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "✓" : "•"} Special character (!@#$%^&*...)
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none" }}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px", display: "block" }}>
                      Passwords do not match
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#3867ff",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "15px",
                    cursor: saving ? "not-allowed" : "pointer"
                  }}
                >
                  {saving ? "Updating Password..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: DANGER ZONE / DEACTIVATION */}
          {activeTab === "danger" && (
            <div style={{ backgroundColor: "white", borderRadius: "14px", border: "1px solid #fecaca", padding: "32px", maxWidth: "680px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
                <div style={{ backgroundColor: "#fee2e2", padding: "12px", borderRadius: "12px", color: "#dc2626" }}>
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#991b1b", margin: "0 0 6px" }}>
                    Deactivate Account
                  </h3>
                  <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
                    Deactivating your account will immediately revoke your active login session and prevent further access.
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "14px 18px", marginBottom: "24px" }}>
                <p style={{ fontSize: "13px", color: "#742a2a", margin: "0 0 8px", lineHeight: 1.5 }}>
                  <strong>Data Integrity & Auditability Notice:</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#742a2a", lineHeight: 1.5 }}>
                  <li>Your user status will be marked as inactive (soft delete).</li>
                  <li>To preserve supply chain records and regulatory auditability, historical orders, shipments, delivery records, and invoices will remain intact.</li>
                  {profileData.role === "ADMIN" && (
                    <li style={{ marginTop: "4px", fontWeight: 600 }}>
                      Administrative Safety: The platform prevents deactivation of the last active platform administrator.
                    </li>
                  )}
                </ul>
              </div>

              <form onSubmit={handleAccountDeactivation}>
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    To confirm, please type <strong style={{ color: "#dc2626" }}>DEACTIVATE</strong> in the box below:
                  </label>
                  <input
                    type="text"
                    value={deactivateConfirmation}
                    onChange={(e) => setDeactivateConfirmation(e.target.value)}
                    placeholder="DEACTIVATE"
                    required
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px",
                      border: "1px solid #d1d5db", fontSize: "14px", outline: "none",
                      letterSpacing: "1px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Confirm your current password:
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showDeactivatePassword ? "text" : "password"}
                      value={deactivatePassword}
                      onChange={(e) => setDeactivatePassword(e.target.value)}
                      placeholder="Current password"
                      required
                      style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeactivatePassword(!showDeactivatePassword)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
                    >
                      {showDeactivatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || deactivateConfirmation !== "DEACTIVATE"}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: deactivateConfirmation === "DEACTIVATE" ? "#dc2626" : "#fca5a5",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: deactivateConfirmation === "DEACTIVATE" && !saving ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <LogOut size={18} />
                  {saving ? "Deactivating Account..." : "Permanently Deactivate My Account"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
