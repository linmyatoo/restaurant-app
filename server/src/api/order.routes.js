const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// GET /api/orders/active
// Gets all tables with an unpaid bill
router.get('/active', orderController.getActiveOrders);

module.exports = router;