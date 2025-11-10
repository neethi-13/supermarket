import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Aorder.css';

const AdminOrder = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('adminOrderState');
    const savedTheme = localStorage.getItem('adminDarkTheme');
    
    if (savedTheme) {
      setDarkTheme(JSON.parse(savedTheme));
    }
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.selectedShop) setSelectedShop(state.selectedShop);
        if (state.cart && state.cart.length > 0) setCart(state.cart);
        if (state.searchTerm) setSearchTerm(state.searchTerm);
        if (state.productSearch) setProductSearch(state.productSearch);
      } catch (error) {
        localStorage.removeItem('adminOrderState');
      }
    }
    
    fetchCustomers();
    fetchProducts().then(() => setIsInitialized(true));
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = { selectedShop, cart, searchTerm, productSearch };
      localStorage.setItem('adminOrderState', JSON.stringify(stateToSave));
    }
  }, [selectedShop, cart, searchTerm, productSearch, isInitialized]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('adminDarkTheme', JSON.stringify(darkTheme));
    if (darkTheme) {
      document.body.classList.add('admin-dark-theme');
    } else {
      document.body.classList.remove('admin-dark-theme');
    }
  }, [darkTheme]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users/customers');
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/all');
      const processedProducts = response.data.map(product => ({
        ...product,
        price: convertDecimal128(product.price)
      }));
      setProducts(processedProducts);
      return processedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const convertDecimal128 = (value) => {
    if (value && typeof value === 'object' && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal);
    }
    return value || 0;
  };

  const handleShopSelect = (customer) => {
    setSelectedShop(customer);
    setIsModalOpen(true);
    setOrderPlaced(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        alert(`Cannot add more. Only ${product.stock_quantity} units available in stock`);
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock_quantity === 0) {
        alert('This product is out of stock');
        return;
      }
      setCart([...cart, {
        product_id: product.product_id,
        product_name: product.product_name,
        price: product.price,
        quantity: 1,
        unit: product.unit,
        maxStock: product.stock_quantity
      }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    
    const cartItem = cart.find(item => item.product_id === productId);
    if (!cartItem) return;

    const currentProduct = products.find(p => p.product_id === productId);
    const maxStock = currentProduct ? currentProduct.stock_quantity : cartItem.maxStock;
    
    if (newQuantity > maxStock) {
      alert(`Only ${maxStock} units available in stock`);
      return;
    }
    
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity, maxStock }
        : item
    ));
  };

  const handlePlaceOrder = async () => {
    if (!selectedShop || cart.length === 0) return;

    try {
      const orderData = {
        name: selectedShop.name,
        shopname: selectedShop.shopname,
        shopid: selectedShop.shopid,
        products: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit
        }))
      };

      await axios.post('http://localhost:5000/api/orders/add', orderData);
      
      setCart([]);
      setOrderPlaced(true);
      fetchProducts();
      
      setTimeout(() => {
        setIsModalOpen(false);
        setOrderPlaced(false);
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const canAddToCart = (product) => {
    if (product.stock_quantity === 0) return false;
    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
      return existingItem.quantity < product.stock_quantity;
    }
    return true;
  };

  const getCurrentMaxStock = (productId) => {
    const currentProduct = products.find(p => p.product_id === productId);
    return currentProduct ? currentProduct.stock_quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.shopname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.shopid?.toString().includes(searchTerm)
  );

  const filteredProducts = products.filter(product =>
    product.product_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.brand_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Sort products to show cart items first
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aInCart = cart.find(item => item.product_id === a.product_id);
    const bInCart = cart.find(item => item.product_id === b.product_id);
    if (aInCart && !bInCart) return -1;
    if (!aInCart && bInCart) return 1;
    return 0;
  });

  return (
    <div className={`admin-admin-order ${darkTheme ? 'admin-dark-theme' : ''}`}>
      {/* Header with Theme Toggle */}
      <div className="admin-order-header">
        <div className="admin-header-content">
          <div className="admin-header-title">
            <h2>Admin Order Management</h2>
            <p>Place orders on behalf of customer shops</p>
          </div>
          <button 
            className="admin-theme-toggle"
            onClick={() => setDarkTheme(!darkTheme)}
          >
            {darkTheme ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Top Search Bar */}
        <div className="admin-main-search">
          <div className="admin-search-container">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search shops by name, owner, or shop ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>
      </div>

      {/* Shop Grid Section */}
      <div className="admin-shops-grid-section">
        {loading ? (
          <div className="admin-loading-shops">
            <div className="admin-loading-spinner"></div>
            <p>Loading shops...</p>
          </div>
        ) : (
          <div className="admin-shops-grid">
            {filteredCustomers.map(customer => (
              <div
                key={customer._id}
                className="admin-shop-card"
                onClick={() => handleShopSelect(customer)}
              >
                <div className="admin-shop-card-content">
                  <div className="admin-shop-header">
                    <h3 className="admin-shop-name">{customer.shopname}</h3>
                    {customer.pendingOrders > 0 && (
                      <span className="admin-pending-badge">
                        {customer.pendingOrders}
                      </span>
                    )}
                  </div>
                  <p className="admin-owner-name">👤 {customer.name}</p>
                  <div className="admin-shop-details">
                    <span className="admin-shop-id">🆔 {customer.shopid}</span>
                    <span className="admin-shop-phone">📞 {customer.phone}</span>
                  </div>
                </div>
                <div className="admin-shop-hover-effect">
                  <span>Click to Order →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {isModalOpen && selectedShop && (
        <div className="admin-order-modal">
          <div className="admin-modal-overlay" onClick={handleCloseModal}></div>
          <div className="admin-modal-content">
            
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div className="admin-modal-header-content">
                <div className="admin-shop-info-large">
                  <h2>Ordering for: {selectedShop.shopname}</h2>
                  <div className="admin-shop-details-large">
                    <span>👤 Owner: {selectedShop.name}</span>
                    <span>🆔 ID: {selectedShop.shopid}</span>
                    <span>📞 Phone: {selectedShop.phone}</span>
                  </div>
                </div>
                <button className="admin-close-modal" onClick={handleCloseModal}>
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              
              {/* Product Search */}
              <div className="admin-modal-search">
                <div className="admin-search-container">
                  <span className="admin-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search products by name, brand, or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="admin-products-table-container">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map(product => {
                      const cartItem = cart.find(item => item.product_id === product.product_id);
                      const isInCart = !!cartItem;
                      
                      return (
                        <tr 
                          key={product._id} 
                          className={`admin-product-row ${isInCart ? 'admin-product-in-cart' : ''}`}
                        >
                          <td className="admin-product-name-cell">
                            <strong>{product.product_name}</strong>
                          </td>
                          <td>{product.brand_name}</td>
                          <td>{product.category}</td>
                          <td className="admin-price-cell">₹{product.price.toFixed(2)}</td>
                          <td className={`admin-stock-cell ${product.stock_quantity === 0 ? 'admin-out-of-stock' : ''}`}>
                            {product.stock_quantity} {product.unit}
                          </td>
                          <td className="admin-action-cell">
                            {isInCart ? (
                              <div className="admin-cart-controls-compact">
                                <div className="admin-quantity-controls-compact">
                                  <button
                                    className="admin-quantity-btn-compact"
                                    onClick={() => handleQuantityChange(product.product_id, cartItem.quantity - 1)}
                                  >
                                    -
                                  </button>
                                  <span className="admin-quantity-display">{cartItem.quantity}</span>
                                  <button
                                    className={`admin-quantity-btn-compact ${cartItem.quantity >= getCurrentMaxStock(product.product_id) ? 'admin-btn-disabled' : ''}`}
                                    onClick={() => handleQuantityChange(product.product_id, cartItem.quantity + 1)}
                                    disabled={cartItem.quantity >= getCurrentMaxStock(product.product_id)}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  className="admin-remove-btn-compact"
                                  onClick={() => handleRemoveFromCart(product.product_id)}
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <button
                                className={`admin-add-to-cart-btn-table ${!canAddToCart(product) ? 'admin-btn-disabled' : ''}`}
                                onClick={() => handleAddToCart(product)}
                                disabled={!canAddToCart(product)}
                              >
                                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Product Cards */}
              <div className="admin-products-mobile">
                {sortedProducts.map(product => {
                  const cartItem = cart.find(item => item.product_id === product.product_id);
                  const isInCart = !!cartItem;
                  
                  return (
                    <div key={product._id} className={`admin-product-card-mobile ${isInCart ? 'admin-product-in-cart' : ''}`}>
                      <div className="admin-product-info-mobile">
                        <h4>{product.product_name}</h4>
                        <p className="admin-product-brand-mobile">{product.brand_name} • {product.category}</p>
                        <div className="admin-product-details-mobile">
                          <span className="admin-price-mobile">₹{product.price.toFixed(2)}</span>
                          <span className={`admin-stock-mobile ${product.stock_quantity === 0 ? 'admin-out-of-stock' : ''}`}>
                            Stock: {product.stock_quantity} {product.unit}
                          </span>
                        </div>
                      </div>
                      {isInCart ? (
                        <div className="admin-cart-controls-mobile">
                          <div className="admin-quantity-controls-mobile">
                            <button
                              className="admin-quantity-btn-mobile"
                              onClick={() => handleQuantityChange(product.product_id, cartItem.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="admin-quantity-display-mobile">{cartItem.quantity}</span>
                            <button
                              className={`admin-quantity-btn-mobile ${cartItem.quantity >= getCurrentMaxStock(product.product_id) ? 'admin-btn-disabled' : ''}`}
                              onClick={() => handleQuantityChange(product.product_id, cartItem.quantity + 1)}
                              disabled={cartItem.quantity >= getCurrentMaxStock(product.product_id)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="admin-remove-btn-mobile"
                            onClick={() => handleRemoveFromCart(product.product_id)}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          className={`admin-add-to-cart-btn-mobile ${!canAddToCart(product) ? 'admin-btn-disabled' : ''}`}
                          onClick={() => handleAddToCart(product)}
                          disabled={!canAddToCart(product)}
                        >
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer - Cart Summary */}
            {cart.length > 0 && (
              <div className="admin-modal-footer">
                <div className="admin-cart-summary-sticky">
                  <div className="admin-cart-stats">
                    <span className="admin-cart-icon">🛒</span>
                    <span className="admin-total-items">{calculateTotalItems()} items</span>
                    <span className="admin-total-amount">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="admin-order-actions-sticky">
                    <button
                      className="admin-place-order-btn-sticky"
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </button>
                    <button
                      className="admin-clear-cart-btn-sticky"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Success Message */}
      {orderPlaced && (
        <div className="admin-order-success-toast">
          <div className="admin-success-content">
            <span className="admin-success-icon">✅</span>
            <div>
              <h4>Order Placed Successfully!</h4>
              <p>Order for {selectedShop?.shopname} has been submitted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrder;