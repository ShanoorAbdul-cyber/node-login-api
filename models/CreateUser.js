const mongoose = require("mongoose");

const CreateUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  role: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("CreateUser", CreateUserSchema, "createUser");
