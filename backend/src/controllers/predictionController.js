const axios = require("axios");

const Prediction = require("../models/Prediction");

const featureFields = [
  "age",
  "bp",
  "sg",
  "al",
  "su",
  "rbc",
  "pc",
  "pcc",
  "ba",
  "bgr",
  "bu",
  "sc",
  "sod",
  "pot",
  "hemo",
  "pcv",
  "wc",
  "rc",
  "htn",
  "dm",
  "cad",
  "appet",
  "pe",
  "ane",
];

const numericFields = new Set([
  "age",
  "bp",
  "sg",
  "al",
  "su",
  "bgr",
  "bu",
  "sc",
  "sod",
  "pot",
  "hemo",
  "pcv",
  "wc",
  "rc",
]);

function validateInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "A JSON object is required";
  }

  const allowedFields = new Set(featureFields);
  const unknownField = Object.keys(body).find((field) => !allowedFields.has(field));
  if (unknownField) {
    return `Unknown input field: ${unknownField}`;
  }

  for (const field of featureFields) {
    const value = body[field];
    if (
      value !== undefined &&
      value !== null &&
      typeof value !== "string" &&
      typeof value !== "number"
    ) {
      return `${field} must be a string, number, or null`;
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      return `${field} must be finite`;
    }
  }

  return null;
}

function normalizeForStorage(body) {
  return Object.fromEntries(
    featureFields.map((field) => {
      let value = body[field] ?? null;
      if (typeof value === "string") {
        value = value.trim();
      }
      if (numericFields.has(field) && (value === "" || value === "?")) {
        value = null;
      }
      return [field, value];
    }),
  );
}

async function createPrediction(req, res, next) {
  try {
    const validationError = validateInput(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const serviceUrl = process.env.ML_SERVICE_URL;
    if (!serviceUrl) {
      return res.status(500).json({ error: "ML_SERVICE_URL is not configured" });
    }

    const { data } = await axios.post(
      `${serviceUrl.replace(/\/$/, "")}/predict`,
      req.body,
      { timeout: 15000 },
    );

    if (
      typeof data?.probability !== "number" ||
      !Number.isFinite(data.probability) ||
      ![0, 1].includes(data.prediction) ||
      !["Low", "Medium", "High"].includes(data.risk_level) ||
      !Array.isArray(data.top_features)
    ) {
      return res.status(502).json({ error: "ML service returned an invalid response" });
    }

    const prediction = await Prediction.create({
      user: req.user.userId,
      ...normalizeForStorage(req.body),
      probability: data.probability,
      prediction: data.prediction,
      riskLevel: data.risk_level,
      topFactors: data.top_features,
    });

    return res.status(201).json({
      id: prediction._id,
      probability: prediction.probability,
      prediction: prediction.prediction,
      riskLevel: prediction.riskLevel,
      topFactors: prediction.topFactors,
      createdAt: prediction.createdAt,
    });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({ error: "ML service request failed" });
    }
    if (
      axios.isAxiosError(error) &&
      ["ECONNABORTED", "ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"].includes(error.code)
    ) {
      return res.status(503).json({ error: "ML service is unavailable" });
    }
    return next(error);
  }
}

async function getPredictionHistory(req, res, next) {
  try {
    const predictions = await Prediction.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(predictions);
  } catch (error) {
    return next(error);
  }
}

async function deletePrediction(req, res, next) {
  try {
    const prediction = await Prediction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    return res.status(204).send();
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ error: "Prediction not found" });
    }
    return next(error);
  }
}

module.exports = { createPrediction, deletePrediction, getPredictionHistory };
