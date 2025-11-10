import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CusApplyOrder.css';

const CusApplyOrder = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('cusApplyOrderState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.cart && state.cart.length > 0) {
          setCart(state.cart);
        }
        if (state.searchTerm) {
          setSearchTerm(state.searchTerm);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        localStorage.removeItem('cusApplyOrderState');
      }
    }
    
    fetchProducts().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = {
        cart,
        searchTerm
      };
      localStorage.setItem('cusApplyOrderState', JSON.stringify(stateToSave));
    }
  }, [cart, searchTerm, isInitialized]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const convertDecimal128 = (value) => {
    if (value && typeof value === 'object' && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal);
    }
    return value || 0;
  };

  const handleAddToCart = (product) => {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      // If already in cart, check if we can increase quantity
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
      // Add new item to cart
      if (product.stock_quantity === 0) {
        alert('This product is out of stock');
        return;
      }
      setCart([...cart, {
        product_id: product.product_id,
        product_name: product.product_name,
        brand_name: product.brand_name,
        category: product.category,
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

    // Get current product stock from products array
    const currentProduct = products.find(p => p.product_id === productId);
    const maxStock = currentProduct ? currentProduct.stock_quantity : cartItem.maxStock;
    
    if (newQuantity > maxStock) {
      alert(`Only ${maxStock} units available in stock`);
      return;
    }
    
    setCart(cart.map(item =>
      item.product_id === productId
        ? { 
            ...item, 
            quantity: newQuantity,
            maxStock: maxStock
          }
        : item
    ));
  };

  const handleQuantityInput = (productId, inputValue) => {
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      handleQuantityChange(productId, 1);
      return;
    }
    
    const newQuantity = parseInt(numericValue, 10);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      return;
    }
    
    handleQuantityChange(productId, newQuantity);
  };

  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0) return;

    try {
      const orderData = {
        name: user.name,
        shopname: user.shopname,
        shopid: user.shopid,
        products: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit
        }))
      };

      await axios.post('http://localhost:5000/api/orders/add', orderData);
      
      // Clear everything ONLY after successful order placement
      clearAllState();
      setOrderPlaced(true);
      
      fetchProducts(); // Refresh product stock
      alert('Order placed successfully! Waiting for admin approval.');
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

  // Check if a product can be added to cart (for button state)
  const canAddToCart = (product) => {
    if (product.stock_quantity === 0) return false;
    
    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
      return existingItem.quantity < product.stock_quantity;
    }
    return true;
  };

  // Check if product is in cart
  const isProductInCart = (productId) => {
    return cart.some(item => item.product_id === productId);
  };

  // Clear all state manually
  const clearAllState = () => {
    setCart([]);
    setSearchTerm('');
    setOrderPlaced(false);
    localStorage.removeItem('cusApplyOrderState');
  };

  // Clear only cart
  const clearCart = () => {
    setCart([]);
  };

  const filteredProducts = products.filter(product =>
    product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cus-apply-order">
      <div className="cus-order-header">
        <h2>Apply New Order</h2>
        <p>Select products and place your order</p>
        
        {cart.length > 0 && (
          <div className="cus-state-controls">
            <button 
              className="cus-clear-cart-btn"
              onClick={clearCart}
            >
              Clear Cart ({cart.length})
            </button>
            <button 
              className="cus-clear-all-btn"
              onClick={clearAllState}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="cus-order-layout">
        {/* Shopping Cart Section - Now on Top */}
        {cart.length > 0 && (
          <div className="cus-cart-section-top">
            <div className="cus-section-card">
              <div className="cus-cart-header">
                <h3>Shopping Cart ({cart.length} items)</h3>
                <div className="cus-cart-summary">
                  <span className="cus-total-items">{calculateTotalItems()} items</span>
                  <span className="cus-total-amount">Total: ₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="cus-table-container">
                <table className="cus-cart-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => {
                      const currentMaxStock = products.find(p => p.product_id === item.product_id)?.stock_quantity || item.maxStock;
                      const isMaxQuantity = item.quantity >= currentMaxStock;
                      
                      return (
                        <tr key={item.product_id} className="cus-cart-row">
                          <td className="cus-product-name-cell">
                            <div className="cus-product-name">{item.product_name}</div>
                            <div className="cus-unit">Unit: {item.unit}</div>
                          </td>
                          <td className="cus-brand-cell">{item.brand_name}</td>
                          <td className="cus-category-cell">{item.category}</td>
                          <td className="cus-price-cell">₹{item.price.toFixed(2)}</td>
                          <td className="cus-quantity-cell">
                            <div className="cus-quantity-controls">
                              <button
                                className="cus-quantity-btn"
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                              >
                                -
                              </button>
                              
                              <input
                                type="text"
                                className="cus-quantity-input"
                                value={item.quantity}
                                onChange={(e) => handleQuantityInput(item.product_id, e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                    handleQuantityChange(item.product_id, 1);
                                  }
                                }}
                              />
                              
                              <button
                                className={`cus-quantity-btn ${isMaxQuantity ? 'cus-btn-disabled' : ''}`}
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                disabled={isMaxQuantity}
                              >
                                +
                              </button>
                            </div>
                            <div className="cus-stock-info">
                              Max: {currentMaxStock} {item.unit}
                            </div>
                          </td>
                          <td className="cus-total-cell">₹{(item.price * item.quantity).toFixed(2)}</td>
                          <td className="cus-action-cell">
                            <button
                              className="cus-remove-btn"
                              onClick={() => handleRemoveFromCart(item.product_id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="cus-order-actions">
                <button
                  className="cus-place-order-btn"
                  onClick={handlePlaceOrder}
                >
                  Place Order - ₹{calculateTotal().toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="cus-products-section">
          <div className="cus-section-card">
            <div className="cus-products-header">
              <h3>Available Products</h3>
              <div className="cus-search-box">
                <input
                  type="text"
                  placeholder="Search products by name, brand, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="cus-search-input"
                />
              </div>
            </div>

            {loading ? (
              <div className="cus-loading">Loading products...</div>
            ) : (
              <div className="cus-table-container">
                <table className="cus-products-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Product Name</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Unit</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => {
                      const inCart = isProductInCart(product.product_id);
                      const canAdd = canAddToCart(product);
                      
                      return (
                        <tr 
                          key={product._id} 
                          className={`cus-product-row ${inCart ? 'cus-in-cart' : ''} ${!canAdd ? 'cus-cannot-add' : ''}`}
                          onClick={() => canAdd && handleAddToCart(product)}
                        >
                          <td className="cus-product-name-cell cus-product-name">
                            {product.product_name}
                          </td>
                          <td className="cus-brand-cell">{product.brand_name}</td>
                          <td className="cus-category-cell">{product.category}</td>
                          <td className="cus-price-cell">₹{product.price.toFixed(2)}</td>
                          <td className={`cus-stock-cell ${product.stock_quantity === 0 ? 'cus-out-of-stock' : ''}`}>
                            {product.stock_quantity}
                          </td>
                          <td className="cus-unit-cell">{product.unit}</td>
                          <td className="cus-action-cell">
                            <button
                              className={`cus-add-to-cart-btn ${!canAdd ? 'cus-btn-disabled' : ''} ${inCart ? 'cus-in-cart-btn' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              disabled={!canAdd}
                            >
                              {product.stock_quantity === 0 ? 'Out of Stock' : 
                               inCart ? 'Add More' : 'Add to Cart'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredProducts.length === 0 && (
                  <div className="cus-no-products">
                    <div className="cus-no-products-icon">📦</div>
                    <p>No products found</p>
                    <p>Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {orderPlaced && (
        <div className="cus-order-success">
          <div className="cus-success-icon">✅</div>
          <h4>Order Submitted Successfully!</h4>
          <p>Your order is pending admin approval. You can track it in "Our Orders" section.</p>
        </div>
      )}
    </div>
  );
};

export default CusApplyOrder;