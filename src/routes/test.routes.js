const express = require("express");
const router = express.Router();
const testController = require("../controllers/test.controller");

// http://localhost:5000/api/test/getmethod
router.get("/getmethod", testController.createInstanceRole);

router.post("/postmethod", (req, res) => {
  res.send("test post methd");
});

module.exports = router;
