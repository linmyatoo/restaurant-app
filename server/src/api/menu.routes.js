const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const { adminAuth } = require("../middleware/auth");

// GET /api/menu (Get all menu items) - Public route
router.get("/", menuController.getMenu);

// GET /api/menu/all (Get all menu items including suspended) - Protected route
router.get("/all", adminAuth, menuController.getAllMenuItems);

// GET /api/menu/active (Get active menu items only) - Public route
router.get("/active", menuController.getActiveMenu);

// POST /api/menu (Create a new menu item) - Protected route
router.post("/", adminAuth, menuController.createMenuItem);

// PUT /api/menu/:id/suspend (Suspend a menu item) - Protected route
router.put("/:id/suspend", adminAuth, menuController.suspendMenuItem);

// PUT /api/menu/:id/unsuspend (Unsuspend a menu item) - Protected route
router.put("/:id/unsuspend", adminAuth, menuController.unsuspendMenuItem);

// This is the most important line that exports the router
module.exports = router;
