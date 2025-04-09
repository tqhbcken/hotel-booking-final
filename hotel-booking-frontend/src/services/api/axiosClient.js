import axios from "axios";

// Tạo instance của axios
const axiosClient = axios.create({
  baseURL: "http://localhost:3333/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để theo dõi việc đang refresh token
let isRefreshing = false;
// Mảng các promise đang chờ token được refresh
let failedQueue = [];

// Xử lý các request sau khi token được refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor cho request: Thêm token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response: Xử lý lỗi và refresh token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu không có response hoặc không phải lỗi 401, trả về lỗi luôn
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }
    
    // Nếu đã thử refresh token rồi mà vẫn lỗi, đăng xuất
    if (originalRequest._retry) {
      // Đã thử refresh và thất bại, đăng xuất
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login?expired=true";
      return Promise.reject(error);
    }
    
    // Đánh dấu request này đã được thử refresh
    originalRequest._retry = true;
    
    // Nếu đang refresh token, thêm request vào queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({resolve, reject});
      })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }
    
    // Bắt đầu quá trình refresh token
    isRefreshing = true;
    
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      // Nếu không có refresh token, đăng xuất
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      
      // Gọi API refresh token
      const res = await axios.post("http://localhost:3333/api/auth/refresh", {
        refreshToken,
      });
      
      const { accessToken, newRefreshToken } = res.data;
      
      // Lưu token mới
      localStorage.setItem("accessToken", accessToken);
      
      // Nếu server trả về refresh token mới, lưu lại
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      
      // Cập nhật Authorization header cho request
      originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
      
      // Xử lý queue các request đang chờ
      processQueue(null, accessToken);
      
      // Gửi lại request ban đầu với token mới
      return axiosClient(originalRequest);
    } catch (err) {
      // Xử lý lỗi khi refresh token thất bại
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      // Xử lý queue với lỗi
      processQueue(err, null);
      
      // Chuyển đến trang đăng nhập
      window.location.href = "/login?expired=true";
      return Promise.reject(err);
    } finally {
      // Reset trạng thái isRefreshing
      isRefreshing = false;
    }
  }
);

export default axiosClient;