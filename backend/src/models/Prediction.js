const mongoose = require("mongoose");

const topFactorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    impact: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const predictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    age: Number,
    bp: Number,
    sg: Number,
    al: Number,
    su: Number,
    rbc: String,
    pc: String,
    pcc: String,
    ba: String,
    bgr: Number,
    bu: Number,
    sc: Number,
    sod: Number,
    pot: Number,
    hemo: Number,
    pcv: Number,
    wc: Number,
    rc: Number,
    htn: String,
    dm: String,
    cad: String,
    appet: String,
    pe: String,
    ane: String,
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    prediction: {
      type: Number,
      required: true,
      enum: [0, 1],
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
    },
    topFactors: {
      type: [topFactorSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

module.exports = mongoose.model("Prediction", predictionSchema);
