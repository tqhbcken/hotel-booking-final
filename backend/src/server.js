const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const auth = require("./utils/jwtConfig");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3333;

// Cấu hình CORS trước tất cả middleware khác
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3333'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Áp dụng CORS cho tất cả các routes
app.use(cors(corsOptions));

// Bổ sung preflight cho OPTIONS requests
app.options('*', cors(corsOptions));

// Các middleware khác
app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files - chỉ giữ lại một cấu hình
app.use('/images', express.static(path.join(__dirname, './public/images')));

// Kết nối database
const pool = require("./config/db");

// Import API routes
const accRouter = require("./routes/accountsRoute");
const addressesRouter = require("./routes/addressesRoute");
const amenitiesRouter = require("./routes/amenityRoute");
const bookingRouter = require("./routes/bookingRoute");
const customerRouter = require("./routes/customersRoute");
const hotelsRouter = require("./routes/hotelsRoute");
const paymentsRouter = require("./routes/paymentsRoute");
const reviewsRouter = require("./routes/reviewsRoute");
const roomImagesRouter = require("./routes/roomImagesRoute");
const roomRouter = require("./routes/roomsRoute");
const roomTypesRouter = require("./routes/roomTypesRoute");
const usersRouter = require("./routes/usersRoute");
const authRouter = require("./routes/authRoute");

// // JWT
// app.use(function (req, res, next) {
//   const token = req.cookies.accessToken;
//   if (token) {
//     const user = auth.verifyToken(token);
//     res.locals.user = user;
//   }
//   next();
// });

// Sử dụng API routes
app.use("/api/accounts", accRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/amenities", amenitiesRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/customers", customerRouter);
app.use("/api/hotels", hotelsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/roomimages", roomImagesRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/roomtypes", roomTypesRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

// Middleware xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({ error: "API not found!" });
});

// Chạy server backend
app.listen(PORT, () => {
  console.log(`App listening at: http://localhost:${PORT}`);
});
