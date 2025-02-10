const mysqlConnection = require('../config/db');

// New Updated fields in Table
const addFieldToProductTable = (tableName, fieldName, fieldType) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS columnExists 
    FROM information_schema.columns 
    WHERE table_name = '${tableName}' 
    AND column_name = '${fieldName}'`;

  // Check if the column exists
  mysqlConnection.query(checkColumnQuery, (err, results) => {
    if (err) {
      console.error(`Error checking column existence for ${fieldName}:`, err);
    } else {
      const columnExists = results[0].columnExists;
      if (columnExists === 0) {
        const addFieldQuery = `
          ALTER TABLE ${tableName} 
          ADD COLUMN ${fieldName} ${fieldType}`;

        mysqlConnection.query(addFieldQuery, (err, results) => {
          if (err) {
            console.error(`Error altering ${tableName} table to add ${fieldName}:`, err);
          } else {
            console.log(`${fieldName} added to ${tableName} table.`);
          }
        });
      } else {
        console.log(`${fieldName} column already exists in ${tableName} table.`);
      }
    }
  });
};

// Add fields Names Here
const alterProductTable = () => {
  // addFieldToProductTable("products", "CutOffRange", "VARCHAR(255)");
};

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
  alterProductTable();
}

// Fetch products based on query filters
const getProducts = (filters, callback) => {
  let query = `SELECT * FROM sample WHERE is_deleted = FALSE`;
  const queryParams = [];

  if (filters.age) {
    query += ' AND age = ?';
    queryParams.push(filters.age);
  }
  if (filters.gender) {
    query += ' AND gender = ?';
    queryParams.push(filters.gender);
  }
  if (filters.ethnicity) {
    query += ' AND ethnicity = ?';
    queryParams.push(filters.ethnicity);
  }
  if (filters.samplecondition) {
    query += ' AND samplecondition = ?';
    queryParams.push(filters.samplecondition);
  }
  if (filters.CountryOfCollection) {
    query += ' AND CountryOfCollection = ?';
    queryParams.push(filters.CountryOfCollection);
  }
  if (filters.SampleTypeMatrix) {
    query += ' AND SampleTypeMatrix = ?';
    queryParams.push(filters.SampleTypeMatrix);
  }
  if (filters.status) {
    query += ' AND status = ?';
    queryParams.push(filters.status);
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

  // Sorting logic
  query += ` ORDER BY ${
    filters.sort === 'Price low to high' ? 'price ASC' :
    filters.sort === 'Price high to low' ? 'price DESC' :
    'created_at DESC'
  }`;

  mysqlConnection.query(query, queryParams, callback);
};


module.exports = { getProducts, createProductsTable };
