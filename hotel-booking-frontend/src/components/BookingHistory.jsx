import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../services/api/axiosClient";
import { useAuth } from "../contexts/AuthContext";

const BookingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // API base URL cho hình ảnh
  const API_BASE_URL = "http://localhost:3333";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchBookingHistory = async () => {
      try {
        // Đảm bảo sử dụng đúng ID khách hàng (kiểm tra cả hai cách viết)
        const customerId = user.CustomerID || user.customerId;
        
        if (!customerId) {
          console.error("Customer ID not found in user object:", user);
          setError("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }
        
        console.log("Fetching booking history for customer ID:", customerId);
        console.log("User object:", user);
        
        const response = await axiosClient.get(`/bookings/customer/${customerId}`);
        console.log("Booking history:", response.data);
        setBookings(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch booking history:", err);
        setError("Không thể tải lịch sử đặt phòng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [user, navigate]);

  // Chức năng hủy đặt phòng
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đặt phòng này không?")) {
      return;
    }

    setCancelLoading(true);
    try {
      const response = await axiosClient.put(`/bookings/${bookingId}`, {
        Status: "Cancelled"
      });

      if (response.status === 200) {
        // Cập nhật trạng thái trong state mà không cần gọi lại API
        setBookings(bookings.map(booking => 
          booking.BookingID === bookingId 
            ? { ...booking, Status: "Cancelled" } 
            : booking
        ));

        alert("Hủy đặt phòng thành công!");
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Không thể hủy đặt phòng. Vui lòng thử lại sau.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Hàm chuyển đổi trạng thái đặt phòng sang tiếng Việt
  const getStatusLabel = (status) => {
    const statusMap = {
      "Pending": "Chờ xác nhận",
      "Confirmed": "Đã xác nhận",
      "Cancelled": "Đã hủy",
      "Completed": "Đã hoàn thành"
    };
    return statusMap[status] || status;
  };

  // Hàm định dạng ngày theo định dạng Việt Nam
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Hàm lấy class CSS dựa trên trạng thái
  const getStatusClass = (status) => {
    const statusClassMap = {
      "Pending": "status-pending",
      "Confirmed": "status-confirmed",
      "Cancelled": "status-cancelled",
      "Completed": "status-completed"
    };
    return statusClassMap[status] || "status-pending";
  };

  // Hàm tạo URL đầy đủ cho hình ảnh
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return `${API_BASE_URL}/images/rooms/no-picture-available.jpg`;
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  if (loading) return <div className="loading-container">Đang tải lịch sử đặt phòng...</div>;

  return (
    <div className="booking-history-container">
      <h2>Lịch sử đặt phòng</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      {bookings.length === 0 ? (
        <div className="no-bookings-message">
          <p>Bạn chưa có đơn đặt phòng nào.</p>
          <button 
            className="book-now-btn" 
            onClick={() => navigate("/rooms")}
          >
            Đặt phòng ngay
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div className="booking-item" key={booking.BookingID}>
              <div className="booking-header">
                <div className="booking-info">
                  <h3>Mã đặt phòng: {booking.BookingCode}</h3>
                  <span className={`booking-status ${getStatusClass(booking.Status)}`}>
                    {getStatusLabel(booking.Status)}
                  </span>
                </div>
                <div className="booking-dates">
                  <p>
                    <strong>Nhận phòng:</strong> {formatDate(booking.CheckInDate)}
                  </p>
                  <p>
                    <strong>Trả phòng:</strong> {formatDate(booking.CheckOutDate)}
                  </p>
                </div>
              </div>

              <div className="booking-details">
                {booking.Room ? (
                  <div className="room-details">
                    <div className="room-image">
                      <img 
                        src={getFullImageUrl(booking.Room.CoverImage)} 
                        alt={booking.Room.RoomName || "Phòng"}
                        onError={(e) => {
                          e.target.src = `${API_BASE_URL}/images/rooms/no-picture-available.jpg`;
                        }}
                      />
                    </div>
                    <div className="room-info">
                      <h4>{booking.Room.RoomName || "Phòng không xác định"}</h4>
                      {booking.Room.RoomTypeName && (
                        <p className="room-type">{booking.Room.RoomTypeName}</p>
                      )}
                      {booking.Room.HotelName && (
                        <p className="hotel-name">{booking.Room.HotelName}</p>
                      )}
                      <p className="guest-count">Số khách: {booking.NumberOfGuests} người</p>
                      {booking.EstimatedArrivalTime && (
                        <p className="arrival-time">
                          Giờ đến dự kiến: {booking.EstimatedArrivalTime}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="room-info-unavailable">
                    <p>Thông tin phòng không khả dụng</p>
                    <p>Mã phòng: {booking.RoomID}</p>
                  </div>
                )}

                <div className="booking-price">
                  <p className="price-label">Tổng tiền:</p>
                  <p className="price-value">
                    {booking.TotalPrice.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>

              {booking.Status === "Pending" && (
                <div className="booking-actions">
                  <button 
                    className="cancel-booking-btn"
                    disabled={cancelLoading}
                    onClick={() => handleCancelBooking(booking.BookingID)}
                  >
                    {cancelLoading ? "Đang hủy..." : "Hủy đặt phòng"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory; 