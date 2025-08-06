const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email")

// Function to create the city table
const createuser_accountTable = () => {
  const createuser_accountTable = `
    CREATE TABLE IF NOT EXISTS user_account (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    accountType ENUM('Researcher', 'Organization', 'CollectionSitesStaff', 'RegistrationAdmin', 'TechnicalAdmin', 'biobank', 'Committeemember','CSR') NOT NULL,
    OTP VARCHAR(4) NULL,
    otpExpiry TIMESTAMP,
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

const getAccountDetail = (id, callback) => {
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
    csr o
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

// Function to Create Account
const createAccount = (req, callback) => {
  const {
    accountType,
    email,
    password,
    ResearcherName,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    nameofOrganization,
    type,
    HECPMDCRegistrationNo,

    status,
    added_by,

  } = req.body;

  const CNICBuffer = req.files?.CNIC?.[0]?.buffer || null;
  const OrgCardBuffer = req.files?.Org_card?.[0]?.buffer || null;
  let logo = null;
  if (req.file) {
    logo = req.file.buffer;
  } else if (req.files?.logo?.[0]) {
    logo = req.files.logo[0].buffer;
  }

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
                query = `INSERT INTO researcher (user_account_id, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization, added_by,CNIC,organization_card) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`;
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
                  CNICBuffer,
                  OrgCardBuffer
                ];
                break;

              case "TechnicalAdmin":
              case "biobank":
              case "RegistrationAdmin":
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
                CSRId = null,
                collectionsiteId = null;

              if (accountType === "Researcher") {
                name = ResearcherName
                researcherId = userId;
              }

              const historyQuery = `
                INSERT INTO history (
                  email, password, ResearcherName,
                  HECPMDCRegistrationNo, nameofOrganization, type, phoneNumber, 
                  fullAddress, city, district, country, logo, added_by, organization_id, 
                  researcher_id, collectionsite_id, csr_id, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

              const historyValues = [
                email,
                password,
                ResearcherName || null,
                HECPMDCRegistrationNo || null,
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

// Function to update account (Researcher, Organization, Collection Sites)
const updateAccount = (req, callback) => {
  const {
    useraccount_email,
    useraccount_password,
    accountType,
    collectionsitename,
    ResearcherName,
    OrganizationName,
    CollectionSiteName,
    CollectionSiteType,
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
    committeetype,
    added_by,
    permission
  } = req.body;
  const user_account_id = req.params.id
  // Handle the logo file (if provided)
  let logo = null;
  if (req.file) {
    logo = req.file.buffer;
  }
  else if (req.files?.logo?.[0]) {
    logo = req.files.logo[0].buffer;
  }


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
          let updateUserAccountQuery = `UPDATE user_account SET email = ?`;
          const updateUserAccountValues = [useraccount_email];

          if (useraccount_password) {
            updateUserAccountQuery += `, password = ?`;
            updateUserAccountValues.push(useraccount_password);
          }
          updateUserAccountQuery += ` WHERE id = ?`;
          updateUserAccountValues.push(user_account_id);

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
                      OrganizationName = ?, type = ?, HECPMDCRegistrationNo = ?, 
                      phoneNumber = ?, fullAddress = ?, city = ?, district = ?, country = ?, logo = ?
                    WHERE user_account_id = ?
                  `;
                  values = [OrganizationName, type, HECPMDCRegistrationNo, phoneNumber, fullAddress, city, district, country, logo, user_account_id];
                  break;

                case "CollectionSites":
                  fetchQuery = "SELECT * FROM collectionsite WHERE user_account_id = ?";
                  updateQuery = `
                    UPDATE collectionsite SET 
                      CollectionSiteName = ?, CollectionSiteType = ?, phoneNumber = ?, fullAddress = ?, city = ?, district = ?, 
                      country = ?, logo = ? WHERE user_account_id = ?
                  `;
                  values = [CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress, city, district, country, logo, user_account_id];
                  break;
                case "Committeemember":
                  fetchQuery = "SELECT * FROM committee_member WHERE user_account_id = ?";
                  updateQuery = `
                    UPDATE committee_member SET 
                      CommitteeMemberName = ?, cnic=?,phoneNumber = ?, fullAddress = ?, city = ?, district = ?, 
                      country = ?,organization=?,committeetype=? WHERE user_account_id = ?
                  `;
                  values = [CommitteeMemberName, cnic, phoneNumber, fullAddress, city, district, country, OrganizationName, committeetype, user_account_id];
                  break;
                case "CSR":
                  fetchQuery = "SELECT * FROM csr WHERE user_account_id = ?";
                  updateQuery = `
                      UPDATE csr SET 
                        CSRName = ?, phoneNumber = ?, fullAddress = ?, city = ?, district = ?, permission = ?,
                        country = ?,collection_id=? WHERE user_account_id = ?
                    `;
                  values = [CSRName, phoneNumber, fullAddress, city, district, permission, country, collectionsitename, user_account_id];
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
                  if (err) return connection.rollback(() => {
                    connection.release();
                    callback(err, null);
                  });


                  let organizationID = null;
                  let researcherID = null;
                  let collectionSiteID = null;
                  let committeemember_id = null;
                  let csr_id = null
                  if (previousData.OrganizationName) {
                    organizationID = previousData.id; // Organization
                  } else if (previousData.ResearcherName) {
                    researcherID = previousData.id; // Researcher
                  } else if (previousData.CollectionSiteName) {
                    collectionSiteID = previousData.id; // Collection Site
                  }
                  else if (previousData.CSRName) {
                    csr_id = previousData.id; // Collection Site
                  }
                  else if (previousData.CommitteeMemberName) {
                    committeemember_id = previousData.id; // Committee Member
                  }

                  const historyQuery = `
                    INSERT INTO history (
                      email, password, ResearcherName, CollectionSiteName, CollectionSiteType, OrganizationName, CommitteeMemberName,CSRName,
                      HECPMDCRegistrationNo, CNIC, CommitteeType, nameofOrganization, type, phoneNumber, 
                      fullAddress, city, district, country, logo, added_by,permission, organization_id, 
                      researcher_id, collectionsite_id, committeemember_id, csr_id,status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?,?,?)
                  `;

                  const historyValues = [
                    previousEmail,
                    previousPassword,
                    previousData.ResearcherName || null,
                    previousData.CollectionSiteName || null,
                    previousData.CollectionSiteType || null,
                    previousData.OrganizationName || null,
                    previousData.CommitteeMemberName || null,
                    previousData.CSRName || null,
                    previousData.HECPMDCRegistrationNo || null,
                    previousData.cnic || null,
                    previousData.committeetype || null,
                    previousData.nameofOrganization ? previousData.nameofOrganization : previousData.organization || null,
                    previousData.type || null,
                    previousData.phoneNumber || null,
                    previousData.fullAddress || null,
                    previousData.city || null,
                    previousData.district || null,
                    previousData.country || null,
                    previousData.logo || null,
                    previousData.added_by || null,
                    previousData.permission || null,
                    organizationID || null,
                    researcherID || null,
                    collectionSiteID || null,
                    committeemember_id || null,  // Fix: Correct spelling
                    csr_id || null,
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

// Function to Login Account
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
    console.log("result", results)

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
      }

      else if (user.accountType === 'Organization') {
        const OrganizationQuery =
          `SELECT status FROM organization WHERE user_account_id = ?`;

        mysqlConnection.query(OrganizationQuery, [user.id], (err, OrganizationResults) => {
          if (err) {
            return callback(err, null); // Pass error to the controller
          }

          if (OrganizationResults.length > 0 && OrganizationResults[0].status === 'active') {
            return callback(null, user); // Return user info if approved
          } else {
            return callback({ status: "fail", message: "Account is not active" }, null);
          }
        });
      } else if (user.accountType === 'CollectionSites') {
        const collectionsiteQuery =
          `SELECT status FROM collectionsite WHERE user_account_id = ?`;

        mysqlConnection.query(collectionsiteQuery, [user.id], (err, collectionsiteResults) => {
          if (err) {
            return callback(err, null); // Pass error to the controller
          }

          if (collectionsiteResults.length > 0 && collectionsiteResults[0].status === 'active') {
            return callback(null, user); // Return user info if approved
          } else {
            return callback({ status: "fail", message: "Account is not active" }, null);
          }
        });
      }
      else if (user.accountType === 'CollectionSitesStaff') {
        const collectionsiteQuery =
          `SELECT status, permission,collectionsite_id AS collection_id FROM collectionsitestaff WHERE user_account_id = ?`;

        mysqlConnection.query(collectionsiteQuery, [user.id], (err, collectionsitestaffResults) => {
          if (err) {
            return callback(err, null); // Pass error to the controller
          }

          if (collectionsitestaffResults.length > 0 && collectionsitestaffResults[0].status === 'active') {
            // Attach action to the user object
            user.action = collectionsitestaffResults[0].permission;

            return callback(null, user); // Return user with action included
          } else {
            return callback({ status: "fail", message: "Account is not active" }, null);
          }
        });
      }

      else if (user.accountType === 'Committeemember') {
        const CommitteememberQuery =
          `SELECT status FROM committee_member WHERE user_account_id = ?`;

        mysqlConnection.query(CommitteememberQuery, [user.id], (err, CommitteememberResults) => {
          if (err) {
            return callback(err, null); // Pass error to the controller
          }

          if (CommitteememberResults.length > 0 && CommitteememberResults[0].status.toLowerCase() === "active") {
            return callback(null, user); // Return user info if approved
          } else {
            return callback({ status: "fail", message: "Account is not approved" }, null);
          }
        });
      }
      else if (user.accountType === 'CSR') {
        const CSRQuery =
          `SELECT permission,status FROM csr WHERE user_account_id = ?`;

        mysqlConnection.query(CSRQuery, [user.id], (err, CSRResults) => {
          if (err) {
            return callback(err, null); // Pass error to the controller
          }
          if (CSRResults.length > 0 && CSRResults[0].status === 'active') {
            user.action = CSRResults[0].permission;
            return callback(null, user); // Return user info if approved
          } else {
            return callback({ status: "fail", message: "Account is not active" }, null);
          }
        });
      }
      else {
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
  const query = "SELECT OTP, otpExpiry FROM user_account WHERE email = ?";

  mysqlConnection.query(query, [email], (err, result) => {
    if (err) {
      console.error("❌ Error fetching OTP from database:", err);
      return callback({ status: 500, message: "Database error while verifying OTP." }, null);
    }

    if (result.length === 0) {
      return callback({ status: 404, message: "User not found." }, null);
    }

    const storedOTP = result[0].OTP?.toString().trim();  // ✅ Convert to string and trim any spaces
    const inputOTP = otp?.toString().trim();  // ✅ Convert input to string and trim

    const otpExpiry = result[0].otpExpiry;

    // Check if OTP is expired
    if (!otpExpiry || new Date() > new Date(otpExpiry)) {
      return callback({ status: 401, message: "OTP has expired. Please request a new one." }, null);
    }

    // Check if OTP is correct
    if (storedOTP !== inputOTP) {
      return callback({ status: 401, message: "Invalid OTP. Please try again." }, null);
    }

    // OTP is valid
    return callback(null, { message: "✅ OTP verified successfully!" });
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
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const updateQuery = `UPDATE user_account SET OTP = ?, otpExpiry = ? WHERE email = ?`;
    mysqlConnection.query(updateQuery, [otp, otpExpiry, email], (updateErr, result) => {
      if (updateErr) {
        console.error("❌ Error while updating OTP:", updateErr);
        return callback({ status: 500, message: "Error saving OTP" }, null);
      }

      sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}.it is valid for the next 5 minutes.`)
        .then(() => {
          callback(null, { message: "OTP sent successfully!", otp });
        })
        .catch((emailError) => {
          console.error("❌ Email sending error:", emailError);
          callback({ status: 500, message: emailError.message }, null);
        });
    });

  });
};


const sendEmailForOrder = async (req, callback) => {
  const { userID, products } = req.body;

  try {
    // ✅ Get Biobank Email
    const [biobankRows] = await mysqlConnection
      .promise()
      .query(`SELECT email FROM user_account WHERE accountType = 'biobank' LIMIT 1`);

    if (biobankRows.length === 0) {
      return callback("Biobank email not found");
    }

    const biobankEmail = biobankRows[0].email;

    // ✅ Get Researcher Email + Details
    const [researcherRows] = await mysqlConnection
      .promise()
      .query(
        `
        SELECT ua.email, r.ResearcherName
        FROM user_account ua
        JOIN researcher r ON ua.id = r.user_account_id
        WHERE ua.id = ?
      `,
        [userID]
      );

    if (researcherRows.length === 0) {
      return callback("Researcher not found");
    }

    const researcherEmail = researcherRows[0].email;
    const researcherName = researcherRows[0].ResearcherName;

    // ✅ Filter unpriced products
    const unpricedProducts = products.filter(
      (item) => item.price === null || item.price === 0
    );

    const sampleIds = unpricedProducts.map((item) => item.id);

    // ✅ Check for already requested samples
    const [existingQuotes] = await mysqlConnection.promise().query(
      `SELECT sample_id FROM quote_requests WHERE researcher_id = ? AND sample_id IN (?) AND status = 'pending'`,
      [userID, sampleIds]
    );

    const alreadyRequestedIds = existingQuotes.map((row) => row.sample_id);

    // ✅ Filter only new requests
    const newQuotes = unpricedProducts.filter(
      (item) => !alreadyRequestedIds.includes(item.id)
    );

    // ✅ Insert new quote requests
    for (const item of newQuotes) {
      await mysqlConnection.promise().query(
        `INSERT INTO quote_requests (researcher_id, sample_id, status) VALUES (?, ?, 'pending')`,
        [userID, item.id]
      );
    }

    // ✅ Email content
    const biobankEmailTable = `
      <h3>Quote Request: Products Missing Price</h3>
      <p>Kindly update the prices for the following products submitted by <strong>${researcherName}.</strong></p>
      <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>No.</th>
            <th>Specimen ID</th>
            <th>Analyte</th>
            <th>Volume (unit)</th>
            <th>Test Result/Unit</th>
            <th>Price</th>
            <th>Sub Total</th>
          </tr>
        </thead>
        <tbody>
          ${newQuotes
        .map(
          (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.masterid || "-"}</td>
                <td>${item.analyte || "-"}</td>
                <td>${item.Volume || "-"} ${item.VolumeUnit || ""}</td>
                <td>${item.TestResult || "-"} ${item.TestResultUnit || ""}</td>
                <td>${item.price || "-"}</td>
                <td>-</td>
              </tr>
            `
        )
        .join("")}
        </tbody>
      </table>
    `;

    const researcherEmailText = `
      <p>Dear ${researcherName},</p>
      <p>Thank you for your submission.</p>
      <p>Some items in your cart are awaiting price confirmation from the Biobank. You will be notified once pricing is updated so you can proceed with checkout.</p>
      <p>Thank you for your patience.</p>
    `;

    // ✅ Send emails if new quotes exist
    if (newQuotes.length > 0) {
      try {
        await Promise.all([
          sendEmail(biobankEmail, "Missing Product Prices", biobankEmailTable),
          sendEmail(researcherEmail, "Awaiting Price Update", researcherEmailText),
        ]);
        return callback(null, "Emails sent successfully");
      } catch (emailErr) {
        console.error("Email sending error:", emailErr);
        return callback(emailErr.message || "Failed to send one or more emails");
      }
    } else {
      return callback(null, "No new quote requests. Skipped sending email.");
    }
  } catch (err) {
    console.error("Error in sendEmailForOrder:", err);
    return callback(err.message || "Server error");
  }
};




module.exports = {
  createuser_accountTable,
  changepassword,
  loginAccount,
  getAccountDetail,
  getUserEmail,
  createAccount,
  updateAccount,
  getEmail,
  sendOTP,
  verifyOTP,
  sendEmailForOrder
};