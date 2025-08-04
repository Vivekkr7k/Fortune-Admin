// Base URL for the live server
export const BASE_URL = 'https://api.fortune-india.co.in';

// Food related API endpoints
export const FOOD_API = {
  LIST: `${BASE_URL}/api/food/list`,
  ADD: `${BASE_URL}/api/food/add`,
  GET_BY_ID: (id) => `${BASE_URL}/api/food/${id}`,
  UPDATE: (id) => `${BASE_URL}/api/food/${id}`,
  REMOVE: `${BASE_URL}/api/food/remove`,
};

// Category related API endpoints
export const CATEGORY_API = {
  ALL: `${BASE_URL}/api/category/all`,
  ADD: `${BASE_URL}/api/category/add`,
  UPDATE: (id) => `${BASE_URL}/api/category/update/${id}`,
  DELETE: (id) => `${BASE_URL}/api/category/delete/${id}`,
};

// Subcategory related API endpoints
export const SUBCATEGORY_API = {
  BY_CATEGORY: (categoryId) => `${BASE_URL}/api/subcategory/by-category/${categoryId}`,
  ADD: `${BASE_URL}/api/subcategory/add`,
  UPDATE: (id) => `${BASE_URL}/api/subcategory/update/${id}`,
  DELETE: (id) => `${BASE_URL}/api/subcategory/delete/${id}`,
};

// Order related API endpoints
export const ORDER_API = {
  LIST: `${BASE_URL}/api/order/list`,
  STATUS: `${BASE_URL}/api/order/status`,
};

// Contact related API endpoints
export const CONTACT_API = {
  LIST: `${BASE_URL}/api/contact`,
};

// Export the base URL for backward compatibility
export const url = BASE_URL; 