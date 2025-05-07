const express = require("express");
const morgan = require("morgan"); //dùng để ghi log request
const cors = require("cors"); //để be có thể nhận request từ fe
// require("dotenv").config();
// const connectDB = require("./config/db");
const indexRoutes = require("./routes/index.routes");

const app = express();
// connectDB();

// app.use(express.json());

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something broke!" });
// });

// Cấu hình
//1:Cấu hình cros để be có thể nhận request từ fe
app.use(
  cors({
    origin: "http://localhost:3000", // Đảm bảo cho phép frontend gửi request
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP được phép
    allowedHeaders: ["Content-Type", "Authorization"], // Các header được phép
  })
);
//2: Cấu hình morgan để có thể ghi log cho mỗi request
app.use(morgan("dev"));

//3: Cấu hình router
app.use("/api", indexRoutes);

module.exports = app;

// Nhiệm vụ file index.js
// Tạo express() instance
// Cấu hình middleware (bodyParser, cors, logger, v.v)
// Thiết lập các route
// Thiết lập middleware xử lý lỗi
// Không lắng nghe cổng (không .listen() ở đây)
// 📌 Có thể coi đây là “app logic” thuần tuý, chưa gắn với cổng nào.
// Ở file index.js ta chỉ đang cấu hình cho object app
