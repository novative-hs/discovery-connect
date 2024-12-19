  const mysql = require("mysql2");
  const mysqlConnection = require("../config/db");

  // Function to create tables
  function createTables() {
      // Define the table creation queries
    //   const createuser_accountTable = `
    //   CREATE TABLE IF NOT EXISTS user_account (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     username VARCHAR(255) NOT NULL,
    //     password VARCHAR(255) NOT NULL,
    //     confirmPassword VARCHAR(255) NOT NULL,
    //     email VARCHAR(255) NOT NULL UNIQUE,
    //     accountType VARCHAR(255) NOT NULL,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    //   )`;
    //   mysqlConnection.query(createuser_accountTable, (err, results) => {
    //     if (err) console.error("Error creating useraccount table: ", err);
    //     else console.log("useraccount table created or already exists");
    // });

    const createAdminSignupTable = `
    CREATE TABLE IF NOT EXISTS admin_signup (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    mysqlConnection.query(createAdminSignupTable, (err, result) => {
      if (err) {
        console.error("Error creating admin_signup table:", err);
      } else {
        console.log("AdminSignup table created or already exists.");
      }
    });

    const createproductsTable = `
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
    )`;
    mysqlConnection.query(createproductsTable, (err, result) => {
      if (err) {
        console.error("Error creating sample table:", err);
      } else {
        console.log("Sample table created or already exists.");
      }
    });

    const createwishlistTable = `
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
    mysqlConnection.query(createwishlistTable, (err, result) => {
      if (err) {
        console.error("Error creating wishlist table:", err);
      } else {
        console.log("Wishlist table created or already exists.");
      }
    });

    const createcartTable = `
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
    mysqlConnection.query(createcartTable, (err, result) => {
      if (err) {
        console.error("Error creating cart table:", err);
      } else {
        console.log("Cart table created or already exists.");
      }
    });  
}

createTables();
