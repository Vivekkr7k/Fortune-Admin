import React, { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FOOD_API } from '../../util/Globalapi';

// Icon component
const Icon = ({ name, className = "" }) => (
  <i className={`fas ${name} ${className}`}></i>
);

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(FOOD_API.LIST);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching food list");
      }
    } catch (error) {
      toast.error("Failed to load food list");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId, foodName) => {
    if (!window.confirm(`Are you sure you want to delete "${foodName}"?`)) {
      return;
    }

    try {
      const response = await axios.post(FOOD_API.REMOVE, { id: foodId });
      await fetchList();
      if (response.data.success) {
        toast.success(`${foodName} removed successfully`);
      } else {
        throw new Error(response.data.message || 'Error removing food');
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || error.message || 'Error occurred';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchList();
  }, [url]);

  // Filter and sort products
  const filteredAndSortedList = list
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                            item.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'category':
          return (a.category?.name || '').localeCompare(b.category?.name || '');
        default:
          return 0;
      }
    });

  // Get unique categories for filter
  const categories = ['all', ...new Set(list.map(item => item.category?.name).filter(Boolean))];

  return (
    <div className="list-container">
      <div className="list-header">
        <div className="list-header-content">
          <h1 className="list-title">Product Inventory</h1>
          <p className="list-subtitle">Manage your product catalog</p>
        </div>
        <div className="list-stats">
          <div className="stat-item">
            <Icon name="fa-box" className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{list.length}</span>
              <span className="stat-label">Total Products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="list-controls">
        <div className="search-container">
          <Icon name="fa-search" className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="products-skeleton">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="product-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-category"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedList.length > 0 ? (
        <div className="products-grid">
          {filteredAndSortedList.map((item, index) => (
            <div key={item._id || index} className="product-card">
              <div className="product-image-container">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="product-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNjAgNzcuOTA5MSA3Ny45MDkxIDYwIDEwMCA2MEMxMjIuMDkxIDYwIDE0MCA3Ny45MDkxIDE0MCAxMDBDMTQwIDEyMi4wOTEgMTIyLjA5MSAxNDAgMTAwIDE0MEM3Ny45MDkxIDE0MCA2MCAxMjIuMDkxIDYwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMjBDMTEwLjQ1NyAxMjAgMTE5IDEwOS40NTcgMTE5IDk4QzExOSA4Ni41NDMgMTEwLjQ1NyA3NiAxMDAgNzZDODkuNTQzIDc2IDgxIDg2LjU0MyA4MSA5OEM4MSAxMDkuNDU3IDg5LjU0MyAxMjAgMTAwIDEyMFoiIGZpbGw9IiNENDFENjMiLz4KPC9zdmc+';
                    e.target.onerror = null;
                  }}
                />
                <div className="product-overlay">
                  <button
                    onClick={() => removeFood(item._id, item.name)}
                    className="delete-button"
                    title="Delete product"
                  >
                    <Icon name="fa-trash" />
                  </button>
                </div>
              </div>
              
              <div className="product-content">
                <h3 className="product-name">{item.name}</h3>
                <p className="product-description">
                  {item.description?.length > 100 
                    ? `${item.description.substring(0, 100)}...` 
                    : item.description || 'No description available'}
                </p>
                
                <div className="product-meta">
                  <div className="product-categories">
                    {item.category?.name && (
                      <span className="product-category">{item.category.name}</span>
                    )}
                    {item.subcategory?.name && (
                      <span className="product-subcategory">{item.subcategory.name}</span>
                    )}
                  </div>
                  
                  <div className="product-price">
                    ₹{item.price?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="fa-box-open" className="empty-icon" />
          <h3>No products found</h3>
          <p>
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start by adding your first product'}
          </p>
        </div>
      )}

      {/* Results Summary */}
      {!loading && list.length > 0 && (
        <div className="results-summary">
          <span>
            Showing {filteredAndSortedList.length} of {list.length} products
          </span>
        </div>
      )}
    </div>
  );
};

export default List;