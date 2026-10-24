import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package, Check, AlertCircle, ShoppingCart, Minus, Plus, MapPin, Store, ShieldCheck, ChevronRight } from "lucide-react";
import { getProduct } from "../../api/productApi";
import { useCart } from "../../context/CartContext";
import { getUserLocation, calculateDistance, formatDistance } from "../../utils/location";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const userLocation = getUserLocation();

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(data => {
        setProduct(data);
        setSelectedImageIdx(0);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load product details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.quantity < 1) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const increment = () => {
    if (quantity < (product?.quantity || 1)) setQuantity(q => q + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px", width: "100%" }}>
        <div style={{ height: "450px", backgroundColor: "#f3f4f6", borderRadius: "20px", animation: "pulse 1.5s infinite" }}></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px", width: "100%", textAlign: "center" }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>{error || "Product not found"}</h2>
        <button onClick={() => navigate(-1)} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", cursor: "pointer" }}>Go Back</button>
      </div>
    );
  }

  // Aggregate images
  const allImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const activeImageUrl = allImages[selectedImageIdx] || allImages[0] || "";

  // Distance calculation
  const distanceKm = calculateDistance(
    userLocation?.latitude,
    userLocation?.longitude,
    product.latitude,
    product.longitude
  );
  const distanceStr = formatDistance(distanceKm);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 24px 60px", width: "100%" }}>
      {/* Breadcrumb / Back Link */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px", fontSize: "14px", color: "#6b7280" }}>
        <Link to="/customer/products" style={{ color: "#4b5563", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
          <ArrowLeft size={16} /> Products
        </Link>
        <ChevronRight size={14} color="#9ca3af" />
        <span style={{ color: "#9ca3af" }}>{product.category || "General"}</span>
        <ChevronRight size={14} color="#9ca3af" />
        <span style={{ color: "#111827", fontWeight: 600, maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {product.name}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "48px" }} className="product-details-grid">
        {/* Left Column: Image Gallery */}
        <div>
          <div style={{
            backgroundColor: "#f9fafb",
            borderRadius: "20px",
            border: "1px solid #e5e7eb",
            height: "460px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}>
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "20px" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div style={{ display: activeImageUrl ? "none" : "flex", flexDirection: "column", alignItems: "center", color: "#9ca3af" }}>
              <Package size={100} />
              <span style={{ marginTop: "12px", fontSize: "14px" }}>No image available</span>
            </div>

            {distanceStr && (
              <div style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                backgroundColor: "rgba(17, 24, 39, 0.85)",
                backdropFilter: "blur(4px)",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <MapPin size={13} className="text-blue-400" />
                {distanceStr} from your location
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {allImages.length > 1 && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", overflowX: "auto", paddingBottom: "8px" }}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    border: selectedImageIdx === idx ? "2px solid #3867ff" : "1px solid #e5e7eb",
                    backgroundColor: "white",
                    padding: "4px",
                    cursor: "pointer",
                    overflow: "hidden",
                    flexShrink: 0,
                    outline: "none"
                  }}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#3867ff", backgroundColor: "#eff6ff", padding: "4px 12px", borderRadius: "12px", textTransform: "uppercase" }}>
              {product.category}
            </span>
            {product.brand && (
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                Brand: <strong style={{ color: "#374151" }}>{product.brand}</strong>
              </span>
            )}
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.25, marginBottom: "16px", color: "#111827" }}>
            {product.name}
          </h1>

          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "24px" }}>
            <span style={{ fontSize: "34px", fontWeight: 800, color: "#111827" }}>
              ${product.price?.toFixed(2)}
            </span>
            <span style={{
              fontSize: "13px",
              padding: "4px 10px",
              borderRadius: "8px",
              backgroundColor: product.quantity > 0 ? "#ecfdf5" : "#fef2f2",
              color: product.quantity > 0 ? "#059669" : "#dc2626",
              fontWeight: 700
            }}>
              {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
            </span>
          </div>

          <p style={{ color: "#4b5563", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
            {product.description || "No description provided for this product."}
          </p>

          {/* Verified Seller / Shop Information Card */}
          <div style={{
            padding: "18px 20px",
            backgroundColor: "#f8fafc",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            marginBottom: "28px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Store size={18} className="text-blue-600" />
                {product.supplierId ? (
                  <Link
                    to={`/customer/shops/${product.supplierId}`}
                    style={{ fontSize: "14px", fontWeight: 700, color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                    title="Visit Store"
                  >
                    {product.supplierName || `Supplier #${product.supplierId}`}
                    <span style={{ fontSize: "11px", fontWeight: 600 }}>→</span>
                  </Link>
                ) : (
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    {product.supplierName || "Verified Supplier"}
                  </span>
                )}
              </div>
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#16a34a",
                fontWeight: 600,
                backgroundColor: "#f0fdf4",
                padding: "2px 8px",
                borderRadius: "6px"
              }}>
                <ShieldCheck size={14} /> Verified Partner
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              {product.address && (
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Location</span>
                  <strong style={{ color: "#334155" }}>{product.address}, {product.city}</strong>
                </div>
              )}
              {distanceStr && (
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Estimated Distance</span>
                  <strong style={{ color: "#2563eb" }}>{distanceStr} away</strong>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Stepper & Add to Cart */}
          {product.quantity > 0 ? (
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "12px", overflow: "hidden", backgroundColor: "white" }}>
                <button
                  onClick={decrement}
                  disabled={quantity <= 1}
                  style={{ padding: "14px", background: "transparent", border: "none", cursor: quantity > 1 ? "pointer" : "not-allowed", color: quantity > 1 ? "#111827" : "#d1d5db" }}
                >
                  <Minus size={18} />
                </button>
                <div style={{ width: "48px", textAlign: "center", fontWeight: 700, fontSize: "16px" }}>
                  {quantity}
                </div>
                <button
                  onClick={increment}
                  disabled={quantity >= product.quantity}
                  style={{ padding: "14px", background: "transparent", border: "none", cursor: quantity < product.quantity ? "pointer" : "not-allowed", color: quantity < product.quantity ? "#111827" : "#d1d5db" }}
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={added}
                style={{
                  flex: 1,
                  backgroundColor: added ? "#10b981" : "#3867ff",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  boxShadow: "0 4px 12px rgba(56, 103, 255, 0.25)"
                }}
              >
                {added ? <><Check size={20} /> Added to Cart</> : <><ShoppingCart size={20} /> Add to Cart</>}
              </button>
            </div>
          ) : (
            <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "12px", textAlign: "center", fontWeight: 600, marginBottom: "24px" }}>
              This item is currently out of stock from the supplier.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .product-details-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
