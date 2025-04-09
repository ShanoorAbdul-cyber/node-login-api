const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User");
const twilio = require("twilio");
require("dotenv").config();

const router = express.Router();

// Connect to MongoDB (you can move this to a global DB config if needed)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Setup SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send OTP Email
const sendOTPEmail = async (toEmail, otp) => {
  const msg = {
    to: toEmail,
    from: "abdulshanoor69@gmail.com",
    subject: "Your OTP Code",
    html: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log("OTP email sent");
  } catch (error) {
    console.error("Error sending OTP email:", error.response?.body || error.message);
  }
};

// Middleware for token verification
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Register user
router.post("/register", async (req, res) => {
  const { name, email, password, mobile } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, mobile });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login user and send OTP
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    await sendOTPEmail(user.email, otp);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login", error });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({
      userDetails: { name: user.name, email: user.email, mobile: user.mobile, role: user.role },
      message: "OTP verified successfully", 
      token, 
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Error verifying OTP", error });
  }
});

// Update Password
router.post("/update-password", authMiddleware, async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
