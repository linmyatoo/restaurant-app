require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const initializeSocket = require('./sockets/socketHandler');

// --- Connect to Database ---
connectDB();

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON
app.use('/public', express.static('public')); // Serve menu photos

// --- HTTP API Routes ---
app.get('/', (req, res) => res.send('Server is running!'));
app.use('/api/menu', require('./api/menu.routes'));
app.use('/api/orders',require('./api/order.routes'));
// You would add other routes here (orders, tables)

// --- Setup HTTP Server for Socket.IO ---
const httpServer = http.createServer(app);

// --- Initialize Socket.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins (for dev)
  },
});

// Pass the 'io' instance to your socket handler
initializeSocket(io);

// --- Start Server ---
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});