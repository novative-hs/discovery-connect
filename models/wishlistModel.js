const mysqlConnection = require('../config/db');

const createWishlistTable = () => {
  const wishlistTableQuery = `
    CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      productname VARCHAR(255) NOT NULL,
      unitprice VARCHAR(255) NOT NULL,
      quantity DECIMAL (65) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_account(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`;

  mysqlConnection.query(wishlistTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating wishlist table:", err);
    } else {
      console.log("Wishlist table created or already exists.");
    }
  });
};

module.exports = { createWishlistTable };
