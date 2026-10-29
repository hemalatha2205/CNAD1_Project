import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supplierApi } from "../../api/supplierApi";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Save, Plus, Trash2, Image, AlertTriangle } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Groceries",
  "Clothing",
  "Health & Pharmacy",
  "Home & Living",
  "Books",
  "Industrial & Hardware",
  "Other"
];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    category: "Electronics",
    price: "",
    quantity: "",
    imageUrl: "",
    images: []
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [supplierStatus, setSupplierStatus] = useState("APPROVED");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Check supplier profile verification status
        if (user?.userId) {
          try {
            const profileRes = await supplierApi.getProfile(user.userId);
            setSupplierStatus(profileRes.data?.verificationStatus || "PENDING");
          } catch (e) {
            console.error("Could not fetch profile status", e);
          }
        }

        if (isEditing) {
          const response = await supplierApi.getProduct(id);
          const p = response.data;
          const imageList = p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []);
          setFormData({
            name: p.name || "",
            description: p.description || "",
            brand: p.brand || "",
            category: p.category || "Electronics",
            price: p.price || "",
            quantity: p.quantity || "",
            imageUrl: p.imageUrl || (imageList.length > 0 ? imageList[0] : ""),
            images: imageList
          });
        }
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing, user?.userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImage = (urlToAdd) => {
    const url = urlToAdd || newImageUrl;
    if (!url || !url.trim()) return;
    setFormData((prev) => {
      const updatedImages = [...prev.images, url.trim()];
      return {
        ...prev,
        images: updatedImages,
        imageUrl: prev.imageUrl || url.trim()
      };
    });
    setNewImageUrl("");
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updatedImages,
        imageUrl: updatedImages.length > 0 ? updatedImages[0] : ""
      };
    });
  };

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image file should be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      handleAddImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEditing && supplierStatus !== "APPROVED") {
      setError("Your supplier profile is currently " + supplierStatus + ". Only approved suppliers can publish products.");
      return;
    }

    setSaving(true);

    try {
      const primaryImage = formData.images.length > 0 ? formData.images[0] : formData.imageUrl;
      const payload = {
        ...formData,
        imageUrl: primaryImage,
        images: formData.images.length > 0 ? formData.images : (primaryImage ? [primaryImage] : []),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10)
      };

      if (isEditing) {
        await supplierApi.updateProduct(id, payload);
      } else {
        const res = await supplierApi.addProduct(payload);
        // After creating the product, initialize inventory
        try {
          await supplierApi.createInventoryRecord(res.data.id, payload.quantity);
        } catch (invErr) {
          console.warn("Inventory record could not be created or already exists", invErr);
        }
      }
      navigate("/supplier/products");
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "An error occurred while saving the product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading product details...</div>;
  }

  const isUnapproved = !isEditing && supplierStatus !== "APPROVED";

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/supplier/products")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium"
      >
        <ArrowLeft size={20} /> Back to Products
      </button>

      {isUnapproved && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800">
          <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Account Verification Pending ({supplierStatus})</h4>
            <p className="text-xs mt-1 text-amber-700">
              Your business profile is awaiting administrator approval. Product creation will be enabled as soon as your account is verified.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? "Update your product details and gallery." : "List a new product in the marketplace."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g. Sony"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="29.99"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEditing ? "Stock Quantity (manage via Inventory)" : "Initial Stock Quantity *"}
              </label>
              <input
                required={!isEditing}
                type="number"
                min="0"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="100"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Detailed specifications, features and dimensions..."
              />
            </div>

            {/* Multiple Product Images Section */}
            <div className="col-span-2 border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image Gallery</label>

              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  placeholder="Paste image URL (e.g. https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddImage()}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-1"
                >
                  <Plus size={16} /> Add URL
                </button>
                <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer flex items-center gap-1">
                  <Image size={16} /> Upload File
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>
              </div>

              {/* Image Previews */}
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
                  No images added yet. Add an image URL or upload a file.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/supplier/products")}
              className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg mr-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isUnapproved}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {saving ? "Saving..." : isEditing ? "Update Product" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
