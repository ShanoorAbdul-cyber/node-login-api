const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema
// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, default: "user" },
//   resetToken: String,
//   resetTokenExpire: Date,

//   resetPasswordToken: String,
//   resetPasswordExpire: Date,
// });


// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },  // Add mobile number
  role: { type: String, default: "user" },
  otp: { type: String },  // Store OTP
  otpExpire: { type: Date }, // Store OTP expiration time
});

// UserSchema.pre("save", async function (next) {
//   if (this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// Password comparison method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetToken = resetToken;
  this.resetTokenExpire = Date.now() + 3600000; // Token valid for 1 hour

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
