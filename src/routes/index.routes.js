const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");

// Import từng route nhỏ
const authRoutes = require("./auth.routes");
// const songRoutes = require("./song.routes");
// const playlistRoutes = require("./playlist.routes");
const testRoutes = require("./test.routes");

// Gắn route với path tương ứng
router.use("/auth", authRoutes); //các route trong này không cần check access token
// router.use("/songs", songRoutes);
// router.use("/playlists", playlistRoutes);
router.use("/test", verifyToken, testRoutes); // các route trong này cần phải check access token

module.exports = router;
