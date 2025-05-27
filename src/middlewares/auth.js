const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("di vao middleware check access token");
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
    next(); // Cho phép đi tiếp đến hàm xử lý tiếp theo của chuỗi request,nếu không gọi next() request sẽ nằm tại đây
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};

module.exports = verifyToken;
