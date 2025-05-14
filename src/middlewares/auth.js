const jwt = require("jsonwebtoken");
// require("dotenv").config(); // Đọc JWT_SECRET từ .env

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Kiểm tra có header Authorization không
  if (!authHeader) {
    return res.status(401).json({ message: "Access token missing" });
  }

  // Kiểm tra cú pháp Authorization: Bearer <token>
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access token malformed or missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Gắn user vào request để route phía sau dùng
    next(); // Cho phép đi tiếp
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};

module.exports = verifyToken;
