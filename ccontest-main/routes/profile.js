const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const profile = require("../controllers/profileController");

router.get("/", verifyToken, profile.getProfile);
router.put("/", verifyToken, profile.saveProfile);
router.post("/", verifyToken, profile.saveProfile);

module.exports = router;
