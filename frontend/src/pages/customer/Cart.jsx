import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, Package } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 24px", width: "100%", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "24px", backgroundColor: "#f3f4f6", borderRadius: "50%", marginBottom: "24px" }}>
          <ShoppingCart size={48} color="#9ca3af" />
        </div>
        <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "16px" }}>Your cart is empty</h1>
        <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
          Looks like you haven't added anything to your cart yet. Browse our catalog to find what you need.
        </p>
        <Link to="/customer/products" style={{
          display: "inline-block", padding: "14px 28px", backgroundColor: "#3867ff", color: "white",
          textDecoration: "none", borderRadius: "12px", fontWeight: 600, fontSize: "16px"
        }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
      <h1 style={{ fontSize: "32px", letterSpacing: "-1px", marginBottom: "32px" }}>Shopping Cart</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "40px" }} className="cart-grid">
        {/* Cart Items */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600 }}>{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</h2>
            <button onClick={clearCart} style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", fontWeight: 500, fontSize: "14px" }}>
              Clear Cart
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {cartItems.map((item) => {
              const itemImg = item.product.imageUrl || (item.product.images && item.product.images[0]);
              return (
                <div key={item.product.id} style={{ display: "flex", gap: "20px", padding: "20px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb" }} className="cart-item">
                  <Link to={`/customer/products/${item.product.id}`} style={{ width: "100px", height: "100px", backgroundColor: "#f9fafb", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f3f4f6", overflow: "hidden", flexShrink: 0 }}>
                    {itemImg ? (
                      <img src={itemImg} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <Package size={32} color="#d1d5db" />
                    )}
                  </Link>


                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <Link to={`/customer/products/${item.product.id}`} style={{ textDecoration: "none", color: "#111827", fontSize: "18px", fontWeight: 600, paddingRight: "20px" }}>
                      {item.product.name}
                    </Link>
                    <div style={{ fontSize: "18px", fontWeight: 700 }}>${(item.product.price * item.quantity).toFixed(2)}</div>
                  </div>

                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
                    {item.product.category} &bull; {item.product.brand}
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden", backgroundColor: "white" }}>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ padding: "8px 12px", background: "transparent", border: "none", cursor: item.quantity > 1 ? "pointer" : "not-allowed", color: item.quantity > 1 ? "#111827" : "#d1d5db" }}>
                        <Minus size={14} />
                      </button>
                      <div style={{ width: "30px", textAlign: "center", fontWeight: 600, fontSize: "14px" }}>
                        {item.quantity}
                      </div>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ padding: "8px 12px", background: "transparent", border: "none", cursor: item.quantity < item.product.quantity ? "pointer" : "not-allowed", color: item.quantity < item.product.quantity ? "#111827" : "#d1d5db" }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>

                  {item.quantity === item.product.quantity && (
                    <div style={{ fontSize: "12px", color: "#d92d20", marginTop: "12px", fontWeight: 500 }}>
                      Maximum available quantity reached
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb", position: "sticky", top: "100px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Order Summary</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#4b5563" }}>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#4b5563" }}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#4b5563" }}>
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "18px", fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>${cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate("/customer/checkout")}
              style={{
                width: "100%", backgroundColor: "#3867ff", color: "white", border: "none",
                padding: "16px", borderRadius: "12px", fontSize: "16px", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                cursor: "pointer", transition: "background-color 0.2s"
              }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Link to="/customer/products" style={{ color: "#6b7280", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
          .cart-item {
            flex-direction: column;
          }
          .cart-item > a {
            width: 100% !important;
            height: 200px !important;
          }
        }
      `}</style>
    </div>
  );
}
