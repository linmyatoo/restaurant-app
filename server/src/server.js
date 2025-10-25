require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const initializeSocket = require("./sockets/socketHandler");
const cloudinary = require("cloudinary").v2;
// --- Connect to Database ---
connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Middleware to parse JSON
app.use("/public", express.static("public")); // Serve menu photos (keeps existing behavior)
// Also expose uploads directly at /uploads so client URLs like '/uploads/xxx.jpg' work
// app.use("/uploads", express.static("public/uploads")); // Removed uploads static route

// Uploads handled by Cloudinary: provide a server route for Admin to POST base64 image data
app.use("/api/upload", require("./api/upload.routes"));

// --- HTTP API Routes ---
app.get("/", (req, res) => res.send("Server is running!"));
app.use("/api/menu", require("./api/menu.routes"));
app.use("/api/orders", require("./api/order.routes"));
// You would add other routes here (orders, tables)

// --- Setup HTTP Server for Socket.IO ---
const httpServer = http.createServer(app);

// --- Initialize Socket.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (for dev)
  },
});

// Pass the 'io' instance to your socket handler
initializeSocket(io);

// --- Start Server ---
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
