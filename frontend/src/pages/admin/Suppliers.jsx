import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { Building2, Search, CheckCircle, XCircle, FileText, ExternalLink, X, MapPin, Eye } from "lucide-react";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchSuppliers = () => {
    setLoading(true);
    adminApi.getSuppliers()
      .then(res => setSuppliers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const getSupplierTargetId = (supplier) => {
    return supplier.userId || supplier.user?.id || supplier.id;
  };

  const handleVerify = (supplier, status) => {
    const id = getSupplierTargetId(supplier);
    if (!id) {
      alert("Error: Supplier ID not found");
      return;
    }
    if (window.confirm(`Are you sure you want to mark "${supplier.businessName}" as ${status}?`)) {
      adminApi.verifySupplier(id, status)
        .then(() => {
          alert(`Supplier "${supplier.businessName}" marked as ${status}`);
          if (selectedSupplier && getSupplierTargetId(selectedSupplier) === id) {
            setSelectedSupplier(null);
          }
          fetchSuppliers();
        })
        .catch(err => {
          console.error(err);
          alert("Failed to update status");
        });
    }
  };

  const filtered = suppliers.filter(s =>
    s.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.businessEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="text-purple-600" /> Suppliers ({suppliers.length})
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search suppliers..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading suppliers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No suppliers found.</td>
                </tr>
              ) : (
                filtered.map(supplier => {
                  const sId = getSupplierTargetId(supplier);
                  return (
                    <tr key={supplier.id || sId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">#{sId}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{supplier.businessName}</p>
                        <p className="text-xs text-gray-500">{supplier.businessType || "Retail"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{supplier.ownerName || supplier.user?.fullName}</p>
                        <p className="text-xs text-gray-500">{supplier.businessEmail || supplier.user?.email}</p>
                        <p className="text-xs text-gray-500">{supplier.businessPhone || supplier.user?.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{supplier.city}, {supplier.state}</p>
                        <p className="text-xs text-gray-500">{supplier.warehouseLocation || supplier.address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          supplier.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          supplier.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {supplier.verificationStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedSupplier(supplier)}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-md"
                        >
                          <Eye size={14} /> Review Docs
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {supplier.verificationStatus !== 'APPROVED' && (
                            <button
                              onClick={() => handleVerify(supplier, 'APPROVED')}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {supplier.verificationStatus !== 'REJECTED' && (
                            <button
                              onClick={() => handleVerify(supplier, 'REJECTED')}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Documents Review Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedSupplier.businessName}</h3>
                <p className="text-sm text-gray-500">Business Verification Review</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Owner</p>
                  <p className="font-semibold text-gray-900">{selectedSupplier.ownerName || selectedSupplier.user?.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Contact Phone</p>
                  <p className="font-semibold text-gray-900">{selectedSupplier.businessPhone || selectedSupplier.user?.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Registered Address</p>
                  <p className="text-gray-900">{selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.state} {selectedSupplier.pinCode}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Warehouse</p>
                  <p className="text-gray-900">{selectedSupplier.warehouseLocation || "Standard address"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Registration / GST</p>
                  <p className="font-mono text-gray-900">{selectedSupplier.registrationNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Trade License</p>
                  <p className="font-mono text-gray-900">{selectedSupplier.licenseDetails || "Not provided"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" /> Submitted Verification Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Tax Certificate</p>
                      <p className="text-xs text-gray-500 mt-1">GST/Tax identification document</p>
                    </div>
                    {selectedSupplier.taxCertificateUrl ? (
                      <a
                        href={selectedSupplier.taxCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded"
                      >
                        Open Certificate <ExternalLink size={12} />
                      </a>
                    ) : (
                      <p className="mt-4 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">No file uploaded</p>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Business License</p>
                      <p className="text-xs text-gray-500 mt-1">Trade license / Permit</p>
                    </div>
                    {selectedSupplier.businessLicenseUrl ? (
                      <a
                        href={selectedSupplier.businessLicenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded"
                      >
                        Open License <ExternalLink size={12} />
                      </a>
                    ) : (
                      <p className="mt-4 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">No file uploaded</p>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Shop Front Photo</p>
                      <p className="text-xs text-gray-500 mt-1">Store / Warehouse entrance</p>
                    </div>
                    {selectedSupplier.shopPhotoUrl ? (
                      <a
                        href={selectedSupplier.shopPhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded"
                      >
                        View Photo <ExternalLink size={12} />
                      </a>
                    ) : (
                      <p className="mt-4 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">No photo uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedSupplier.latitude && selectedSupplier.longitude && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <MapPin size={16} className="text-blue-600" />
                  <span>GPS Coordinates: {selectedSupplier.latitude.toFixed(4)}, {selectedSupplier.longitude.toFixed(4)}</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => handleVerify(selectedSupplier, 'REJECTED')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-1.5"
              >
                <XCircle size={16} /> Reject Supplier
              </button>
              <button
                onClick={() => handleVerify(selectedSupplier, 'APPROVED')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1.5"
              >
                <CheckCircle size={16} /> Approve Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
