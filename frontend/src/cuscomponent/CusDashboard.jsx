import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CusDashboard.css';

const CusDashboard = ({ user }) => {
  const [timeFilter, setTimeFilter] = useState('today');
  const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://supermarket-208b.onrender.com/";
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState({
    daily: { current: 0, previous: 0 },
    weekly: { current: 0, previous: 0 },
    monthly: { current: 0, previous: 0 }
  });
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (allOrders.length > 0) {
      updateStatsAndCharts();
    }
  }, [timeFilter, allOrders]);

  const convertDecimal128 = (value) => {
    if (value && typeof value === 'object' && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal);
    }
    return value || 0;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const ordersRes = await axios.get(`${API_BASE_URL}/api/orders/shop/${user.shopid}`);
      const orders = ordersRes.data.orders || [];

      const processedOrders = orders.map(order => ({
        ...order,
        total_amount: convertDecimal128(order.total_amount),
        orderedAt: new Date(order.orderedAt)
      }));

      setAllOrders(processedOrders);
      calculateComparisonData(processedOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatsAndCharts = () => {
    const filteredOrders = filterOrdersByTime(allOrders, timeFilter);
    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const pendingOrders = filteredOrders.filter(order => !order.isApproved).length;
    const approvedOrders = filteredOrders.filter(order => order.isApproved).length;

    setStats({
      totalOrders: filteredOrders.length,
      pendingOrders,
      approvedOrders,
      totalAmount
    });
  };

  const filterOrdersByTime = (orders, filter) => {
    const now = new Date();
    
    switch (filter) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return orders.filter(order => {
          const orderDate = new Date(order.orderedAt);
          return orderDate >= today;
        });
      
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
        return orders.filter(order => {
          const orderDate = new Date(order.orderedAt);
          return orderDate >= yesterdayStart && orderDate < yesterdayEnd;
        });
      
      case 'this-week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return orders.filter(order => order.orderedAt >= weekStart);
      
      case 'prev-week':
        const prevWeekStart = new Date(now);
        prevWeekStart.setDate(now.getDate() - now.getDay() - 7);
        prevWeekStart.setHours(0, 0, 0, 0);
        const prevWeekEnd = new Date(prevWeekStart);
        prevWeekEnd.setDate(prevWeekStart.getDate() + 7);
        return orders.filter(order => 
          order.orderedAt >= prevWeekStart && order.orderedAt < prevWeekEnd
        );
      
      case 'this-month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders.filter(order => order.orderedAt >= monthStart);
      
      case 'prev-month':
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        return orders.filter(order => 
          order.orderedAt >= prevMonthStart && order.orderedAt < prevMonthEnd
        );
      
      default:
        return orders;
    }
  };

  const calculateComparisonData = (orders) => {
    const now = new Date();
    
    // Daily comparison (Today vs Yesterday)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayOrders = orders.filter(order => order.orderedAt >= today);
    const yesterdayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderedAt);
      return orderDate >= yesterday && orderDate < today;
    });

    // Weekly comparison (This week vs Previous week)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);
    
    const thisWeekOrders = orders.filter(order => order.orderedAt >= weekStart);
    const prevWeekOrders = orders.filter(order => 
      order.orderedAt >= prevWeekStart && order.orderedAt < prevWeekEnd
    );

    // Monthly comparison (This month vs Previous month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthOrders = orders.filter(order => order.orderedAt >= monthStart);
    const prevMonthOrders = orders.filter(order => 
      order.orderedAt >= prevMonthStart && order.orderedAt < prevMonthEnd
    );

    setComparisonData({
      daily: {
        current: todayOrders.reduce((sum, order) => sum + order.total_amount, 0),
        previous: yesterdayOrders.reduce((sum, order) => sum + order.total_amount, 0)
      },
      weekly: {
        current: thisWeekOrders.reduce((sum, order) => sum + order.total_amount, 0),
        previous: prevWeekOrders.reduce((sum, order) => sum + order.total_amount, 0)
      },
      monthly: {
        current: thisMonthOrders.reduce((sum, order) => sum + order.total_amount, 0),
        previous: prevMonthOrders.reduce((sum, order) => sum + order.total_amount, 0)
      }
    });
  };

  const renderPieChart = (current, previous, title) => {
    const total = current + previous;
    if (total === 0) {
      return (
        <div className="cus-chart-placeholder">
          <div className="cus-no-data">No data available</div>
        </div>
      );
    }

    const currentPercent = total > 0 ? (current / total * 100).toFixed(1) : 0;
    const previousPercent = total > 0 ? (previous / total * 100).toFixed(1) : 0;

    return (
      <div className="cus-pie-chart">
        <div className="cus-chart-title">{title}</div>
        <div className="cus-chart-visual">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#34495e"
              strokeWidth="20"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#27ae60"
              strokeWidth="20"
              strokeDasharray={`${currentPercent} ${100 - currentPercent}`}
              strokeDashoffset="25"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="cus-chart-center">
            <span className="cus-chart-percentage">{currentPercent}%</span>
          </div>
        </div>
        <div className="cus-chart-legend">
          <div className="cus-legend-item">
            <span className="cus-legend-color current"></span>
            <span>Current: ₹{current.toFixed(2)}</span>
          </div>
          <div className="cus-legend-item">
            <span className="cus-legend-color previous"></span>
            <span>Previous: ₹{previous.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBarChart = (current, previous, title) => {
    const maxValue = Math.max(current, previous, 1);
    const currentHeight = (current / maxValue) * 100;
    const previousHeight = (previous / maxValue) * 100;

    return (
      <div className="cus-bar-chart">
        <div className="cus-chart-title">{title}</div>
        <div className="cus-bars-container">
          <div className="cus-bar-group">
            <div className="cus-bar-label">Current</div>
            <div className="cus-bar-wrapper">
              <div 
                className="cus-bar current" 
                style={{ height: `${currentHeight}%` }}
              >
                <span className="cus-bar-value">₹{current.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="cus-bar-group">
            <div className="cus-bar-label">Previous</div>
            <div className="cus-bar-wrapper">
              <div 
                className="cus-bar previous" 
                style={{ height: `${previousHeight}%` }}
              >
                <span className="cus-bar-value">₹{previous.toFixed(2)}</span>
              </div>
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
    return (
      <div className="cus-loading">
        <div className="cus-loading-spinner"></div>
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="cus-dashboard">
      <div className="cus-dashboard-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="cus-active-filter">
            Showing data for: <strong>{getFilterDisplayName(timeFilter)}</strong>
          </p>
        </div>
        <div className="cus-time-filters">
          {['today', 'yesterday', 'this-week', 'prev-week', 'this-month', 'prev-month'].map(filter => (
            <button
              key={filter}
              className={`cus-time-filter ${timeFilter === filter ? 'cus-filter-active' : ''}`}
              onClick={() => setTimeFilter(filter)}
            >
              {getFilterDisplayName(filter)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cus-stats-grid">
        <div className="cus-stat-card">
          <div className="cus-stat-icon">📦</div>
          <div className="cus-stat-content">
            <h3>Total Orders</h3>
            <div className="cus-stat-value">{stats.totalOrders}</div>
            <div className="cus-stat-period">{getFilterDisplayName(timeFilter)}</div>
          </div>
        </div>

        <div className="cus-stat-card">
          <div className="cus-stat-icon">⏳</div>
          <div className="cus-stat-content">
            <h3>Pending Orders</h3>
            <div className="cus-stat-value">{stats.pendingOrders}</div>
            <div className="cus-stat-period">Awaiting Approval</div>
          </div>
        </div>

        <div className="cus-stat-card">
          <div className="cus-stat-icon">✅</div>
          <div className="cus-stat-content">
            <h3>Approved Orders</h3>
            <div className="cus-stat-value">{stats.approvedOrders}</div>
            <div className="cus-stat-period">Completed</div>
          </div>
        </div>

        <div className="cus-stat-card">
          <div className="cus-stat-icon">💰</div>
          <div className="cus-stat-content">
            <h3>Total Amount</h3>
            <div className="cus-stat-value">₹{stats.totalAmount.toFixed(2)}</div>
            <div className="cus-stat-period">{getFilterDisplayName(timeFilter)}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="cus-charts-section">
        <div className="cus-chart-row">
          <div className="cus-chart-container">
            <h4>Daily Comparison</h4>
            <div className="cus-chart-content">
              {renderPieChart(comparisonData.daily.current, comparisonData.daily.previous, "Today vs Yesterday")}
            </div>
          </div>
          
          <div className="cus-chart-container">
            <h4>Weekly Comparison</h4>
            <div className="cus-chart-content">
              {renderPieChart(comparisonData.weekly.current, comparisonData.weekly.previous, "This Week vs Last Week")}
            </div>
          </div>
          
          <div className="cus-chart-container">
            <h4>Monthly Comparison</h4>
            <div className="cus-chart-content">
              {renderPieChart(comparisonData.monthly.current, comparisonData.monthly.previous, "This Month vs Last Month")}
            </div>
          </div>
        </div>

        <div className="cus-chart-row">
          <div className="cus-chart-container cus-bar-chart-container">
            <h4>Revenue Comparison - Bar Chart</h4>
            <div className="cus-bar-charts-grid">
              <div className="cus-bar-chart-item">
                {renderBarChart(comparisonData.daily.current, comparisonData.daily.previous, "Daily")}
              </div> 
              <div className="cus-bar-chart-item">
                {renderBarChart(comparisonData.weekly.current, comparisonData.weekly.previous, "Weekly")}
              </div>
              <div className="cus-bar-chart-item">
                {renderBarChart(comparisonData.monthly.current, comparisonData.monthly.previous, "Monthly")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CusDashboard;