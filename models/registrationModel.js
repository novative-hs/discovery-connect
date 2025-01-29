const mysqlConnection = require("../config/db");
// Function to create the city table
const createuser_accountTable = () => {
    const createuser_accountTable = `
    CREATE TABLE IF NOT EXISTS user_account (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      accountType ENUM('Researcher', 'Organization', 'CollectionSites', 'RegistrationAdmin', 'biobank') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

  mysqlConnection.query(createuser_accountTable, (err, results) => {
    if (err) {
      console.error("Error creating accounts table: ", err);
    } else {
      console.log("Accounts table created Successfully");
    }
  });
};

// Researcher Table
const create_researcherTable = () => {
    const create_researcherTable = `
    CREATE TABLE IF NOT EXISTS researcher (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_account_id INT,
      ResearcherName VARCHAR(100),
      phoneNumber VARCHAR(15),
      fullAddress TEXT,
      city INT,
      district INT,
      country INT,
      nameofOrganization INT,
      logo LONGBLOB,
      status ENUM('pending', 'approved', 'unapproved') DEFAULT 'pending',
      FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
      FOREIGN KEY (nameofOrganization) REFERENCES organization(id) ON DELETE CASCADE,
      FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
      FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
      FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
  )`;
  mysqlConnection.query(create_researcherTable, (err, results) => {
    if (err) {
      console.error("Error creating researcher table: ", err);
    } else {
      console.log("Researcher table created Successfully");
    }
  });
};

const create_organizationTable = () => {
    const create_organizationTable = `
    CREATE TABLE IF NOT EXISTS organization (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_account_id INT,
      type VARCHAR(50),
      OrganizationName VARCHAR(100),
      HECPMDCRegistrationNo VARCHAR(50),
      city INT,
      district INT,
      country INT,
      phoneNumber VARCHAR(15),
      ntnNumber VARCHAR(50),
      fullAddress TEXT,
      logo LONGBLOB,
      status ENUM('pending', 'approved', 'unapproved') DEFAULT 'pending',
      FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
      FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
      FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
      FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
  )`;

  mysqlConnection.query(create_organizationTable, (err, results) => {
    if (err) {
      console.error("Error creating organization table: ", err);
    } else {
      console.log("Organization table created Successfully");
    }
  });
};

const create_collectionsiteTable = () => {
    const create_collectionsiteTable = `
    CREATE TABLE IF NOT EXISTS collectionsite (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_account_id INT,
      type VARCHAR(50),
      CollectionSiteName VARCHAR(100),
      ntnNumber VARCHAR(50),
      fullAddress TEXT,
      city INT,
      district INT,
      country INT,
      logo LONGBLOB,
      phoneNumber VARCHAR(15),
      status ENUM('pending', 'approved', 'unapproved') DEFAULT 'pending',
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

const create_biobankTable = () => {
  const create_biobankTable = `
  CREATE TABLE IF NOT EXISTS biobank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_account_id INT,
    Name VARCHAR(100),
    FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
)`;

mysqlConnection.query(create_biobankTable, (err, results) => {
  if (err) {
    console.error("Error biobank table: ", err);
  } else {
    console.log("Biobank table created Successfully");
  }
});
};



const getAccountDetail = (id, callback) => {
  console.log("ID", id);
  // Query to verify email and password for any account type
  const query = `SELECT id, email, accountType 
     FROM user_account 
     WHERE id=?`;

  mysqlConnection.query(query, [id], (err, results) => {
    if (err) {
      return callback(err, null); // Pass error to the controller
    }

    if (results.length > 0) {
      const user = results[0];

      // If account type is Researcher, check the status in researcher table
      if (user.accountType === "Researcher") {
        const researcherQuery = `SELECT 
      researcher.*,
      city.id AS cityid,
      city.name AS cityname,
      district.id AS districtid,
      district.name AS districtname,
      country.id AS countryid,
      country.name AS countryname,
      organization.id AS organization_id,
      organization.OrganizationName AS OrganizationName,
      user_account.email AS useraccount_email,
      user_account.accountType 
  FROM 
      researcher
  LEFT JOIN city ON researcher.city = city.id
  LEFT JOIN district ON researcher.district = district.id
  LEFT JOIN country ON researcher.country = country.id
  LEFT JOIN organization ON researcher.nameofOrganization = organization.id
  LEFT JOIN user_account ON researcher.user_account_id = user_account.id
  WHERE 
      researcher.user_account_id = ?`;

        mysqlConnection.query(
          researcherQuery,
          [user.id],
          (err, researcherResults) => {
            if (err) {
              return callback(err, null); // Pass error to the controller
            }
            return callback(err, researcherResults); // Pass data to the controller
          }
        );
      } else if (user.accountType === "Organization") {
        const OrganizationQuery = `
        SELECT o.*,  c.id AS cityid,
        c.name AS cityname, 
        cnt.id AS countryid, 
        cnt.name AS countryname, 
        d.id AS districtid, d.name AS districtname, 
        ua.accountType as accountType ,
        ua.email AS useraccount_email FROM organization o 
        JOIN city c ON o.city = c.id 
        JOIN country cnt ON o.country = cnt.id 
        JOIN district d ON o.district = d.id 
        JOIN user_account ua ON o.user_account_id = ua.id
         WHERE o.user_account_id = ?
        
        `;

        mysqlConnection.query(
          OrganizationQuery,
          [user.id],
          (err, OrganizationResults) => {
            if (err) {
              return callback(err, null); // Pass error to the controller
            }
            return callback(null, OrganizationResults); // Return organization info
          }
        );
      } else if (user.accountType === "CollectionSites") {
        const collectionsiteQuery = `
         SELECT 
      collectionsite.*, 
      city.id AS cityid, 
      city.name AS cityname, 
      district.id AS districtid, 
      district.name AS districtname, 
      country.id AS countryid, 
      country.name AS countryname, 
      user_account.email AS useraccount_email,
      user_account.accountType
    FROM 
      collectionsite
    LEFT JOIN city ON collectionsite.city = city.id
    LEFT JOIN district ON collectionsite.district = district.id
    LEFT JOIN country ON collectionsite.country = country.id
    LEFT JOIN user_account ON collectionsite.user_account_id = user_account.id
    WHERE 
      collectionsite.user_account_id = ?
        `;

        mysqlConnection.query(
          collectionsiteQuery,
          [user.id],
          (err, collectionsiteResults) => {
            if (err) {
              return callback(err, null); // Pass error to the controller
            }
 
              return callback(null, collectionsiteResults); // Return collectiosite info 
            
          }
        );
      } else {
        // For non-researcher accounts, return the user info
        callback(null, user);
      }
    } else {
      callback({ status: "fail", message: "Invalid ID" }, null);
    }
  });
};

const updateAccount = (req, callback) => {
 
  const {
    user_account_id,
    useraccount_email,
    accountType,
    ResearcherName,
    OrganizationName,
    CollectionSiteName,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    nameofOrganization,
    type,
    HECPMDCRegistrationNo,
    ntnNumber,
  } = req.body;
  
  // Handle the logo file (if provided)
  let logo = null;
  if (req.file) {
    // If a file was uploaded, convert it to a buffer
    logo = req.file.buffer;
  }
  //Start MySQL transaction
  mysqlConnection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return callback(err, null);
    }

    // Check if user account exists
    const checkAccountQuery = "SELECT * FROM user_account WHERE id = ?";
    mysqlConnection.query(
      checkAccountQuery,
      [user_account_id],
      (err, results) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            console.error("Database Query Error:", err);
            callback(err, null);
          });
        }

        if (results.length === 0) {
          // If account does not exist, return an error
          return mysqlConnection.rollback(() => {
            callback(new Error("Account not found"), null);
          });
        }

        // Update user account table
        const updateUserAccountQuery = `
        UPDATE user_account SET email = ? WHERE id = ?
      `;
        const updateUserAccountValues = [useraccount_email, user_account_id];

        mysqlConnection.query(
          updateUserAccountQuery,
          updateUserAccountValues,
          (err, userAccountResults) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                console.error("Error updating user_account:", err);
                callback(err, null);
              });
            }

            let query, values;

            // Prepare the query and values based on account type
            switch (accountType) {
              case "Researcher":
                query = `
                UPDATE researcher SET 
                  ResearcherName = ?, 
                  phoneNumber = ?, 
                  fullAddress = ?, 
                  city = ?, 
                  district = ?, 
                  country = ?, 
                  nameofOrganization = ?, 
                  logo = ?
                WHERE user_account_id = ?
              `;
                values = [
                  ResearcherName,
                  phoneNumber,
                  fullAddress,
                  city,
                  district,
                  country,
                  nameofOrganization,
                  logo,
                  user_account_id,
                ];
                break;

              case "Organization":
                query = `
                UPDATE organization SET 
                  OrganizationName = ?, 
                  type = ?, 
                  HECPMDCRegistrationNo = ?, 
                  ntnNumber = ?, 
                  phoneNumber = ?, 
                  fullAddress = ?, 
                  city = ?, 
                  district = ?, 
                  country = ?, 
                  logo = ?
                WHERE user_account_id = ?
              `;
                values = [
                  OrganizationName,
                  type,
                  HECPMDCRegistrationNo,
                  ntnNumber,
                  phoneNumber,
                  fullAddress,
                  city,
                  district,
                  country,
                  logo,
                  user_account_id,
                ];
                break;

              case "CollectionSites":
                query = `
                UPDATE collectionsite SET 
                  CollectionSiteName = ?, 
                  phoneNumber = ?, 
                  ntnNumber = ?, 
                  fullAddress = ?, 
                  city = ?, 
                  district = ?, 
                  country = ?, 
                  logo = ?
                WHERE user_account_id = ?
              `;
                values = [
                  CollectionSiteName,
                  phoneNumber,
                  ntnNumber,
                  fullAddress,
                  city,
                  district,
                  country,
                  logo,
                  user_account_id,
                ];
                break;

              default:
                return mysqlConnection.rollback(() => {
                  callback(new Error("Invalid account type"), null);
                });
            }

            // Execute the query for the secondary table
            mysqlConnection.query(query, values, (err, results) => {
              if (err) {
                return mysqlConnection.rollback(() => {
                  console.error("Error updating secondary table:", err);
                  callback(err, null);
                });
              }

              // If everything is successful, commit the transaction
              mysqlConnection.commit((err) => {
                if (err) {
                  return mysqlConnection.rollback(() => {
                    console.error("Error committing transaction:", err);
                    callback(err, null);
                  });
                }

                callback(null, {
                  message: "Account updated successfully",
                  userId: user_account_id,
                });
              });
            });
          }
        );
      }
    );
  });
};
// Function to insert a new City member
const createAccount = (req, callback) => {
  const {
    accountType,
    email,
    password,
    ResearcherName,
    OrganizationName,
    CollectionSiteName,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    nameofOrganization,
    type,
    HECPMDCRegistrationNo,
    ntnNumber,
  } = req.body;

  // Handle the logo file (if provided)
  const logo = req.file ? req.file.buffer : null && accountType === 'CollectionSites' || accountType === "Organization" || accountType === "Researcher"
  console.log('Logo Buffer:', logo);
  console.log('Received File:', req.file);

  // Start MySQL transaction
  mysqlConnection.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return callback(err, null);
    }

    // Check if email already exists in the user_account table
    const checkEmailQuery = 'SELECT * FROM user_account WHERE email = ?';
    mysqlConnection.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
        return mysqlConnection.rollback(() => {
          console.error('Database Query Error:', err);
          callback(err, null);
        });
      }

      if (results.length > 0) {
        // If email already exists, return an error message
        return mysqlConnection.rollback(() => {
          callback(new Error('Email already exists'), null);
        });
      }

      // If email does not exist, proceed with user account creation
      const userAccountQuery = `
        INSERT INTO user_account (email, password, accountType)
        VALUES (?, ?, ?)
      `;
      const userAccountValues = [email, password, accountType];

      mysqlConnection.query(userAccountQuery, userAccountValues, (err, userAccountResults) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            console.error('Error inserting into user_account:', err);
            callback(err, null);
          });
        }

        const userAccountId = userAccountResults.insertId;
        let query, values;

        // Prepare the query and values based on account type
        switch (accountType) {
          case 'Researcher':
            query = 'INSERT INTO researcher (user_account_id, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization,logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            values = [
              userAccountId,
              ResearcherName,
              phoneNumber,
              fullAddress,
              city,
              district,
              country,
              nameofOrganization,
              logo
            ];
            break;

          case 'Organization':
            query = 'INSERT INTO organization (user_account_id, OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country, logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            values = [
              userAccountId,
              OrganizationName,
              type,
              HECPMDCRegistrationNo,
              ntnNumber,
              phoneNumber,
              fullAddress,
              city,
              district,
              country,
              logo,
            ];
            break;

          case 'CollectionSites':
            query = 'INSERT INTO collectionsite (user_account_id, CollectionSiteName, phoneNumber, ntnNumber, fullAddress, city, district, country, logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            values = [
              userAccountId,
              CollectionSiteName,
              phoneNumber,
              ntnNumber,
              fullAddress,
              city,
              district,
              country,
              logo,
            ];
            break;

          case 'RegistrationAdmin':
            return callback(null, { message: 'RegistrationAdmin account registered successfully', userId: userAccountId });
          case 'biobank':
            return callback(null, { message: 'Biobank account registered successfully', userId: userAccountId });

          default:
            return mysqlConnection.rollback(() => {
              callback(new Error('Invalid account type'), null);
            });
        }

        // Execute the query for the secondary table
        mysqlConnection.query(query, values, (err, results) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              console.error('Error inserting into secondary table:', err);
              callback(err, null);
            });
          }

          // If everything is successful, commit the transaction
          mysqlConnection.commit((err) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                console.error('Error committing transaction:', err);
                callback(err, null);
              });
            }

            callback(null, { message: 'Account registered successfully', userId: userAccountId });
          });
        });
      });
    });
  });
};
 
const loginAccount = (data, callback) => {
  const { email, password } = data;

  // Check if all fields are provided
  if (!email || !password) {
    return callback({ status: "fail", message: "Email and password are required" });
  }

  // Query to verify email and password for any account type
  const query = 
    `SELECT id, email, accountType 
     FROM user_account 
     WHERE email = ? AND password = ?`;

  mysqlConnection.query(query, [email, password], (err, results) => {
    if (err) {
      return callback(err, null); // Pass error to the controller
    }

    if (results.length > 0) {
      const user = results[0];

      // If account type is Researcher, check the status in researcher table
      if (user.accountType === 'Researcher') {
        const researcherQuery = 
          `SELECT status FROM researcher WHERE user_account_id = ?`;

        mysqlConnection.query(researcherQuery, [user.id], (err, researcherResults) => {
          if (err) {
            return callback(err, null); // Pass error to the controller
          }

          if (researcherResults.length > 0 && researcherResults[0].status === 'approved') {
            return callback(null, user); // Return user info if approved
          } else {
            return callback({ status: "fail", message: "Account is not approved" }, null);
          }
        });
      } else if (user.accountType === 'Organization') {
        const OrganizationQuery = 
          `SELECT status FROM organization WHERE user_account_id = ?`;

        mysqlConnection.query(OrganizationQuery, [user.id], (err, OrganizationResults) => {
          if (err) {
            return callback(err, null); // Pass error to the controller
          }

          if (OrganizationResults.length > 0 && OrganizationResults[0].status === 'approved') {
            return callback(null, user); // Return user info if approved
          } else {
            return callback({ status: "fail", message: "Account is not approved" }, null);
          }
        });
      } else if (user.accountType === 'CollectionSites') {
        const collectionsiteQuery = 
          `SELECT status FROM collectionsite WHERE user_account_id = ?`;

        mysqlConnection.query(collectionsiteQuery, [user.id], (err, collectionsiteResults) => {
          if (err) {
            return callback(err, null); // Pass error to the controller
          }

          if (collectionsiteResults.length > 0 && collectionsiteResults[0].status === 'approved') {
            return callback(null, user); // Return user info if approved
          } else {
            return callback({ status: "fail", message: "Account is not approved" }, null);
          }
        });
      } else{
        // For non-researcher accounts, return the user info
        callback(null, user);
      }
    } else {
      callback({ status: "fail", message: "Invalid email or password" }, null);
    }
  });
};

const getUserEmail = (id, callback) => {
  const query = `SELECT * FROM user_account WHERE id = ?`;
  mysqlConnection.query(query, [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results); // Pass results to the controller
  });
};


function changepassword(data, callback) {
  const tables = [
    "user_account",
  ];

  const findUserQueries = tables.map(
    (table) => `SELECT email FROM ${table} WHERE email = ?`
  );

  const updateQueries = tables.map(
    (table) => `UPDATE ${table} SET password = ? WHERE email = ?`
  );

  // First, find where the user exists
  Promise.all(
    findUserQueries.map((query) =>
      new Promise((resolve, reject) => {
        mysqlConnection.query(query, [data.email], (err, result) => {
          if (err) {
            reject(err);
          } else if (result.length > 0) {
            resolve(true); // User exists in this table
          } else {
            resolve(false); // User does not exist in this table
          }
        });
      })
    )
  )
    .then((exists) => {
      const updatePromises = exists
        .map((existsInTable, index) => {
          if (existsInTable) {
            return new Promise((resolve, reject) => {
              mysqlConnection.query(
                updateQueries[index],
                [data.newPassword, data.email],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          }
          return Promise.resolve(); // Skip updates for tables where the user doesn't exist
        })
        .filter(Boolean); // Remove skipped promises

      return Promise.all(updatePromises);
    })
    .then(() => {
      callback(null, { message: "Password updated successfully" });
    })
    .catch((err) => {
      console.error("Error updating password:", err);
      callback({ status: 500, message: "Update error" }, null);
    });
}
  
module.exports = {
  changepassword,
  loginAccount,
  getAccountDetail,
  getUserEmail,
  create_collectionsiteTable,
  create_biobankTable,
  create_organizationTable,
  create_researcherTable,
  createuser_accountTable,
  createAccount,
  updateAccount
};