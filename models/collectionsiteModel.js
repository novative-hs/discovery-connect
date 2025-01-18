const mysqlConnection = require("../config/db");

// Function to get all collection sites
const getAllCollectionSites = (callback) => {
  const query = `
    SELECT collectionsite.*, user_account.email
    FROM collectionsite
    JOIN user_account ON collectionsite.user_account_id = user_account.id
  `;

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

// function getCollectionSiteById(id, callback) {
//   const query = 'SELECT * FROM researcher WHERE id = ?';
//   mysqlConnection.query(query, [id], callback);
// }  

// Function to delete a collection site
const deleteCollectionSite = (id, callback) => {
  const query = 'UPDATE collectionsite SET status = ? WHERE id = ?';
  mysqlConnection.query(query, ['unapproved', id], (err, result) => {
    callback(err, result);
  });
};

const getAllCollectionSiteNames = (user_account_id, callback) => {
  const query = `
    SELECT CollectionSiteName, user_account_id 
    FROM collectionsite 
    WHERE user_account_id != ?`;
  mysqlConnection.query(query, [user_account_id], (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      callback(err, null);
    } else {
      console.log('SQL Results:', results);
      callback(null, results);
    }
  });
};



module.exports = {
  // getCollectionSiteById,
  getAllCollectionSites,
  createCollectionSite,
  updateCollectionSite,
  updateCollectionSiteStatus,
  deleteCollectionSite,
  getAllCollectionSiteNames
};
