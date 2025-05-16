const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email");


const create_collectionsiteTable = () => {
  const create_collectionsiteTable = `
    CREATE TABLE IF NOT EXISTS collectionsite (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_account_id INT,
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
      FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
      FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
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
      user_account.id AS user_account_id, 
      user_account.email AS useraccount_email, 
      user_account.password AS useraccount_password,
      city.name AS city,
      city.id AS cityid,
      district.name AS district,
      district.id AS districtid,
      country.name AS country,
      country.id AS countryid
    FROM collectionsite 
    JOIN user_account ON collectionsite.user_account_id = user_account.id
    LEFT JOIN city ON collectionsite.city = city.id
    LEFT JOIN district ON collectionsite.district = district.id
    LEFT JOIN country ON collectionsite.country = country.id
    ORDER BY collectionsite.id DESC
  `;

  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};
const getAllCollectioninCollectionStaff=(callback)=>{
  const query= `
   SELECT 
  collectionsite.id,
  collectionsite.CollectionSiteName AS name
FROM collectionsite 
WHERE status = 'active'
ORDER BY collectionsite.id DESC;

  `;
   mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
}

// Function to register a new collection site in Registration Dashboard
const createCollectionSite = (req, callback) => {
  const {
    email,
    password,
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

      const checkEmailQuery = 'SELECT * FROM user_account WHERE email = ?';
      connection.query(checkEmailQuery, [email], (err, results) => {
        if (err || results.length > 0) {
          return connection.rollback(() => {
            connection.release();
            if (results.length > 0) return callback(new Error("Email already exists"), null);
            return callback(err, null);
          });
        }

        const insertUserQuery = `INSERT INTO user_account (email, password, accountType) VALUES (?, ?, ?)`;
        connection.query(insertUserQuery, [email, password, 'CollectionSites'], (err, userResults) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const userId = userResults.insertId;

          const insertCSQuery = `
            INSERT INTO collectionsite (
              user_account_id, CollectionSiteName, CollectionSiteType, 
              phoneNumber, fullAddress, city, district, country, logo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const csValues = [
            userId,
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
                email, password, CollectionSiteName, CollectionSiteType,
                phoneNumber, fullAddress, city, district, country, logo,
                added_by, collectionsite_id, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const historyValues = [
              email, password, CollectionSiteName, CollectionSiteType,
              phoneNumber, fullAddress, city, district, country, logo,
              added_by, collectionSiteId, 'added'
            ];

            connection.query(insertHistory, historyValues, (err) => {
              if (err) {
                return connection.rollback(() => callback(err, null));
              }

              connection.commit(err => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    callback(err, null);
                  });
                }

                connection.release();

                // Send confirmation email
                sendEmail(
                  email,
                  'Welcome to Discovery Connect',
                  `Dear ${CollectionSiteName},\n\nYour account status is currently pending.\nPlease wait for approval.\n\nRegards,\nDiscovery Connect`
                );

                callback(null, {
                  message: 'Collection site registered successfully',
                  userId
                });
              });
            });
          });
        });
      });
    });
  });
};

// Function to insert a new collection site
// const createCollectionSite = (data, callback) => {
//   const {
//     CollectionSiteName,
//     email,
//     password,
//     CollectionSiteType,
//     phoneNumber,
//     fullAddress,
//     city,
//     district,
//     country,
//   } = data;

//   const checkEmailQuery = `SELECT * FROM user_account WHERE email = ?`;

//   mysqlConnection.query(checkEmailQuery, [email], (err, results) => {
//     if (err) return callback(err, null);

//     if (results.length > 0) {
//       return callback(new Error("Email already exists in user_account"), null);
//     }

//     const userAccountQuery = `
//       INSERT INTO user_account (email, password, accountType) 
//       VALUES (?, ?, ?)
//     `;

//     mysqlConnection.query(userAccountQuery, [email, password, "CollectionSites"], (err, result) => {
//       if (err) return callback(err, null);

//       const userAccountId = result.insertId; // Get inserted user ID

//       const collectionSiteQuery = `
//         INSERT INTO collectionsite (user_account_id, CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress, city, district, country) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       mysqlConnection.query(
//         collectionSiteQuery,
//         [userAccountId, CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress, city, district, country],
//         (err, result) => {
//           if (err) return callback(err, null);

//           const collectionSiteId = result.insertId; // ✅ Get collection site ID

//           // ✅ Insert into history table with collection site ID
//           const historyQuery = `
//             INSERT INTO history (email, password, CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress, city, district, country, status, collectionsite_id)
//             VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//           `;

//           mysqlConnection.query(
//             historyQuery,
//             [email, password, CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress, city, district, country, "added", collectionSiteId],
//             (err) => {
//               if (err) console.error("Error inserting into history:", err);
//               callback(err, result);
//             }
//           );
//         }
//       );
//     });
//   });
// };

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
    const status = 'unactive';

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
      .then(() => console.log("Email sent successfully"))
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
    SELECT cs.CollectionSiteName, cs.user_account_id 
    FROM collectionsite cs
    WHERE cs.user_account_id != ?
      AND cs.status = 'active'
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
      SELECT CollectionSiteName, user_account_id 
      FROM collectionsite 
      WHERE user_account_id != ?
      AND status = 'active';
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


const getAllNameinCSR = (callback) => {
  const query = `
    SELECT cs.id, cs.CollectionSiteName AS name, ua.id as user_id,ua.accountType AS type
    FROM collectionsite cs
    JOIN user_account ua ON cs.user_account_id = ua.id
    WHERE cs.status = 'active' AND ua.accountType = 'CollectionSites'
    
    UNION
    
    SELECT b.id, b.Name AS name, ua.id as user_id,ua.accountType AS type
    FROM biobank b
    JOIN user_account ua ON b.user_account_id = ua.id
    WHERE  ua.accountType = 'biobank'
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

// Function to update collection site Status (Active/Inactive))
const updateCollectionSiteStatus = async (id, status) => {
  const updateQuery = 'UPDATE collectionsite SET status = ? WHERE id = ?';
  const getEmailQuery = `
    SELECT ua.email, cs.CollectionSiteName
    FROM collectionsite cs
    JOIN user_account ua ON cs.user_account_id = ua.id
    WHERE cs.id = ?
  `;
  try {
    // Update collection site status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No collection site found with the given ID.");
    }
    // Fetch email
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);
    if (emailResults.length === 0) {
      throw new Error("collection site email not found.");
    }
    const email = emailResults[0].email;
    const name = emailResults[0].CollectionSiteName;

    // Construct email content based on status
    let emailText = "";
    if (status === "inactive") {
      emailText = `
      Dear ${name},
      
      We hope you're doing well.

      We wanted to inform you that your collection site's account on Discovery Connect has been set to <b>inactive</b>. This means you will no longer be able to access the platform or its services until reactivation.

      If you believe this was done in error or you need further assistance, please reach out to our support team.

      Thank you for being a part of Discovery Connect.

      Best regards,  
      The Discovery Connect Team
      `;
    } else if (status === "active") {
      emailText = `
      Dear ${name},

      We are pleased to inform you that your collection site's account on Discovery Connect has been <b>approved and activated</b>!

      You can now log in and start exploring all the features and resources our platform offers. We're excited to have you onboard and look forward to your active participation.

      If you have any questions or need help getting started, feel free to contact us.

      Welcome to Discovery Connect!

      Best regards,  
      The Discovery Connect Team
      `;
    }
    // Send email asynchronously
    sendEmail(email, "Account Status Update", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated and email sent" };
  } catch (error) {
    console.error("Error updating collection site status:", error);
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
  getAllCollectioninCollectionStaff
};
