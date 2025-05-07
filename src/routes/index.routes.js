const express = require("express");
const router = express.Router();

// Import từng route nhỏ
const authRoutes = require("./auth.routes");
// const songRoutes = require("./song.routes");
// const playlistRoutes = require("./playlist.routes");
const testRoutes = require("./test.routes");

// Gắn route với path tương ứng
router.use("/auth", authRoutes);
// router.use("/songs", songRoutes);
// router.use("/playlists", playlistRoutes);
router.use("/test", testRoutes);

module.exports = router;
