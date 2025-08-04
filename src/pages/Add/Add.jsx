import React, { useState, useEffect } from 'react';
import './Add.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CATEGORY_API, SUBCATEGORY_API, FOOD_API } from '../../util/Globalapi';

// Icon component
const Icon = ({ name, className = "" }) => (
  <i className={`fas ${name} ${className}`}></i>
);

const Add = ({ url }) => {
    const [image, setImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    
    const [data, setData] = useState({
        name: '',
        description: '',
        price: '',
        shippingCharge: '550',
        category: '',
        subcategory: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const response = await axios.get(CATEGORY_API.ALL);
                if (response.data.success) {
                    setCategories(response.data.data);
                    // Set default category if available
                    if (response.data.data.length > 0) {
                        setData(prev => ({
                            ...prev,
                            category: response.data.data[0]._id
                        }));
                        fetchSubcategories(response.data.data[0]._id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch categories', err);
                toast.error('Failed to load categories');
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, [url]);

    const fetchSubcategories = async (categoryId) => {
        try {
            const response = await axios.get(SUBCATEGORY_API.BY_CATEGORY(categoryId));
            if (response.data.success) {
                setSubcategories(response.data.data);
                // Reset subcategory when parent category changes
                setData(prev => ({
                    ...prev,
                    subcategory: response.data.data.length > 0 ? response.data.data[0]._id : ''
                }));
            }
        } catch (err) {
            console.error('Failed to fetch subcategories', err);
            toast.error('Failed to load subcategories');
        }
    };

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prev => ({ ...prev, [name]: value }));
        
        // When category changes, fetch its subcategories
        if (name === 'category') {
            fetchSubcategories(value);
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!image) {
            toast.error('Please upload an image');
            setLoading(false);
            return;
        }

        try {
            // Convert image to base64
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(image);
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
            });

            const payload = {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                shippingCharge: Number(data.shippingCharge),
                category: data.category,
                subcategory: data.subcategory,
                image: base64Image,
            };

            const response = await axios.post(FOOD_API.ADD, payload);

            if (response.data.success) {
                setData({
                    name: '',
                    description: '',
                    price: '',
                    shippingCharge: '550',
                    category: categories.length > 0 ? categories[0]._id : '',
                    subcategory: ''
                });
                setImage(false);
                setImagePreview(null);
                toast.success("Product Added Successfully");
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Error uploading product:', err);
            toast.error(err.response?.data?.message || 'Error uploading product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-container">
            <div className="add-header">
                <h1 className="add-title">Add New Product</h1>
                <p className="add-subtitle">Create a new product listing for your store</p>
            </div>

            <div className="add-content">
                <div className="add-form-card">
                    <form onSubmit={onSubmitHandler} className="add-form">
                        {/* Image Upload Section */}
                        <div className="form-section">
                            <label className="form-label">
                                <Icon name="fa-image" className="form-label-icon" />
                                Product Image
                            </label>
                            <div className="image-upload-container">
                                <div className="image-upload-area">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="image-upload-input"
                                    />
                                    <label htmlFor="image-upload" className="image-upload-label">
                                        {imagePreview ? (
                                            <div className="image-preview">
                                                <img src={imagePreview} alt="Preview" />
                                                <div className="image-preview-overlay">
                                                    <Icon name="fa-camera" />
                                                    <span>Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="image-upload-placeholder">
                                                <Icon name="fa-cloud-upload-alt" />
                                                <span>Click to upload image</span>
                                                <small>Supports: JPG, PNG, GIF</small>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Product Details Section */}
                        <div className="form-section">
                            <label className="form-label">
                                <Icon name="fa-info-circle" className="form-label-icon" />
                                Product Details
                            </label>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="name" className="input-label">Product Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={onChangeHandler}
                                        className="form-input"
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price" className="input-label">Price (₹)</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={data.price}
                                        onChange={onChangeHandler}
                                        className="form-input"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="shippingCharge" className="input-label">Shipping Charge (₹)</label>
                                    <input
                                        type="number"
                                        id="shippingCharge"
                                        name="shippingCharge"
                                        value={data.shippingCharge}
                                        onChange={onChangeHandler}
                                        className="form-input"
                                        placeholder="550"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description" className="input-label">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={onChangeHandler}
                                    className="form-textarea"
                                    placeholder="Describe your product..."
                                    rows="4"
                                    required
                                />
                            </div>
                        </div>

                        {/* Category Selection Section */}
                        <div className="form-section">
                            <label className="form-label">
                                <Icon name="fa-tags" className="form-label-icon" />
                                Category & Subcategory
                            </label>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="category" className="input-label">Category</label>
                                    {categoriesLoading ? (
                                        <div className="select-skeleton"></div>
                                    ) : (
                                        <select
                                            id="category"
                                            name="category"
                                            value={data.category}
                                            onChange={onChangeHandler}
                                            className="form-select"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subcategory" className="input-label">Subcategory</label>
                                    <select
                                        id="subcategory"
                                        name="subcategory"
                                        value={data.subcategory}
                                        onChange={onChangeHandler}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Select Subcategory</option>
                                        {subcategories.map((subcategory) => (
                                            <option key={subcategory._id} value={subcategory._id}>
                                                {subcategory.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Icon name="fa-spinner fa-spin" />
                                        Adding Product...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="fa-plus" />
                                        Add Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Card */}
                <div className="preview-card">
                    <h3 className="preview-title">
                        <Icon name="fa-eye" />
                        Product Preview
                    </h3>
                    <div className="product-preview">
                        <div className="preview-image">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Product Preview" />
                            ) : (
                                <div className="preview-placeholder">
                                    <Icon name="fa-image" />
                                    <span>Upload an image to see preview</span>
                                </div>
                            )}
                        </div>
                        <div className="preview-details">
                            <h4 className="preview-name">
                                {data.name || 'Product Name'}
                            </h4>
                            <p className="preview-description">
                                {data.description || 'Product description will appear here...'}
                            </p>
                            <div className="preview-price">
                                ₹{data.price || '0.00'}
                            </div>
                            <div className="preview-shipping">
                                Shipping: ₹{data.shippingCharge || '550'}
                            </div>
                            <div className="preview-categories">
                                <span className="preview-category">
                                    {categories.find(c => c._id === data.category)?.name || 'Category'}
                                </span>
                                {data.subcategory && (
                                    <span className="preview-subcategory">
                                        {subcategories.find(s => s._id === data.subcategory)?.name || 'Subcategory'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Add;