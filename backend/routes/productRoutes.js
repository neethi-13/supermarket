const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Routes
router.post("/add", addProduct);         // Create product
router.get("/all", getAllProducts);      // Get all products
router.put("/update/:id", updateProduct); // Update product
router.delete("/delete/:id", deleteProduct); // Delete product

module.exports = router;
