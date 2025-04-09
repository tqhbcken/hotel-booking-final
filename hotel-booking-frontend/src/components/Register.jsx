import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    
    // Kiểm tra các điều kiện hợp lệ khác
    if (formData.username.trim() === "") {
      setError("Tên đăng nhập không được để trống");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Log dữ liệu trước khi gửi request
      console.log("Đang gửi dữ liệu đăng ký:", {
        username: formData.username,
        passwordLength: formData.password.length
      });
      
      // Đăng ký tài khoản
      const registerResponse = await axios.post("http://localhost:3333/api/auth/register", {
        username: formData.username.toLowerCase(),
        password: formData.password
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Kết quả đăng ký:", registerResponse.data);
      
      if (registerResponse.data && registerResponse.data.account && registerResponse.data.account.id) {
        // Thông báo đăng ký thành công
        alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập và cập nhật thông tin cá nhân trong mục Hồ sơ.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      
      // Log chi tiết hơn về lỗi
      if (err.response) {
        // Lỗi có response từ server
        console.error("Server response error:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        if (err.response.status === 400) {
          // Thường là lỗi người dùng đã tồn tại
          setError(err.response.data?.message || "Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.");
        } else if (err.response.status === 500) {
          // Lỗi database liên quan đến insertId
          if (err.response.data?.error?.includes("insertId")) {
            // Kiểm tra xem tài khoản có thực sự được tạo không
            try {
              // Thử đăng nhập với tài khoản vừa tạo
              await axios.post("http://localhost:3333/api/auth/login", {
                username: formData.username.toLowerCase(),
                password: formData.password
              });
              
              // Nếu đăng nhập thành công, tức là tài khoản đã được tạo
              alert("Tài khoản đã được tạo thành công mặc dù hệ thống báo lỗi. Vui lòng đăng nhập và cập nhật hồ sơ.");
              navigate("/login");
              return;
            } catch (loginErr) {
              // Nếu đăng nhập thất bại, hiển thị thông báo lỗi tương ứng
              if (loginErr.response?.status === 401) {
                setError("Dữ liệu có thể đã được thêm không đầy đủ. Vui lòng thử đăng ký lại với tên đăng nhập khác.");
              } else {
                setError("Lỗi khi tạo tài khoản trong database. Vui lòng thông báo cho quản trị viên.");
              }
            }
          } else {
            // Lỗi server khác
            setError("Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.");
          }
          console.error("Detailed error:", err.response.data);
        } else {
          // Lỗi khác
          setError(err.response.data?.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
        }
      } else if (err.request) {
        // Đã gửi request nhưng không nhận được response
        console.error("No response received:", err.request);
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại sau.");
      } else {
        // Lỗi khi thiết lập request
        console.error("Request setup error:", err.message);
        setError("Có lỗi xảy ra khi thiết lập yêu cầu. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <h2>Đăng ký tài khoản</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Thông tin đăng nhập</h3>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              pattern="[a-zA-Z0-9]+"
              title="Tên đăng nhập chỉ được chứa chữ cái và số, không có ký tự đặc biệt"
            />
            <small className="form-text">Chỉ chứa chữ cái và số, không có ký tự đặc biệt</small>
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            <small className="form-text">Tối thiểu 6 ký tự</small>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="register-btn">
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
      <div className="login-link">
        <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
      </div>
      <div className="register-note">
        <p>* Sau khi đăng ký, vui lòng đăng nhập và cập nhật thông tin cá nhân trong mục Hồ sơ.</p>
      </div>
    </div>
  );
};

export default Register; 