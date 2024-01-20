/** @format */

// routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();


router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

router.get("/profile", authMiddleware.verifyToken, (req, res) => {
  /* #swagger.ignore = true */
  // This route is protected and can only be accessed by authenticated users
  res.json({ message: "Profile accessed successfully", userId: req.userId });
});

module.exports = router;
