const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Prediction = require("../models/Prediction");

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: {
      emailUpdates: user.preferences?.emailUpdates ?? true,
      healthReminders: user.preferences?.healthReminders ?? true,
    },
  };
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Account not found" });
    if (!user.preferences) user.preferences = { emailUpdates: true, healthReminders: true };
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, preferences } = req.body || {};
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.userId },
    });
    if (duplicate) return res.status(409).json({ error: "Email is already registered" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Account not found" });
    if (!user.preferences) user.preferences = { emailUpdates: true, healthReminders: true };
    user.name = name.trim();
    user.email = normalizedEmail;
    if (preferences && typeof preferences === "object") {
      if (typeof preferences.emailUpdates === "boolean") user.preferences.emailUpdates = preferences.emailUpdates;
      if (typeof preferences.healthReminders === "boolean") user.preferences.healthReminders = preferences.healthReminders;
    }
    await user.save();
    return res.json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Email is already registered" });
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }
    if (newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters" });
    const user = await User.findById(req.user.userId).select("+passwordHash");
    if (!user) return res.status(404).json({ error: "Account not found" });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body || {};
    if (typeof password !== "string" || !password) return res.status(400).json({ error: "Password is required to delete your account" });
    const user = await User.findById(req.user.userId).select("+passwordHash");
    if (!user) return res.status(404).json({ error: "Account not found" });
    if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Password is incorrect" });
    await Prediction.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+passwordHash",
    );
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  changePassword,
  deleteAccount,
  getProfile,
  login,
  register,
  updateProfile,
};
