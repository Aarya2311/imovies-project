const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  currentUser,
  logout,
} = require("../controllers/authController");

const router = express.Router();
const authAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

router.post("/register", authAttemptLimit, register);
router.post("/login", authAttemptLimit, login);
router.get("/me", currentUser);
router.post("/logout", logout);

module.exports = router;
