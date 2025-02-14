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
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
      FOREIGN KEY (nameofOrganization) REFERENCES organization(id) ON DELETE CASCADE,
      FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
      FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
      FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
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
    added_by
  } = req.body;

  let logo = req.file ? req.file.buffer : null;

  mysqlConnection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return callback(err, null);
    }

    const checkAccountQuery = "SELECT * FROM user_account WHERE id = ?";
    mysqlConnection.query(checkAccountQuery, [user_account_id], (err, results) => {
      if (err) {
        return mysqlConnection.rollback(() => callback(err, null));
      }

      if (results.length === 0) {
        return mysqlConnection.rollback(() => callback(new Error("Account not found"), null));
      }

      let getDetailsQuery, getDetailsValues;

      // Get existing record from the respective table
      switch (accountType) {
        case "Researcher":
          getDetailsQuery = "SELECT * FROM researcher WHERE user_account_id = ?";
          break;
        case "Organization":
          getDetailsQuery = "SELECT * FROM organization WHERE user_account_id = ?";
          break;
        case "CollectionSites":
          getDetailsQuery = "SELECT * FROM collectionsite WHERE user_account_id = ?";
          break;
        default:
          return mysqlConnection.rollback(() => callback(new Error("Invalid account type"), null));
      }

      mysqlConnection.query(getDetailsQuery, [user_account_id], (err, detailsResults) => {
        if (err) {
          return mysqlConnection.rollback(() => callback(err, null));
        }

        const oldRecord = detailsResults.length > 0 ? detailsResults[0] : {};
console.log(oldRecord)
        // Insert old record into history table
        const historyQuery = `
        INSERT INTO history (
          email, password, ResearcherName, CollectionSiteName, OrganizationName, 
          HECPMDCRegistrationNo, ntnNumber, nameofOrganization, type, 
          researcher_id, organization_id, collectionsite_id, phoneNumber, 
          fullAddress, city, district, country, added_by, status, logo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      let researcherId = null;
      let organizationId = null;
      let collectionsiteId = null;
      
      // Assign correct ID based on account type
      if (accountType === "Researcher") {
        researcherId = oldRecord.id; // ID from researcher table
      } else if (accountType === "Organization") {
        organizationId = oldRecord.id; // ID from organization table
      } else if (accountType === "CollectionSites") {
        collectionsiteId = oldRecord.id; // ID from collectionsite table
      }
      
      const historyValues = [
        results[0].email,
        results[0].password,
        oldRecord.ResearcherName || null,
        oldRecord.CollectionSiteName || null,
        oldRecord.OrganizationName || null,
        oldRecord.HECPMDCRegistrationNo || null,
        oldRecord.ntnNumber || null,
        oldRecord.nameofOrganization || null,
        oldRecord.type || null,
        researcherId, // Researcher ID
        organizationId, // Organization ID
        collectionsiteId, // Collection Site ID
        oldRecord.phoneNumber || null,
        oldRecord.fullAddress || null,
        oldRecord.city || null,
        oldRecord.district || null,
        oldRecord.country || null,
        oldRecord.added_by || null,
        "updated",
        oldRecord.logo || null,
      ];
      
        mysqlConnection.query(historyQuery, historyValues, (err) => {
          if (err) {
            return mysqlConnection.rollback(() => callback(err, null));
          }

          // Update user_account
          const updateUserAccountQuery = `UPDATE user_account SET email = ? WHERE id = ?`;
          mysqlConnection.query(updateUserAccountQuery, [useraccount_email, user_account_id], (err) => {
            if (err) {
              return mysqlConnection.rollback(() => callback(err, null));
            }

            let updateQuery, updateValues;

            switch (accountType) {
              case "Researcher":
                updateQuery = `UPDATE researcher SET ResearcherName = ?, phoneNumber = ?, fullAddress = ?, city = ?, district = ?, country = ?, nameofOrganization = ?, logo = ? WHERE user_account_id = ?`;
                updateValues = [ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization, logo, user_account_id];
                break;

              case "Organization":
                updateQuery = `UPDATE organization SET OrganizationName = ?, type = ?, HECPMDCRegistrationNo = ?, ntnNumber = ?, phoneNumber = ?, fullAddress = ?, city = ?, district = ?, country = ?, logo = ? WHERE user_account_id = ?`;
                updateValues = [OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country, logo, user_account_id];
                break;

              case "CollectionSites":
                updateQuery = `UPDATE collectionsite SET CollectionSiteName = ?, phoneNumber = ?, fullAddress = ?, city = ?, district = ?, country = ?, logo = ? WHERE user_account_id = ?`;
                updateValues = [CollectionSiteName, phoneNumber, fullAddress, city, district, country, logo, user_account_id];
                break;
            }

            mysqlConnection.query(updateQuery, updateValues, (err) => {
              if (err) {
                return mysqlConnection.rollback(() => callback(err, null));
              }

              mysqlConnection.commit((err) => {
                if (err) {
                  return mysqlConnection.rollback(() => callback(err, null));
                }

                callback(null, { message: "Account updated successfully", userId: user_account_id });
              });
            });
          });
        });
      });
    });
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
    added_by,
  } = req.body;

  let logo = req.file ? req.file.buffer : null;

  mysqlConnection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return callback(err, null);
    }

    const checkEmailQuery = "SELECT * FROM user_account WHERE email = ?";
    mysqlConnection.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
        return mysqlConnection.rollback(() => callback(err, null));
      }

      if (results.length > 0) {
        return mysqlConnection.rollback(() =>
          callback(new Error("Email already exists"), null)
        );
      }

      const userAccountQuery = `INSERT INTO user_account (email, password, accountType) VALUES (?, ?, ?)`;
      mysqlConnection.query(
        userAccountQuery,
        [email, password, accountType],
        (err, userAccountResults) => {
          if (err) {
            return mysqlConnection.rollback(() => callback(err, null));
          }

          const userAccountId = userAccountResults.insertId;
          let query, values;

          switch (accountType) {
            case "Researcher":
              query = `INSERT INTO researcher (user_account_id, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization, logo, added_by) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
              values = [
                userAccountId,
                ResearcherName,
                phoneNumber,
                fullAddress,
                city,
                district,
                country,
                nameofOrganization,
                logo,
                added_by,
              ];
              break;

            case "Organization":
              query = `INSERT INTO organization (user_account_id, OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country, logo) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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

            case "CollectionSites":
              query = `INSERT INTO collectionsite (user_account_id, CollectionSiteName, phoneNumber, fullAddress, city, district, country, logo) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
              values = [
                userAccountId,
                CollectionSiteName,
                phoneNumber,
                fullAddress,
                city,
                district,
                country,
                logo,
              ];
              break;

            case "RegistrationAdmin":
            case "biobank":
              return callback(null, {
                message: `${accountType} account registered successfully`,
                userId: userAccountId,
              });

            default:
              return mysqlConnection.rollback(() =>
                callback(new Error("Invalid account type"), null)
              );
          }

          mysqlConnection.query(query, values, (err, results) => {
            if (err) {
              return mysqlConnection.rollback(() => callback(err, null));
            }

            const userId = results.insertId;

            // Identify correct ID for history table
            let organizationId = null,
              researcherId = null,
              collectionsiteId = null;

            if (accountType === "Organization") organizationId = userId;
            if (accountType === "Researcher") researcherId = userId;
            if (accountType === "CollectionSites") collectionsiteId = userId;

            const historyQuery = `
            INSERT INTO history (
              email, password, ResearcherName, CollectionSiteName, OrganizationName, 
              HECPMDCRegistrationNo, ntnNumber, nameofOrganization, type, phoneNumber, 
              fullAddress, city, district, country, logo, added_by, organization_id, 
              researcher_id, collectionsite_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const historyValues = [
              email,
              password,
              ResearcherName || null,
              CollectionSiteName || null,
              OrganizationName || null,
              HECPMDCRegistrationNo || null,
              ntnNumber || null,
              nameofOrganization || null,
              type || null,
              phoneNumber,
              fullAddress,
              city,
              district,
              country,
              logo,
              added_by || null,
              organizationId,
              researcherId,
              collectionsiteId,
              "added",
            ];

            mysqlConnection.query(
              historyQuery,
              historyValues,
              (err, historyResults) => {
                if (err) {
                  return mysqlConnection.rollback(() => callback(err, null));
                }

                mysqlConnection.commit((err) => {
                  if (err) {
                    return mysqlConnection.rollback(() => callback(err, null));
                  }

                  callback(null, {
                    message: "Account registered successfully",
                    userId: userAccountId,
                  });
                });
              }
            );
          });
        }
      );
    });
  });
};

const loginAccount = (data, callback) => {
  const { email, password } = data;

  // Check if all fields are provided
  if (!email || !password) {
    return callback({
      status: "fail",
      message: "Email and password are required",
    });
  }

  // Query to verify email and password for any account type
  const query = `SELECT id, email, accountType 
     FROM user_account 
     WHERE email = ? AND password = ?`;

  mysqlConnection.query(query, [email, password], (err, results) => {
    if (err) {
      return callback(err, null); // Pass error to the controller
    }

    if (results.length > 0) {
      const user = results[0];

      // If account type is Researcher, check the status in researcher table
      if (user.accountType === "Researcher") {
        const researcherQuery = `SELECT status FROM researcher WHERE user_account_id = ?`;

        mysqlConnection.query(
          researcherQuery,
          [user.id],
          (err, researcherResults) => {
            if (err) {
              return callback(err, null); // Pass error to the controller
            }

            if (
              researcherResults.length > 0 &&
              researcherResults[0].status === "approved"
            ) {
              return callback(null, user); // Return user info if approved
            } else {
              return callback(
                { status: "fail", message: "Account is not approved" },
                null
              );
            }
          }
        );
      } else if (user.accountType === "Organization") {
        const OrganizationQuery = `SELECT status FROM organization WHERE user_account_id = ?`;

        mysqlConnection.query(
          OrganizationQuery,
          [user.id],
          (err, OrganizationResults) => {
            if (err) {
              return callback(err, null); // Pass error to the controller
            }

            if (
              OrganizationResults.length > 0 &&
              OrganizationResults[0].status === "approved"
            ) {
              return callback(null, user); // Return user info if approved
            } else {
              return callback(
                { status: "fail", message: "Account is not approved" },
                null
              );
            }
          }
        );
      } else if (user.accountType === "CollectionSites") {
        const collectionsiteQuery = `SELECT status FROM collectionsite WHERE user_account_id = ?`;

        mysqlConnection.query(
          collectionsiteQuery,
          [user.id],
          (err, collectionsiteResults) => {
            if (err) {
              return callback(err, null); // Pass error to the controller
            }

            if (
              collectionsiteResults.length > 0 &&
              collectionsiteResults[0].status === "approved"
            ) {
              return callback(null, user); // Return user info if approved
            } else {
              return callback(
                { status: "fail", message: "Account is not approved" },
                null
              );
            }
          }
        );
      } else {
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
  const tables = ["user_account"];

  const findUserQueries = tables.map(
    (table) => `SELECT email FROM ${table} WHERE email = ?`
  );

  const updateQueries = tables.map(
    (table) => `UPDATE ${table} SET password = ? WHERE email = ?`
  );

  // First, find where the user exists
  Promise.all(
    findUserQueries.map(
      (query) =>
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
  updateAccount,
  
};
