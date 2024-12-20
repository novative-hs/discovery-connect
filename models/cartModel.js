const mysqlConnection = require('../config/db');

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
};

module.exports = { createCartTable };
