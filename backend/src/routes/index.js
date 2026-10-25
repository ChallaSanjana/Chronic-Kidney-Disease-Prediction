const express = require("express");

const authRoutes = require("./auth");
const predictRoute = require("./predict");
const predictionRoutes = require("./predictions");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

router.use("/auth", authRoutes);
router.use("/predict", predictRoute);
router.use("/predictions", predictionRoutes);

module.exports = router;
