const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const getEncryptionKey = () => {
  const rawKey = process.env.VAULT_ENCRYPTION_KEY;

  if (!rawKey) {
    throw new Error("VAULT_ENCRYPTION_KEY is not configured");
  }

  // Allow a 64-char hex key directly.
  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    return Buffer.from(rawKey, "hex");
  }

  // Derive a 32-byte key from passphrase-like values.
  return crypto.createHash("sha256").update(rawKey).digest();
};

const isEncryptedFormat = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const parts = value.split(":");
  if (parts.length !== 3) {
    return false;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  return Boolean(ivHex && authTagHex && encryptedHex && /^[0-9a-fA-F]+$/.test(ivHex + authTagHex + encryptedHex));
};

const encryptVaultPassword = (plainText) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(String(plainText), "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

const decryptVaultPassword = (encryptedValue) => {
  if (!encryptedValue) {
    return "";
  }

  // Backward compatibility: older plaintext values.
  if (!isEncryptedFormat(encryptedValue)) {
    return String(encryptedValue);
  }

  const [ivHex, authTagHex, encryptedHex] = encryptedValue.split(":");

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

module.exports = {
  encryptVaultPassword,
  decryptVaultPassword,
};
