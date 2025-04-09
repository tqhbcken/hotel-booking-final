import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract redirect URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";
  const expired = searchParams.get("expired");

  // Nếu đã đăng nhập, chuyển hướng đến trang được yêu cầu
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  // Hiển thị thông báo nếu token hết hạn
  useEffect(() => {
    if (expired === "true") {
      setError("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }, [expired]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(credentials);
      // Đăng nhập thành công, chuyển hướng đến redirect URL
      navigate(redirect);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Tên đăng nhập:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
      <div className="register-link">
        Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
      </div>
    </div>
  );
};

export default Login;