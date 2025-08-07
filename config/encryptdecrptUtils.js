// encryptDecrypt.js
const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync("secret-key", "salt", 32);

// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt function
function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(":")) {
    return encryptedText;
  }

  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    const ivBuffer = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("❌ Decryption failed:", error.message);
    return encryptedText;
  }
}

// For display only (8 characters)
function decryptAndShort(encryptedText) {
  const full = decrypt(encryptedText);
  if (!full || typeof full !== "string") {
    return "Invalid";
  }
  return full.substring(0, 8);
}


module.exports = {
  encrypt,
  decrypt,
  decryptAndShort, // use in frontend
};
