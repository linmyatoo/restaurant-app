const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const { adminAuth } = require("../middleware/auth");

// GET /api/menu (Get all menu items) - Public route
router.get("/", menuController.getMenu);

// POST /api/menu (Create a new menu item) - Protected route
router.post("/", adminAuth, menuController.createMenuItem);

// This is the most important line that exports the router
module.exports = router;
