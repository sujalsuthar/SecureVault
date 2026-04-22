const express = require("express");
const {
  createVaultItem,
  getVaultItems,
  updateVaultItem,
  deleteVaultItem,
} = require("../controllers/vaultController");
const { protect } = require("../middleware/authMiddleware");
const { protectVault } = require("../middleware/vaultMiddleware");

const router = express.Router();

router.use(protect);
router.use(protectVault);

router.route("/").post(createVaultItem).get(getVaultItems);
router.route("/:id").put(updateVaultItem).delete(deleteVaultItem);

module.exports = router;
