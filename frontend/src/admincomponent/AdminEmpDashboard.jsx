import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminEmpDashboard.css';

const AdminEmpDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopOrders, setShopOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const fetchShopOrders = async (shopid) => {
    try {
      setOrdersLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/shop/${shopid}`);
      setShopOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching shop orders:', error);
      setShopOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleShopSelect = (customer) => {
    setSelectedShop(customer);
    fetchShopOrders(customer.shopid);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setTimeout(() => {
      setSelectedShop(null);
      setShopOrders([]);
    }, 300);
  };

  const convertDecimal128 = (value) => {
    if (value && typeof value === 'object' && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal);
    }
    return value || 0;
  };

  const handleApproveOrder = async (billId) => {
    try {
      setActionLoading(billId);
      await axios.put(`http://localhost:5000/api/orders/approve/${billId}`);
      
      setShopOrders(prevOrders => 
        prevOrders.map(order => 
          order.billId === billId 
            ? { ...order, isApproved: true }
            : order
        )
      );
      
      alert('Order approved successfully!');
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOrder = async (billId) => {
    if (!window.confirm('Are you sure you want to reject this order? This will restore the stock quantities.')) {
      return;
    }
    try {
      setActionLoading(billId);
      await axios.put(`http://localhost:5000/api/orders/reject/${billId}`);
      
      setShopOrders(prevOrders => 
        prevOrders.filter(order => order.billId !== billId)
      );
      
      alert('Order rejected successfully! Stock quantities have been restored.');
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.shopname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.shopid?.toString().includes(searchTerm)
  );

  const getShopStats = (orders) => {
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + convertDecimal128(order.total_amount), 0);
    const pendingOrders = orders.filter(order => !order.isApproved).length;
    const approvedOrders = orders.filter(order => order.isApproved).length;
    return {
      totalOrders,
      totalAmount,
      pendingOrders,
      approvedOrders
    };
  };

  const shopStats = selectedShop && shopOrders.length > 0 ? getShopStats(shopOrders) : null;

  return (
    <div className="admin-emp-dashboard">
      <div className="admin-emp-header">
        <h2>Employee Dashboard</h2>
        <p>Manage customer shops and their orders</p>
      </div>

      <div className="admin-emp-search">
        <input
          type="text"
          placeholder="Search shops by name, owner, or shop ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-emp-content">
        <div className="admin-shops-section">
          <div className="admin-section-header">
            <h3>Customer Shops ({filteredCustomers.length})</h3>
            <span className="admin-section-subtitle">
              Click on a shop to view its orders
            </span>
          </div>
          
          {loading ? (
            <div className="admin-loading">Loading shops...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="admin-no-data">
              {searchTerm ? 'No shops found matching your search' : 'No customer shops available'}
            </div>
          ) : (
            <div className="admin-shops-grid">
              {filteredCustomers.map(customer => (
                <div
                  key={customer._id}
                  className="admin-shop-card"
                  onClick={() => handleShopSelect(customer)}
                >
                  <div className="admin-shop-card-header">
                    <h4 className="admin-shop-name">{customer.shopname}</h4>
                  </div>
                  
                  <div className="admin-shop-info">
                    <div className="admin-info-item">
                      <span className="admin-info-label">Owner:</span>
                      <span className="admin-info-value">{customer.name}</span>
                    </div>
                    <div className="admin-info-item">
                      <span className="admin-info-label">Shop ID:</span>
                      <span className="admin-info-value">{customer.shopid}</span>
                    </div>
                    <div className="admin-info-item">
                      <span className="admin-info-label">Phone:</span>
                      <span className="admin-info-value">{customer.phone}</span>
                    </div>
                    <div className="admin-info-item">
                      <span className="admin-info-label">Email:</span>
                      <span className="admin-info-value">{customer.email}</span>
                    </div>
                  </div>
                  
                  <div className="admin-shop-actions">
                    <button 
                      className="admin-view-orders-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShopSelect(customer);
                      }}
                    >
                      View Orders
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className={`popup-overlay ${showPopup ? 'popup-show' : ''}`} onClick={closePopup}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={closePopup}>
              ✕
            </button>

            {selectedShop && (
              <>
                <div className="popup-header">
                  <div className="popup-header-content">
                    <div className="popup-shop-icon">🏪</div>
                    <h2 className="popup-shop-name">{selectedShop.shopname}</h2>
                    <p className="popup-shop-owner">Owner: {selectedShop.name}</p>
                    <p className="popup-shop-id">Shop ID: {selectedShop.shopid}</p>
                  </div>
                </div>

                <div className="popup-body">
                  {shopStats && (
                    <div className="popup-stats">
                      <div className="popup-stat-item">
                        <span className="popup-stat-number">{shopStats.totalOrders}</span>
                        <span className="popup-stat-label">Total Orders</span>
                      </div>
                      <div className="popup-stat-item">
                        <span className="popup-stat-number">₹{shopStats.totalAmount.toFixed(2)}</span>
                        <span className="popup-stat-label">Total Revenue</span>
                      </div>
                      <div className="popup-stat-item">
                        <span className="popup-stat-number">{shopStats.pendingOrders}</span>
                        <span className="popup-stat-label">Pending</span>
                      </div>
                      <div className="popup-stat-item">
                        <span className="popup-stat-number">{shopStats.approvedOrders}</span>
                        <span className="popup-stat-label">Approved</span>
                      </div>
                    </div>
                  )}

                  {ordersLoading ? (
                    <div className="popup-loading">Loading orders...</div>
                  ) : shopOrders.length === 0 ? (
                    <div className="popup-no-orders">
                      <div className="popup-no-orders-icon">📦</div>
                      <h4>No Orders Found</h4>
                      <p>This shop hasn't placed any orders yet.</p>
                    </div>
                  ) : (
                    <div className="popup-orders-list">
                      {shopOrders.map(order => (
                        <div key={order._id} className="popup-order-card">
                          <div className="popup-order-header">
                            <div className="popup-order-id">
                              <strong>Bill ID:</strong> {order.billId}
                            </div>
                            <div className={`popup-order-status ${order.isApproved ? 'status-approved' : 'status-pending'}`}>
                              {order.isApproved ? '✅ Approved' : '⏳ Pending'}
                            </div>
                          </div>
                          
                          <div className="popup-order-details">
                            <div className="popup-order-info">
                              <div className="popup-order-amount">
                                <strong>Total Amount:</strong> ₹{convertDecimal128(order.total_amount).toFixed(2)}
                              </div>
                              <div className="popup-order-date">
                                <strong>Order Date:</strong> {new Date(order.orderedAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            
                            <div className="popup-order-products">
                              <h5>Products Ordered:</h5>
                              <div className="popup-products-table">
                                {order.products.map((product, index) => (
                                  <div key={index} className="popup-product-row">
                                    <span className="popup-product-name">{product.product_name}</span>
                                    <span className="popup-product-quantity">
                                     quantity {product.quantity}    
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {!order.isApproved && (
                              <div className="popup-order-actions">
                                <button
                                  className="popup-approve-btn"
                                  onClick={() => handleApproveOrder(order.billId)}
                                  disabled={actionLoading === order.billId}
                                >
                                  {actionLoading === order.billId ? 'Processing...' : '✅ Approve Order'}
                                </button>
                                <button
                                  className="popup-reject-btn"
                                  onClick={() => handleRejectOrder(order.billId)}
                                  disabled={actionLoading === order.billId}
                                >
                                  {actionLoading === order.billId ? 'Processing...' : '❌ Reject Order'}
                                </button>
                              </div>
                            )}

                            {order.isApproved && (
                              <div className="popup-order-approved">
                                ✅ This order has been approved successfully.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmpDashboard;