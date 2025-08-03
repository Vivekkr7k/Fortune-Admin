import React, { useEffect, useState } from 'react';
import './Category.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { CATEGORY_API, SUBCATEGORY_API } from '../../util/Globalapi';

const AddCategory = ({ url }) => {
  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Subcategory states
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryImage, setSubcategoryImage] = useState(null);
  const [subcategoryPreview, setSubcategoryPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategoryEditMode, setSubcategoryEditMode] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showSubcategoryDeleteModal, setShowSubcategoryDeleteModal] = useState(false);
  const [deletingSubcategoryId, setDeletingSubcategoryId] = useState(null);

  // Expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setImage(base64);
      setPreview(base64);
    }
  };

  const handleSubcategoryImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setSubcategoryImage(base64);
      setSubcategoryPreview(base64);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(CATEGORY_API.ALL);
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!categoryName.trim()) {
      toast.error('Please enter category name');
      setLoading(false);
      return;
    }

    try {
      if (editMode) {
        const response = await axios.put(CATEGORY_API.UPDATE(editingId), {
          name: categoryName,
          image,
        });

        if (response.data.success) {
          toast.success('Category updated successfully');
        } else {
          toast.error(response.data.message);
        }
      } else {
        if (!image) {
          toast.error('Please upload an image');
          setLoading(false);
          return;
        }
        const response = await axios.post(CATEGORY_API.ADD, {
          name: categoryName,
          image,
        });

        if (response.data.success) {
          toast.success('Category added successfully');
        } else {
          toast.error(response.data.message);
        }
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSubcategoryHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!subcategoryName.trim()) {
      toast.error('Please enter subcategory name');
      setLoading(false);
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      setLoading(false);
      return;
    }

    try {
      if (subcategoryEditMode) {
        const response = await axios.put(SUBCATEGORY_API.UPDATE(editingSubcategoryId), {
          name: subcategoryName,
          image: subcategoryImage,
          category: selectedCategory._id
        });

        if (response.data.success) {
          toast.success('Subcategory updated successfully');
        } else {
          toast.error(response.data.message);
        }
      } else {
        if (!subcategoryImage) {
          toast.error('Please upload an image');
          setLoading(false);
          return;
        }
        const response = await axios.post(SUBCATEGORY_API.ADD, {
          name: subcategoryName,
          image: subcategoryImage,
          category: selectedCategory._id
        });

        if (response.data.success) {
          toast.success('Subcategory added successfully');
        } else {
          toast.error(response.data.message);
        }
      }

      resetSubcategoryForm();
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryName('');
    setImage(null);
    setPreview(null);
    setEditMode(false);
    setEditingId(null);
    setShowModal(false);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryName('');
    setSubcategoryImage(null);
    setSubcategoryPreview(null);
    setSubcategoryEditMode(false);
    setEditingSubcategoryId(null);
    setShowSubcategoryModal(false);
  };

  const handleEdit = (cat) => {
    setCategoryName(cat.name);
    setImage(cat.image);
    setPreview(cat.image);
    setEditMode(true);
    setEditingId(cat._id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(CATEGORY_API.DELETE(deletingId));
      if (res.data.success) {
        toast.success(res.data.message);
        fetchCategories();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete category');
    } finally {
      setShowDeleteModal(false);
      setDeletingId(null);
      setLoading(false);
    }
  };

  const openAddSubcategoryModal = (category) => {
    setSelectedCategory(category);
    setShowSubcategoryModal(true);
  };

  const handleEditSubcategory = (category, subcategory) => {
    setSelectedCategory(category);
    setSubcategoryName(subcategory.name);
    setSubcategoryImage(subcategory.image);
    setSubcategoryPreview(subcategory.image);
    setSubcategoryEditMode(true);
    setEditingSubcategoryId(subcategory._id);
    setShowSubcategoryModal(true);
  };

  const handleDeleteSubcategory = (subcategoryId) => {
    setDeletingSubcategoryId(subcategoryId);
    setShowSubcategoryDeleteModal(true);
  };

  const confirmSubcategoryDelete = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(SUBCATEGORY_API.DELETE(deletingSubcategoryId));
      if (res.data.success) {
        toast.success(res.data.message);
        fetchCategories();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete subcategory');
    } finally {
      setShowSubcategoryDeleteModal(false);
      setDeletingSubcategoryId(null);
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="category-management">
      {/* Header */}
      <div className="category-header">
        <h1>Categories</h1>
        <p>Manage your product categories and subcategories</p>
      </div>

      {/* Main Content */}
      <div className="category-content">
        {/* Category Form */}
        <div className="category-form-container">
          <h2 className="section-title">{editMode ? 'Edit Category' : 'Add New Category'}</h2>
          <form className="flex-col" onSubmit={onSubmitHandler}>
            <div className="category-img-upload flex-col">
              <p>Category Image</p>
              <label htmlFor="image">
                <img src={preview || assets.upload_area} alt="Upload Preview" />
              </label>
              <input
                type="file"
                id="image"
                hidden
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            <div className="flex-col">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="e.g. Beverages"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="add-btn" disabled={loading}>
              {loading ? 'PROCESSING...' : editMode ? 'UPDATE CATEGORY' : 'ADD CATEGORY'}
            </button>
          </form>
        </div>

        {/* Category List */}
        <div className="category-list-container">
          <h2 className="section-title">All Categories</h2>
          
          {loading ? (
            <div className="loading-state">Loading categories...</div>
          ) : categories.length > 0 ? (
            <div className="category-list">
              {categories.map((cat) => (
                <div className="category-item" key={cat._id}>
                  <div className="category-header-row" onClick={() => toggleCategory(cat._id)}>
                    <div className="category-info">
                      <div className={`rotate-chevron ${expandedCategories[cat._id] ? 'open' : ''}`}>
                        {expandedCategories[cat._id] ? <FiChevronDown /> : <FiChevronRight />}
                      </div>
                      <img src={cat.image} alt={cat.name} className="category-image" />
                      <span className="category-name">{cat.name}</span>
                    </div>
                    <div className="category-actions">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(cat);
                        }}
                        title="Edit"
                        disabled={loading}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cat._id);
                        }}
                        title="Delete"
                        disabled={loading}
                      >
                        <FiTrash2 />
                      </button>
                      <button 
                        className="action-btn add-sub-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddSubcategoryModal(cat);
                        }}
                        title="Add Subcategory"
                        disabled={loading}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  {expandedCategories[cat._id] && (
                    <div className="subcategory-list">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        cat.subcategories.map((sub) => (
                          <div className="subcategory-item" key={sub._id}>
                            <div className="subcategory-info">
                              <img src={sub.image} alt={sub.name} className="subcategory-image" />
                              <span className="subcategory-name">{sub.name}</span>
                            </div>
                            <div className="subcategory-actions">
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => handleEditSubcategory(cat, sub)}
                                title="Edit"
                                disabled={loading}
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteSubcategory(sub._id)}
                                title="Delete"
                                disabled={loading}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="subcategory-empty">
                          No subcategories found. Click the + button to add one.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No categories found. Add your first category above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editMode ? 'Edit Category' : 'Add Category'}</h3>
            <div className="category-img-upload flex-col">
              <p>Category Image</p>
              <label htmlFor="edit-image">
                <img src={preview || assets.upload_area} alt="Upload Preview" />
              </label>
              <input
                type="file"
                id="edit-image"
                hidden
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            <div className="flex-col">
              <label>Category Name</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={resetCategoryForm}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="add-btn" 
                onClick={onSubmitHandler}
                disabled={loading}
              >
                {loading ? 'PROCESSING...' : editMode ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete this category? All subcategories will also be removed.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="delete-btn" 
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'DELETING...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {subcategoryEditMode 
                ? `Edit Subcategory (${selectedCategory?.name})` 
                : `Add Subcategory to ${selectedCategory?.name}`}
            </h3>
            <div className="category-img-upload flex-col">
              <p>Subcategory Image</p>
              <label htmlFor="subcategory-image">
                <img src={subcategoryPreview || assets.upload_area} alt="Upload Preview" />
              </label>
              <input
                type="file"
                id="subcategory-image"
                hidden
                onChange={handleSubcategoryImageChange}
                accept="image/*"
              />
            </div>

            <div className="flex-col">
              <label>Subcategory Name</label>
              <input
                type="text"
                placeholder="e.g. Soft Drinks"
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={resetSubcategoryForm}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="add-btn" 
                onClick={onSubmitSubcategoryHandler}
                disabled={loading}
              >
                {loading ? 'PROCESSING...' : subcategoryEditMode ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Delete Confirmation Modal */}
      {showSubcategoryDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Subcategory</h3>
            <p>Are you sure you want to delete this subcategory?</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowSubcategoryDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="delete-btn" 
                onClick={confirmSubcategoryDelete}
                disabled={loading}
              >
                {loading ? 'DELETING...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategory;