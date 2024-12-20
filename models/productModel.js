const mysqlConnection = require('../config/db');

// Create the 'products' table if it doesn't already exist
const createProductsTable = () => {
const productsTable = `
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_category VARCHAR(255) NOT NULL,
    child_category VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    color VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

mysqlConnection.query(productsTable, (err, result) => {
  if (err) {
    console.error("Error creating products table:", err);
  } else {
    console.log("Products table created or already exists.");
  }
});
}

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

  mysqlConnection.query(query, queryParams, callback);
};

module.exports = { getProducts, createProductsTable };
