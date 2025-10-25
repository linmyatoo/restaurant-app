const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");

// POST /api/upload (body: { image: '<data-url>' })
router.post("/", uploadController.uploadImage);

module.exports = router;
