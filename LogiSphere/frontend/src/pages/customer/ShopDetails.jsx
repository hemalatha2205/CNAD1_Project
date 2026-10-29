import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Store, MapPin, ShieldCheck, Package, ArrowLeft,
  ExternalLink, ShoppingBag, AlertCircle
} from "lucide-react";
import { getPublicStore } from "../../api/authApi";
import { getProductsBySupplier } from "../../api/productApi";
import { getUserLocation, calculateDistance, formatDistance } from "../../utils/location";
import { getErrorMessage } from "../../utils/errorHandler";

export default function ShopDetails() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userLocation = getUserLocation();

  useEffect(() => {
    async function loadStoreAndProducts() {
      try {
        setLoading(true);
        setError("");

        // 1. Fetch public store profile
        const storeData = await getPublicStore(id);
        setStore(storeData);

        // 2. Fetch products owned by this supplier (use userId if available, or id)
        const supplierOwnerId = storeData.userId || storeData.id;
        try {
          const productList = await getProductsBySupplier(supplierOwnerId);
          setProducts(productList || []);
        } catch (prodErr) {
          console.warn("Could not load store products:", prodErr);
          setProducts([]);
        }

      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadStoreAndProducts();
    }
  }, [id]);

  const distanceKm = store
    ? calculateDistance(userLocation?.latitude, userLocation?.longitude, store.latitude, store.longitude)
    : null;
  const distanceStr = formatDistance(distanceKm);

  if (loading) {
    return (
      <div style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>Loading store details and catalog...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "32px" }}>
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#991b1b", marginBottom: "8px" }}>
            Store Not Found
          </h2>
          <p style={{ color: "#7f1d1d", fontSize: "14px", marginBottom: "20px" }}>
            {error || "The requested storefront does not exist or has been deactivated."}
          </p>
          <Link
            to="/customer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: "#3867ff",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            <ArrowLeft size={16} /> Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Breadcrumb / Back Link */}
      <div style={{ marginBottom: "24px" }}>
        <Link
          to="/customer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
      </div>

      {/* Store Hero Banner & Header Card */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        marginBottom: "40px"
      }}>
        {/* Banner Area */}
        <div style={{
          height: "200px",
          backgroundColor: "#1e293b",
          backgroundImage: store.shopPhotoUrl ? `url(${store.shopPhotoUrl})` : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.3) 100%)"
          }} />

          {/* Badges on Banner */}
          <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "10px" }}>
            <span style={{
              backgroundColor: "#16a34a",
              color: "white",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
            }}>
              <ShieldCheck size={16} /> VERIFIED STORE
            </span>

            {distanceStr && (
              <span style={{
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(4px)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <MapPin size={14} className="text-blue-400" /> {distanceStr} away
              </span>
            )}
          </div>
        </div>

        {/* Store Profile Body */}
        <div style={{ padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              backgroundColor: "#eff4ff",
              color: "#3867ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
              marginTop: "-60px",
              position: "relative",
              zIndex: 10
            }}>
              <Store size={36} />
            </div>

            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {store.businessType || "Retail Store"}
              </span>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "2px 0 6px", letterSpacing: "-0.5px" }}>
                {store.businessName}
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={15} color="#94a3b8" />
                {store.address ? `${store.address}, ${store.city}` : (store.city || "Available on LogiSphere")}
                {store.state ? `, ${store.state}` : ""}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Catalog Size</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                {products.length} {products.length === 1 ? "Product" : "Products"}
              </div>
            </div>
            <div style={{ height: "36px", width: "1px", backgroundColor: "#e2e8f0" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Fulfillment</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#059669" }}>
                Active & Ready
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShoppingBag size={22} color="#3867ff" />
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: 0 }}>
            Products from {store.businessName}
          </h2>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "60px 24px",
          textAlign: "center"
        }}>
          <Package size={48} className="mx-auto mb-3 text-gray-300" />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
            No products in catalog yet
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 20px" }}>
            This verified supplier is currently updating their product offerings.
          </p>
          <Link
            to="/customer/products"
            style={{
              padding: "10px 20px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            Explore Global Marketplace
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
          {products.map((product) => {
            const hasMultipleImages = product.imageUrls && product.imageUrls.length > 0;
            const primaryImage = hasMultipleImages ? product.imageUrls[0] : product.imageUrl;

            return (
              <Link
                key={product.id}
                to={`/customer/products/${product.id}`}
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                }}
              >
                {/* Product Image Area */}
                <div style={{ height: "200px", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "16px" }}>
                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={product.name}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <Package size={48} color="#cbd5e1" />
                  )}

                  {product.quantity <= 0 ? (
                    <span style={{
                      position: "absolute", top: "10px", right: "10px",
                      backgroundColor: "#fee2e2", color: "#b91c1c",
                      fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px"
                    }}>
                      Out of Stock
                    </span>
                  ) : product.quantity <= 5 ? (
                    <span style={{
                      position: "absolute", top: "10px", right: "10px",
                      backgroundColor: "#fef3c7", color: "#b45309",
                      fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px"
                    }}>
                      Only {product.quantity} left
                    </span>
                  ) : null}
                </div>

                {/* Product Info */}
                <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>
                    {product.category || "General"}
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 6px", lineHeight: 1.4 }}>
                    {product.name}
                  </h3>
                  <p style={{
                    fontSize: "13px", color: "#6b7280", margin: "0 0 16px",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>
                    {product.description}
                  </p>

                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                      ${Number(product.price).toFixed(2)}
                    </div>
                    <span style={{
                      fontSize: "13px", fontWeight: 600, color: "#3867ff",
                      display: "flex", alignItems: "center", gap: "4px"
                    }}>
                      Details <ExternalLink size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
