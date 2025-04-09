import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosClient from "../services/api/axiosClient";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgErrors, setImgErrors] = useState({});
  const [searchParams, setSearchParams] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  
  // Lấy query parameters từ URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const noImagePlaceholder = "http://localhost:3333/images/rooms/no-picture-available.jpg";
  const API_BASE_URL = "http://localhost:3333";

  // Hàm để tạo URL đầy đủ cho hình ảnh
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return noImagePlaceholder;
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  useEffect(() => {
    // Lấy các tham số tìm kiếm từ URL
    const checkIn = queryParams.get("checkIn") || "";
    const checkOut = queryParams.get("checkOut") || "";
    const guests = queryParams.get("guests") || 1;

    // Cập nhật state với tham số tìm kiếm
    setSearchParams({
      checkIn,
      checkOut,
      guests
    });

    const fetchRooms = async () => {
      try {
        let endpoint = "/rooms";
        
        // Thêm tham số tìm kiếm vào API request nếu có
        if (checkIn && checkOut) {
          endpoint += `?checkIn=${checkIn}&checkOut=${checkOut}`;
          if (guests) {
            endpoint += `&guests=${guests}`;
          }
        }
        
        console.log("Requesting rooms with endpoint:", endpoint);
        const response = await axiosClient.get(endpoint);
        console.log("Rooms API response:", response.data);
        setRooms(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        setError("Không thể tải danh sách phòng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [location.search]); // Thêm location.search vào dependencies để re-fetch khi URL thay đổi

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
    setImgErrors(prev => ({...prev, [roomId]: true}));
  };

  // Kiểm tra ID phòng có hợp lệ không
  const isValidRoomId = (id) => {
    return id !== undefined && id !== null && id !== '';
  };

  // Hiển thị thông tin tìm kiếm
  const renderSearchInfo = () => {
    if (!searchParams.checkIn && !searchParams.checkOut) {
      return null;
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    };
    
    return (
      <div className="search-info">
        <h3>Kết quả tìm kiếm:</h3>
        <p>
          {searchParams.checkIn && searchParams.checkOut ? 
            `Ngày ${formatDate(searchParams.checkIn)} đến ${formatDate(searchParams.checkOut)}` : ""}
          {searchParams.guests && searchParams.guests > 1 ? `, ${searchParams.guests} khách` : ""}
        </p>
      </div>
    );
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="room-list">
      <h2>Danh sách phòng</h2>
      
      {renderSearchInfo()}
      
      {rooms.length === 0 ? (
        <div className="no-rooms">
          <p>Không tìm thấy phòng nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
          <Link to="/" className="back-btn">Quay lại trang chủ</Link>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((room, index) => (
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
                <p>Giá: {formatPrice(room.PricePerNight)} VND/đêm</p>
                <p>Loại phòng: {room.RoomTypeName || "Không xác định"}</p>
                <p>Sức chứa: {room.Capacity || "Không xác định"} người</p>
                {isValidRoomId(room.RoomID) ? (
                  <Link 
                    to={`/rooms/${room.RoomID}${location.search}`} 
                    className="view-details-btn"
                  >
                    Xem chi tiết
                  </Link>
                ) : (
                  <span className="view-details-btn disabled">Không có thông tin chi tiết</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList; 