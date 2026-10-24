import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../api/orderApi";
import { getUserLocation } from "../../utils/location";

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const activeLocation = getUserLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: activeLocation?.city || "",
    state: activeLocation?.state || "",
    pincode: ""
  });


  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: "800px", margin: "80px auto", textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
        <ShoppingBag size={48} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Your cart is empty</h2>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>Add items to your cart before proceeding to checkout.</p>
        <Link to="/customer/products" style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "#3867ff", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: 600 }}>
          Go to Catalog
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode} (Phone: ${formData.phone})`;

      const orderData = {
        customerId: parseInt(user.userId),
        customerName: formData.name,
        deliveryAddress: fullAddress,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      const response = await createOrder(orderData);
      clearCart();
      navigate("/customer/order-success", { state: { orderId: response.id, totalAmount: response.totalAmount, date: new Date().toISOString() } });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", gap: "8px", color: "#6b7280", cursor: "pointer", marginBottom: "30px", fontWeight: 500 }}
      >
        <ArrowLeft size={18} /> Back to Cart
      </button>

      <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "32px" }}>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "40px" }} className="checkout-grid">

        {/* Form Section */}
        <div>
          {error && (
            <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "12px", border: "1px solid #fecaca", marginBottom: "24px" }}>
              {error}
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmit} style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={20} color="#3867ff" /> Delivery Information
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Phone Number</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }} />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Street Address</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "32px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>State</label>
                <input required type="text" name="state" value={formData.state} onChange={handleChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Pincode</label>
                <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }} />
              </div>
            </div>

            <div style={{ backgroundColor: "#f3f4f6", padding: "16px", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "12px", color: "#4b5563", fontSize: "14px" }}>
              <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "#111827", display: "block", marginBottom: "4px" }}>Secure Checkout</strong>
                Your data is protected. For this phase, payment is handled offline via Invoice.
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", border: "1px solid #e5e7eb", position: "sticky", top: "100px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShoppingBag size={20} color="#3867ff" /> Order Summary
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px", maxHeight: "300px", overflowY: "auto", paddingRight: "10px" }}>
              {cartItems.map((item) => (
                <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ fontWeight: 500, color: "#374151" }}>{item.quantity}x</div>
                    <div style={{ color: "#4b5563" }}>
                      {item.product.name}
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>${item.product.price.toFixed(2)} each</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: "#111827" }}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#4b5563", marginBottom: "12px" }}>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#4b5563", marginBottom: "12px" }}>
                <span>Shipping</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>Free</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                <span style={{ fontSize: "18px", fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              style={{
                width: "100%", backgroundColor: loading ? "#9ca3af" : "#3867ff", color: "white", border: "none",
                padding: "16px", borderRadius: "12px", fontSize: "16px", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                cursor: loading ? "not-allowed" : "pointer", transition: "background-color 0.2s"
              }}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <><CreditCard size={18} /> Place Order - ${cartTotal.toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
