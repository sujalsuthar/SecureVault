const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { protectVault } = require("../middleware/vaultMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadFile } = require("../controllers/uploadController");

const router = express.Router();

router.post("/", protect, protectVault, upload.single("file"), uploadFile);

module.exports = router;
