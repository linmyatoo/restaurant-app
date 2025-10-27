const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");
const { adminAuth } = require("../middleware/auth");

// POST /api/upload (body: { image: '<data-url>' }) - Protected route
router.post("/", adminAuth, uploadController.uploadImage);

module.exports = router;
