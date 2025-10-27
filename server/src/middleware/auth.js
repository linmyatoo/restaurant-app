// Simple authentication middleware
// In production, use JWT tokens and proper password hashing

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  // Simple token validation (in production, use JWT)
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // For demo purposes, we're using a simple token check
  // In production, verify JWT token here
  const validToken = process.env.ADMIN_TOKEN || "admin123"; // Set in .env file

  if (token === validToken) {
    next(); // User is authenticated
  } else {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { adminAuth };
