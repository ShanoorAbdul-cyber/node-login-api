const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    tableId: { type: String, required: true },
    tableName: { type: String, required: true },
    items: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Booked'], default: 'Active' }, // Added status field
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("OrdersList", orderSchema, "ordersList");
  

