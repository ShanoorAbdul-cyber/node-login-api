const mongoose = require("mongoose");
// UserDetails Schema
const UserDetailsSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    role: { type: String },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Export model using 'userdetails' collection (lowercase, pluralized)
// module.exports = mongoose.model("UserDetails", UserDetailsSchema, "userdetails");
module.exports = mongoose.model("UserDetails", UserDetailsSchema, "userDetails");

