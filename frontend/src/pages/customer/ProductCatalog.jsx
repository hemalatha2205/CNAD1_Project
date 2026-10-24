import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Package, AlertCircle, MapPin, Navigation, ShoppingCart, Check, ArrowUpDown, Store } from "lucide-react";
import { getProducts, searchProducts, getProductsByCategory } from "../../api/productApi";
import { useCart } from "../../context/CartContext";
import {
  getUserLocation,
  setUserLocation,
  requestBrowserGpsLocation,
  calculateDistance,
  formatDistance,
  DEFAULT_CITIES
} from "../../utils/location";

const PRESET_CATEGORIES = [
  "All",
  "Electronics",
  "Groceries",
  "Clothing",
  "Health & Pharmacy",
  "Home & Living",
  "Books",
  "Industrial & Hardware"
];

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(PRESET_CATEGORIES);

  const querySearch = searchParams.get("search") || "";
  const queryCategory = searchParams.get("category") || "All";
  const viewMode = searchParams.get("view") || "products";

  const [searchInput, setSearchInput] = useState(querySearch);
  const [sortBy, setSortBy] = useState("distance"); // 'distance', 'price_asc', 'price_desc', 'name', 'stock'
  const [userLocation, setLocationState] = useState(getUserLocation());
  const [locPromptOpen, setLocPromptOpen] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState({});

  useEffect(() => {
    const handleLocationChange = (e) => {
      if (e.detail) {
        setLocationState(e.detail);
      }
    };
    window.addEventListener("logisphere_location_changed", handleLocationChange);
    return () => window.removeEventListener("logisphere_location_changed", handleLocationChange);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [querySearch, queryCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      if (querySearch) {
        data = await searchProducts(querySearch);
      } else if (queryCategory !== "All") {
        data = await getProductsByCategory(queryCategory);
      } else {
        data = await getProducts();
      }
      setProducts(data || []);

      // Extract unique categories from actual products
      if (data && data.length > 0) {
        const foundCategories = Array.from(new Set(data.map(p => p.category).filter(Boolean)));
        const combined = ["All", ...Array.from(new Set([...foundCategories, ...PRESET_CATEGORIES.slice(1)]))];
        setCategories(combined);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchInput.trim()) {
        prev.set("search", searchInput);
        prev.delete("category");
      } else {
        prev.delete("search");
      }
      return prev;
    });
  };

  const handleCategoryClick = (cat) => {
    setSearchParams(prev => {
      if (cat === "All") {
        prev.delete("category");
      } else {
        prev.set("category", cat);
      }
      prev.delete("search");
      setSearchInput("");
      return prev;
    });
  };

  const handleGpsDetect = async () => {
    try {
      setDetectingGps(true);
      const loc = await requestBrowserGpsLocation();
      setLocationState(loc);
      setLocPromptOpen(false);
    } catch (err) {
      alert("GPS detection failed: " + err.message + ". Please choose a manual city.");
    } finally {
      setDetectingGps(false);
    }
  };

  const handleCitySelect = (cityObj) => {
    const loc = {
      label: `${cityObj.name}, ${cityObj.state}`,
      city: cityObj.name,
      latitude: cityObj.latitude,
      longitude: cityObj.longitude,
      isGps: false
    };
    setUserLocation(loc);
    setLocationState(loc);
    setLocPromptOpen(false);
  };

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product || product.quantity < 1) return;
    addToCart(product, 1);
    setAddedItemMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  // Compute distance for all products based on active user location
  const productsWithDistance = products.map(product => {
    const dist = calculateDistance(
      userLocation?.latitude,
      userLocation?.longitude,
      product.latitude,
      product.longitude
    );
    return {
      ...product,
      distanceKm: dist
    };
  });

  // Sort products
  const sortedProducts = [...productsWithDistance].sort((a, b) => {
    if (sortBy === "distance") {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    }
    if (sortBy === "price_asc") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === "price_desc") {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortBy === "stock") {
      return (b.quantity || 0) - (a.quantity || 0);
    }
    if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
  });

  if (viewMode === "categories") {
    return (
      <div style={{ padding: "60px 24px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontSize: "36px", letterSpacing: "-1px", marginBottom: "40px" }}>All Categories</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
          {categories.filter(c => c !== "All").map(cat => (
            <Link key={cat} to={`/customer/products?category=${encodeURIComponent(cat)}`} style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "200px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb",
              textDecoration: "none", color: "#111827", transition: "all 0.2s",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
            }}>
              <Package size={48} color="#3867ff" style={{ marginBottom: "16px" }} />
              <h3 style={{ fontSize: "20px" }}>{cat}</h3>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px 24px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
      {/* Geolocation Top Bar */}
      <div style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "14px 20px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "#eff6ff", color: "#2563eb", padding: "8px", borderRadius: "8px" }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Delivering to
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              {userLocation?.label || "Set Location"} {userLocation?.isGps && <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>(Live GPS)</span>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleGpsDetect}
            disabled={detectingGps}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer"
            }}
          >
            <Navigation size={15} className="text-blue-600" />
            {detectingGps ? "Locating..." : "Use GPS"}
          </button>

          <button
            onClick={() => setLocPromptOpen(!locPromptOpen)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #3867ff",
              background: "#eff6ff",
              fontSize: "13px",
              fontWeight: 600,
              color: "#3867ff",
              cursor: "pointer"
            }}
          >
            Change City
          </button>
        </div>
      </div>

      {/* Location Dropdown Modal */}
      {locPromptOpen && (
        <div style={{
          background: "white",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "24px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "#0f172a" }}>
            Select Your Delivery Location (for nearby calculation)
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
            {DEFAULT_CITIES.map(c => (
              <button
                key={c.name}
                onClick={() => handleCitySelect(c)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: userLocation?.city === c.name ? "2px solid #3867ff" : "1px solid #e2e8f0",
                  background: userLocation?.city === c.name ? "#eff6ff" : "#f8fafc",
                  fontSize: "13px",
                  fontWeight: userLocation?.city === c.name ? 700 : 500,
                  color: userLocation?.city === c.name ? "#1d4ed8" : "#334155",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <div>{c.name}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>{c.state}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "36px" }}>
        {/* Sidebar Filters */}
        <div style={{ width: "240px", flexShrink: 0 }} className="hide-on-mobile">
          <div style={{ position: "sticky", top: "100px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={18} /> Filters
            </h2>

            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "12px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                Categories
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                {categories.map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: "8px 12px",
                        width: "100%",
                        textAlign: "left",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        backgroundColor: queryCategory === cat && !querySearch ? "#eff6ff" : "transparent",
                        color: queryCategory === cat && !querySearch ? "#2563eb" : "#4b5563",
                        fontWeight: queryCategory === cat && !querySearch ? 700 : 500
                      }}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Products Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", margin: 0 }}>
                {querySearch ? `Search: "${querySearch}"` : (queryCategory !== "All" ? `${queryCategory}` : "Marketplace")}
              </h1>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
                Showing {sortedProducts.length} verified item{sortedProducts.length === 1 ? "" : "s"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Sort By Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", padding: "6px 12px", borderRadius: "10px", border: "1px solid #d1d5db" }}>
                <ArrowUpDown size={15} className="text-gray-500" />
                <span style={{ fontSize: "13px", color: "#6b7280" }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", fontWeight: 600, color: "#111827", cursor: "pointer" }}
                >
                  <option value="distance">Nearest to Me</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock">In Stock First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", width: "260px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 10px 8px 36px",
                      borderRadius: "8px", border: "1px solid #d1d5db", outline: "none",
                      fontSize: "14px"
                    }}
                  />
                </div>
              </form>
            </div>
          </div>

          {error && (
            <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} style={{ height: "360px", backgroundColor: "#f3f4f6", borderRadius: "16px", animation: "pulse 1.5s infinite" }}></div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
              {sortedProducts.map(product => {
                const distanceStr = formatDistance(product.distanceKm);
                const hasImages = (product.images && product.images.length > 0) || product.imageUrl;
                const primaryImage = product.imageUrl || (product.images && product.images[0]);

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
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                    }}
                  >
                    {/* Product Image */}
                    <div style={{ height: "200px", backgroundColor: "#f9fafb", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {hasImages ? (
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
                      <div style={{ display: hasImages ? "none" : "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#9ca3af" }}>
                        <Package size={48} />
                      </div>

                      {/* Distance Pill */}
                      {distanceStr && (
                        <div style={{
                          position: "absolute",
                          bottom: "8px",
                          left: "8px",
                          backgroundColor: "rgba(17, 24, 39, 0.85)",
                          backdropFilter: "blur(4px)",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <MapPin size={11} className="text-blue-400" />
                          {distanceStr}
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
                          {product.category}
                        </span>
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 7px",
                          borderRadius: "6px",
                          backgroundColor: product.quantity > 0 ? "#ecfdf5" : "#fef2f2",
                          color: product.quantity > 0 ? "#059669" : "#dc2626",
                          fontWeight: 700
                        }}>
                          {product.quantity > 0 ? `${product.quantity} in stock` : "Out of Stock"}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: "0 0 8px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {product.name}
                      </h3>

                      {/* Shop Name & Location */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#4b5563", marginBottom: "12px" }}>
                        <Store size={13} className="text-indigo-600" />
                        <span style={{ fontWeight: 600, color: "#374151" }}>{product.supplierName || "Direct Supplier"}</span>
                        {product.city && <span style={{ color: "#9ca3af" }}>&bull; {product.city}</span>}
                      </div>

                      {/* Price & Action */}
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>Price</span>
                          <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                            ${product.price?.toFixed(2)}
                          </div>
                        </div>

                        {product.quantity > 0 && (
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            style={{
                              backgroundColor: addedItemMap[product.id] ? "#10b981" : "#3867ff",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontWeight: 600,
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer",
                              transition: "background 0.2s"
                            }}
                          >
                            {addedItemMap[product.id] ? <><Check size={14} /> Added</> : <><ShoppingCart size={14} /> Add</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 20px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
              <Package size={52} color="#9ca3af" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>No products found</h3>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Try adjusting your search keywords or browsing other categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
