import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import CustomerLayout from "./components/customer/CustomerLayout";
import Home from "./pages/customer/Home";
import ProductCatalog from "./pages/customer/ProductCatalog";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderSuccess from "./pages/customer/OrderSuccess";
import MyOrders from "./pages/customer/MyOrders";
import OrderDetails from "./pages/customer/OrderDetails";
import TrackShipment from "./pages/customer/TrackShipment";
import "./index.css";
import DeliveryLayout from "./components/delivery/DeliveryLayout";
import DeliveryDashboard from "./pages/delivery/Dashboard";
import Assignments from "./pages/delivery/Assignments";
import AssignmentDetails from "./pages/delivery/AssignmentDetails";
import Completed from "./pages/delivery/Completed";

import SupplierLayout from "./components/supplier/SupplierLayout";
import SupplierDashboard from "./pages/supplier/Dashboard";
import SupplierProducts from "./pages/supplier/MyProducts";
import SupplierProductForm from "./pages/supplier/ProductForm";
import SupplierInventory from "./pages/supplier/Inventory";
import SupplierOrders from "./pages/supplier/Orders";
import SupplierProfile from "./pages/supplier/Profile";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminSuppliers from "./pages/admin/Suppliers";
import AdminProducts from "./pages/admin/Products";
import AdminInventory from "./pages/admin/Inventory";
import AdminOrders from "./pages/admin/Orders";
import AdminShipments from "./pages/admin/Shipments";
import AdminDeliveries from "./pages/admin/Deliveries";
import AdminAlerts from "./pages/admin/Alerts";
import AdminAnalytics from "./pages/admin/Analytics";
import AccountSettings from "./pages/AccountSettings";
import ShopDetails from "./pages/customer/ShopDetails";

const ROLE_PATHS = {
  ADMIN: "/admin",
  SUPPLIER: "/supplier",
  CUSTOMER: "/customer",
  DELIVERY_PERSON: "/delivery",
};

function Landing() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role) {
    return <Navigate to={ROLE_PATHS[user.role] || "/customer"} replace />;
  }

  return (
    <div style={{ padding: "40px", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f9fafb" }}>
      <h1 style={{ fontSize: "48px", marginBottom: "16px", letterSpacing: "-1px" }}>LogiSphere</h1>
      <p style={{ fontSize: "20px", color: "#6b7280", marginBottom: "40px" }}>Smart Logistics. Delivered Smarter.</p>
      <a href="/login" style={{
        padding: "14px 28px", background: "#3867ff", color: "white",
        textDecoration: "none", borderRadius: "12px", fontWeight: 600, fontSize: "16px"
      }}>
        Go to Login
      </a>
    </div>
  );
}

function DashboardPlaceholder({ title }) {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1>LogiSphere - {title}</h1>
          <p style={{ color: "#667085", marginTop: "4px" }}>
            Welcome, {user?.name || user?.email} ({user?.role})
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          style={{ padding: "10px 20px", background: "#d92d20", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
        >
          Logout
        </button>
      </div>
      <p>Dashboard will be built in future phases.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Customer Portal */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <CartProvider>
              <CustomerLayout />
            </CartProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="products" element={<ProductCatalog />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="orders/:id/tracking" element={<TrackShipment />} />
        <Route path="shops/:id" element={<ShopDetails />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      {/* Other Roles */}
            {/* Supplier Portal */}
      <Route
        path="/supplier"
        element={
          <ProtectedRoute allowedRoles={["SUPPLIER"]}>
            <SupplierLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SupplierDashboard />} />
        <Route path="products" element={<SupplierProducts />} />
        <Route path="products/new" element={<SupplierProductForm />} />
        <Route path="products/:id/edit" element={<SupplierProductForm />} />
        <Route path="inventory" element={<SupplierInventory />} />
        <Route path="orders" element={<SupplierOrders />} />
        <Route path="profile" element={<SupplierProfile />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="suppliers" element={<AdminSuppliers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="shipments" element={<AdminShipments />} />
        <Route path="deliveries" element={<AdminDeliveries />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
      {/* Delivery Portal */}
      <Route
        path="/delivery"
        element={
          <ProtectedRoute allowedRoles={["DELIVERY_PERSON"]}>
            <DeliveryLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeliveryDashboard />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="assignments/:id" element={<AssignmentDetails />} />
        <Route path="completed" element={<Completed />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
