const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { adminAuth } = require("../middleware/auth");

// GET /api/orders/active (for Admin) - Protected route
router.get("/active", adminAuth, orderController.getActiveOrders);

// === ADD THIS NEW LINE ===
// GET /api/orders/kitchen/1 (or /2)
router.get("/kitchen/:kitchenId", orderController.getKitchenOrders);

module.exports = router;
