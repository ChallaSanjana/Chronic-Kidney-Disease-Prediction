const express = require("express");

const {
  changePassword,
  deleteAccount,
  getProfile,
  login,
  register,
  updateProfile,
} = require("../controllers/authController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.use(authenticate);
router.get("/me", getProfile);
router.patch("/profile", updateProfile);
router.post("/password", changePassword);
router.delete("/account", deleteAccount);

module.exports = router;
