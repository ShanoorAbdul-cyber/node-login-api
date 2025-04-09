const mongoose = require("mongoose");

const CreateUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  role: { type: String, required: true },
}, { timestamps: true });

// CreateUserSchema.index({ email: 1 }, { unique: true });
// CreateUserSchema.index({ mobile: 1 }, { unique: true });

module.exports = mongoose.model("CreateUser", CreateUserSchema, "createUser");
