import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../services/api/axiosClient";
import { useAuth } from "../contexts/AuthContext";
import { format, addDays } from 'date-fns';

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State cho phần reviews
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [commentText, setCommentText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Lấy query parameters từ URL
  const queryParams = new URLSearchParams(location.search);
  const checkInParam = queryParams.get("checkIn") || "";
  const checkOutParam = queryParams.get("checkOut") || "";
  const guestsParam = queryParams.get("guests") || 1;
  
  const [booking, setBooking] = useState({
    checkIn: checkInParam,
    checkOut: checkOutParam,
    guests: guestsParam,
  });
  
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const noImagePlaceholder = "http://localhost:3333/images/rooms/no-picture-available.jpg";
  const API_BASE_URL = "http://localhost:3333";

  // Hàm để tạo URL đầy đủ cho hình ảnh
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return noImagePlaceholder;
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
  };

  useEffect(() => {
    const fetchRoomDetail = async () => {
      if (!roomId || roomId === 'undefined') {
        setError("Không tìm thấy thông tin phòng. ID phòng không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching room details for ID:", roomId);
        const response = await axiosClient.get(`/rooms/${roomId}`);
        console.log("Room detail response:", response.data);
        setRoom(response.data);
        setError("");
        
        // Sau khi lấy thông tin phòng, lấy danh sách ngày đã đặt
        fetchBookedDates(roomId);
        // Lấy thông tin reviews
        fetchReviews(roomId);
      } catch (err) {
        console.error("Failed to fetch room details:", err);
        setError("Không thể tải thông tin phòng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetail();
  }, [roomId]);
  
  // Hàm lấy reviews theo roomId
  const fetchReviews = async (roomId) => {
    try {
      setLoadingReviews(true);
      const response = await axiosClient.get(`/reviews/room/${roomId}`);
      console.log("Room reviews response:", response.data);
      setReviews(response.data);
      setReviewsError("");
    } catch (err) {
      console.error("Failed to fetch room reviews:", err);
      setReviewsError("Không thể tải đánh giá của phòng. Vui lòng thử lại sau.");
    } finally {
      setLoadingReviews(false);
    }
  };
  
  // Hàm xử lý gửi review mới
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
      alert("Bạn cần đăng nhập để đánh giá phòng");
      navigate(`/login?redirect=rooms/${roomId}`);
      return false;
    }
    
    if (!commentText.trim()) {
      alert("Vui lòng nhập nội dung đánh giá");
      return false;
    }
    
    try {
      setIsSubmittingReview(true);
      
      const reviewData = {
        AccountID: user.accountId, // Lấy từ thông tin user đã đăng nhập
        RoomID: roomId,
        Rating: parseInt(newReview.rating),
        Comment: commentText
      };
      console.log("Review data:", {
        accountId: user.accountId, 
        user: user,
        roomId: roomId,
        comment: commentText
      });
      
      const response = await axiosClient.post('/reviews', reviewData);
      console.log("Review submitted:", response.data);
      
      // Làm mới danh sách reviews
      fetchReviews(roomId);
      
      // Reset form
      setNewReview({ rating: 5, comment: "" });
      setCommentText("");
      
      alert("Đánh giá của bạn đã được gửi thành công!");
      return true;
    } catch (err) {
      console.error("Failed to submit review:", err);
      console.error("Error details:", err.response?.data || err.message);
      alert("Không thể gửi đánh giá: " + (err.response?.data?.message || err.message));
      return false;
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  // Hàm xử lý thay đổi dữ liệu review
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    console.log("Review change:", name, value);
    
    if (name === "rating") {
      setNewReview({ ...newReview, rating: value });
    } else if (name === "comment") {
      setNewReview({ ...newReview, comment: value });
    }
  };
  
  // Hàm lấy danh sách ngày đã đặt
  const fetchBookedDates = async (roomId) => {
    try {
      setLoadingDates(true);
      const response = await axiosClient.get(`/bookings/booked-dates/${roomId}`);
      console.log("Booked dates response:", response.data);
      setBookedDates(response.data.bookedDates || []);
    } catch (err) {
      console.error("Failed to fetch booked dates:", err);
    } finally {
      setLoadingDates(false);
    }
  };

  // Phương thức để format giá an toàn
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0";
    }
    return parseFloat(price).toLocaleString("vi-VN");
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu đang thay đổi ngày và ngày đó đã bị đặt, không cho chọn
    if ((name === 'checkIn' || name === 'checkOut') && isDateBooked(value)) {
      alert("Ngày này đã có người đặt. Vui lòng chọn ngày khác.");
      return;
    }
    
    // Nếu ngày nhận phòng sau ngày trả phòng, tự động điều chỉnh
    if (name === 'checkIn' && booking.checkOut && value > booking.checkOut) {
      setBooking({ 
        ...booking, 
        [name]: value,
        checkOut: value // Đặt ngày trả = ngày nhận + 1
      });
      return;
    }
    
    setBooking({ ...booking, [name]: value });
    
    // Nếu thay đổi ngày nhận phòng, kiểm tra xem có ngày nào trong khoảng đã bị đặt không
    if (name === 'checkIn' && booking.checkOut) {
      checkDateRangeAvailability(value, booking.checkOut);
    }
    
    // Nếu thay đổi ngày trả phòng, kiểm tra xem có ngày nào trong khoảng đã bị đặt không
    if (name === 'checkOut' && booking.checkIn) {
      checkDateRangeAvailability(booking.checkIn, value);
    }
  };
  
  // Kiểm tra xem ngày đã bị đặt chưa
  const isDateBooked = (dateString) => {
    return bookedDates.includes(dateString);
  };
  
  // Kiểm tra xem khoảng thời gian có hợp lệ không
  const checkDateRangeAvailability = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Kiểm tra từng ngày trong khoảng
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      if (isDateBooked(dateString)) {
        alert(`Trong khoảng thời gian bạn chọn, ngày ${dateString} đã có người đặt. Vui lòng chọn khoảng thời gian khác.`);
        return false;
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return true;
  };

  // Tính số ngày ở
  const calculateDays = () => {
    if (!booking.checkIn || !booking.checkOut) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Tính tổng tiền
  const calculateTotalPrice = () => {
    const days = calculateDays();
    if (!days || !room?.PricePerNight) return 0;
    return days * parseFloat(room.PricePerNight);
  };

  // Tạo mã đặt phòng
  const generateBookingCode = () => {
    const prefix = "BK";
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const validateBookingInput = () => {
    if (!booking.checkIn || !booking.checkOut) {
      setBookingError("Vui lòng chọn ngày nhận và trả phòng");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);

    if (checkInDate < today) {
      setBookingError("Ngày nhận phòng không thể là ngày trong quá khứ");
      return false;
    }

    if (checkOutDate <= checkInDate) {
      setBookingError("Ngày trả phòng phải sau ngày nhận phòng");
      return false;
    }

    if (booking.guests < 1 || booking.guests > room.Capacity) {
      setBookingError(`Số lượng khách phải từ 1 đến ${room.Capacity}`);
      return false;
    }
    
    // Kiểm tra xem có ngày nào trong khoảng bị đặt không
    if (!checkDateRangeAvailability(booking.checkIn, booking.checkOut)) {
      return false;
    }

    return true;
  };

  const handleBookNow = async () => {
    setBookingError("");
    
    if (!validateBookingInput()) {
      return;
    }

    if (!user) {
      // Lưu thông tin đặt phòng vào URL để sau khi đăng nhập có thể quay lại
      const bookingQueryParams = new URLSearchParams({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        redirect: `rooms/${roomId}`
      }).toString();
      
      navigate(`/login?${bookingQueryParams}`);
      return;
    }

    // Hiển thị modal xác nhận thay vì đặt phòng ngay
    setShowConfirmation(true);
  };
  
  // Hàm mới để xác nhận đặt phòng sau khi xem lại thông tin
  const confirmBooking = async () => {
    try {
      setIsBooking(true);
      
      // Kiểm tra CustomerID
      if (!user.CustomerID) {
        console.error("Missing CustomerID in user object:", user);
        
        // Thử tải lại thông tin profile người dùng
        try {
          console.log("Attempting to reload user profile...");
          const profileResponse = await axiosClient.get("/auth/profile");
          console.log("Profile response:", profileResponse.data);
          
          if (profileResponse.data && profileResponse.data.CustomerID) {
            // Cập nhật thông tin user với CustomerID mới
            console.log("Got CustomerID from fresh profile:", profileResponse.data.CustomerID);
            user.CustomerID = profileResponse.data.CustomerID;
          } else {
            setBookingError("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại bằng tài khoản customer.");
            setShowConfirmation(false);
            return;
          }
        } catch (err) {
          console.error("Failed to reload profile:", err);
          setBookingError("Không thể lấy thông tin khách hàng. Vui lòng đăng nhập lại bằng tài khoản customer.");
          setShowConfirmation(false);
          return;
        }
      }
      
      // Tính toán tổng tiền dựa trên số ngày và giá phòng
      const totalPrice = calculateTotalPrice();
      
      // Thông tin đặt phòng gửi lên server
      const bookingData = {
        CustomerID: user.CustomerID, // Lấy CustomerID từ thông tin user đã đăng nhập
        RoomID: roomId,
        CheckInDate: booking.checkIn,
        CheckOutDate: booking.checkOut,
        TotalPrice: totalPrice,
        Status: "Pending", // Trạng thái mặc định khi đặt phòng
        NumberOfGuests: parseInt(booking.guests),
        BookingCode: generateBookingCode() // Tạo mã đặt phòng ngẫu nhiên
      };
      
      console.log("Sending booking data:", bookingData);
      
      try {
        const response = await axiosClient.post("/bookings", bookingData);
        console.log("Booking response:", response.data);
        
        setBookingSuccess(true);
        setShowConfirmation(false);
        
        // Sau 3 giây sẽ chuyển đến trang bookings
        setTimeout(() => {
          navigate("/bookings");
        }, 3000);
      } catch (err) {
        console.error("API call error details:", err);
        if (err.response) {
          console.error("Error response data:", err.response.data);
          setBookingError(err.response.data.message || "Đặt phòng thất bại. Vui lòng thử lại sau.");
        } else {
          setBookingError("Không thể kết nối đến server. Vui lòng thử lại sau.");
        }
        setShowConfirmation(false);
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setBookingError(err.response?.data?.message || "Đặt phòng thất bại. Vui lòng thử lại sau.");
      setShowConfirmation(false);
    } finally {
      setIsBooking(false);
    }
  };

  // Component hiển thị danh sách ngày đã đặt
  const BookedDatesList = ({ bookedDates, currentMonth }) => {
    // Lọc chỉ hiển thị các ngày trong tháng hiện tại và tháng tiếp theo
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1;
    
    // Lọc các ngày trong 3 tháng tới
    const filteredDates = bookedDates.filter(dateStr => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      return (year === currentYear && month >= currentMonthNum && month <= currentMonthNum + 2);
    });
    
    // Nhóm các ngày theo tháng
    const datesByMonth = {};
    filteredDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const monthYear = format(date, 'MM/yyyy');
      if (!datesByMonth[monthYear]) {
        datesByMonth[monthYear] = [];
      }
      datesByMonth[monthYear].push({
        date: dateStr,
        day: format(date, 'd')
      });
    });
    
    if (filteredDates.length === 0) {
      return <p className="no-booked-dates">Không có ngày nào bị đặt trong 3 tháng tới.</p>;
    }
    
    return (
      <div className="booked-dates-container">
        <h4>Ngày đã có người đặt (3 tháng tới)</h4>
        {Object.keys(datesByMonth).map(monthYear => (
          <div key={monthYear} className="month-group">
            <h5>Tháng {monthYear}</h5>
            <div className="date-list">
              {datesByMonth[monthYear].map(item => (
                <div key={item.date} className="date-item booked">
                  {item.day}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Component hiển thị danh sách reviews
  const ReviewsList = ({ reviews }) => {
    if (reviews.length === 0) {
      return <p className="no-reviews">Chưa có đánh giá nào cho phòng này.</p>;
    }
    
    // Tính rating trung bình
    const averageRating = (reviews.reduce((total, review) => total + review.Rating, 0) / reviews.length).toFixed(1);
    
    return (
      <div className="reviews-container">
        <div className="reviews-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={star <= Math.round(averageRating) ? "star filled" : "star"}>
                  ★
                </span>
              ))}
            </div>
            <span className="total-reviews">({reviews.length} đánh giá)</span>
          </div>
        </div>
        
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.ReviewID} className="review-item">
              <div className="review-header">
                <span className="review-author">{review.Username}</span>
                <div className="review-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= review.Rating ? "star filled" : "star"}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="review-date">
                  {new Date(review.CreatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="review-comment">{review.Comment}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Component form đánh giá
  const ReviewForm = () => {
    // Sử dụng state cục bộ trong component
    const [localRating, setLocalRating] = useState(5);
    const [localComment, setLocalComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRatingChange = (e) => {
      setLocalRating(parseInt(e.target.value));
    };

    const handleCommentChange = (e) => {
      setLocalComment(e.target.value);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!user) {
        // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
        alert("Bạn cần đăng nhập để đánh giá phòng");
        navigate(`/login?redirect=rooms/${roomId}`);
        return;
      }
      
      if (!localComment.trim()) {
        alert("Vui lòng nhập nội dung đánh giá");
        return;
      }
      
      try {
        setIsSubmitting(true);
        
        const reviewData = {
          AccountID: user.accountId,
          RoomID: roomId,
          Rating: localRating,
          Comment: localComment
        };
        
        console.log("Submitting review:", reviewData);
        
        const response = await axiosClient.post('/reviews', reviewData);
        console.log("Review submitted:", response.data);
        
        // Làm mới danh sách reviews
        fetchReviews(roomId);
        
        // Reset form
        setLocalRating(5);
        setLocalComment("");
        
        alert("Đánh giá của bạn đã được gửi thành công!");
      } catch (err) {
        console.error("Failed to submit review:", err);
        console.error("Error details:", err.response?.data || err.message);
        alert("Không thể gửi đánh giá: " + (err.response?.data?.message || err.message));
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="review-form-container">
        <h3>Viết đánh giá của bạn</h3>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Đánh giá của bạn:</label>
            <div className="star-rating">
              {[5, 4, 3, 2, 1].map(star => (
                <React.Fragment key={star}>
                  <input
                    type="radio"
                    id={`star${star}`}
                    name="rating"
                    value={star}
                    checked={localRating === star}
                    onChange={handleRatingChange}
                  />
                  <label htmlFor={`star${star}`} title={`${star} sao`}>
                    <span className="star">★</span>
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Nhận xét:</label>
            <textarea
              id="comment"
              name="comment"
              value={localComment}
              onChange={handleCommentChange}
              rows="4"
              placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-review-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      </div>
    );
  };

  // Component modal xác nhận đặt phòng
  const BookingConfirmationModal = () => {
    const days = calculateDays();
    const totalPrice = calculateTotalPrice();
    
    return (
      <div className="modal-overlay">
        <div className="confirmation-modal">
          <h3>Xác nhận đặt phòng</h3>
          
          <div className="confirmation-details">
            <div className="confirmation-room">
              <h4>{room.RoomName}</h4>
              {room.RoomImages && room.RoomImages.length > 0 && room.RoomImages.find(img => img.IsPrimary) ? (
                <img 
                  src={getFullImageUrl(room.RoomImages.find(img => img.IsPrimary).ImageURL)}
                  alt={room.RoomName || "Phòng"} 
                  className="confirmation-room-image"
                />
              ) : room.ImageURL ? (
                <img 
                  src={getFullImageUrl(room.ImageURL)}
                  alt={room.RoomName || "Phòng"} 
                  className="confirmation-room-image"
                />
              ) : null}
            </div>
            
            <div className="confirmation-info">
              <div className="info-item">
                <span className="info-label">Nhận phòng:</span>
                <span className="info-value">{format(new Date(booking.checkIn), 'dd/MM/yyyy')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Trả phòng:</span>
                <span className="info-value">{format(new Date(booking.checkOut), 'dd/MM/yyyy')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Số đêm:</span>
                <span className="info-value">{days} đêm</span>
              </div>
              <div className="info-item">
                <span className="info-label">Số khách:</span>
                <span className="info-value">{booking.guests} người</span>
              </div>
              <div className="info-item">
                <span className="info-label">Giá một đêm:</span>
                <span className="info-value">{formatPrice(room.PricePerNight)} VND</span>
              </div>
              <div className="info-item total">
                <span className="info-label">Tổng tiền:</span>
                <span className="info-value">{formatPrice(totalPrice)} VND</span>
              </div>
            </div>
            
            <div className="user-info">
              <h4>Thông tin khách hàng</h4>
              <div className="info-item">
                <span className="info-label">Họ tên:</span>
                <span className="info-value">{user.fullName || user.userName}</span>
              </div>
              {user.email && (
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="info-item">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{user.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="confirmation-actions">
            <button 
              className="confirm-booking-btn"
              onClick={confirmBooking}
              disabled={isBooking}
            >
              {isBooking ? "Đang xử lý..." : "Xác nhận đặt phòng"}
            </button>
            <button 
              className="cancel-btn"
              onClick={() => setShowConfirmation(false)}
              disabled={isBooking}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!room) return <div>Không tìm thấy thông tin phòng</div>;

  return (
    <div className="room-detail">
      <h2>{room.RoomName || "Phòng không tên"}</h2>
      <div className="room-image">
        {room.RoomImages && room.RoomImages.length > 0 && room.RoomImages.find(img => img.IsPrimary) ? (
          <img 
            src={getFullImageUrl(room.RoomImages.find(img => img.IsPrimary).ImageURL)}
            alt={room.RoomName || "Phòng"} 
            onError={(e) => {
              console.log("Lỗi tải ảnh:", e.target.src);
              e.target.onerror = null;
              e.target.src = noImagePlaceholder;
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
            }}
          />
        ) : (
          <div className="placeholder-image">Không có ảnh</div>
        )}
      </div>
      
      <div className="room-images">
        {room.RoomImages && room.RoomImages.length > 0 ? (
          room.RoomImages.map((image, index) => (
            <img 
              key={index} 
              src={getFullImageUrl(image.ImageURL)}
              alt={`${room.RoomName || "Phòng"} - ${index + 1}`} 
              onError={(e) => {
                console.log("Lỗi tải ảnh gallery:", e.target.src);
                e.target.onerror = null;
                e.target.src = noImagePlaceholder;
              }}
            />
          ))
        ) : (
          <div className="no-images">Không có thêm ảnh</div>
        )}
      </div>

      <div className="room-info">
        <p className="room-price">Giá: {formatPrice(room.PricePerNight)} VND/đêm</p>
        <p>Loại phòng: {room.RoomTypeName || "Không xác định"}</p>
        <p>Sức chứa: {room.Capacity || "Không xác định"} người</p>
        <p>Mô tả: {room.Description || "Không có mô tả"}</p>
        
        {/* Hiển thị các tiện ích */}
        {room.Amenities && room.Amenities.length > 0 && (
          <div className="amenities">
            <h3>Tiện nghi</h3>
            <ul>
              {room.Amenities.map(amenity => (
                <li key={amenity.AmenityID}>{amenity.AmenityName}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="booking-form">
        <h3>Đặt phòng</h3>
        
        {loadingDates && <p>Đang tải thông tin ngày đã đặt...</p>}
        
        {!loadingDates && bookedDates.length > 0 && (
          <BookedDatesList bookedDates={bookedDates} />
        )}
        
        {bookingSuccess ? (
          <div className="booking-success">
            <h4>Đặt phòng thành công!</h4>
            <p>Cảm ơn bạn đã đặt phòng. Chúng tôi sẽ xác nhận đơn đặt phòng của bạn sớm.</p>
            <p>Đang chuyển đến trang đặt phòng của bạn...</p>
          </div>
        ) : (
          <>
            {bookingError && <div className="error-message">{bookingError}</div>}
            
            <div className="form-group">
              <label>Ngày nhận phòng:</label>
              <input
                type="date"
                name="checkIn"
                value={booking.checkIn}
                onChange={handleBookingChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Ngày trả phòng:</label>
              <input
                type="date"
                name="checkOut"
                value={booking.checkOut}
                onChange={handleBookingChange}
                min={booking.checkIn || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Số lượng khách:</label>
              <input
                type="number"
                name="guests"
                value={booking.guests}
                onChange={handleBookingChange}
                min="1"
                max={room.Capacity || 10}
                required
              />
            </div>
            
            {booking.checkIn && booking.checkOut && (
              <div className="booking-summary">
                <h4>Chi tiết đặt phòng</h4>
                <p>Số đêm: {calculateDays()} đêm</p>
                <p>Giá một đêm: {formatPrice(room.PricePerNight)} VND</p>
                <p className="total-price">Tổng tiền: {formatPrice(calculateTotalPrice())} VND</p>
              </div>
            )}
            
            <button 
              onClick={handleBookNow} 
              className="book-now-btn"
              disabled={isBooking}
            >
              {isBooking ? "Đang xử lý..." : "Đặt ngay"}
            </button>
          </>
        )}
      </div>

      {/* Phần Reviews */}
      <div className="room-reviews-section">
        <h3>Đánh giá từ khách hàng</h3>
        
        {loadingReviews ? (
          <div>Đang tải đánh giá...</div>
        ) : reviewsError ? (
          <div className="error-message">{reviewsError}</div>
        ) : (
          <>
            <ReviewsList reviews={reviews} />
            {user && <ReviewForm />}
            {!user && (
              <div className="login-to-review">
                <p>Hãy <a href={`/login?redirect=rooms/${roomId}`}>đăng nhập</a> để viết đánh giá</p>
              </div>
            )}
          </>
        )}
      </div>

      {showConfirmation && <BookingConfirmationModal />}
    </div>
  );
};

export default RoomDetail; 