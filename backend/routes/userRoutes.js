const express = require("express");
const router = express.Router();
const getAllCustomers = require("../controllers/getCustomers");

// Route to get all customers
router.get("/customers", getAllCustomers);

module.exports = router;
