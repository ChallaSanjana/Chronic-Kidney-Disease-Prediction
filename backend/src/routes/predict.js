const express = require("express");

const { createPrediction } = require("../controllers/predictionController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticate, createPrediction);

module.exports = router;
