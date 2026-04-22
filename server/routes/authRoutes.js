const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  setupMasterPassword,
  verifyMasterPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.post("/master-password", protect, setupMasterPassword);
router.post("/master-password/verify", protect, verifyMasterPassword);

module.exports = router;
