const express = require("express");
const morgan = require("morgan"); //dùng để ghi log request
const cors = require("cors"); //để be có thể nhận request từ fe
const mongoose = require("mongoose"); // ODM để kết nối và làm việc với MongoDB
require("dotenv").config(); // Đọc các biến môi trường từ file .env
const indexRoutes = require("./routes/index.routes"); // Import router chính
// const multer = require("multer");

const app = express();

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something broke!" });
// });

// Cấu hình
//1:Cấu hình parser để backend đọc được dữ liệu JSON mà frontend gửi lên (thường là POST, PUT).
//Đọc trong body.req
app.use(express.json());

//2:Cấu hình cros để be có thể nhận request từ fe
app.use(
  cors({
    origin: "http://localhost:3000", // Đảm bảo cho phép frontend gửi request
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Các phương thức HTTP được phép
    allowedHeaders: ["Content-Type", "Authorization"], // Các header được phép
    credentials: true, // Cho phép gửi cookie
  })
);
//3: Cấu hình morgan để có thể ghi log cho mỗi request
app.use(morgan("dev"));

//4: Cấu hình router
app.use("/api", indexRoutes);

//5: Cấu hình database "Kết nối MongoDB"
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

//6: Thiết lập Pug làm template engine
app.set("view engine", "pug");
app.set("views", "./views");

module.exports = app;

// Nhiệm vụ file index.js
// Tạo express() instance
// Cấu hình middleware (bodyParser, cors, logger, v.v)
// Thiết lập các route
// Thiết lập middleware xử lý lỗi
// Không lắng nghe cổng (không .listen() ở đây)
// 📌 Có thể coi đây là “app logic” thuần tuý, chưa gắn với cổng nào.
// Ở file index.js ta chỉ đang cấu hình cho object app
