const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
  tableId: String,
  tableName: String,
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    }
  ],
  closedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("OrderHistory", orderHistorySchema);
