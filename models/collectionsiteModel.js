const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email");
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
  const { user_account_id, username, email, password, accountType, CollectionSiteName, CollectionSiteType, confirmPassword, fullAddress, city, district, country, phoneNumber } = data;
  const query = `
    INSERT INTO collectionsite (user_account_id, username, email, password, accountType, CollectionSiteName, CollectionSiteType, confirmPassword, fullAddress, city, district, country, phoneNumber)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  mysqlConnection.query(query, [user_account_id, username, email, password, accountType, CollectionSiteName, CollectionSiteType, confirmPassword, fullAddress, city, district, country, phoneNumber], (err, result) => {
    callback(err, result);
  });
};

// Function to update a collection site
const updateCollectionSite = (id, data, callback) => {
  const { user_account_id, username, email, password, accountType, CollectionSiteName, CollectionSiteType, confirmPassword, fullAddress, city, district, country, phoneNumber } = data;
  const query = `
    UPDATE collectionsite
    SET user_account_id = ?, username = ?, email = ?, password = ?, accountType = ?, CollectionSiteName = ?, CollectionSiteType = ?, confirmPassword = ?, fullAddress = ?, city = ?, district = ?, country = ?, phoneNumber = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [user_account_id, username, email, password, accountType, CollectionSiteName, CollectionSiteType, confirmPassword, fullAddress, city, district, country, phoneNumber, id], (err, result) => {
    callback(err, result);
  });
};

// Function to update a collection site's status
const updateCollectionSiteStatus = async (id, status) => {
  const getEmailQuery = `
    SELECT ua.email 
    FROM collectionsite cs
    JOIN user_account ua ON cs.user_account_id = ua.id
    WHERE cs.id = ?
  `;

  const updateStatusQuery = `
    UPDATE collectionsite SET status = ? WHERE id = ?
  `;

  try {
    // Fetch email and update status in parallel
    const [[emailResults], _] = await Promise.all([
      mysqlConnection.promise().query(getEmailQuery, [id]),
      mysqlConnection.promise().query(updateStatusQuery, [status, id])
    ]);

    // Check if email exists
    if (emailResults.length === 0) {
      throw new Error("Collection site not found");
    }

    const email = emailResults[0].email;

    // Prepare email content
    let emailText = `Dear Collectionsite,\n\nYour account status is currently pending. 
    Please wait for approval.\n\nBest regards,\nDiscovery Connect`;

    if (status === "approved") {
      emailText = `Dear Collectionsite,\n\nYour account has been approved! 
      You can now log in and access your account.\n\nBest regards,\nDiscovery Connect`;
    }

    // Send email asynchronously (does not block function execution)
    sendEmail(email, "Welcome to Discovery Connect", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated and email sent" };
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
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

// Function to GET collectionsite names in collectionsite dashboard
const getAllCollectionSiteNames = (user_account_id, callback) => {
  // Query to fetch collectionsite data
  const collectionSiteQuery = `
    SELECT CollectionSiteName, user_account_id 
    FROM collectionsite 
    WHERE user_account_id != ?
    AND status = 'approved';
  `;
  mysqlConnection.query(collectionSiteQuery, [user_account_id], (err, results) => {
    if (err) {
      console.error('SQL Error (CollectionSite):', err);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};

// Function to GET collectionsite names in biobank dashboard
const getAllCollectionSiteNamesInBiobank = (sample_id, callback) => {
  // First, get the user_account_id of the collection site that posted this sample
  const sampleQuery = `SELECT user_account_id FROM sample WHERE id = ?`;

  mysqlConnection.query(sampleQuery, [sample_id], (err, sampleResult) => {
    if (err) {
      console.error("SQL Error (Sample):", err);
      callback(err, null);
      return;
    }

    if (sampleResult.length === 0) {
      callback(null, []); // No sample found, return empty
      return;
    }

    const sampleOwnerUserId = sampleResult[0].user_account_id;

    // Now fetch collection site names EXCLUDING the one that owns this sample
    const collectionSiteQuery = `
      SELECT CollectionSiteName, user_account_id 
      FROM collectionsite 
      WHERE user_account_id != ?;
    `;

    mysqlConnection.query(collectionSiteQuery, [sampleOwnerUserId], (err, results) => {
      if (err) {
        console.error("SQL Error (CollectionSite):", err);
        callback(err, null);
        return;
      }

      callback(null, results);
    });
  });
};

function updateCollectionSiteDetail(id, data, callback) {
  const {
    useraccount_email,
    CollectionSiteName,
    CollectionSiteType,
    phoneNumber,
    fullAddress,
    cityid,
    districtid,
    countryid,
    logo
  } = data;

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool:", err);
      return callback(err);
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Error starting transaction:", err);
        return callback(err);
      }

      const updateEmailQuery = `UPDATE user_account SET email = ? WHERE id = ?`;

      connection.query(updateEmailQuery, [useraccount_email, id], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error('Error updating email:', err);
            return callback(err);
          });
        }

        // Get the current logo from the database
        const getCurrentLogoQuery = `SELECT logo FROM collectionsite WHERE user_account_id = ?`;

        connection.query(getCurrentLogoQuery, [id], (err, results) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error('Error fetching current logo:', err);
              return callback(err);
            });
          }

          const currentLogo = results[0]?.logo;

          // Use the provided logo or retain the existing one
          const updatedLogo = logo || currentLogo;

          const updateCollectionSiteQuery = `
        UPDATE collectionsite
        SET
          CollectionSiteName = ?,
          CollectionSiteType = ?,
          phoneNumber = ?,
          fullAddress = ?,
          city = ?,
          district = ?,
          country = ?,
          logo = ?  
        WHERE user_account_id = ?
      `;

          connection.query(
            updateCollectionSiteQuery,
            [CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress, cityid, districtid, countryid, logo, id],
            (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Error updating collectionsite:', err);
                  return callback(err);
                });
              }

              // Commit the transaction if both queries succeed
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('Error committing transaction:', err);
                    return callback(err);
                  });
                }
                connection.release();
                console.log('Both email and collectionsite updated successfully');
                return callback(null, 'Both updates were successful');
              });
            }
          );
        });
      });
    });
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
  getAllCollectionSiteNamesInBiobank,
  getCollectionSiteById,
  getAllCollectionSites,
  createCollectionSite,
  updateCollectionSite,
  updateCollectionSiteStatus,
  deleteCollectionSite,
};
