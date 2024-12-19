const mysqlConnection = require("../config/db");

// Function to create the collectionsite table
const createCollectionSiteTable = () => {
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
        status VARCHAR(50) DEFAULT 'pending',
        phoneNumber VARCHAR(15),
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(collectionsiteTable, (err, results) => {
    if (err) {
      console.error("Error creating collectionsite table: ", err);
    } else {
      console.log("Collectionsite table created or already exists");
    }
  });
};

// Function to get all collection sites
const getAllCollectionSites = (callback) => {
  const query = 'SELECT * FROM collectionsite';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Function to insert a new collection site
const createCollectionSite = (data, callback) => {
  const { user_account_id, username, email, password, accountType, CollectionSiteName, confirmPassword, ntnNumber, fullAddress, city, district, country, phoneNumber } = data;
  const query = `
    INSERT INTO collectionsite (user_account_id, username, email, password, accountType, CollectionSiteName, confirmPassword, ntnNumber, fullAddress, city, district, country, phoneNumber)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  mysqlConnection.query(query, [user_account_id, username, email, password, accountType, CollectionSiteName, confirmPassword, ntnNumber, fullAddress, city, district, country, phoneNumber], (err, result) => {
    callback(err, result);
  });
};

// Function to update a collection site
const updateCollectionSite = (id, data, callback) => {
  const { user_account_id, username, email, password, accountType, CollectionSiteName, confirmPassword, ntnNumber, fullAddress, city, district, country, phoneNumber } = data;
  const query = `
    UPDATE collectionsite
    SET user_account_id = ?, username = ?, email = ?, password = ?, accountType = ?, CollectionSiteName = ?, confirmPassword = ?, ntnNumber = ?, fullAddress = ?, city = ?, district = ?, country = ?, phoneNumber = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [user_account_id, username, email, password, accountType, CollectionSiteName, confirmPassword, ntnNumber, fullAddress, city, district, country, phoneNumber, id], (err, result) => {
    callback(err, result);
  });
};

// Function to update a collection site's status
const updateCollectionSiteStatus = (id, status, callback) => {
  const query = `
    UPDATE collectionsite
    SET status = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [status, id], (err, result) => {
    callback(err, result);
  });
};

// Function to delete a collection site
// const deleteCollectionSite = (id, callback) => {
//     const query = 'DELETE FROM collectionsite WHERE id = ?';
//     mysqlConnection.query(query, [id], (err, result) => {
//       callback(err, result);
//     });
//   };

// Function to delete the associated user account
// const deleteUserAccount = (userAccountId, callback) => {
//     const query = 'DELETE FROM user_account WHERE id = ?';
//     mysqlConnection.query(query, [userAccountId], (err, result) => {
//       callback(err, result);
//     });
//   };

module.exports = {
  createCollectionSiteTable,
  getAllCollectionSites,
  createCollectionSite,
  updateCollectionSite,
  updateCollectionSiteStatus
//   deleteCollectionSite,
//   deleteUserAccount
};
