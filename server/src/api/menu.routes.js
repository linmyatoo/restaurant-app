const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

// GET /api/menu (Get all menu items)
router.get('/', menuController.getMenu);

// POST /api/menu (Create a new menu item)
router.post('/', menuController.createMenuItem);

// This is the most important line that exports the router
module.exports = router;