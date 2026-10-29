import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

/**
 * Read initial auth state from localStorage (runs once, synchronously).
 */
function getInitialUser() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  if (token && userId && role) {
    return { token, userId, email, role, name };
  }

  return null;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [loading] = useState(false);

  const login = (data) => {
    const token = data.token;
    const userId = String(data.userId);
    const email = data.email;
    const role = data.role;
    const name = data.name;

    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name);

    setUser({ token, userId, email, role, name });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    setUser(null);
  };

  const isAuthenticated = !!user?.token;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
