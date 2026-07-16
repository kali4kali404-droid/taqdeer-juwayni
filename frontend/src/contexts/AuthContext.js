import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // ================= INIT =================
  useEffect(() => {
    const init = async () => {
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await fetchUser();
      } else {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  // ================= GET USER =================
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/auth/me`);
      setUser(res.data);
    } catch (err) {
      console.log("fetchUser error:", err?.response?.data || err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =================
  const login = async ({ username, password }) => {
    try {
      const res = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });

      const { access_token, user: userData } = res.data;

      localStorage.setItem("token", access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setToken(access_token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      console.log("Login error:", err?.response?.data || err.message);

      return {
        success: false,
        error: err?.response?.data?.detail || "خطأ في تسجيل الدخول",
      };
    }
  };

  // ================= STUDENT LOGIN =================
  const loginStudent = async (data) => {
    try {
      const res = await axios.post(`${API}/auth/student-login`, data);

      const { access_token, user: userData } = res.data;

      localStorage.setItem("token", access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setToken(access_token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      console.log("Student login error:", err?.response?.data || err.message);

      return {
        success: false,
        error: err?.response?.data?.detail || "خطأ في دخول الطالب",
      };
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginStudent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};