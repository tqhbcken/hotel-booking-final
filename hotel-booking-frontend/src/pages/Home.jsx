import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../services/api/axiosClient";

const Home = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState({});
  const [searchParams, setSearchParams] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const navigate = useNavigate();

  // Thêm biến cho đường dẫn hình ảnh placeholder và domain API
  const noImagePlaceholder = "http://localhost:3333/images/rooms/no-picture-available.jpg";
  const API_BASE_URL = "http://localhost:3333";

  // Hàm để tạo URL đầy đủ cho hình ảnh
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return noImagePlaceholder;
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        // Set a default limit to get featured rooms
        const response = await axiosClient.get("/rooms?limit=4");
        console.log("API response:", response.data);
        setFeaturedRooms(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch featured rooms:", err);
        setError("Không thể tải phòng nổi bật. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Kiểm tra ngày có hợp lệ không
    if (searchParams.checkIn && searchParams.checkOut) {
      const checkInDate = new Date(searchParams.checkIn);
      const checkOutDate = new Date(searchParams.checkOut);
      
      if (checkOutDate <= checkInDate) {
        alert("Ngày trả phòng phải sau ngày nhận phòng");
        return;
      }
    }
    
    // Chuyển hướng đến trang danh sách phòng với tham số tìm kiếm
    const queryParams = new URLSearchParams({
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests,
    }).toString();
    
    navigate(`/rooms?${queryParams}`);
  };

  // Phương thức để format giá an toàn
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0";
    }
    return parseFloat(price).toLocaleString("vi-VN");
  };

  // Xử lý sự kiện lỗi khi tải ảnh
  const handleImageError = (roomId) => {
    console.log("Lỗi tải ảnh cho phòng ID:", roomId);
    setImgError(prev => ({...prev, [roomId]: true}));
  };

  // Kiểm tra ID phòng có hợp lệ không
  const isValidRoomId = (id) => {
    return id !== undefined && id !== null && id !== '';
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Chào mừng đến với Hotel Booking</h1>
          <p>Khám phá những căn phòng tuyệt vời cho kỳ nghỉ của bạn</p>
          
          <div className="search-box">
            <h2>Tìm phòng</h2>
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-group">
                <label>Ngày nhận phòng:</label>
                <input
                  type="date"
                  name="checkIn"
                  value={searchParams.checkIn}
                  onChange={handleSearchChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày trả phòng:</label>
                <input
                  type="date"
                  name="checkOut"
                  value={searchParams.checkOut}
                  onChange={handleSearchChange}
                  min={searchParams.checkIn || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số lượng khách:</label>
                <input
                  type="number"
                  name="guests"
                  value={searchParams.guests}
                  onChange={handleSearchChange}
                  min="1"
                  required
                />
              </div>
              <button type="submit" className="search-btn">Tìm kiếm</button>
            </form>
          </div>
        </div>
      </div>

      <div className="featured-rooms">
        <h2>Phòng nổi bật</h2>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="room-grid">
            {featuredRooms.length > 0 ? (
              featuredRooms.map((room, index) => (
                <div key={room.RoomID || index} className="room-card">
                  <div className="room-image">
                    {/* Kiểm tra nếu có ảnh chính từ RoomImages */}
                    {room.RoomImages && room.RoomImages.length > 0 && room.RoomImages.find(img => img.IsPrimary) ? (
                      <img 
                        src={getFullImageUrl(room.RoomImages.find(img => img.IsPrimary).ImageURL)}
                        alt={room.RoomName || "Phòng"}
                        onError={(e) => {
                          console.log("Lỗi tải ảnh:", e.target.src);
                          e.target.onerror = null;
                          e.target.src = noImagePlaceholder;
                          handleImageError(room.RoomID);
                        }}
                      />
                    ) : room.ImageURL ? (
                      <img 
                        src={getFullImageUrl(room.ImageURL)}
                        alt={room.RoomName || "Phòng"}
                        onError={(e) => {
                          console.log("Lỗi tải ảnh:", e.target.src);
                          e.target.onerror = null;
                          e.target.src = noImagePlaceholder;
                          handleImageError(room.RoomID);
                        }}
                      />
                    ) : (
                      <div className="placeholder-image">Không có ảnh</div>
                    )}
                  </div>
                  <div className="room-info">
                    <h3>{room.RoomName || "Phòng không tên"}</h3>
                    <p className="room-price">{formatPrice(room.PricePerNight)} VND/đêm</p>
                    <p>Loại phòng: {room.RoomTypeName || "Không xác định"}</p>
                    {isValidRoomId(room.RoomID) ? (
                      <Link to={`/rooms/${room.RoomID}`} className="view-details-btn">
                        Xem chi tiết
                      </Link>
                    ) : (
                      <span className="view-details-btn disabled">Không có thông tin chi tiết</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>Không có phòng nào hiển thị</p>
            )}
          </div>
        )}
        <div className="view-all-container">
          <Link to="/rooms" className="view-all-btn">
            Xem tất cả phòng
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Tại sao chọn chúng tôi?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Giá cả hợp lý</h3>
            <p>Chúng tôi cam kết cung cấp giá tốt nhất cho khách hàng</p>
          </div>
          <div className="feature-card">
            <h3>Vị trí thuận tiện</h3>
            <p>Khách sạn của chúng tôi nằm ở vị trí trung tâm, thuận tiện di chuyển</p>
          </div>
          <div className="feature-card">
            <h3>Dịch vụ 24/7</h3>
            <p>Đội ngũ nhân viên luôn sẵn sàng phục vụ quý khách mọi lúc</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;