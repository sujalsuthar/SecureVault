const jwt = require("jsonwebtoken");

const generateVaultToken = (userId) => {
  return jwt.sign({ id: userId, scope: "vault_unlock" }, process.env.JWT_SECRET, { expiresIn: "8h" });
};

module.exports = generateVaultToken;
