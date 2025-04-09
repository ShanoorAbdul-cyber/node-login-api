const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // Needed for password reset token generation

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  role: { type: String, default: "user" },
  otp: { type: String },           // Stores OTP
  otpExpire: { type: Date },       // OTP expiration time
  resetToken: { type: String },    // For password reset
  resetTokenExpire: { type: Date } // Reset token expiration
});

// Method: Compare entered password with hashed one
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Generate password reset token
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetToken = resetToken;
  this.resetTokenExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  return resetToken;
};

// Export the model (uses "users" collection in MongoDB by default)
module.exports = mongoose.model("User", UserSchema);
