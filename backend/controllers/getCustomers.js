// controllers/getCustomers.js

const Signup = require("../models/Signup");

// Get all customer users (excluding admins)
const getAllCustomers = async (req, res) => {
  try {
    // Fetch only users where role is 'customer'
    const customers = await Signup.find({ role: "customer" });

    // If no customers found
    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    // Success response
    res.status(200).json({
      message: "✅ Customer users fetched successfully",
      customers,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching customers",
      error: error.message,
    });
  }
};

module.exports = getAllCustomers;
