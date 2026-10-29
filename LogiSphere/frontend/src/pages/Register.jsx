import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Building2, MapPin, FileText, Upload, CheckCircle2, ShieldCheck, Calendar, CreditCard, Car } from "lucide-react";
import { registerUser, registerSupplier, registerDeliveryPerson } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorHandler";

const ROLE_PATHS = {
  ADMIN: "/admin",
  SUPPLIER: "/supplier",
  CUSTOMER: "/customer",
  DELIVERY_PERSON: "/delivery",
};

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(ROLE_PATHS[user.role] || "/customer");
    }
  }, [isAuthenticated, user, navigate]);

  // Account Type: 'CUSTOMER' | 'SUPPLIER' | 'DELIVERY_PERSON'
  const [roleType, setRoleType] = useState("CUSTOMER");

  // Common User Credentials
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Supplier Specific Fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Retail & General");
  const [ownerName, setOwnerName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenseDetails, setLicenseDetails] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Document URLs or Data URLs
  const [taxCertificateUrl, setTaxCertificateUrl] = useState("");
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState("");
  const [shopPhotoUrl, setShopPhotoUrl] = useState("");

  // Delivery Person KYC Fields
  const [deliveryDob, setDeliveryDob] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [identityDocumentType, setIdentityDocumentType] = useState("Aadhaar");
  const [identityDocumentNumber, setIdentityDocumentNumber] = useState("");
  const [identityDocumentUrl, setIdentityDocumentUrl] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [drivingLicenseExpiryDate, setDrivingLicenseExpiryDate] = useState("");
  const [drivingLicenseFrontUrl, setDrivingLicenseFrontUrl] = useState("");
  const [drivingLicenseBackUrl, setDrivingLicenseBackUrl] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState("");

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

  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Helper to handle local file upload to Data URL
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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    setGpsStatus("Detecting coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setDetectingGps(false);
        setGpsStatus("GPS location detected successfully!");
      },
      (err) => {
        setDetectingGps(false);
        setGpsStatus("Could not detect location: " + err.message);
      },
      { timeout: 10000 }
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !phone) {
      setError("Please fill in all primary account fields.");
      return;
    }

    const hasMinLength = password.length >= 12;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLength || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setError("Password must be at least 12 characters and include uppercase, lowercase, digit, and special character.");
      return;
    }

    if (roleType === "SUPPLIER") {
      if (!businessName || !address || !city || !state || !pinCode) {
        setError("Please fill in all required seller details (Business Name, Address, City, State, PIN Code).");
        return;
      }
    }

    if (roleType === "DELIVERY_PERSON") {
      if (!deliveryDob || !deliveryAddress || !deliveryCity || !identityDocumentNumber || !drivingLicenseNumber || !drivingLicenseExpiryDate) {
        setError("Please fill in all required delivery partner KYC details.");
        return;
      }
      const age = calculateAge(deliveryDob);
      if (age === null || age < 18) {
        setError("Legal working age requirement not met. Delivery partners must be at least 18 years old.");
        return;
      }
      const expiry = new Date(drivingLicenseExpiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry <= today) {
        setError("Driving licence has expired or invalid expiry date. Please provide a valid licence.");
        return;
      }
    }

    try {
      setLoading(true);

      if (roleType === "SUPPLIER") {
        const payload = {
          fullName,
          email,
          password,
          phone,
          businessName,
          businessType,
          ownerName: ownerName || fullName,
          businessPhone: businessPhone || phone,
          businessEmail: businessEmail || email,
          address,
          city,
          state,
          pinCode,
          warehouseLocation: warehouseLocation || address,
          registrationNumber: registrationNumber || "REG-" + Date.now().toString().slice(-6),
          licenseDetails: licenseDetails || "LIC-" + Date.now().toString().slice(-6),
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          taxCertificateUrl: taxCertificateUrl || "",
          businessLicenseUrl: businessLicenseUrl || "",
          shopPhotoUrl: shopPhotoUrl || ""
        };
        await registerSupplier(payload);
      } else if (roleType === "DELIVERY_PERSON") {
        const payload = {
          fullName,
          email,
          password,
          phone,
          dateOfBirth: deliveryDob,
          address: deliveryAddress,
          city: deliveryCity,
          identityDocumentType,
          identityDocumentNumber,
          identityDocumentUrl: identityDocumentUrl || "",
          drivingLicenseNumber,
          drivingLicenseExpiryDate,
          drivingLicenseFrontUrl: drivingLicenseFrontUrl || "",
          drivingLicenseBackUrl: drivingLicenseBackUrl || "",
          profilePhotoUrl: profilePhotoUrl || "",
          vehicleType,
          vehicleRegistrationNumber: vehicleRegistrationNumber || ""
        };
        await registerDeliveryPerson(payload);
      } else {
        const payload = {
          fullName,
          email,
          password,
          phone,
          role: "CUSTOMER"
        };
        await registerUser(payload);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-form-area" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
          <div className="login-card" style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            {roleType === "SUPPLIER" ? (
              <p className="text-gray-600 mb-6">
                Your seller profile has been submitted and is currently <strong>PENDING</strong> administrator review. You can now log in to access your seller portal.
              </p>
            ) : roleType === "DELIVERY_PERSON" ? (
              <p className="text-gray-600 mb-6">
                Your delivery partner profile and KYC documents have been submitted and are currently <strong>PENDING_VERIFICATION</strong> (review target: 1–3 business days). Log in to monitor verification progress and audit updates.
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                Your LogiSphere customer account is ready. Redirecting to login...
              </p>
            )}
            <Link to="/login" className="login-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-brand">
          <div className="logo-icon"><Truck size={22} /></div>
          <span>Logi<span>Sphere</span></span>
        </div>
        <div className="login-visual-content">
          <div className="login-badge"><span></span>Join LogiSphere</div>
          <h1>End-to-end logistics<br /><strong>marketplace.</strong></h1>
          <p>
            {roleType === "SUPPLIER"
              ? "Onboard your store, upload multiple product images, and reach local shoppers with intelligent fulfillment."
              : roleType === "DELIVERY_PERSON"
              ? "Join our dedicated delivery fleet. Manage verified shipments and earn with live tracking."
              : "Discover nearby approved shops, order quality goods, and track live deliveries in real-time."}
          </p>
        </div>
      </div>

      <div className="login-form-area" style={{ overflowY: 'auto', maxHeight: '100vh', padding: '30px 20px' }}>
        <div className="login-card" style={{ maxWidth: '640px', margin: 'auto' }}>
          <div className="mobile-login-logo">
            <div className="logo-icon"><Truck size={21} /></div>
            <span>Logi<span>Sphere</span></span>
          </div>

          <div className="login-heading">
            <h2>Create your account</h2>
            <p>Select your persona to get started.</p>
          </div>

          {error && <div className="login-error" style={{ marginBottom: '16px' }}>{error}</div>}

          {/* Persona Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setRoleType("CUSTOMER")}
              style={{
                padding: '12px 8px',
                borderRadius: '8px',
                border: roleType === "CUSTOMER" ? '2px solid #3867ff' : '1px solid #e5e7eb',
                background: roleType === "CUSTOMER" ? '#eff4ff' : '#ffffff',
                fontWeight: roleType === "CUSTOMER" ? '600' : '400',
                color: roleType === "CUSTOMER" ? '#3867ff' : '#4b5563',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '13px'
              }}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRoleType("SUPPLIER")}
              style={{
                padding: '12px 8px',
                borderRadius: '8px',
                border: roleType === "SUPPLIER" ? '2px solid #3867ff' : '1px solid #e5e7eb',
                background: roleType === "SUPPLIER" ? '#eff4ff' : '#ffffff',
                fontWeight: roleType === "SUPPLIER" ? '600' : '400',
                color: roleType === "SUPPLIER" ? '#3867ff' : '#4b5563',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '13px'
              }}
            >
              Seller
            </button>
            <button
              type="button"
              onClick={() => setRoleType("DELIVERY_PERSON")}
              style={{
                padding: '12px 8px',
                borderRadius: '8px',
                border: roleType === "DELIVERY_PERSON" ? '2px solid #3867ff' : '1px solid #e5e7eb',
                background: roleType === "DELIVERY_PERSON" ? '#eff4ff' : '#ffffff',
                fontWeight: roleType === "DELIVERY_PERSON" ? '600' : '400',
                color: roleType === "DELIVERY_PERSON" ? '#3867ff' : '#4b5563',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '13px'
              }}
            >
              Delivery Fleet
            </button>
          </div>

          <form onSubmit={handleRegister}>
            {/* Account Credentials Section */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Account Credentials
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Full Name *</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label>Email Address *</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                <div>
                  <label>Phone Number *</label>
                  <div className="input-wrapper">
                    <Phone size={18} />
                    <input type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label>Password *</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input type={showPassword ? "text" : "password"} placeholder="Secure password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: '8px', fontSize: '11px', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Password Requirements:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                        <span style={{ color: password.length >= 12 ? '#16a34a' : '#94a3b8' }}>
                          {password.length >= 12 ? '✓' : '•'} 12+ characters
                        </span>
                        <span style={{ color: /[A-Z]/.test(password) ? '#16a34a' : '#94a3b8' }}>
                          {/[A-Z]/.test(password) ? '✓' : '•'} Uppercase letter
                        </span>
                        <span style={{ color: /[a-z]/.test(password) ? '#16a34a' : '#94a3b8' }}>
                          {/[a-z]/.test(password) ? '✓' : '•'} Lowercase letter
                        </span>
                        <span style={{ color: /[0-9]/.test(password) ? '#16a34a' : '#94a3b8' }}>
                          {/[0-9]/.test(password) ? '✓' : '•'} Number (0-9)
                        </span>
                        <span style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '#16a34a' : '#94a3b8', gridColumn: 'span 2' }}>
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '•'} Special character (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Supplier Specific Form Fields */}
            {roleType === "SUPPLIER" && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} className="text-indigo-600" /> Seller & Business Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div>
                    <label>Shop / Business Name *</label>
                    <div className="input-wrapper">
                      <input type="text" placeholder="Apex Superstore" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label>Business Category *</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        outline: 'none',
                        fontSize: '14px'
                      }}
                    >
                      <option value="Electronics">Electronics & Tech</option>
                      <option value="Groceries">Groceries & Supermarket</option>
                      <option value="Clothing">Fashion & Apparel</option>
                      <option value="Health & Pharmacy">Health & Pharmacy</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Books & Stationery">Books & Stationery</option>
                      <option value="Industrial & Hardware">Industrial & Hardware</option>
                      <option value="Retail & General">General Store</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div>
                    <label>Owner Name</label>
                    <div className="input-wrapper">
                      <input type="text" placeholder={fullName || "Owner full name"} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label>Business Phone</label>
                    <div className="input-wrapper">
                      <input type="tel" placeholder={phone || "Business contact phone"} value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Shop Location & Coordinates */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} className="text-indigo-600" /> Shop Location & Coordinates
                  </h4>
                  <div style={{ marginBottom: '10px' }}>
                    <label>Street Address *</label>
                    <div className="input-wrapper">
                      <input type="text" placeholder="123 Commercial Street" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label>City *</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label>State *</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="Karnataka" value={state} onChange={(e) => setState(e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label>PIN Code *</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="560001" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  {/* Geolocation Coordinates */}
                  <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                        Store GPS Coordinates (for Nearby Marketplace)
                      </span>
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={detectingGps}
                        style={{
                          fontSize: '11px',
                          color: '#3867ff',
                          background: '#eff4ff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {detectingGps ? "Detecting..." : "Detect My Location"}
                      </button>
                    </div>
                    {gpsStatus && <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{gpsStatus}</p>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude (e.g. 12.9716)"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude (e.g. 77.5946)"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Business Verification Documents */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} className="text-indigo-600" /> Business Verification & Documents
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label>GST / Tax ID</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="29ABCDE1234F1Z5" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label>Trade License / Details</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="LIC-BLR-2026-99" value={licenseDetails} onChange={(e) => setLicenseDetails(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px' }}>Tax Certificate</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, setTaxCertificateUrl)}
                        style={{ fontSize: '11px', width: '100%', marginTop: '4px' }}
                      />
                      {taxCertificateUrl && <span style={{ fontSize: '10px', color: '#16a34a' }}>Attached</span>}
                    </div>
                    <div>
                      <label style={{ fontSize: '12px' }}>Business License</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, setBusinessLicenseUrl)}
                        style={{ fontSize: '11px', width: '100%', marginTop: '4px' }}
                      />
                      {businessLicenseUrl && <span style={{ fontSize: '10px', color: '#16a34a' }}>Attached</span>}
                    </div>
                    <div>
                      <label style={{ fontSize: '12px' }}>Shop Front Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setShopPhotoUrl)}
                        style={{ fontSize: '11px', width: '100%', marginTop: '4px' }}
                      />
                      {shopPhotoUrl && <span style={{ fontSize: '10px', color: '#16a34a' }}>Attached</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Person Specific KYC Form Fields */}
            {roleType === "DELIVERY_PERSON" && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <ShieldCheck size={16} className="text-blue-600" /> Delivery Partner KYC & Verification
                  </h4>
                  <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: '500' }}>
                    SLA: 1-3 Business Days
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12px', color: '#475569' }}>
                  LogiSphere adheres to legal working age requirements (18+) and mandatory vehicle/licence compliance. Documents are securely encrypted.
                </div>

                {/* Personal & Age Verification */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Date of Birth *</span>
                      {deliveryDob && (
                        <span style={{ fontSize: '11px', fontWeight: '600', color: calculateAge(deliveryDob) >= 18 ? '#16a34a' : '#dc2626' }}>
                          {calculateAge(deliveryDob) !== null ? (
                            calculateAge(deliveryDob) >= 18
                              ? `Age: ${calculateAge(deliveryDob)} yrs (Eligible)`
                              : `Age: ${calculateAge(deliveryDob)} yrs (Must be ≥18)`
                          ) : ""}
                        </span>
                      )}
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="date"
                        value={deliveryDob}
                        onChange={(e) => setDeliveryDob(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label>Profile Photograph</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setProfilePhotoUrl)}
                      style={{ fontSize: '11px', width: '100%', marginTop: '8px' }}
                    />
                    {profilePhotoUrl && <span style={{ fontSize: '10px', color: '#16a34a' }}>Photo Attached ✓</span>}
                  </div>
                </div>

                {/* Residential Address */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label>Residential Address *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="Flat / House / Street Name"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label>City *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="Bengaluru"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Identity Document Verification */}
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px', marginTop: '12px', marginBottom: '12px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={14} /> Government Identity Document
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px', marginBottom: '8px' }}>
                    <div>
                      <label>ID Document Type *</label>
                      <select
                        value={identityDocumentType}
                        onChange={(e) => setIdentityDocumentType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          outline: 'none',
                          fontSize: '14px'
                        }}
                      >
                        <option value="Aadhaar">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                      </select>
                    </div>
                    <div>
                      <label>ID Document Number *</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          placeholder="e.g. 1234-5678-9012"
                          value={identityDocumentNumber}
                          onChange={(e) => setIdentityDocumentNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px' }}>Upload Government ID (PDF/Image)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, setIdentityDocumentUrl)}
                      style={{ fontSize: '11px', width: '100%', marginTop: '4px' }}
                    />
                    {identityDocumentUrl && <span style={{ fontSize: '10px', color: '#16a34a' }}>ID Attached ✓</span>}
                  </div>
                </div>

                {/* Driving Licence & Vehicle Details */}
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={14} /> Driving Licence & Vehicle Information
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                    <div>
                      <label>Driving Licence Number *</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          placeholder="DL-0420110012345"
                          value={drivingLicenseNumber}
                          onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Licence Expiry Date *</span>
                        {drivingLicenseExpiryDate && (
                          <span style={{ fontSize: '11px', fontWeight: '600', color: new Date(drivingLicenseExpiryDate) > new Date() ? '#16a34a' : '#dc2626' }}>
                            {new Date(drivingLicenseExpiryDate) > new Date() ? "✓ Valid" : "✕ Expired"}
                          </span>
                        )}
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="date"
                          value={drivingLicenseExpiryDate}
                          onChange={(e) => setDrivingLicenseExpiryDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px' }}>Licence Front Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setDrivingLicenseFrontUrl)}
                        style={{ fontSize: '11px', width: '100%', marginTop: '4px' }}
                      />
                      {drivingLicenseFrontUrl && <span style={{ fontSize: '10px', color: '#16a34a' }}>Front Attached ✓</span>}
                    </div>
                    <div>
                      <label style={{ fontSize: '12px' }}>Licence Back Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setDrivingLicenseBackUrl)}
                        style={{ fontSize: '11px', width: '100%', marginTop: '4px' }}
                      />
                      {drivingLicenseBackUrl && <span style={{ fontSize: '10px', color: '#16a34a' }}>Back Attached ✓</span>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
                    <div>
                      <label>Vehicle Type</label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          outline: 'none',
                          fontSize: '14px'
                        }}
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
                      <label>Vehicle Registration #</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          placeholder="KA-01-AB-1234"
                          value={vehicleRegistrationNumber}
                          onChange={(e) => setVehicleRegistrationNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading} style={{ marginTop: '24px' }}>
              {loading ? "Submitting application..." : roleType === "SUPPLIER" ? "Register Seller Account & Submit for Approval" : roleType === "DELIVERY_PERSON" ? "Register & Submit KYC Application" : "Sign Up"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="register-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
