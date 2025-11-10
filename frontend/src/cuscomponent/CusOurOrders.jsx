import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CusOurOrders.css';

const CusOurOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://supermarket-208b.onrender.com/";
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/orders/shop/${user.shopid}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
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

  const getStatusBadge = (isApproved) => {
    return isApproved ? 'Approved' : 'Pending';
  };

  const getStatusClass = (isApproved) => {
    return isApproved ? 'cus-order-approved' : 'cus-order-pending';
  };

  return (
    <div className="cus-our-orders">
      <div className="cus-orders-header">
        <h2>Our Orders</h2>
        <p>Track your order history and status</p>
      </div>

      <div className="cus-orders-content">
        {loading ? (
          <div className="cus-loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="cus-no-orders">
            <div className="cus-no-orders-icon">📦</div>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Start by creating an order in the "Apply Order" section.</p>
          </div>
        ) : (
          <div className="cus-orders-list">
            {orders.map(order => (
              <div key={order._id} className="cus-order-card">
                <div className="cus-order-header">
                  <div className="cus-order-id">
                    <strong>Order ID:</strong> {order.billId}
                  </div>
                  <div className={`cus-order-status ${getStatusClass(order.isApproved)}`}>
                    {getStatusBadge(order.isApproved)}
                  </div>
                </div>
                
                <div className="cus-order-details">
                  <div className="cus-order-info">
                    <div className="cus-order-amount">
                      <strong>Total Amount:</strong> ₹{convertDecimal128(order.total_amount).toFixed(2)}
                    </div>
                    <div className="cus-order-date">
                      <strong>Order Date:</strong> {new Date(order.orderedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div className="cus-order-products">
                    <h5>Products Ordered:</h5>
                    <div className="cus-products-list">
                      {order.products.map((product, index) => (
                        <div key={index} className="cus-product-item">
                          <span className="cus-product-name">{product.product_name}</span>
                          <span className="cus-product-quantity">
                            Quantity - {product.quantity} 
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CusOurOrders;