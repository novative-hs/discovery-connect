const mysqlConnection = require("../config/db");

// Function to get all collection sites
const getAllCollectionSites = (callback) => {
  const query = `
    SELECT collectionsite.*, user_account.email
    FROM collectionsite
    JOIN user_account ON collectionsite.user_account_id = user_account.id
    WHERE collectionsite.status IN ('approved', 'pending')
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
function getCollectionSiteById(id, callback) {
  const query = 'SELECT * FROM researcher WHERE id = ?';
  mysqlConnection.query(query, [id], callback);
}  

// Function to delete a collection site
const deleteCollectionSite = (id, callback) => {
  const query = 'UPDATE collectionsite SET status = ? WHERE id = ?';
  mysqlConnection.query(query, ['unapproved', id], (err, result) => {
    callback(err, result);
  });
};

// Function to GET collectionsite names
const getAllCollectionSiteNames = (user_account_id, callback) => {
  // Query to fetch collectionsite data
  const collectionSiteQuery = `
    SELECT CollectionSiteName, user_account_id 
    FROM collectionsite 
    WHERE user_account_id != ?;
  `;
  // Query to fetch biobank name
  const biobankQuery = `
    SELECT Name, user_account_id 
    FROM biobank
    WHERE user_account_id != ?;
  `;

  // Execute both queries
  mysqlConnection.query(collectionSiteQuery, [user_account_id], (err, collectionSiteResults) => {
    if (err) {
      console.error('SQL Error (CollectionSite):', err);
      callback(err, null);
      return;
    }

    mysqlConnection.query(biobankQuery, [user_account_id], (err, biobankResults) => {
      if (err) {
        console.error('SQL Error (Biobank):', err);
        callback(err, null);
        return;
      }

      // Combine results
      callback(null, {
        collectionSites: collectionSiteResults,
        biobank: biobankResults,
      });
    });
  });
};


function updateCollectionSiteDetail(id, data, callback) {
  const { 
    useraccount_email, 
    CollectionSiteName, 
    phoneNumber, 
    ntnNumber, 
    fullAddress, 
    cityid, 
    districtid, 
    countryid, 
    type, 
    logo
  } = data;
    const updateEmailQuery = `
      UPDATE user_account
      SET email = ?
      WHERE id = ?
    `;

    mysqlConnection.query(updateEmailQuery, [useraccount_email, id], (err, result) => {
      if (err) {
        return mysqlConnection.rollback(() => {
          console.error('Error updating email:', err);
          return callback(err);
        });
      }

      const updateCollectionSiteQuery = `
        UPDATE collectionsite
        SET
          CollectionSiteName = ?,
          phoneNumber = ?,
          ntnNumber = ?,
          fullAddress = ?,
          city = ?,
          district = ?,
          country = ?,
          type = ?,
          logo = ?  
        WHERE user_account_id = ?
      `;

      mysqlConnection.query(
        updateCollectionSiteQuery, 
        [CollectionSiteName, phoneNumber, ntnNumber, fullAddress, cityid, districtid, countryid, type, logo, id], 
        (err, result) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              console.error('Error updating collectionsite:', err);
              return callback(err);
            });
          }

          // Commit the transaction if both queries succeed
          mysqlConnection.commit((err) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                console.error('Error committing transaction:', err);
                return callback(err);
              });
            }

            console.log('Both email and collectionsite updated successfully');
            return callback(null, 'Both updates were successful');
          });
        }
      );
    });
  
}

function getCollectionSiteDetail(id, callback) {
  const query = `
    SELECT 
      collectionsite.*, 
      city.id AS cityid, 
      city.name AS cityname, 
      district.id AS districtid, 
      district.name AS districtname, 
      country.id AS countryid, 
      country.name AS countryname, 
      user_account.email AS useraccount_email
    FROM 
      collectionsite
    LEFT JOIN city ON collectionsite.city = city.id
    LEFT JOIN district ON collectionsite.district = district.id
    LEFT JOIN country ON collectionsite.country = country.id
    LEFT JOIN user_account ON collectionsite.user_account_id = user_account.id
    WHERE 
      collectionsite.user_account_id = ?
  `;
  
  mysqlConnection.query(query, [id], callback);
}  
module.exports = {
  getCollectionSiteDetail,
  updateCollectionSiteDetail,
  getAllCollectionSiteNames,
  getCollectionSiteById,
  getAllCollectionSites,
  createCollectionSite,
  updateCollectionSite,
  updateCollectionSiteStatus,
  deleteCollectionSite,
};
