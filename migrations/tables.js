const mysql = require("mysql2");
const mysqlConnection = require("../config/db");

// Function to create tables
function createTables() {
    // Define the table creation queries
    const createuser_accountTable = `
    CREATE TABLE IF NOT EXISTS user_account (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      confirmPassword VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      accountType VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

    const researcherTable = `
    CREATE TABLE IF NOT EXISTS researcher (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_account_id INT,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100),
        confirmPassword VARCHAR(100),
        accountType VARCHAR(255),
        ResearcherName VARCHAR(100),
        phoneNumber VARCHAR(15),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        nameofOrganization VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logo VARCHAR(255),
        age VARCHAR(100),
        gender VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE 
    )`;

    const organizationTable = `
    CREATE TABLE IF NOT EXISTS organization (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_account_id INT,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100),
        confirmPassword VARCHAR(100),
        accountType VARCHAR(255) NOT NULL,
        OrganizationName VARCHAR(100),
        type VARCHAR(50),
        HECPMDCRegistrationNo VARCHAR(50),
        ntnNumber VARCHAR(50),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        phoneNumber VARCHAR(15),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

    const collectionsiteTable = `
    CREATE TABLE IF NOT EXISTS collectionsite (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_account_id INT,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100),
        accountType VARCHAR(255) NOT NULL,
        CollectionSiteName VARCHAR(100),
        confirmPassword VARCHAR(100),
        ntnNumber VARCHAR(50),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending',
        phoneNumber VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

    const committememberTable = `
    CREATE TABLE IF NOT EXISTS committe_member (
        id INT AUTO_INCREMENT PRIMARY KEY,
        CommitteMemberName VARCHAR(100),
        email VARCHAR(100),
        phoneNumber VARCHAR(15),
        cnic VARCHAR(15),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        organization VARCHAR(50),
        status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const createAdminSignupTable = `
    CREATE TABLE IF NOT EXISTS admin_signup (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const createsampleTable = `
    CREATE TABLE IF NOT EXISTS sample (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      storagetemp VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quantity VARCHAR(255) NOT NULL,
      labname VARCHAR(255) NOT NULL,
      endTime DATETIME NOT NULL,
      logo VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

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

    // Query

    mysqlConnection.query(createuser_accountTable, (err, results) => {
      if (err) console.error("Error creating useraccount table: ", err);
      else console.log("useraccount table created or already exists");
   });

    mysqlConnection.query(researcherTable, (err, results) => {
        if (err) console.error("Error creating Researcher table: ", err);
        else console.log("Researcher table created or already exists");
    });

    mysqlConnection.query(organizationTable, (err, results) => {
        if (err) console.error("Error creating Organization table: ", err);
        else console.log("Crganization table created or already exists");
    });

    mysqlConnection.query(collectionsiteTable, (err, results) => {
        if (err) console.error("Error creating CollectionSites table: ", err);
        else console.log("CollectionSites table created or already exists");
    });

    mysqlConnection.query(committememberTable, (err, results) => {
       if (err) console.error("Error creating committemember table: ", err);
       else console.log("committemember table created or already exists");
    });

    mysqlConnection.query(createAdminSignupTable, (err, result) => {
        if (err) {
          console.error("Error creating admin_signup table:", err);
        } else {
          console.log("AdminSignup table created or already exists.");
        }
      });

    mysqlConnection.query(createsampleTable, (err, result) => {
        if (err) {
          console.error("Error creating sample table:", err);
        } else {
          console.log("Sample table created or already exists.");
        }
      });

    mysqlConnection.query(createproductsTable, (err, result) => {
        if (err) {
          console.error("Error creating sample table:", err);
        } else {
          console.log("Sample table created or already exists.");
        }
      });

    mysqlConnection.query(createwishlistTable, (err, result) => {
        if (err) {
          console.error("Error creating wishlist table:", err);
        } else {
          console.log("Wishlist table created or already exists.");
        }
      });


       
}

createTables();
