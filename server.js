const app = require("./src/index");
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Nhiệm vụ file server.js
// Import app từ app.js
// Lắng nghe trên một cổng (ví dụ: app.listen(5000))
// Có thể thêm logic liên quan đến server (websocket, https, clustering…)
// 📌 Chỉ dùng để chạy ứng dụng chứ không cấu hình app.
