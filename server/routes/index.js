const express = require("express");
const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const vaultRoutes = require("./vaultRoutes");
const uploadRoutes = require("./uploadRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "SecureVault API is running" });
});

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/vault", vaultRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
