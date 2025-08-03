import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ORDER_API, FOOD_API, CONTACT_API } from '../../util/Globalapi';
import './Dashboard.css';

// Icon components (using Font Awesome classes)
const Icon = ({ name, className = "" }) => (
  <i className={`fas ${name} ${className}`}></i>
);

// Stat Card Component
const StatCard = ({ title, value, change, icon, color, isLoading = false }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-card__icon">
      <Icon name={icon} />
    </div>
    <div className="stat-card__content">
      <h3 className="stat-card__title">{title}</h3>
      {isLoading ? (
        <div className="stat-card__skeleton"></div>
      ) : (
        <div className="stat-card__value">{value}</div>
      )}
      {change && (
        <div className={`stat-card__change ${change > 0 ? 'positive' : 'negative'}`}>
          <Icon name={change > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} />
          {Math.abs(change)}%
        </div>
      )}
    </div>
  </div>
);

// Recent Order Component
const RecentOrder = ({ order }) => (
  <div className="recent-order">
    <div className="recent-order__header">
      <div className="recent-order__id">#{order._id.substring(0, 8)}</div>
      <div className={`recent-order__status status--${order.status.toLowerCase().replace(' ', '-')}`}>
        {order.status}
      </div>
    </div>
    <div className="recent-order__customer">
      {order.address?.firstName} {order.address?.lastName}
    </div>
    <div className="recent-order__details">
      <span>{order.items?.length || 0} items</span>
      <span className="recent-order__amount">₹{order.totalAmount}</span>
    </div>
    <div className="recent-order__date">
      {new Date(order.date).toLocaleDateString()}
    </div>
  </div>
);

// Chart Component (Simple CSS-based chart)
const SimpleChart = ({ data, title, color = 'primary' }) => (
  <div className="simple-chart">
    <h3 className="simple-chart__title">{title}</h3>
    <div className="simple-chart__container">
      {data.map((item, index) => (
        <div key={index} className="simple-chart__bar">
          <div 
            className={`simple-chart__bar-fill simple-chart__bar-fill--${color}`}
            style={{ height: `${item.value}%` }}
          ></div>
          <span className="simple-chart__bar-label">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await axios.get(ORDER_API.LIST);
      const orders = ordersResponse.data.success ? ordersResponse.data.data : [];
      
      // Fetch products
      const productsResponse = await axios.get(FOOD_API.LIST);
      const products = productsResponse.data.success ? productsResponse.data.data : [];
      
      // Fetch contacts (customers)
      const contactsResponse = await axios.get(CONTACT_API.LIST);
      const contacts = contactsResponse.data || [];

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'Food Processing').length;
      const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
      const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: contacts.length,
        pendingOrders,
        deliveredOrders,
        cancelledOrders
      });

      // Get recent orders (last 5)
      const recent = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentOrders(recent);

      // Generate sales data for chart (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const salesByDay = last7Days.map(date => {
        const dayOrders = orders.filter(order => 
          order.date && order.date.split('T')[0] === date
        );
        const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        return {
          label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: dayRevenue
        };
      });

      setSalesData(salesByDay);

      // Get top products (by order frequency)
      const productOrderCount = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          productOrderCount[item.name] = (productOrderCount[item.name] || 0) + item.quantity;
        });
      });

      const topProductsList = Object.entries(productOrderCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setTopProducts(topProductsList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__subtitle">Welcome to your e-commerce admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard__stats">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change={12.5}
          icon="fa-chart-line"
          color="success"
          isLoading={loading}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          change={8.2}
          icon="fa-shopping-bag"
          color="primary"
          isLoading={loading}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          change={-2.1}
          icon="fa-box"
          color="info"
          isLoading={loading}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          change={15.3}
          icon="fa-users"
          color="warning"
          isLoading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard__content">
        {/* Left Column */}
        <div className="dashboard__left">
          {/* Sales Chart */}
          <div className="dashboard__card">
            <div className="dashboard__card-header">
              <h3>Sales Overview</h3>
              <span className="dashboard__card-subtitle">Last 7 days</span>
            </div>
            <div className="dashboard__card-content">
              <SimpleChart 
                data={salesData} 
                title="Daily Sales" 
                color="success"
              />
            </div>
          </div>

          {/* Recent Orders */}
          <div className="dashboard__card">
            <div className="dashboard__card-header">
              <h3>Recent Orders</h3>
              <button className="dashboard__card-action">View All</button>
            </div>
            <div className="dashboard__card-content">
              {loading ? (
                <div className="dashboard__skeleton">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="dashboard__skeleton-item"></div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="recent-orders">
                  {recentOrders.map((order, index) => (
                    <RecentOrder key={order._id || index} order={order} />
                  ))}
                </div>
              ) : (
                <div className="dashboard__empty">
                  <Icon name="fa-inbox" className="dashboard__empty-icon" />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard__right">
          {/* Order Status */}
          <div className="dashboard__card">
            <div className="dashboard__card-header">
              <h3>Order Status</h3>
            </div>
            <div className="dashboard__card-content">
              <div className="order-status">
                <div className="order-status__item">
                  <div className="order-status__label">Pending</div>
                  <div className="order-status__value">{stats.pendingOrders}</div>
                </div>
                <div className="order-status__item">
                  <div className="order-status__label">Delivered</div>
                  <div className="order-status__value">{stats.deliveredOrders}</div>
                </div>
                <div className="order-status__item">
                  <div className="order-status__label">Cancelled</div>
                  <div className="order-status__value">{stats.cancelledOrders}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="dashboard__card">
            <div className="dashboard__card-header">
              <h3>Top Products</h3>
            </div>
            <div className="dashboard__card-content">
              {loading ? (
                <div className="dashboard__skeleton">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="dashboard__skeleton-item"></div>
                  ))}
                </div>
              ) : topProducts.length > 0 ? (
                <div className="top-products">
                  {topProducts.map((product, index) => (
                    <div key={index} className="top-product">
                      <div className="top-product__rank">#{index + 1}</div>
                      <div className="top-product__name">{product.name}</div>
                      <div className="top-product__count">{product.count} sold</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard__empty">
                  <Icon name="fa-box" className="dashboard__empty-icon" />
                  <p>No product data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 