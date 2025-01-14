const mysqlConnection = require('../config/db');

// New Updated fields in Table
const addFieldToCartTable = (tableName, fieldName, fieldType) => {
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

// Add Field Names Here
const alterCartTable = () => {
  // addFieldToCartTable("cart", "CutOffRange", "VARCHAR(255)");
};

const createCartTable = () => {
  const cartTableQuery = `
    CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      productname VARCHAR(255) NOT NULL,
      price VARCHAR(255) NOT NULL,
      quantity DECIMAL (65) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_account(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`;

  mysqlConnection.query(cartTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating cart table:", err);
    } else {
      console.log("Cart table created or already exists.");
    }
  });
  alterCartTable();
};

module.exports = { createCartTable };
