const db = require('../config/db');

// Fetch products based on query filters
const getProducts = (filters, callback) => {
  let query = `SELECT * FROM products WHERE 1=1`;
  const queryParams = [];

  if (filters.Category) {
    query += ' AND parent_category = ?';
    queryParams.push(filters.Category);
  }
  if (filters.category) {
    query += ' AND child_category = ?';
    queryParams.push(filters.category);
  }
  if (filters.brand) {
    query += ' AND brand = ?';
    queryParams.push(filters.brand);
  }
  if (filters.color) {
    query += ' AND color = ?';
    queryParams.push(filters.color);
  }
  if (filters.priceMin || filters.priceMax) {
    if (filters.priceMin) {
      query += ' AND price >= ?';
      queryParams.push(filters.priceMin);
    }
    if (filters.priceMax) {
      query += ' AND price <= ?';
      queryParams.push(filters.priceMax);
    }
  }
  query += ` ORDER BY ${
    filters.sort === 'Price low to high' ? 'price ASC' :
    filters.sort === 'Price high to low' ? 'price DESC' :
    'created_at DESC'
  }`;

  db.query(query, queryParams, callback);
};

module.exports = { getProducts };
