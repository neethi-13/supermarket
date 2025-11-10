const Product = require("../models/productModel");



// 🟢 Add new product with validation & duplicate checks
exports.addProduct = async (req, res) => {
  try {
    console.log("🧾 Received product data:", req.body);

    // Convert numeric fields  safely
    const productData = {
      ...req.body,
      product_id: Number(req.body.product_id),
      price: parseFloat(req.body.price),
      stock_quantity: Number(req.body.stock_quantity),
      expiry_date: req.body.expiry_date ? new Date(req.body.expiry_date) : null,
    };

    // ✅ Basic validation
    if (
      !productData.product_id ||
      !productData.product_name ||
      !productData.brand_name ||
      !productData.category ||
      !productData.price ||
      !productData.stock_quantity ||
      !productData.barcode ||
      !productData.unit ||
      !productData.product_unit
    ) {
      return res.status(400).json({
        message: "⚠️ Missing required fields in product data",
      });
    }

    // ✅ Check for existing product (product_id, product_name, or barcode)
    const existingProduct = await Product.findOne({
      $or: [
        { product_id: productData.product_id },
        { product_name: productData.product_name },
        { barcode: productData.barcode },
      ],
    });

    if (existingProduct) {
      // Identify which field is duplicated for clarity
      const duplicateFields = [];
      if (existingProduct.product_id === productData.product_id)
        duplicateFields.push("Product ID");
      if (existingProduct.product_name === productData.product_name)
        duplicateFields.push("Product Name");
      if (existingProduct.barcode === productData.barcode)
        duplicateFields.push("Barcode");

      return res.status(400).json({
        message: `⚠️ Duplicate ${duplicateFields.join(", ")} already exists.`,
      });
    }

    // ✅ Create and save new product
    const newProduct = new Product(productData);
    await newProduct.save();

    res.status(201).json({
      message: "✅ Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error adding product:", error);

    // Handle MongoDB duplicate key error as a fallback
    if (error.code === 11000) {
      return res.status(400).json({
        message: "⚠️ Duplicate product_id, product_name, or barcode found.",
      });
    }

    res.status(400).json({
      message: "❌ Error adding product",
      error: error.message,
    });
  }
};


// 🟡 Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching products", error: error.message });
  }
};

// 🟠 Update product by ID
// 🟠 Update product by product_id
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { product_id: req.params.id },  // 🔹 match by product_id instead of _id
      req.body,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "❌ Product not found" });

    res.status(200).json({
      message: "✅ Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    res.status(400).json({ message: "❌ Error updating product", error: error.message });
  }
};

// 🔴 Delete product by product_id
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ product_id: req.params.id });

    if (!deletedProduct)
      return res.status(404).json({ message: "❌ Product not found" });

    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error deleting product", error: error.message });
  }
};
