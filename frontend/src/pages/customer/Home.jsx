import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Package, Truck, ShieldCheck, Zap, Store, MapPin, Navigation } from "lucide-react";
import { getProducts } from "../../api/productApi";
import { getApprovedSuppliers } from "../../api/authApi";
import { getUserLocation, calculateDistance, formatDistance } from "../../utils/location";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [approvedStores, setApprovedStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userLocation = getUserLocation();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProducts().catch(err => {
        console.error("Failed to load products", err);
        return [];
      }),
      getApprovedSuppliers().catch(err => {
        console.error("Failed to load approved suppliers", err);
        return [];
      })
    ]).then(([products, suppliers]) => {
      setFeaturedProducts((products || []).slice(0, 4));
      setApprovedStores(suppliers || []);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: "Electronics", color: "#3867ff", desc: "Gadgets, Audio & Accessories", icon: "⚡" },
    { name: "Groceries", color: "#12b76a", desc: "Fresh Produce & Essentials", icon: "🍎" },
    { name: "Clothing", color: "#7a5af8", desc: "Apparel & Fashion", icon: "👕" },
    { name: "Health & Pharmacy", color: "#06b6d4", desc: "Wellness & Medications", icon: "💊" },
    { name: "Home & Living", color: "#f79009", desc: "Decor & Everyday Living", icon: "🏠" },
    { name: "Industrial & Hardware", color: "#64748b", desc: "Tools & Equipment", icon: "🔧" }
  ];

  // Calculate distance for approved stores
  const storesWithDistance = approvedStores.map(store => {
    const dist = calculateDistance(
      userLocation?.latitude,
      userLocation?.longitude,
      store.latitude,
      store.longitude
    );
    return { ...store, distanceKm: dist };
  }).sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return 0;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  return (
    <div style={{ width: "100%" }}>
      {/* Hero Section */}
      <section style={{
        backgroundColor: "#101828", color: "white", padding: "80px 24px",
        background: "radial-gradient(circle at 80% 30%, rgba(56, 103, 255, 0.25), transparent 45%), #101828"
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "60px", alignItems: "center" }} className="hero-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(56, 103, 255, 0.2)", color: "#91a9ff", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "20px" }}>
              <Navigation size={13} />
              <span>DELIVERING TO {userLocation?.label ? userLocation.label.toUpperCase() : "YOUR DOORSTEP"}</span>
            </div>

            <h1 style={{ fontSize: "52px", lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-1.5px" }}>
              Shop Local & Global.<br />Deliver <strong style={{ color: "#91a9ff", fontWeight: "inherit" }}>Smarter.</strong>
            </h1>
            <p style={{ color: "#98a2b3", fontSize: "17px", lineHeight: 1.6, marginBottom: "36px", maxWidth: "500px" }}>
              Discover verified nearby shops and quality products. Real-time GPS distance calculation and live parcel tracking.
            </p>

            <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", maxWidth: "500px" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={20} color="#98a2b3" style={{ position: "absolute", left: "16px", top: "14px" }} />
                <input
                  type="text"
                  placeholder="Search products, brands, or nearby stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 14px 14px 45px",
                    borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", outline: "none",
                    fontSize: "15px", backgroundColor: "rgba(255,255,255,0.95)", color: "#111827"
                  }}
                />
              </div>
              <button type="submit" style={{
                backgroundColor: "#3867ff", color: "white", border: "none",
                padding: "0 28px", borderRadius: "12px", fontWeight: 700, cursor: "pointer",
                transition: "background-color 0.2s", fontSize: "15px"
              }}>
                Search
              </button>
            </form>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Truck size={28} color="#91a9ff" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "6px" }}>Fast Delivery</h3>
              <p style={{ color: "#98a2b3", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>Smart dispatch connects your order directly to nearby delivery partners.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)", transform: "translateY(20px)" }}>
              <ShieldCheck size={28} color="#12b76a" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "6px" }}>Verified Stores</h3>
              <p style={{ color: "#98a2b3", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>All suppliers are verified with trade licenses and GST registrations.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Store size={28} color="#f79009" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "6px" }}>Live Coordinates</h3>
              <p style={{ color: "#98a2b3", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>Accurate GPS distance from shop to your doorstep with Haversine formula.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)", transform: "translateY(20px)" }}>
              <Zap size={28} color="#7a5af8" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "6px" }}>Real-time Tracking</h3>
              <p style={{ color: "#98a2b3", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>Synchronized Kafka events stream instant delivery progress updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Nearby Stores Section */}
      <section style={{ padding: "70px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#3867ff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                <Store size={16} /> Verified Suppliers & Shops
              </div>
              <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
                Nearby Verified Stores
              </h2>
            </div>
            <Link to="/customer/products" style={{ color: "#3867ff", textDecoration: "none", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              Explore All <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {storesWithDistance.length > 0 ? (
              storesWithDistance.map(store => {
                const distStr = formatDistance(store.distanceKm);
                return (
                  <div
                    key={store.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)";
                    }}
                  >
                    <div style={{ height: "140px", backgroundColor: "#f1f5f9", position: "relative", overflow: "hidden" }}>
                      {store.shopPhotoUrl ? (
                        <img
                          src={store.shopPhotoUrl}
                          alt={store.businessName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#94a3b8" }}>
                          <Store size={48} />
                        </div>
                      )}

                      <div style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        backgroundColor: "#16a34a",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <ShieldCheck size={12} /> VERIFIED
                      </div>

                      {distStr && (
                        <div style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "12px",
                          backgroundColor: "rgba(15, 23, 42, 0.85)",
                          backdropFilter: "blur(4px)",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <MapPin size={11} className="text-blue-400" />
                          {distStr}
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                        {store.businessType || "Retail Store"}
                      </div>

                      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                        {store.businessName}
                      </h3>

                      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: 1.5 }}>
                        {store.address ? `${store.address}, ${store.city}` : (store.city || "Available on LogiSphere")}
                      </p>

                      <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                          Open for Orders
                        </span>
                        <Link
                          to={`/customer/shops/${store.id}`}
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#3867ff",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          Visit Store <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                <Store size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "#64748b", margin: 0 }}>Approved stores will appear here once verified by Admin.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: "70px 24px", backgroundColor: "#fff" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
            <div>
              <div style={{ color: "#3867ff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Curated Selection
              </div>
              <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
                Featured Products
              </h2>
            </div>
            <Link to="/customer/products" style={{ color: "#3867ff", textDecoration: "none", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              Shop All <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => {
                const primaryImage = product.imageUrl || (product.images && product.images[0]);
                const distStr = formatDistance(calculateDistance(
                  userLocation?.latitude,
                  userLocation?.longitude,
                  product.latitude,
                  product.longitude
                ));

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
                      color: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ height: "190px", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div style={{ display: primaryImage ? "none" : "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#9ca3af" }}>
                        <Package size={52} />
                      </div>

                      {distStr && (
                        <span style={{
                          position: "absolute",
                          bottom: "8px",
                          left: "8px",
                          backgroundColor: "rgba(17, 24, 39, 0.8)",
                          color: "white",
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "4px"
                        }}>
                          {distStr}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                        {product.category} &bull; {product.supplierName || "Verified Shop"}
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 12px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {product.name}
                      </h3>
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                          ${product.price?.toFixed(2)}
                        </div>
                        <div style={{ fontSize: "12px", color: product.quantity > 0 ? "#059669" : "#dc2626", fontWeight: 600 }}>
                          {product.quantity > 0 ? `${product.quantity} in stock` : "Out of Stock"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px", color: "#6b7280" }}>
                <Package size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p>No featured products available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section style={{ padding: "70px 24px", backgroundColor: "#f9fafb" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px" }}>
            <div>
              <div style={{ color: "#3867ff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Browse by Department
              </div>
              <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
                Popular Categories
              </h2>
            </div>
            <Link to="/customer/products?view=categories" style={{ color: "#3867ff", textDecoration: "none", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              All Categories <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/customer/products?category=${encodeURIComponent(cat.name)}`}
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  padding: "24px",
                  background: `linear-gradient(135deg, #1e293b, ${cat.color}dd)`,
                  textDecoration: "none",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "150px",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "28px" }}>{cat.icon}</div>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px" }}>{cat.name}</h3>
                  <p style={{ opacity: 0.85, fontSize: "13px", margin: 0 }}>{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
