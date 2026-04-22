const jwt = require("jsonwebtoken");

const isVaultUnlockedRequest = (req) => {
  try {
    const vaultToken = req.headers["x-vault-token"];
    if (!vaultToken) {
      return false;
    }
    const decoded = jwt.verify(vaultToken, process.env.JWT_SECRET);
    return decoded.scope === "vault_unlock" && String(decoded.id) === String(req.user._id);
  } catch {
    return false;
  }
};

const protectVault = (req, res, next) => {
  if (!isVaultUnlockedRequest(req)) {
    res.status(403);
    return next(new Error("Vault locked. Enter your master password."));
  }
  return next();
};

module.exports = {
  protectVault,
  isVaultUnlockedRequest,
};
