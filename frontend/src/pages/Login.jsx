import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorHandler";

const ROLE_PATHS = {
  ADMIN: "/admin",
  SUPPLIER: "/supplier",
  CUSTOMER: "/customer",
  DELIVERY_PERSON: "/delivery",
};

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(ROLE_PATHS[user.role] || "/customer");
    }
  }, [isAuthenticated, user, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      const token = data.token;

      if (!token) {
        throw new Error("Login successful but JWT token was not returned.");
      }

      // Use AuthContext login
      login(data);

      const role = (data.role || "CUSTOMER").toUpperCase();
      const path = ROLE_PATHS[role] || "/customer";
      navigate(path);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-visual">

        <div className="login-brand">
          <div className="logo-icon">
            <Truck size={22} />
          </div>

          <span>
            Logi<span>Sphere</span>
          </span>
        </div>

        <div className="login-visual-content">

          <div className="login-badge">
            <span></span>
            Adaptive Cloud Logistics
          </div>

          <h1>
            Move smarter.
            <br />
            <strong>Deliver better.</strong>
          </h1>

          <p>
            One intelligent platform to manage products, inventory,
            orders, shipments and deliveries.
          </p>

          <div className="login-stat-row">

            <div>
              <strong>10K+</strong>
              <span>Products</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Tracking</span>
            </div>

            <div>
              <strong>99.9%</strong>
              <span>Uptime</span>
            </div>

          </div>

        </div>

      </div>

      <div className="login-form-area">

        <div className="login-card">

          <div className="mobile-login-logo">
            <div className="logo-icon">
              <Truck size={21} />
            </div>

            <span>
              Logi<span>Sphere</span>
            </span>
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>

            <p>
              Sign in to continue to your LogiSphere account.
            </p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <label>Email address</label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label>Password</label>

            <div className="input-wrapper">

              <Lock size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            <div className="login-options">

              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="forgot"
              >
                Forgot password?
              </button>

            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="register-text">
            Don't have an account?

            <Link to="/register">
              Create an account
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
