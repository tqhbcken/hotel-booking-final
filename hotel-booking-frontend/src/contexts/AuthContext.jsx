import React, { createContext, useState, useContext, useEffect } from "react";
import authApi from "../services/api/authApi";
import axiosClient from "../services/api/axiosClient";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Check if there's a token in localStorage during initialization
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!token && !refreshToken) {
        // Không có token hoặc refresh token
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      
      if (token) {
        try {
          const response = await authApi.getProfile();
          console.log("Auth check - Profile response:", response.data);
          
          // Lưu dữ liệu nguyên bản trả về từ API không cần chuyển đổi
          setUser(response.data);
          setLoading(false);
          setAuthChecked(true);
        } catch (error) {
          console.error("Authentication check failed:", error.response || error);
          
          // Nếu token không hợp lệ và có refresh token, thử refresh
          if (refreshToken && !isRefreshingToken) {
            await refreshAuthToken(refreshToken);
          } else {
            // Không có refresh token hoặc refresh đã thất bại
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setLoading(false);
            setAuthChecked(true);
          }
        }
      } else if (refreshToken && !isRefreshingToken) {
        // Có refresh token nhưng không có access token
        await refreshAuthToken(refreshToken);
      }
    };
    
    checkAuth();
  }, []);
  
  // Hàm refresh token
  const refreshAuthToken = async (refreshToken) => {
    if (isRefreshingToken) return;
    
    setIsRefreshingToken(true);
    try {
      const response = await authApi.refreshToken(refreshToken);
      const { accessToken, newRefreshToken } = response.data;
      
      localStorage.setItem("accessToken", accessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      
      // Lấy thông tin user với token mới
      const profileResponse = await authApi.getProfile();
      setUser(profileResponse.data);
    } catch (error) {
      console.error("Failed to refresh token:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    } finally {
      setIsRefreshingToken(false);
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      // Backend returns: token, refreshToken, role
      const { token, refreshToken, role } = response.data;
      
      console.log("Login response:", response.data);
      
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      
      // Get user profile after login
      const profileResponse = await authApi.getProfile();
      console.log("Profile response:", profileResponse.data);
      
      // Đảm bảo CustomerID có sẵn
      let userData = { ...profileResponse.data, role };
      
      // Đảm bảo cả hai kiểu viết được lưu đúng
      if (userData.customer && userData.customer.CustomerID) {
        userData.CustomerID = userData.customer.CustomerID;
        userData.customerId = userData.customer.CustomerID;
      }
      
      // Kiểm tra nếu customerId ở root level
      if (!userData.CustomerID && userData.customerId) {
        userData.CustomerID = userData.customerId;
      }

      // Kiểm tra trường hợp ngược lại
      if (!userData.customerId && userData.CustomerID) {
        userData.customerId = userData.CustomerID;
      }
      
      console.log("Final user data being set:", userData);
      setUser(userData);
      
      return profileResponse.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Chỉ gọi API logout nếu có user đang đăng nhập
      if (user) {
        await authApi.logout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };
  
  // Kiểm tra và tự động refresh token nếu cần
  const checkTokenAndRefresh = async () => {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!token && refreshToken && !isRefreshingToken) {
      // Nếu không có access token nhưng có refresh token
      await refreshAuthToken(refreshToken);
      return true;
    }
    
    return !!token; // Trả về true nếu có token, false nếu không
  };

  const value = {
    user,
    login,
    logout,
    loading,
    authChecked,
    checkTokenAndRefresh,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);