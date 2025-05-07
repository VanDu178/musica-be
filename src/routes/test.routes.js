const express = require("express");
const router = express.Router();

// http://localhost:5000/api/test/getmethod
router.get("/getmethod", (req, res) => {
  res.send("test get method");
});

router.post("/postmethod", (req, res) => {
  res.send("test post methd");
});

module.exports = router;
