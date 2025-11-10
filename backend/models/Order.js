const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  shopname: {
    type: String,
    required: true,
    trim: true,
  },
  shopid: {
    type: Number,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  products: [
    {
      product_id: { type: Number, required: true },
      product_name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      unit: { type: String }, // optional (for 2 Litre, 1 Kg, etc.)
    },
  ],
  total_amount: { type: Number, required: true, min: 1 },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
