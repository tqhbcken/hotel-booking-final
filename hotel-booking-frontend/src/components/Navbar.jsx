import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuActive(false);
      }
    };

    if (menuActive) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuActive]);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Hotel Booking</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Trang chủ</Link>
        <Link to="/rooms" className="nav-link">Phòng</Link>
        {user ? (
          <div className={`user-menu ${menuActive ? 'active' : ''}`} ref={menuRef}>
            <span className="user-greeting" onClick={toggleMenu}>
              Xin chào, {user.fullName || user.username}
            </span>
            {menuActive && (
              <div className="menu-dropdown">
                <Link to="/profile" onClick={() => setMenuActive(false)}>Hồ sơ</Link>
                <Link to="/bookings" onClick={() => setMenuActive(false)}>Lịch sử đặt phòng</Link>
                <button onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-link">Đăng nhập</Link>
            <Link to="/register" className="nav-link">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;