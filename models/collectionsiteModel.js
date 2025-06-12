const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email");


const create_collectionsiteTable = () => {
  const create_collectionsiteTable = `
    CREATE TABLE IF NOT EXISTS collectionsite (
      id INT AUTO_INCREMENT PRIMARY KEY,
      CollectionSiteType VARCHAR(50),
      CollectionSiteName VARCHAR(100),
      fullAddress TEXT,
      city INT,
      district INT,
      country INT,
      logo LONGBLOB,
      phoneNumber VARCHAR(15),
      status ENUM('active', 'inactive') DEFAULT 'inactive',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
      FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
      FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE
  )`;

  mysqlConnection.query(create_collectionsiteTable, (err, results) => {
    if (err) {
      console.error("Error Collection site table: ", err);
    } else {
      console.log("Collection site table created Successfully");
    }
  });
};

const getAllCollectionSites = (callback) => {
  const query = `
    SELECT 
      collectionsite.*, 
      city.name AS city,
      city.id AS cityid,
      district.name AS district,
      district.id AS districtid,
      country.name AS country,
      country.id AS countryid
    FROM collectionsite 
    LEFT JOIN city ON collectionsite.city = city.id
    LEFT JOIN district ON collectionsite.district = district.id
    LEFT JOIN country ON collectionsite.country = country.id
    ORDER BY collectionsite.id DESC
  `;

  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};

const getAllCollectioninCollectionStaff = (id, callback) => {
  const query = `
    SELECT 
      cs.id,
      cs.CollectionSiteName AS name
    FROM collectionsite cs
    WHERE cs.status = 'active'
      AND cs.id NOT IN (
        SELECT collectionsite_id
        FROM collectionsitestaff
        WHERE user_account_id = ?
      )
    ORDER BY cs.id DESC;
  `;
  mysqlConnection.query(query, [id], (err, results) => {
    callback(err, results);
  });
};


const getAllinRegistrationAdmin = async (callback) => {
  const CollectionSiteQuery = `SELECT CollectionSiteName as name, id 
      FROM collectionsite 
      WHERE status = 'active'`;

  mysqlConnection.query(CollectionSiteQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (CollectionSite):', err);
      callback(err, null);
      return;
    }
    
    callback(null, results);
  });
}


// Function to register a new collection site in Registration Dashboard
const createCollectionSite = (req, callback) => {
  const {
    CollectionSiteName,
    CollectionSiteType,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    added_by,
  } = req.body;

  const logo = req.files?.logo?.[0]?.buffer || null;

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err, null);
    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return callback(err, null);
      }

      const insertCSQuery = `
    INSERT INTO collectionsite (
      CollectionSiteName, CollectionSiteType, 
      phoneNumber, fullAddress, city, district, country, logo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

      const csValues = [
        CollectionSiteName,
        CollectionSiteType,
        phoneNumber,
        fullAddress,
        city,
        district,
        country,
        logo
      ];

      connection.query(insertCSQuery, csValues, (err, csResults) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }

        const collectionSiteId = csResults.insertId;

        const insertHistory = `
      INSERT INTO history (
        CollectionSiteName, CollectionSiteType,
        phoneNumber, fullAddress, city, district, country, logo,
        added_by, collectionsite_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const historyValues = [
          CollectionSiteName, CollectionSiteType,
          phoneNumber, fullAddress, city, district, country, logo,
          added_by, collectionSiteId, 'added'
        ];

        connection.query(insertHistory, historyValues, (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          connection.commit(err => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            connection.release();
            callback(null, {
              message: 'Collection site registered successfully',
              collectionSiteId
            });
          });
        });
      });
    });
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

function getCollectionSiteById(id, callback) {
  const query = 'SELECT * FROM researcher WHERE id = ?';
  mysqlConnection.query(query, [id], callback);
}

// Function to delete a collection site
const deleteCollectionSite = async (id) => {
  const updateQuery = 'UPDATE collectionsite SET status = ? WHERE id = ?';
  const getEmailQuery = `
    SELECT ua.email ,c.CollectionSiteName
    FROM collectionsite c
    JOIN user_account ua ON c.user_account_id = ua.id
    WHERE c.id = ?
  `;

  try {
    // Set the status here (e.g., 'inactive' for deletion)
    const status = 'inactive';

    // Update CollectionSite status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No collectionsite found with the given ID.");
    }

    // Fetch email in parallel
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);

    // Check if email exists
    if (emailResults.length === 0) {
      throw new Error("collectionsite email not found.");
    }

    const email = emailResults[0].email;
    const name = emailResults[0].CollectionSiteName;

    // Construct the email content based on the status
    let emailText = `
    Dear ${name},
  
    Thank you for registering with Discovery Connect! 
  
    We appreciate your interest in our platform. However, we regret to inform you that your account is currently <b>INACTIVE</b>. This means that you will not be able to log in or access the platform until the admin completes the review and approval process.
  
    We understand this might be disappointing, but rest assured, we are working hard to process your registration as quickly as possible.
  
    Once your account is active, you'll be able to explore all the exciting features and resources that Discovery Connect has to offer!
  
    We will notify you via email as soon as your account is active. In the meantime, if you have any questions or need further assistance, feel free to reach out to us.
  
    We appreciate your patience and look forward to having you on board soon!
  
    Best regards,<br/>
    The Discovery Connect Team
`;

    // Send email asynchronously (does not block response)
    sendEmail(email, "Account Status Update", emailText)
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    // Final response (status update and email sent)
    return { message: "Status updated and email sent" };
  } catch (error) {
    console.error("Error updating CollectionSite status:", error);
    throw error;
  }
};

// Function to GET collectionsite names in collectionsite dashboard
const getAllCollectionSiteNames = (user_account_id, callback) => {
  const collectionSiteQuery = `
    SELECT cs.CollectionSiteName
    FROM collectionsite cs
    WHERE
       cs.status = 'active'
      AND NOT EXISTS (
        SELECT 1 
        FROM collectionsitestaff css
        WHERE css.user_account_id = ?
          AND css.collectionsite_id = cs.id
      );
  `;
  mysqlConnection.query(collectionSiteQuery, [user_account_id, user_account_id], (err, results) => {
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
      SELECT CollectionSiteName, id 
      FROM collectionsite 
      WHERE status = 'active';
    `;

    mysqlConnection.query(collectionSiteQuery, (err, results) => {
      if (err) {
        console.error("SQL Error (CollectionSite):", err);
        callback(err, null);
        return;
      }

      callback(null, results);
    });
  });
};

const getAllNameinCSR = (callback) => {
  const query = `
    SELECT cs.id, cs.CollectionSiteName AS name, NULL as user_id, 'CollectionSites' AS type
    FROM collectionsite cs
    WHERE cs.status = 'active'
    
    UNION
    
    SELECT b.id, b.Name AS name, ua.id as user_id, ua.accountType AS type
    FROM biobank b
    JOIN user_account ua ON b.user_account_id = ua.id
    WHERE ua.accountType = 'biobank'
  `;

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      return callback({ error: "Database query failed" }, null);
    }
    callback(null, results);
  });
};


function updateCollectionSiteDetail(id, data, callback) {
  const {
    CollectionSiteName,
    CollectionSiteType,
    phoneNumber,
    fullAddress,
    cityid,
    districtid,
    countryid,
    logo,
   
  } = data;

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err);

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err);
      }

      // Step 1: Get existing collection site data
      const getCurrentQuery = `SELECT * FROM collectionsite WHERE id = ?`;

      connection.query(getCurrentQuery, [id], (err, results) => {
        if (err || results.length === 0) {
          return connection.rollback(() => {
            connection.release();
            return callback(err || new Error("Collection site not found."));
          });
        }

        const currentData = results[0];
        const finalLogo = logo || currentData.logo;

        // Step 2: Insert previous data into history table
        const insertHistoryQuery = `
          INSERT INTO history
          (collectionsite_id, CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress,
           city, district, country, logo, status, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const historyValues = [
          id,
          currentData.CollectionSiteName,
          currentData.CollectionSiteType,
          currentData.phoneNumber,
          currentData.fullAddress,
          currentData.city,
          currentData.district,
          currentData.country,
          currentData.logo,
          'updated'
        ];

        connection.query(insertHistoryQuery, historyValues, (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              return callback(err);
            });
          }

          // Step 3: Update current collectionsite
          const updateQuery = `
            UPDATE collectionsite
            SET CollectionSiteName = ?, CollectionSiteType = ?, phoneNumber = ?, fullAddress = ?,
                city = ?, district = ?, country = ?, logo = ?
            WHERE id = ?
          `;

          const updateValues = [
            CollectionSiteName,
            CollectionSiteType,
            phoneNumber,
            fullAddress,
            cityid,
            districtid,
            countryid,
            finalLogo,
            id
          ];

          connection.query(updateQuery, updateValues, (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                return callback(err);
              });
            }

            // Step 4: Commit transaction
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  return callback(err);
                });
              }

              connection.release();
              return callback(null, "Collection site updated successfully and previous data stored in history.");
            });
          });
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

// Function to update collection site Status (Active/Inactive)
const updateCollectionSiteStatus = async (id, status) => {
  const connection = mysqlConnection.promise();

  try {
    // Step 1: Get the CollectionSiteName for the given id
    const [rows] = await connection.query('SELECT CollectionSiteName FROM collectionsite WHERE id = ?', [id]);

    if (rows.length === 0) {
      throw new Error("No collection site found with the given ID.");
    }

    const collectionSiteName = rows[0].CollectionSiteName;

    // Step 2: Update the status
    const [updateResult] = await connection.query('UPDATE collectionsite SET status = ? WHERE id = ?', [status, id]);

    if (updateResult.affectedRows === 0) {
      throw new Error("Failed to update status for the collection site.");
    }

    // Step 3: Insert into history table
    // Assuming your history table has columns: collectionSiteName, status, created_at (auto timestamp), and optionally created_by
    const insertHistoryQuery = `
      INSERT INTO history (CollectionSiteName,collectionsite_id, status)
      VALUES (?, ?,?)
    `;

    await connection.query(insertHistoryQuery, [collectionSiteName,id, status]);

    return { message: "Status updated and history recorded successfully." };
  } catch (error) {
    console.error("Error updating collection site status and adding history:", error);
    throw error;
  }
};


module.exports = {
  create_collectionsiteTable,
  getCollectionSiteDetail,
  createCollectionSite,
  updateCollectionSiteDetail,
  getAllCollectionSiteNames,
  getAllCollectionSiteNamesInBiobank,
  getCollectionSiteById,
  getAllCollectionSites,
  updateCollectionSite,
  updateCollectionSiteStatus,
  deleteCollectionSite,
  getAllNameinCSR,
  getAllCollectioninCollectionStaff,
  getAllinRegistrationAdmin
};
