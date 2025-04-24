const mysqlConnection = require("../config/db");
const {sendEmail}=require("../config/email");

// Function to create the committee_member table
const createCommitteeMemberTable = () => {
  const committeememberTable = `
    CREATE TABLE IF NOT EXISTS committee_member (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_account_id INT,
        CommitteeMemberName VARCHAR(100),
        phoneNumber VARCHAR(15),
        cnic VARCHAR(15),
        fullAddress TEXT,
        city INT,
        district INT,
        country INT,
        organization INT,
        committeetype VARCHAR(50),
        status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization) REFERENCES organization(id) ON DELETE CASCADE,
        FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
        FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
        FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(committeememberTable, (err, results) => {
    if (err) {
      console.error("Error creating committee member table: ", err);
    } else {
      console.log("Committee member table created or already exists");
    }
  });

  // Ensure alterCommitteememberTable exists before calling
  if (typeof alterCommitteememberTable === "function") {
    alterCommitteememberTable();
  } else {
    console.warn("alterCommitteememberTable function is not defined.");
  }
};


// Function to get all committee members
const getAllCommitteeMembers = (callback) => {
  const query = `
    SELECT 
        cm.*,
        c.id AS city_id,
        c.name AS city_name,
        d.id AS district_id,
        d.name AS district_name,
        ctr.id AS country_id,
        ctr.name AS country_name,
        org.id AS organization_id,
        org.OrganizationName AS organization_name,
        ua.email,
        ua.password
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
        user_account ua ON cm.user_account_id = ua.id;
  `;

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


// Function to insert a new committee member
const createCommitteeMember = (data, callback) => {
  const {
    CommitteeMemberName,
    email,
    password,
    phoneNumber,
    cnic,
    fullAddress,
    city,
    district,
    country,
    organization,
  } = data;

  const checkEmailQuery = `SELECT * FROM user_account WHERE email = ?`;

  mysqlConnection.query(checkEmailQuery, [email], (err, results) => {
    if (err) return callback(err, null);

    if (results.length > 0) {
      return callback(new Error("Email already exists in user_account"), null);
    }

    const userAccountQuery = `
      INSERT INTO user_account (email, password, accountType) 
      VALUES (?, ?, ?)
    `;

    mysqlConnection.query(userAccountQuery, [email, password, "CommitteeMember"], (err, result) => {
      if (err) return callback(err, null);

      const userAccountId = result.insertId; // Get inserted user ID

      const committeeMemberQuery = `
        INSERT INTO committee_member (user_account_id, CommitteeMemberName, phoneNumber, cnic, fullAddress, city, district, country, organization) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      mysqlConnection.query(
        committeeMemberQuery,
        [userAccountId, CommitteeMemberName, phoneNumber, cnic, fullAddress, city, district, country, organization],
        (err, result) => {
          if (err) return callback(err, null);

          const committeeMemberId = result.insertId; // ✅ Get committee_member ID

          // ✅ Insert into history table with committeemember_id
          const historyQuery = `
            INSERT INTO history (email, password, CommitteeMemberName, phoneNumber, CNIC, fullAddress, city, district, country, nameofOrganization, status, committeemember_id)
            VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          mysqlConnection.query(
            historyQuery,
            [email, password, CommitteeMemberName, phoneNumber, cnic, fullAddress, city, district, country, organization, "added", committeeMemberId],
            (err) => {
              if (err) console.error("Error inserting into history:", err);
              callback(err, result);
            }
          );
        }
      );
    });
  });
};


// Function to update a committee member
const updateCommitteeMember = (id, data, callback) => {
  const {
    CommitteeMemberName,
    email,
    password,
    phoneNumber,
    cnic,
    fullAddress,
    city,
    district,
    country,
    organization,
  } = data;

  const checkEmailQuery = `SELECT * FROM user_account WHERE email = ?`;

  mysqlConnection.query(checkEmailQuery, [email], (err, results) => {
    if (err) return callback(err, null);
    
    if (results.length === 0) {
      return callback(new Error("Email does not exist in user_account"), null);
    }

    // ✅ Fetch previous record from committee_member
    const getPreviousDataQuery = `SELECT * FROM committee_member WHERE id = ?`;

    mysqlConnection.query(getPreviousDataQuery, [id], (err, previousResults) => {
      if (err) return callback(err, null);

      if (previousResults.length === 0) {
        return callback(new Error("Committee member not found"), null);
      }

      const previousData = previousResults[0];

      // ✅ Insert previous data into history table before updating
      const historyQuery = `
        INSERT INTO history (email, password, CommitteeMemberName, phoneNumber, CNIC, fullAddress, city, district, country, nameofOrganization,committeetype,committeemember_id, status)
        VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
      `;

      mysqlConnection.query(
        historyQuery,
        [
          email,
          password,
          previousData.CommitteeMemberName,
          previousData.phoneNumber,
          previousData.cnic,
          previousData.fullAddress,
          previousData.city,
          previousData.district,
          previousData.country,
          previousData.organization,
          previousData.committeetype,
          previousData.id
,          "updated",
        ],
        (err) => {
          if (err) console.error("Error inserting previous record into history:", err);

          // ✅ Update user_account
          const userAccountQuery = `
            UPDATE user_account
            SET password = ?, accountType = ?
            WHERE email = ?
          `;

          mysqlConnection.query(userAccountQuery, [password, "CommitteeMember", email], (err, result) => {
            if (err) return callback(err, null);

            // ✅ Update committee_member
            const committeeMemberQuery = `
              UPDATE committee_member
              SET CommitteeMemberName = ?, phoneNumber = ?, cnic = ?, fullAddress = ?, city = ?, district = ?, country = ?, organization = ?
              WHERE id = ?
            `;

            mysqlConnection.query(
              committeeMemberQuery,
              [CommitteeMemberName, phoneNumber, cnic, fullAddress, city, district, country, organization, id],
              (err, result) => {
                callback(err, result);
              }
            );
          });
        }
      );
    });
  });
};

// Function to update a committee member's status
const updateCommitteeMemberStatus = async (id, status) => {
  try {
    // Get the committee member's email while updating status (run queries in parallel)
    const updateQuery = `UPDATE committee_member SET status = ? WHERE id = ?`;
    const getEmailQuery = `
      SELECT ua.email 
      FROM user_account ua
      JOIN committee_member cm ON cm.user_account_id = ua.id
      WHERE cm.id = ?
    `;

    // Run both queries concurrently
    const [updateResult, emailResults] = await Promise.all([
      new Promise((resolve, reject) => {
        mysqlConnection.query(updateQuery, [status, id], (err, results) => {
          if (err) return reject(err);
          if (results.affectedRows === 0) {
            return reject(new Error("No committee member found with the given ID."));
          }
          resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        mysqlConnection.query(getEmailQuery, [id], (err, results) => {
          if (err) return reject(err);
          if (results.length === 0) return reject(new Error("Committee member email not found."));
          resolve(results[0].email);
        });
      }),
    ]);

    const email = emailResults;

    // Prepare the email content
    let emailText = `Dear Committee Member,\n\nYour account status is currently <b>inactive</b>. 
    Please wait for approval.\n\nBest regards,\nDiscovery Connect`;

    if (status === "active") {
      emailText = `Dear Committee Member,\n\nYour account is now <b>active</b>! 
      You can now log in and access your account.\n\nBest regards,\nDiscovery Connect`;
    }

    // Send email asynchronously (Don't block status update)
    sendEmail(email, "Welcome to Discovery Connect", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((error) => console.error("Error sending email:", error));

    return { message: "Status updated and email sent (async)" };
  } catch (error) {
    console.error("Error updating committee member status:", error);
    throw error;
  }
};


// Function to update a committee member's type
const updateCommitteeMemberType = (id, updateFields, callback) => {
  // ✅ Fetch the previous record from committee_member
  const getPreviousDataQuery = `SELECT * FROM committee_member WHERE id = ?`;

  mysqlConnection.query(getPreviousDataQuery, [id], (err, previousResults) => {
    if (err) return callback(err, null);

    if (previousResults.length === 0) {
      return callback(new Error("Committee member not found"), null);
    }

    const previousData = previousResults[0];

    // ✅ Insert previous record into history table
    const historyQuery = `
      INSERT INTO history (CommitteeMemberName, phoneNumber, CNIC, fullAddress, city, district, country, nameofOrganization, committeetype,committeemember_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

    mysqlConnection.query(
      historyQuery,
      [
        previousData.CommitteeMemberName,
        previousData.phoneNumber,
        previousData.cnic,
        previousData.fullAddress,
        previousData.city,
        previousData.district,
        previousData.country,
        previousData.organization,
        previousData.committeetype,
        previousData.id,
        "updated",
      ],
      (err) => {
        if (err) {
          console.error("Error inserting previous record into history:", err);
          return callback(err, null);
        }

        // ✅ Construct the dynamic query for updating only the provided fields
        const setClause = Object.keys(updateFields)
          .map((key) => `${key} = ?`)
          .join(", ");
        const values = Object.values(updateFields);
        values.push(id); // Add the ID to the query parameters

        const query = `
          UPDATE committee_member
          SET ${setClause}
          WHERE id = ?
        `;

        // ✅ Perform the update
        mysqlConnection.query(query, values, (err, result) => {
          callback(err, result);
        });
      }
    );
  });
};


// Function to delete a committee member
const deleteCommitteeMember = (id, callback) => {
  const query = "DELETE FROM committee_member WHERE id = ?";
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  createCommitteeMemberTable,
  getAllCommitteeMembers,
  createCommitteeMember,
  updateCommitteeMember,
  updateCommitteeMemberStatus,
  updateCommitteeMemberType,
  deleteCommitteeMember,
};