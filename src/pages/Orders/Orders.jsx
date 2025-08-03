import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Orders.css';
import emailjs from 'emailjs-com';
import { ORDER_API, FOOD_API } from '../../util/Globalapi';

// ProductImage component to handle image display with fallback
const ProductImage = ({ item, productDetails, fetchProductDetails, allProducts }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      console.log('ProductImage: Loading image for item:', item.name, 'Item ID:', item._id);
      
      // First, try to use the image from the item itself
      if (item.image && item.image.trim()) {
        console.log('ProductImage: Using image from item directly');
        const src = item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`;
        setImageSrc(src);
        return;
      }

      // If no image in item, try to fetch from product details
      if (item._id || item.productId) {
        const productId = item._id || item.productId;
        console.log('ProductImage: Looking for product with ID:', productId);
        
        // Check if we already have the product details
        if (productDetails[productId] && productDetails[productId].image) {
          console.log('ProductImage: Found product in productDetails cache');
          const src = productDetails[productId].image.startsWith('data:') 
            ? productDetails[productId].image 
            : `data:image/jpeg;base64,${productDetails[productId].image}`;
          setImageSrc(src);
          return;
        }

        // Check if we have all products loaded and can find the product
        if (allProducts.length > 0) {
          console.log('ProductImage: Searching in allProducts array, length:', allProducts.length);
          const product = allProducts.find(p => p._id === productId);
          if (product && product.image) {
            console.log('ProductImage: Found product in allProducts array');
            const src = product.image.startsWith('data:') 
              ? product.image 
              : `data:image/jpeg;base64,${product.image}`;
            setImageSrc(src);
            return;
          } else {
            console.log('ProductImage: Product not found in allProducts array');
          }
        }

        // Fetch product details if not available
        console.log('ProductImage: Fetching product details from API');
        setIsLoading(true);
        try {
          const productData = await fetchProductDetails(productId);
          if (productData && productData.image) {
            console.log('ProductImage: Successfully fetched product data');
            const src = productData.image.startsWith('data:') 
              ? productData.image 
              : `data:image/jpeg;base64,${productData.image}`;
            setImageSrc(src);
          } else {
            console.log('ProductImage: No image found in fetched product data');
            setHasError(true);
          }
        } catch (error) {
          console.error('Error loading product image:', error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('ProductImage: No product ID found in item');
        setHasError(true);
      }
    };

    loadImage();
  }, [item, productDetails, fetchProductDetails, allProducts]);

  if (isLoading) {
    return (
      <div className="image-placeholder" style={{ display: 'flex' }}>
        <i className="fas fa-spinner fa-spin"></i>
      </div>
    );
  }

  if (hasError || !imageSrc) {
    return (
      <div className="image-placeholder" style={{ display: 'flex' }}>
        <i className="fas fa-image"></i>
      </div>
    );
  }

  return (
    <>
      <img 
        src={imageSrc}
        alt={item.name}
        onError={() => {
          console.log('Image failed to load for item:', item.name);
          setHasError(true);
        }}
        onLoad={() => {
          console.log('Image loaded successfully for item:', item.name);
        }}
      />
      <div className="image-placeholder" style={{ display: 'none' }}>
        <i className="fas fa-image"></i>
      </div>
    </>
  );
};

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productDetails, setProductDetails] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const itemsPerPage = 10;


  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ORDER_API.LIST);
      if (response.data.success) {
        // Sort orders by date in descending order (newest first)
        const sortedOrders = response.data.data.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        // Debug: Log first order's items to check image data
        if (sortedOrders.length > 0 && sortedOrders[0].items.length > 0) {
          console.log('Sample order item data:', {
            itemName: sortedOrders[0].items[0].name,
            hasImage: !!sortedOrders[0].items[0].image,
            imageLength: sortedOrders[0].items[0].image?.length,
            imageStart: sortedOrders[0].items[0].image?.substring(0, 30),
            hasId: !!sortedOrders[0].items[0]._id,
            hasProductId: !!sortedOrders[0].items[0].productId,
            itemKeys: Object.keys(sortedOrders[0].items[0]),
            itemId: sortedOrders[0].items[0]._id
          });
        }
        
        setOrders(sortedOrders);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      toast.error("Error connecting to server");
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };



const statusHandler = async (event, orderId) => {
  try {
    const newStatus = event.target.value;
    const orderToUpdate = orders.find(order => order._id === orderId);
    
    if (!orderToUpdate) {
      toast.error("Order not found");
      return;
    }

    // Validate email exists
    if (!orderToUpdate.address?.email) {
      toast.error("Customer email not found. Cannot send notification.");
      return;
    }

    // First update the order status
    const response = await axios.post(ORDER_API.STATUS, {
      orderId,
      status: newStatus
    });

    if (response.data.success) {
      // Send email notification using EmailJS
      try {
        const templateParams = {
          email: orderToUpdate.address.email, // Changed to match your template
          name: `${orderToUpdate.address.firstName} ${orderToUpdate.address.lastName}`,
          to_name: `${orderToUpdate.address.firstName} ${orderToUpdate.address.lastName}`,
          order_id: orderToUpdate._id.substring(0, 8),
          order_date: new Date(orderToUpdate.date).toLocaleDateString(),
          old_status: orderToUpdate.status,
          new_status: newStatus,
          order_items: orderToUpdate.items.map(item => 
            `${item.name} (Qty: ${item.quantity}) - ₹${item.price} each`
          ).join('<br>'),
          total_amount: orderToUpdate.totalAmount,
          reply_to: 'your-support@email.com'
        };

        console.log("Sending email to:", templateParams.email);
        console.log("Email params:", templateParams);

        await emailjs.send(
          'service_rrkhv9a',
          'template_6jymct6',
          templateParams,
          '3pJJPPIW3OyXhX9qA'
        );

        toast.success("Order status updated and notification sent");
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        if (emailError.text) {
          console.error("EmailJS response:", emailError.text);
        }
        toast.error("Status updated but email failed: " + emailError.message);
      }

      await fetchAllOrders();
    } else {
      toast.error("Failed to update status");
    }
  } catch (error) {
    toast.error("Error updating status");
    console.error("Status update error:", error);
  }
};

  const loadAllProducts = async () => {
    if (productsLoaded) return;
    
    try {
      const response = await axios.get(FOOD_API.LIST);
      if (response.data.success) {
        setAllProducts(response.data.data);
        setProductsLoaded(true);
        console.log('Loaded all products:', response.data.data.length);
      }
    } catch (error) {
      console.error('Error loading all products:', error);
    }
  };

  const fetchProductDetails = async (productId) => {
    // Check if we already have the product details
    if (productDetails[productId]) {
      return productDetails[productId];
    }

    // If we have all products loaded, find the product
    if (allProducts.length > 0) {
      const product = allProducts.find(p => p._id === productId);
      if (product) {
        setProductDetails(prev => ({
          ...prev,
          [productId]: product
        }));
        return product;
      }
    }

    // If products not loaded yet, load them first
    if (!productsLoaded) {
      await loadAllProducts();
      const product = allProducts.find(p => p._id === productId);
      if (product) {
        setProductDetails(prev => ({
          ...prev,
          [productId]: product
        }));
        return product;
      }
    }

    return null;
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#4caf50';
      case 'Cancelled': return '#f44336';
      case 'Out for delivery': return '#ff9800';
      case 'Order Confirmed': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.address.firstName + " " + order.address.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.phone.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchAllOrders();
    loadAllProducts();
  }, []);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Order Management</h1>
        <div className="controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-box">
            <label>Filter by status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Orders</option>
              <option value="Food Processing">Order Received</option>
              <option value="Order Confirmed">Order Confirmed</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-box-open"></i>
          <p>No orders found</p>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {currentItems.map((order) => (
              <div key={order._id} className="order-card">
                <div 
                  className="order-summary" 
                  onClick={() => toggleOrderDetails(order._id)}
                >
                  <div className="order-id">
                    <span>Order ID:</span> {order._id.substring(0, 8)}...
                    <i className={`fas fa-chevron-${expandedOrders[order._id] ? 'up' : 'down'}`}></i>
                  </div>
                  
                  <div className="customer-info">
                    <div className="customer-name">
                      <i className="fas fa-user"></i>
                      {order.address.firstName} {order.address.lastName}
                    </div>
                    <div className="customer-phone">
                      <i className="fas fa-phone"></i>
                      {order.address.phone}
                    </div>
                  </div>
                  
                  <div className="order-meta">
                    <div className="order-date">
                      <i className="fas fa-calendar"></i>
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                    <div className="order-items-count">
                      <i className="fas fa-shopping-basket"></i>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="order-total">
                    <span>Total:</span> ₹{order.totalAmount}
                  </div>
                  
                  <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status}
                  </div>
                </div>
                
                {expandedOrders[order._id] && (
                  <div className="order-details">
                    <div className="details-section">
                      <h3><i className="fas fa-user-circle"></i> Customer Details</h3>
                      <div className="customer-details-grid">
                        <div>
                          <label>Name:</label>
                          <p>{order.address.firstName} {order.address.lastName}</p>
                        </div>
                        <div>
                          <label>Email:</label>
                          <p>{order.address.email}</p>
                        </div>
                        <div>
                          <label>Phone:</label>
                          <p>{order.address.phone}</p>
                        </div>
                        <div>
                          <label>Address:</label>
                          <p>
                            {order.address.street}, {order.address.city},<br />
                            {order.address.state}, {order.address.country} - {order.address.zipcode}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="details-section">
                      <h3><i className="fas fa-box"></i> Order Items</h3>
                      <div className="items-grid">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-image">
                              <ProductImage 
                                item={item} 
                                productDetails={productDetails}
                                fetchProductDetails={fetchProductDetails}
                                allProducts={allProducts}
                              />
                            </div>
                            <div className="item-details">
                              <div className="item-name">{item.name}</div>
                              <div className="item-quantity">Qty: {item.quantity}</div>
                              <div className="item-price">₹{item.price} each</div>
                            </div>
                            <div className="item-total">₹{item.price * item.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="details-section">
                      <h3><i className="fas fa-receipt"></i> Payment & Summary</h3>
                      <div className="payment-details-grid">
                        <div>
                          <label>Subtotal:</label>
                          <p>₹{order.amount}</p>
                        </div>
                        <div>
                          <label>Shipping:</label>
                          <p>₹{order.shippingCharge}</p>
                        </div>
                        <div>
                          <label>Total Amount:</label>
                          <p className="total-amount">₹{order.totalAmount}</p>
                        </div>
                        <div>
                          <label>Payment Status:</label>
                          <p className={order.payment ? 'payment-success' : 'payment-pending'}>
                            {order.payment ? 'Paid' : 'Pending'}
                          </p>
                        </div>
                        <div>
                          <label>Update Status:</label>
                          <select 
                            className="status-select" 
                            onChange={(event) => statusHandler(event, order._id)} 
                            value={order.status}
                          >
                            <option value="Food Processing">Order Received</option>
                            <option value="Order Confirmed">Order Confirmed</option>
                            <option value="Out for delivery">Out for delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredOrders.length > itemsPerPage && (
            <div className="pagination">
              {currentPage > 1 && (
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  className="pagination-button"
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
              )}
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              {currentPage < totalPages && (
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  className="pagination-button"
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;