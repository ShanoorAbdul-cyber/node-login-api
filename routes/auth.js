const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");  // For generating reset tokens
const nodemailer = require("nodemailer");
const User = require("../models/User");  
const twilio = require('twilio');

const router = express.Router();

const sgMail = require('@sendgrid/mail');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Set your SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPEmail = async (toEmail, otp) => {
  const msg = {
    to: toEmail, // Recipient email
    from: 'abdulshanoor69@gmail.com', // Your verified sender email
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    html: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.body : error.message);
  }
};


const sendSMS = (mobile, otp) => {
  console.log("Sending OTP to mobile:", mobile);
  const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');
  client.messages.create({
    body: `Your OTP is: ${otp}`,
    to: mobile,
    from: '+1234567890',
  }).then(message => console.log(message.sid));
};

// Middleware for protecting routes
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

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, mobile } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, mobile });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpire = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    // Send OTP via email
    await sendOTPEmail(user.email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error during login:", error);
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

      // Clear OTP after successful verification
      user.otp = null;
      user.otpExpire = null;
      await user.save();

      res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
      console.error("Error verifying OTP:", error);
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

// Logout route
router.post("/logout", (req, res) => {
    // Logout logic (for token-based authentication, logout is handled client-side)
    res.status(200).json({ message: "Logged out successfully" });
  });

module.exports = router;
