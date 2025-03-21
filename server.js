const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("./models/User");
const userRoutes = require("./routes/auth");
const crypto = require("crypto"); // For generating a reset token
const nodemailer = require("nodemailer"); // To send email
const cors = require('cors');  // Allow cross-origin requests
const helmet = require('helmet'); // Add security headers

dotenv.config(); // Load environment variables

const app = express(); // Initialize express app

// Middleware for parsing JSON data
app.use(express.json());
app.use(cors());  // Enable CORS for development or production
app.use(helmet()); // Enhance security with HTTP headers

app.use("/api/users", userRoutes); 

// Middleware: Verify Token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info from the token
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Logout Route
app.post("/api/users/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

// Login Route
app.post("/api/users/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  
    try {
      console.log("Login request received for email:", email);
  
      const user = await User.findOne({ email: email });
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("User found:", user);
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Password mismatch for email:", email);
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      console.log("Login successful for email:", email);
      res.json({ message: "Login successful", token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in", error });
    }
  });


// verify-otp Route
  app.post("/api/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Clear the OTP after successful verification
        user.otp = null;
        user.otpExpire = null;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Error verifying OTP", error });
    }
});

// MongoDB Connection and Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
