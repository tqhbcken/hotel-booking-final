import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../services/api/axiosClient";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    nation: "Vietnam",
    gender: "Male"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setProfileData({
          fullName: user.fullName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
          nation: user.nation || "Vietnam",
          gender: user.gender || "Male"
        });
        setError("");
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await axiosClient.put(`/customers/${user.CustomerID}`, {
        FullName: profileData.fullName,
        PhoneNumber: profileData.phoneNumber,
        Email: profileData.email,
        DateOfBirth: profileData.dateOfBirth || null,
        Nation: profileData.nation,
        Gender: profileData.gender
      });
      setSuccess("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Cập nhật hồ sơ thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.fullName) return <div>Đang tải...</div>;

  return (
    <div className="profile-container">
      <h2>Hồ sơ của tôi</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Họ và tên:</label>
          <input
            type="text"
            name="fullName"
            value={profileData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Số điện thoại:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Ngày sinh:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={profileData.dateOfBirth}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Giới tính:</label>
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleChange}
          >
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Quốc gia:</label>
          <input
            type="text"
            name="nation"
            value={profileData.nation}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit" disabled={loading} className="update-btn">
          {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
        </button>
      </form>
    </div>
  );
};

export default Profile; 