import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminAddProducts.css";

const AdminAddProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://supermarket-208b.onrender.com/";
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    brand_name: "",
    category: "",
    price: "",
    stock_quantity: "",
    barcode: "",
    unit: "",
    product_unit: "",
    expiry_date: "",
    language: "English",
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products/all`);
      const processedProducts = response.data.map((product) => ({
        ...product,
        price: convertDecimal128(product.price),
      }));
      setProducts(processedProducts);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert Decimal128 to number for display
  const convertDecimal128 = (price) => {
    if (price && typeof price === "object" && price.$numberDecimal) {
      return parseFloat(price.$numberDecimal);
    }
    return price;
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter products by search
  const filteredProducts = products.filter(
    (product) =>
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Add or Update
  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate required fields
  if (
    !formData.product_id ||
    !formData.product_name ||
    !formData.brand_name ||
    !formData.category ||
    !formData.price ||
    !formData.stock_quantity ||
    !formData.barcode ||
    !formData.unit ||
    !formData.product_unit
  ) {
    alert("⚠️ Please fill in all required fields before saving.");
    return;
  }

  // Convert string inputs to correct types
  const productData = {
    ...formData,
    product_id: Number(formData.product_id),
    price: parseFloat(formData.price),
    stock_quantity: Number(formData.stock_quantity),
    expiry_date: formData.expiry_date ? new Date(formData.expiry_date) : null,
  };

  console.log("📦 Sending Product Data:", productData);

  try {
    if (editingProduct) {
      await axios.put(
        `${API_BASE_URL}/api/products/update/${editingProduct.product_id}`,
        productData
      );
      alert("✅ Product updated successfully!");
    } else {
      const res = await axios.post(
        `${API_BASE_URL}/api/products/add`,
        productData
      );
      console.log("Server Response:", res.data);
      alert("✅ Product added successfully!");
    }

    fetchProducts();
    resetForm();
  } catch (error) {
    console.error("❌ Error saving product:", error);

    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`);
    } else if (error.response?.data?.error) {
      alert(`Error: ${error.response.data.error}`);
    } else {
      alert("❌ Unknown error while saving product. Check backend logs.");
    }
  }
};

  // Handle edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_id: product.product_id,
      product_name: product.product_name,
      brand_name: product.brand_name,
      category: product.category,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      barcode: product.barcode,
      unit: product.unit,
      product_unit: product.product_unit,
      expiry_date: product.expiry_date ? product.expiry_date.split("T")[0] : "",
      language: product.language || "English",
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      product_id: "",
      product_name: "",
      brand_name: "",
      category: "",
      price: "",
      stock_quantity: "",
      barcode: "",
      unit: "",
      product_unit: "",
      expiry_date: "",
      language: "English",
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="admin-add-products">
      <div className="admin-products-header">
        <h2>🛒 Product Management</h2>
        <button
          className="admin-add-product-btn"
          onClick={() => setShowForm(true)}
        >
          ➕ Add New Product
        </button>
      </div>

      {/* Search bar */}
      <div className="admin-search-section">
        <input
          type="text"
          placeholder="Search products by name, brand, or category..."
          value={searchTerm}
          onChange={handleSearch}
          className="admin-search-input"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-product-form">
          <h3>{editingProduct ? "✏️ Edit Product" : "🆕 Add New Product"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <input
                type="number"
                name="product_id"
                placeholder="Product ID"
                value={formData.product_id}
                onChange={handleInputChange}
                required
                disabled={!!editingProduct}
              />
              <input
                type="text"
                name="product_name"
                placeholder="Product Name"
                value={formData.product_name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="brand_name"
                placeholder="Brand Name"
                value={formData.brand_name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                step="0.01"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="stock_quantity"
                placeholder="Stock Quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="barcode"
                placeholder="Barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="unit"
                placeholder="Unit (e.g., Litre)"
                value={formData.unit}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="product_unit"
                placeholder="Product Unit (e.g., 1 Litre)"
                value={formData.product_unit}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="expiry_date"
                placeholder="Expiry Date"
                value={formData.expiry_date}
                onChange={handleInputChange}
              />
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-save-btn">
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="admin-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Table */}
      <div className="admin-products-table">
        <h3>📦 Product List</h3>
        {loading ? (
          <div className="admin-loading">Loading products...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Product Unit</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.product_id}</td>
                  <td>{product.product_name}</td>
                  <td>{product.brand_name}</td>
                  <td>{product.category}</td>
                  <td>
                    ₹
                    {typeof product.price === "number"
                      ? product.price.toFixed(2)
                      : "N/A"}
                  </td>
                  <td>{product.product_unit}</td>
                  <td>{product.stock_quantity}</td>
                  <td>{product.unit}</td>
                  <td>
                    <button
                      className="admin-edit-btn"
                      onClick={() => handleEdit(product)}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAddProducts;
