const mongoose = require("mongoose");

const MeanuSchema = new mongoose.Schema({
  name: { type: String },
  price: {type: String}
});

module.exports = mongoose.model("MeanuList", MeanuSchema, "meanuList");
