const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email")

// Function to create the city table
const createuser_accountTable = () => {
  const createuser_accountTable = `
    CREATE TABLE IF NOT EXISTS user_account (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    accountType ENUM('Researcher', 'Organization', 'CollectionSites', 'DatabaseAdmin', 'RegistrationAdmin', 'biobank', 'Committeemember','CSR') NOT NULL,
    OTP VARCHAR(4) NULL,
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
      status ENUM('pending', 'approved', 'unapproved') DEFAULT 'pending',
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
const create_CSR=()=>{
  const create_CSR = `
  CREATE TABLE IF NOT EXISTS CSR (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_account_id INT,
    CSRName VARCHAR(100),
    phoneNumber VARCHAR(15),
    fullAddress TEXT,
    city INT,
    district INT,
    country INT,
    status ENUM('pending', 'approved', 'unapproved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
    FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
    FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
    FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
)`;
mysqlConnection.query(create_CSR, (err, results) => {
  if (err) {
    console.error("Error creating CSR table: ", err);
  } else {
    console.log("CSR table created Successfully");
  }
});
}

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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
      CollectionSiteType VARCHAR(50),
      CollectionSiteName VARCHAR(100),
      fullAddress TEXT,
      city INT,
      district INT,
      country INT,
      logo LONGBLOB,
      phoneNumber VARCHAR(15),
      status ENUM('pending', 'approved', 'unapproved') DEFAULT 'pending',
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
      user_account.password AS useraccount_password,
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
      collectionsite.CollectionSiteType,
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
      } 
      else if (user.accountType === "Committeemember") {
        const CommitteememberQuery = `
        SELECT 
    cm.*,
   c.id AS cityid,
      c.name AS cityname,
      d.id AS districtid,
      d.name AS districtname,
      ctr.id AS countryid,
      ctr.name AS countryname,
    org.id AS organization_id,
    org.OrganizationName AS OrganizationName,
    ua.email AS useraccount_email,
    ua.accountType
FROM 
    committee_member cm
JOIN 
    city c ON cm.city = c.id
JOIN 
    district d ON cm.district = d.id
JOIN 
    country ctr ON cm.country = ctr.id
JOIN 
    organization org ON cm.organization = org.id
LEFT JOIN 
    user_account ua ON cm.user_account_id = ua.id
WHERE 
    cm.user_account_id = ?;

        `;

        mysqlConnection.query(
          CommitteememberQuery,
          [user.id],
          (err, CommitteememberResults) => {
            if (err) {
              return callback(err, null); // Pass error to the controller
            }

            return callback(null, CommitteememberResults); // Return collectiosite info 

          }
        );
      } 
      else if (user.accountType === "CSR") {
        const CSRQuery = `
        SELECT 
    o.*,
   c.id AS cityid,
      c.name AS cityname,
      d.id AS districtid,
      d.name AS districtname,
      ctr.id AS countryid,
      ctr.name AS countryname,
    ua.email AS useraccount_email,
    ua.accountType
FROM 
    CSR o
JOIN 
    city c ON o.city = c.id
JOIN 
    district d ON o.district = d.id
JOIN 
    country ctr ON o.country = ctr.id

LEFT JOIN 
    user_account ua ON o.user_account_id = ua.id
WHERE 
    o.user_account_id = ?;

        `;

        mysqlConnection.query(
          CSRQuery,
          [user.id],
          (err, CSRResults) => {
            if (err) {
              return callback(err, null); // Pass error to the controller
            }

            return callback(null, CSRResults); // Return collectiosite info 

          }
        );
      } 
      else {
        // For non-researcher accounts, return the user info
        callback(null, user);
      }
    } else {
      callback({ status: "fail", message: "Invalid ID" }, null);
    }
  });
};

// Function to update account (Researcher, Organization, Collection Sites)
const updateAccount = (req, callback) => {
  const {
    user_account_id,
    useraccount_email,
    password,
    accountType,
    ResearcherName,
    OrganizationName,
    CollectionSiteName,
    CommitteeMemberName,
    CSRName,
    cnic,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    nameofOrganization,
    type,
    HECPMDCRegistrationNo,
    ntnNumber,
    committeetype,
    added_by
  } = req.body;

  // Handle the logo file (if provided)
  let logo = null;
  if (req.file) {
    // If a file was uploaded, convert it to a buffer
    logo = req.file.buffer;
  }
  console.log(req.body)
  mysqlConnection.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return callback(err, null);
    }
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Error starting transaction:", err);
        return callback(err, null);
      }
      // Check if user account exists
      const checkAccountQuery = "SELECT email, password FROM user_account WHERE id = ?";
      connection.query(
        checkAccountQuery,
        [user_account_id],
        (err, results) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Database Query Error:", err);
              callback(err, null);
            });
          }

          if (results.length === 0) {
            // If account does not exist, return an error
            return connection.rollback(() => {
              connection.release();
              callback(new Error("Account not found"), null);
            });
          }
          const previousEmail = results[0].email;
          const previousPassword = results[0].password;
          // Update user account table
          const updateUserAccountQuery = `
        UPDATE user_account SET email = ? WHERE id = ?
      `;
          const updateUserAccountValues = [useraccount_email, user_account_id];
          console.log("Updating user_account with:", { useraccount_email, user_account_id });


          connection.query(
            updateUserAccountQuery,
            updateUserAccountValues,
            (err, userAccountResults) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Error updating user_account:", err);
                  callback(err, null);
                });
              }

              let fetchQuery, updateQuery, values;

              switch (accountType) {
                case "Researcher":
                  fetchQuery = "SELECT * FROM researcher WHERE user_account_id = ?";
                  updateQuery = `
                    UPDATE researcher SET 
                      ResearcherName = ?, phoneNumber = ?, fullAddress = ?, city = ?, district = ?, 
                      country = ?, nameofOrganization = ? WHERE user_account_id = ?
                  `;
                  values = [ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization, user_account_id];
                  break;

                case "Organization":
                  fetchQuery = "SELECT * FROM organization WHERE user_account_id = ?";
                  updateQuery = `
                    UPDATE organization SET 
                      OrganizationName = ?, type = ?, HECPMDCRegistrationNo = ?, ntnNumber = ?, 
                      phoneNumber = ?, fullAddress = ?, city = ?, district = ?, country = ?, logo = ?
                    WHERE user_account_id = ?
                  `;
                  values = [OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country, logo, user_account_id];
                  break;

                case "CollectionSites":
                  fetchQuery = "SELECT * FROM collectionsite WHERE user_account_id = ?";
                  updateQuery = `
                    UPDATE collectionsite SET 
                      CollectionSiteName = ?, phoneNumber = ?, fullAddress = ?, city = ?, district = ?, 
                      country = ?, logo = ? WHERE user_account_id = ?
                  `;
                  values = [CollectionSiteName, phoneNumber, fullAddress, city, district, country, logo, user_account_id];
                  break;
                  case "Committeemember":
                  fetchQuery = "SELECT * FROM committee_member WHERE user_account_id = ?";
                  updateQuery = `
                    UPDATE committee_member SET 
                      CommitteeMemberName = ?, cnic=?,phoneNumber = ?, fullAddress = ?, city = ?, district = ?, 
                      country = ?,organization=?,committeetype=? WHERE user_account_id = ?
                  `;
                  values = [CommitteeMemberName, cnic,phoneNumber, fullAddress, city, district, country, OrganizationName,committeetype,user_account_id];
                  break;
                  case "CSR":
                    fetchQuery = "SELECT * FROM CSR WHERE user_account_id = ?";
                    updateQuery = `
                      UPDATE CSR SET 
                        CSRName = ?, phoneNumber = ?, fullAddress = ?, city = ?, district = ?, 
                        country = ? WHERE user_account_id = ?
                    `;
                    values = [CSRName, phoneNumber, fullAddress, city, district, country, user_account_id];
                    break;
  
                default:
                  return mysqlConnection.rollback(() => callback(new Error("Invalid account type"), null));
              }

              // Execute the query for the secondary table
              connection.query(fetchQuery, [user_account_id], (err, previousResults) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error("Error updating secondary table:", err);
                    callback(err, null);
                  });
                }
                const previousData = previousResults[0] || {};

                connection.query(updateQuery, values, (err) => {
                  if (err) return mysqlConnection.rollback(() => callback(err, null));
                  
                  let organizationID = null;
                  let researcherID = null;
                  let collectionSiteID = null;
                  let committeemember_id=null;
                  let CSR_id=null
                  if (previousData.OrganizationName) {
                    organizationID = previousData.id; // Organization
                  } else if (previousData.ResearcherName) {
                    researcherID = previousData.id; // Researcher
                  } else if (previousData.CollectionSiteName) {
                    collectionSiteID = previousData.id; // Collection Site
                  }
                  else if (previousData.CSRName) {
                    CSR_id = previousData.id; // Collection Site
                  }
                  else if (previousData.CommitteeMemberName) {
                    committeemember_id = previousData.id; // Committee Member
                  }
                  
                  const historyQuery = `
                    INSERT INTO history (
                      email, password, ResearcherName, CollectionSiteName, OrganizationName, CommitteeMemberName,CSRName,
                      HECPMDCRegistrationNo, CNIC, CommitteeType, ntnNumber, nameofOrganization, type, phoneNumber, 
                      fullAddress, city, district, country, logo, added_by, organization_id, 
                      researcher_id, collectionsite_id, committeemember_id, CSR_id,status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
                  `;
                  
                  const historyValues = [
                    previousEmail,
                    previousPassword,
                    previousData.ResearcherName || null,
                    previousData.CollectionSiteName || null,
                    previousData.OrganizationName || null,
                    previousData.CommitteeMemberName || null,
                    previousData.CSRName||null,
                    previousData.HECPMDCRegistrationNo || null,
                    previousData.cnic || null,  
                    previousData.committeetype || null,
                    previousData.ntnNumber || null,
                    previousData.nameofOrganization ? previousData.nameofOrganization : previousData.organization || null,
                    previousData.type || null,
                    previousData.phoneNumber || null,
                    previousData.fullAddress || null,
                    previousData.city || null,
                    previousData.district || null,
                    previousData.country || null,
                    previousData.logo || null,
                    previousData.added_by || null,
                    organizationID || null,
                    researcherID || null,
                    collectionSiteID || null,
                    committeemember_id || null,  // Fix: Correct spelling
                    CSR_id||null,
                    "updated",
                  ];
                  
                  connection.query(historyQuery, historyValues, (err) => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        console.error("Error inserting into history:", err);
                        callback(err, null);
                      });
                    }
                  
                    // Commit transaction if successful
                    connection.commit((err) => {
                      if (err) {
                        return connection.rollback(() => {
                          connection.release();
                          console.error("Error committing transaction:", err);
                          callback(err, null);
                        });
                      }
                      connection.release();
                      callback(null, {
                        message: "Account updated successfully",
                        userId: user_account_id,
                      });
                    });                  
                  });
                });
              });
            });
        }
      );
    }
    );
  });
};

// Function to Create Account
const createAccount = (req, callback) => {
  const {
    accountType,
    email,
    password,
    ResearcherName,
    CSRName,
    OrganizationName,
    CollectionSiteName,
    CollectionSiteType,
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

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return callback(err, null);
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Error starting transaction:", err);
        return callback(err, null);
      }

      // Check if email already exists in the user_account table
      const checkEmailQuery = 'SELECT * FROM user_account WHERE email = ?';
      connection.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }

        if (results.length > 0) {
          return connection.rollback(() => {
            connection.release();
            callback(new Error("Email already exists"), null);
          });
        }

        const userAccountQuery = `INSERT INTO user_account (email, password, accountType) VALUES (?, ?, ?)`;
        connection.query(
          userAccountQuery,
          [email, password, accountType],
          (err, userAccountResults) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            const userAccountId = userAccountResults.insertId;
            let query, values;

            switch (accountType) {
              case "Researcher":
                query = `INSERT INTO researcher (user_account_id, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization, added_by) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                values = [
                  userAccountId,
                  ResearcherName,
                  phoneNumber,
                  fullAddress,
                  city,
                  district,
                  country,
                  nameofOrganization,
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
                query = `INSERT INTO collectionsite (user_account_id, CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress, city, district, country, logo) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                values = [
                  userAccountId,
                  CollectionSiteName,
                  CollectionSiteType,
                  phoneNumber,
                  fullAddress,
                  city,
                  district,
                  country,
                  logo,
                ];
                break;

                case "CSR":
                  query = `INSERT INTO CSR (user_account_id, CSRName, phoneNumber, fullAddress, city, district, country) 
                           VALUES ( ?, ?, ?, ?, ?, ?, ?)`;
                  values = [
                    userAccountId,
                    CSRName,
                    phoneNumber,
                    fullAddress,
                    city,
                    district,
                    country,
                  
                  ];
                  break;
  
              case "RegistrationAdmin":
              case "biobank":
                return callback(null, {
                  message: `${accountType} account registered successfully`,
                  userId: userAccountId,
                });

              default:
                return connection.rollback(() => {
                  connection.release();
                  callback(new Error("Invalid account type"), null);
                });
            }

            connection.query(query, values, (err, results) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  callback(err, null);
                });
              }

              const userId = results.insertId;
              let name = null
              // Identify correct ID for history table
              let organizationId = null,
                researcherId = null,
                CSRId=null,
                collectionsiteId = null;

              if (accountType === "Organization") {
                name = OrganizationName
                organizationId = userId;
              }
              if (accountType === "Researcher") {
                name = ResearcherName
                researcherId = userId;
              }
              if (accountType === "CollectionSites") {
                collectionsiteId = userId;
                name = CollectionSiteName
              }
              if (accountType === "CSR") {
                CSRId = userId;
                name = CSRName
              }

              const historyQuery = `
                INSERT INTO history (
                  email, password, ResearcherName, CollectionSiteName, OrganizationName, CSRName,
                  HECPMDCRegistrationNo, ntnNumber, nameofOrganization, type, CollectionSiteType, phoneNumber, 
                  fullAddress, city, district, country, logo, added_by, organization_id, 
                  researcher_id, collectionsite_id, CSR_id,status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?, ?)`;

              const historyValues = [
                email,
                password,
                ResearcherName || null,
                CollectionSiteName || null,
                OrganizationName || null,
                CSRName||null,
                HECPMDCRegistrationNo || null,
                ntnNumber || null,
                nameofOrganization || null,
                type || null,
                CollectionSiteType || null,
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
                CSRId,
                "added",
              ];

              connection.query(historyQuery, historyValues, (err, historyResults) => {
                if (err) {
                  return connection.rollback(() => callback(err, null));
                }

                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      callback(err, null);
                    });
                  }

                  connection.release(); // Always release the connection!

                  //  Send Confirmation Email
                  sendEmail(
                    email,
                    "Welcome to Discovery Connect",
                    ` Dear ${name},\n\nYour account status is currently pending. 
                    Please wait for approval.\n\nBest regards,\n LabHazir`
                  );

                  connection.release(); // Always release the connection!
                  sendEmail(
                    email,
                    "Welcome to Discovery Connect",
                    ` Dear ${name},\n\nYour account status is currently pending. 
                      Please wait for approval.\n\nBest regards,\n LabHazir`
                  );
                  callback(null, {
                    message: "Account registered successfully",
                    userId: userAccountId,
                  });
                });
              });
            });
          });
      }
      );
    });
  });
};


const loginAccount = (data, callback) => {
  const { email, password } = data;

  // Validate input
  if (!email || !password) {
    return callback({ message: "Email and password are required" }, null);
  }

  // Base user check
  const query = `
    SELECT id, email, accountType 
    FROM user_account 
    WHERE email = ? AND password = ?`;

  mysqlConnection.query(query, [email, password], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) {
      return callback({ message: "Invalid email or password" }, null);
    }

    const user = results[0];

    // Helper to check status
    const checkStatus = (tableName, activeStatus = "approved") => {
      const statusQuery = `SELECT status FROM ${tableName} WHERE user_account_id = ?`;
      mysqlConnection.query(statusQuery, [user.id], (err, statusResults) => {
        if (err) return callback(err, null);
        if (
          statusResults.length > 0 &&
          statusResults[0].status.toLowerCase() === activeStatus.toLowerCase()
        ) {
          return callback(null, user);
        } else {
          return callback({ message: "Account is not approved" }, null);
        }
      });
    };

    switch (user.accountType) {
      case "Researcher":
        return checkStatus("researcher");
      case "Organization":
        return checkStatus("organization");
      case "CollectionSites":
        return checkStatus("collectionsite");
      case "CSR":
        return checkStatus("CSR");
      case "Committeemember":
        return checkStatus("committee_member", "active");
      default:
        return callback(null, user); // Allow login if no special status check
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

const getEmail = (email, callback) => {
  if (!email) {
    return callback({ status: 400, error: "Email is required" }, null);
  }

  const query = `SELECT * FROM user_account WHERE email = ?`;

  mysqlConnection.query(query, [email], (err, results) => {
    if (err) {
      console.error(" Database Error:", err);
      return callback({ status: 500, error: "Database error" }, null);
    }
    callback(null, { exists: results.length > 0, user: results[0] || null });
  });
};

function changepassword(data, callback) {
  const table = "user_account"; 
  const findUserQuery = `SELECT password FROM ${table} WHERE email = ?`;

  mysqlConnection.query(findUserQuery, [data.email], (err, result) => {
    if (err) {
      console.error("Error fetching password:", err);
      return callback({ status: 500, message: "Database error" }, null);
    }

    // 🛑 Check if user exists
    if (result.length === 0) {
      return callback({ status: 404, message: "User not found" }, null);
    }

    const dbPassword = result[0].password;

    // ✅ If password is NULL, empty, or not provided, allow password update
    if (!dbPassword || !data.password || data.password === dbPassword) {
      console.warn("Password not provided or no existing password found. Proceeding with update...");
    } else {
      return callback({ status: 401, message: "Incorrect current password." }, null);
    }

    // 🛠 Update the password in the database
    const updateQuery = `UPDATE ${table} SET password = ? WHERE email = ?`;

    mysqlConnection.query(updateQuery, [data.newPassword, data.email], (err) => {
      if (err) {
        console.error("Error updating password:", err);
        return callback({ status: 500, message: "Error updating password" }, null);
      }

      return callback(null, { message: "Password updated successfully." });
    });
  });
}

const verifyOTP = (email, otp, callback) => {
  const query = "SELECT OTP FROM user_account WHERE email = ?"; 

  mysqlConnection.query(query, [email], (err, result) => {
    if (err) {
      console.error("❌ Error fetching OTP from DB:", err);
      return callback(err, null);
    }

    if (result.length === 0) {
      return callback(null, { message: "User not found" });
    }

    const storedOTP = result[0].OTP.toString();  // ✅ Convert to string
    const inputOTP = otp.toString();  // ✅ Convert input to string

    if (storedOTP !== inputOTP) {
      return callback(null, { message: "Invalid OTP" });
    }

    callback(null, { message: "✅ OTP verified successfully!" });
  });
};


const sendOTP = (req, callback) => {
  const { email } = req.body;

  if (!email) {
    return callback({ status: 400, message: "Email is required" }, null);
  }

  // Generate a 4-digit OTP
  const query = `SELECT email FROM user_account WHERE email = ?`;
  mysqlConnection.query(query, [email], (err, result) => {
    if (err) {
      return callback({ status: 500, message: "Database error" }, null);
    }
    if (result.length === 0) {
      return callback({ status: 404, message: "User not found" }, null);
    }
  
    // Now update the OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const updateQuery = `UPDATE user_account SET OTP = ? WHERE email = ?`;
    mysqlConnection.query(updateQuery, [otp, email], (updateErr) => {
      if (updateErr) {
        return callback({ status: 500, message: "Error saving OTP" }, null);
      }
      
      // Send email after successfully updating OTP
      sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}`)
      .then(() => {
        console.log("✅ Email sent successfully to:", email);
        callback(null, { message: "OTP sent successfully!", otp });
      })
      .catch((error) => {
        console.error("❌ Email sending error:", error);
        callback({ status: 500, message: error.message }, null);
      });
    
    });
  });
};

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
  create_CSR,
  createAccount,
  updateAccount,
  getEmail,
  sendOTP,
  verifyOTP
};