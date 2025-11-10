// models/Signup.js
const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
  name: String,
  shopname: String,
  shopid: Number,
  adminid: Number,
  role: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  otp: String,
  otpExpires: Date,
});

module.exports = mongoose.model("Signup", signupSchema);
