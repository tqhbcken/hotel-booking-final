import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component bảo vệ các route cần xác thực
const ProtectedRoute = ({ children }) => {
  const { user, loading, authChecked, checkTokenAndRefresh } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const verifyAuth = async () => {
      if (authChecked) {
        if (user) {
          // Đã có user, không cần kiểm tra thêm
          setIsAuthenticated(true);
          setIsChecking(false);
        } else {
          // Chưa có user, thử refresh token
          const hasToken = await checkTokenAndRefresh();
          setIsAuthenticated(hasToken);
          setIsChecking(false);
        }
      }
    };
    
    verifyAuth();
  }, [user, authChecked, checkTokenAndRefresh]);
  
  // Đang kiểm tra xác thực
  if (loading || isChecking) {
    return <div className="loading-overlay">Đang kiểm tra thông tin đăng nhập...</div>;
  }
  
  // Nếu không xác thực, chuyển hướng đến trang đăng nhập
  // Lưu lại URL hiện tại để có thể quay lại sau khi đăng nhập
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // Nếu đã xác thực, hiển thị nội dung component
  return children;
};

export default ProtectedRoute; 