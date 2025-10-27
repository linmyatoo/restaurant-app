const express = require("express");
const router = express.Router();

// Simple login endpoint
// In production, use bcrypt for password hashing and JWT for tokens
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Get credentials from environment variables
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (username === adminUsername && password === adminPassword) {
    // In production, generate a JWT token here
    const token = process.env.ADMIN_TOKEN || "admin123";

    res.json({
      success: true,
      token: token,
      message: "Login successful",
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }
});

// Logout endpoint (for clearing session on client)
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// Verify token endpoint
router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const validToken = process.env.ADMIN_TOKEN || "admin123";

  if (token === validToken) {
    res.json({ success: true, message: "Token is valid" });
  } else {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

module.exports = router;
