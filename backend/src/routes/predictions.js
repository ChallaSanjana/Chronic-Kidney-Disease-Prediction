const express = require("express");

const {
  deletePrediction,
  getPredictionHistory,
} = require("../controllers/predictionController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", getPredictionHistory);
router.delete("/:id", deletePrediction);

module.exports = router;
