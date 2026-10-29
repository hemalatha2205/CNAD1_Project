import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supplierApi } from "../../api/supplierApi";
import { User, Building2, MapPin, Mail, Phone, FileText, Package, ShieldCheck, ExternalLink } from "lucide-react";

export default function SupplierProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await supplierApi.getProfile(user.userId);
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.userId]);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading profile details...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-red-500">Failed to load profile. Please contact administrator.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-500 mt-1">View your registered business details.</p>
        </div>
        <div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            profile.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
            profile.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
          }`}>
            Status: {profile.verificationStatus || "PENDING"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-2xl">
              {profile.businessName?.charAt(0) || "B"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.businessName}</h2>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <Building2 size={16} /> {profile.businessType || "Supplier"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Owner Name</p>
                    <p className="text-gray-900">{profile.ownerName || profile.user?.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Email</p>
                    <p className="text-gray-900">{profile.businessEmail || profile.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Phone</p>
                    <p className="text-gray-900">{profile.businessPhone || profile.user?.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Location Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registered Address</p>
                    <p className="text-gray-900">{profile.address || profile.streetAddress}</p>
                    <p className="text-gray-900">{profile.city}, {profile.state} {profile.pinCode || profile.zipCode}</p>
                    {profile.latitude && profile.longitude && (
                      <p className="text-xs text-indigo-600 mt-1">
                        GPS: {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Warehouse Location</p>
                    <p className="text-gray-900">{profile.warehouseLocation || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Registration & Compliance Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <FileText className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration Number</p>
                    <p className="text-gray-900">{profile.registrationNumber || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">License Details</p>
                    <p className="text-gray-900">{profile.licenseDetails || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Products Supplied</p>
                    <p className="text-gray-900">{profile.productsSupplied || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tax Certificate</p>
                    {profile.taxCertificateUrl ? (
                      <a href={profile.taxCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 text-sm">
                        View Document <ExternalLink size={14} />
                      </a>
                    ) : (
                      <p className="text-gray-400 text-sm">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business License Document</p>
                    {profile.businessLicenseUrl ? (
                      <a href={profile.businessLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 text-sm">
                        View Document <ExternalLink size={14} />
                      </a>
                    ) : (
                      <p className="text-gray-400 text-sm">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Shop Front Photo</p>
                    {profile.shopPhotoUrl ? (
                      <a href={profile.shopPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 text-sm">
                        View Photo <ExternalLink size={14} />
                      </a>
                    ) : (
                      <p className="text-gray-400 text-sm">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
