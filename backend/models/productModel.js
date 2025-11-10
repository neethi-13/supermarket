const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
    unique: true,
  },
  product_name: {
     type: String, required: true, unique: true, trim: true 
    
  },
  brand_name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: mongoose.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString()),
  },
  stock_quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  unit: {
    type: String,
    required: true,
  },
  product_unit: {
    type: String,
    required: true,
  },
  expiry_date: {
    type: Date,
  },
  added_date: {
    type: Date,
    default: Date.now,
  },
  language: {
    type: String,
    enum: ["English", "Tamil"],
    default: "English",
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
