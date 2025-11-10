import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://supermarket-208b.onrender.com";
  const [timeFilter, setTimeFilter] = useState('today');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalAmount: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const convertDecimal128 = (value) => {
    if (value && typeof value === 'object' && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal);
    }
    return value || 0;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch customers
      const customersRes = await axios.get(`${API_BASE_URL}/api/users/customers`);
      const customers = customersRes.data.customers || [];
      setAllCustomers(customers);
      
      // Fetch orders
      const ordersRes = await axios.get(`${API_BASE_URL}/api/orders/allorders`);
      const orders = ordersRes.data || [];

      // Process orders
      const processedOrders = orders.map(order => ({
        ...order,
        total_amount: convertDecimal128(order.total_amount),
        orderDate: new Date(order.orderedAt || order.createdAt),
        status: order.status || 'pending'
      }));

      setAllOrders(processedOrders);

      // Calculate stats based on time filter
      const filteredData = calculateFilteredData(processedOrders, timeFilter);
      
      setStats({
        totalOrders: filteredData.orders.length,
        pendingOrders: filteredData.orders.filter(order => order.status === 'pending').length,
        totalAmount: filteredData.totalAmount,
        totalCustomers: customers.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFilteredData = (orders, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filteredOrders = [];
    
    switch (filter) {
      case 'today':
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate.toDateString() === today.toDateString();
        });
        break;
        
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate.toDateString() === yesterday.toDateString();
        });
        break;
        
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= weekStart;
        });
        break;
        
      case 'prev-week':
        const prevWeekStart = new Date(today);
        prevWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const prevWeekEnd = new Date(prevWeekStart);
        prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= prevWeekStart && orderDate <= prevWeekEnd;
        });
        break;
        
      case 'this-month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= monthStart;
        });
        break;
        
      case 'prev-month':
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= prevMonthStart && orderDate <= prevMonthEnd;
        });
        break;
        
      default:
        filteredOrders = orders;
    }

    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    return {
      orders: filteredOrders,
      totalAmount
    };
  };

  // Calculate comparison data dynamically from all orders
  const getComparisonData = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Today vs Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === today.toDateString();
    });
    
    const yesterdayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === yesterday.toDateString();
    });

    // This Week vs Previous Week
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    
    const prevWeekStart = new Date(currentWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(currentWeekEnd);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
    
    const currentWeekOrders = allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= currentWeekStart && orderDate <= currentWeekEnd;
    });
    
    const prevWeekOrders = allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= prevWeekStart && orderDate <= prevWeekEnd;
    });

    // This Month vs Previous Month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const currentMonthOrders = allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= currentMonthStart && orderDate <= currentMonthEnd;
    });
    
    const prevMonthOrders = allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= prevMonthStart && orderDate <= prevMonthEnd;
    });

    return {
      daily: {
        current: todayOrders.reduce((sum, order) => sum + order.total_amount, 0),
        previous: yesterdayOrders.reduce((sum, order) => sum + order.total_amount, 0),
        currentOrders: todayOrders.length,
        previousOrders: yesterdayOrders.length
      },
      weekly: {
        current: currentWeekOrders.reduce((sum, order) => sum + order.total_amount, 0),
        previous: prevWeekOrders.reduce((sum, order) => sum + order.total_amount, 0),
        currentOrders: currentWeekOrders.length,
        previousOrders: prevWeekOrders.length
      },
      monthly: {
        current: currentMonthOrders.reduce((sum, order) => sum + order.total_amount, 0),
        previous: prevMonthOrders.reduce((sum, order) => sum + order.total_amount, 0),
        currentOrders: currentMonthOrders.length,
        previousOrders: prevMonthOrders.length
      }
    };
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const renderPieChart = (current, previous, title, currentOrders, previousOrders) => {
    const total = current + previous;
    
    if (total === 0 && currentOrders === 0 && previousOrders === 0) {
      return (
        <div className="pie-chart-placeholder">
          <div className="no-data">No data available</div>
        </div>
      );
    }

    const currentPercent = total > 0 ? (current / total * 100).toFixed(1) : 0;
    const previousPercent = total > 0 ? (previous / total * 100).toFixed(1) : 0;
    const percentageChange = calculatePercentageChange(current, previous);

    // Calculate angles for pie chart
    const currentAngle = (currentPercent / 100) * 360;
    const previousAngle = (previousPercent / 100) * 360;

    return (
      <div className="pie-chart-container">
        <div className="pie-chart-visual">
          <svg width="150" height="150" viewBox="0 0 150 150">
            {/* Previous slice */}
            <circle 
              cx="75" 
              cy="75" 
              r="60" 
              fill="none" 
              stroke="#e74c3c" 
              strokeWidth="30"
              strokeDasharray={`${previousAngle} 360`}
              transform="rotate(-90 75 75)"
            />
            {/* Current slice */}
            <circle 
              cx="75" 
              cy="75" 
              r="60" 
              fill="none" 
              stroke="#3498db" 
              strokeWidth="30"
              strokeDasharray={`${currentAngle} 360`}
              transform={`rotate(${previousAngle - 90} 75 75)`}
            />
          </svg>
          <div className="pie-center">
            <span className="percentage">{currentPercent}%</span>
            <span className="center-label">Current</span>
          </div>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="color-dot current-dot"></span>
            <div className="legend-info">
              <span className="legend-label">Current Period</span>
              <span className="legend-value">₹{current.toFixed(2)}</span>
              <span className="legend-count">{currentOrders} orders</span>
            </div>
          </div>
          <div className="legend-item">
            <span className="color-dot previous-dot"></span>
            <div className="legend-info">
              <span className="legend-label">Previous Period</span>
              <span className="legend-value">₹{previous.toFixed(2)}</span>
              <span className="legend-count">{previousOrders} orders</span>
            </div>
          </div>
          <div className={`change-indicator ${percentageChange >= 0 ? 'positive' : 'negative'}`}>
            {percentageChange >= 0 ? '↗' : '↘'} {Math.abs(percentageChange)}% change
          </div>
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    const comparisonData = getComparisonData();
    const { daily, weekly, monthly } = comparisonData;
    
    const maxRevenue = Math.max(
      daily.current, daily.previous,
      weekly.current, weekly.previous,
      monthly.current, monthly.previous
    ) || 1;

    const maxOrders = Math.max(
      daily.currentOrders, daily.previousOrders,
      weekly.currentOrders, weekly.previousOrders,
      monthly.currentOrders, monthly.previousOrders
    ) || 1;

    return (
      <div className="bar-chart-container">
        <div className="bar-chart">
          {/* Daily Comparison */}
          <div className="bar-group">
            <div className="bar-label">Today vs Yesterday</div> <br /><br />
            <div className="bars">
              <div className="bar-wrapper">
                <div 
                  className="bar current-bar" 
                  style={{ height: `${(daily.current / maxRevenue) * 80}%` }}
                >
                  <span className="bar-value">₹{daily.current.toFixed(2)}</span>
                </div>
                <div className="bar-label-small">Today</div>
              </div>
              <div className="bar-wrapper">
                <div 
                  className="bar previous-bar" 
                  style={{ height: `${(daily.previous / maxRevenue) * 80}%` }}
                >
                  <span className="bar-value">₹{daily.previous.toFixed(2)}</span>
                </div>
                <div className="bar-label-small">Yesterday</div>
              </div>
            </div>
          </div>
          
          {/* Weekly Comparison */}
          <div className="bar-group">
            <div className="bar-label">This Week vs Last Week</div> <br /> <br />
            <div className="bars">
              <div className="bar-wrapper">
                <div 
                  className="bar current-bar" 
                  style={{ height: `${(weekly.current / maxRevenue) * 80}%` }}
                >
                  <span className="bar-value">₹{weekly.current.toFixed(2)}</span>
                </div>
                <div className="bar-label-small">This Week</div>
              </div>
              <div className="bar-wrapper">
                <div 
                  className="bar previous-bar" 
                  style={{ height: `${(weekly.previous / maxRevenue) * 80}%` }}
                >
                  <span className="bar-value">₹{weekly.previous.toFixed(2)}</span>
                </div>
                <div className="bar-label-small">Last Week</div>
              </div>
            </div>
          </div>
          
          {/* Monthly Comparison */}
          <div className="bar-group">
            <div className="bar-label">This Month vs Last Month</div> <br /><br />
            <div className="bars">
              <div className="bar-wrapper">
                <div 
                  className="bar current-bar" 
                  style={{ height: `${(monthly.current / maxRevenue) * 80}%` }}
                >
                  <span className="bar-value">₹{monthly.current.toFixed(2)}</span>
                </div>
                <div className="bar-label-small">This Month</div>
              </div>
              <div className="bar-wrapper">
                <div 
                  className="bar previous-bar" 
                  style={{ height: `${(monthly.previous / maxRevenue) * 80}%` }}
                >
                  <span className="bar-value">₹{monthly.previous.toFixed(2)}</span>
                </div>
                <div className="bar-label-small">Last Month</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Orders Count Display */}
        <div className="orders-comparison">
          <h5>Orders Comparison</h5>
          <div className="orders-grid">
            <div className="orders-item">
              <span className="orders-period">Today:</span>
              <span className="orders-count">{daily.currentOrders} orders</span>
            </div>
            <div className="orders-item">
              <span className="orders-period">Yesterday:</span>
              <span className="orders-count">{daily.previousOrders} orders</span>
            </div>
            <div className="orders-item">
              <span className="orders-period">This Week:</span>
              <span className="orders-count">{weekly.currentOrders} orders</span>
            </div>
            <div className="orders-item">
              <span className="orders-period">Last Week:</span>
              <span className="orders-count">{weekly.previousOrders} orders</span>
            </div>
            <div className="orders-item">
              <span className="orders-period">This Month:</span>
              <span className="orders-count">{monthly.currentOrders} orders</span>
            </div>
            <div className="orders-item">
              <span className="orders-period">Last Month:</span>
              <span className="orders-count">{monthly.previousOrders} orders</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getFilterDisplayName = (filter) => {
    const filterNames = {
      'today': 'Today',
      'yesterday': 'Yesterday',
      'this-week': 'This Week',
      'prev-week': 'Previous Week',
      'this-month': 'This Month',
      'prev-month': 'Previous Month'
    };
    return filterNames[filter] || filter;
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  const comparisonData = getComparisonData();

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="active-filter">
            Showing stats for: <strong>{getFilterDisplayName(timeFilter)}</strong>
          </p>
        </div>
        <div className="time-filters">
          {['today', 'yesterday', 'this-week', 'prev-week', 'this-month', 'prev-month'].map(filter => (
            <button
              key={filter}
              className={`time-filter ${timeFilter === filter ? 'filter-active' : ''}`}
              onClick={() => setTimeFilter(filter)}
            >
              {getFilterDisplayName(filter)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Orders</h3>
            <span className="stat-badge">{getFilterDisplayName(timeFilter)}</span>
          </div>
          <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
          <div className="stat-trend">
            Total orders in selected period
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Pending Orders</h3>
            <span className="stat-badge">{getFilterDisplayName(timeFilter)}</span>
          </div>
          <div className="stat-value">{stats.pendingOrders.toLocaleString()}</div>
          <div className="stat-trend">
            Awaiting processing
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Amount</h3>
            <span className="stat-badge">{getFilterDisplayName(timeFilter)}</span>
          </div>
          <div className="stat-value">₹{stats.totalAmount.toFixed(2)}</div>
          <div className="stat-trend">
            Revenue in selected period
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Customers</h3>
            <span className="stat-badge">All Time</span>
          </div>
          <div className="stat-value">{stats.totalCustomers.toLocaleString()}</div>
          <div className="stat-trend">
            Registered customers
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h4>Daily Revenue Comparison (Today vs Yesterday)</h4>
          <div className="chart-content">
            {renderPieChart(
              comparisonData.daily.current, 
              comparisonData.daily.previous, 
              "Daily",
              comparisonData.daily.currentOrders,
              comparisonData.daily.previousOrders
            )}
          </div>
        </div>
        
        <div className="chart-container">
          <h4>Weekly Revenue Comparison (This Week vs Previous Week)</h4>
          <div className="chart-content">
            {renderPieChart(
              comparisonData.weekly.current, 
              comparisonData.weekly.previous, 
              "Weekly",
              comparisonData.weekly.currentOrders,
              comparisonData.weekly.previousOrders
            )}
          </div>
        </div>
        
        <div className="chart-container">
          <h4>Monthly Revenue Comparison (This Month vs Previous Month)</h4>
          <div className="chart-content">
            {renderPieChart(
              comparisonData.monthly.current, 
              comparisonData.monthly.previous, 
              "Monthly",
              comparisonData.monthly.currentOrders,
              comparisonData.monthly.previousOrders
            )}
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bar-chart-section">
        <div className="chart-container full-width">
          <h4>Revenue Comparison Overview</h4> 
          <div className="chart-content bar-chart-content">
            {renderBarChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;