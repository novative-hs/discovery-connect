const mysqlConnection = require("../config/db")
const mysqlPool = require("../config/db")
const { sendEmail } = require("../config/email");

const create_collectionsitestaffTable = () => {
  const create_collectionsitestaffTable = `
    CREATE TABLE IF NOT EXISTS collectionsitestaff (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_account_id INT,
      staffName VARCHAR(100),
      collectionsite_id INT,
      permission VARCHAR(500),
      status ENUM('active', 'inactive') DEFAULT 'inactive',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE,
      FOREIGN KEY (collectionsite_id) REFERENCES collectionsite(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(create_collectionsitestaffTable, (err, results) => {
    if (err) {
      console.error("Error Collection site staff table: ", err);
    } else {
      console.log("Collection site staff table created Successfully");
    }
  });
};

const getAllCollectionsitestaff = (callback) => {
  const query = `
   SELECT 
  collectionsitestaff.*, 
  user_account.id AS user_account_id, 
  user_account.email AS useraccount_email, 
  user_account.password AS useraccount_password,
  collectionsite.CollectionSiteName AS collectionsite_name  -- Get the collectionsite name
FROM collectionsitestaff
JOIN user_account ON collectionsitestaff.user_account_id = user_account.id
JOIN collectionsite ON collectionsitestaff.collectionsite_id = collectionsite.id  
ORDER BY collectionsitestaff.id DESC

  `;

  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
}

const getCollectionSiteStaffDetail=(id,callback)=>{
   const query = `
   SELECT 
  collectionsitestaff.*, 
  user_account.email AS useraccount_email
FROM 
  collectionsitestaff
LEFT JOIN collectionsite 
  ON collectionsitestaff.collectionsite_id = collectionsite.id
LEFT JOIN user_account 
  ON collectionsitestaff.user_account_id = user_account.id
WHERE 
  collectionsitestaff.user_account_id = ?

  `;

  mysqlConnection.query(query, [id], callback);
}

const createCollectionsiteStaff = (req, callback) => {
  const {
    email,
    password,
    staffName,
    collectionsitesid,
    permission,
    status
  } = req.body;

 const VALID_PERMISSIONS = ['add_full', 'add_basic', 'edit', 'dispatch', 'receive', 'all'];

let permissionsString = "";

if (permission === "all") {
  permissionsString = "all";
} else if (Array.isArray(permission)) {
  const filtered = permission.filter((p) => VALID_PERMISSIONS.includes(p));
  permissionsString = filtered.join(",");
}

if (!permissionsString) {
  return callback(new Error("Invalid permissions provided."), null);
}

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
        connection.query(insertUserQuery, [email, password, 'CollectionSitesStaff'], (err, userResults) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const userId = userResults.insertId;

          const insertCSQuery = `
            INSERT INTO collectionsitestaff (
              user_account_id, collectionsite_id, staffName, permission, status
            ) VALUES (?, ?, ?, ?, ?)
          `;

          const csValues = [
            userId,
            collectionsitesid,
            staffName,
            permissionsString,
            status
          ];

          connection.query(insertCSQuery, csValues, (err, csResults) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            const collectionsitestaffId = csResults.insertId;

            const historyQuery = `
              INSERT INTO history (
                email, password, staffName, permission, collectionsite_id, collectionsitestaff_id, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const historyValues = [
              email,
              password,
              staffName || null,
              permissionsString,
              collectionsitesid,
              collectionsitestaffId,
              status
            ];

            connection.query(historyQuery, historyValues, (err, historyResults) => {
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

                // ✅ Send confirmation email
                sendEmail(
                  email,
                  'Welcome to Discovery Connect',
                  `Dear ${staffName},\n\nYour account status is currently pending.\nPlease wait for approval.\n\nRegards,\nDiscovery Connect`
                );

                callback(null, {
                  message: 'Collection site staff registered successfully',
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


const updateCollectonsiteStaffStatus = async (id, status) => {

  const updateQuery = 'UPDATE collectionsitestaff SET status = ? WHERE id = ?';
  const getEmailQuery = `
    SELECT ua.email, cs.staffName
    FROM collectionsitestaff cs
    JOIN user_account ua ON cs.user_account_id = ua.id
    WHERE cs.id = ?
  `;
  try {
    // Update collection site status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No collection site staff found with the given ID.");
    }
    // Fetch email
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);
    if (emailResults.length === 0) {
      throw new Error("collection site staff email not found.");
    }
    const email = emailResults[0].email;
    const name = emailResults[0].staffName;
    // Construct email content based on status
    let emailText = "";
    if (status === "inactive") {
      emailText = `
      Dear ${name},
      
      We hope you're doing well.

      We wanted to inform you that your collection site's staff account on Discovery Connect has been set to <b>inactive</b>. This means you will no longer be able to access the platform or its services until reactivation.

      If you believe this was done in error or you need further assistance, please reach out to our support team.

      Thank you for being a part of Discovery Connect.

      Best regards,  
      The Discovery Connect Team
      `;
    } else if (status === "active") {
      emailText = `
      Dear ${name},

      We are pleased to inform you that your collection site's staff account on Discovery Connect has been <b>approved and activated</b>!

      You can now log in and start exploring all the features and resources our platform offers. We're excited to have you onboard and look forward to your active participation.

      If you have any questions or need help getting started, feel free to contact us.

      Welcome to Discovery Connect!

      Best regards,  
      The Discovery Connect Team
      `;
    }
    // Send email asynchronously
    sendEmail(email, "Account Status Update", emailText)
      
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated and email sent" };
  } catch (error) {
    console.error("Error updating collection site staff status:", error);
    throw error;
  }
}
const updateCollectonsiteStaffDetail = async (id, req) => {
  const {
    email,
    password,
    user_account_id,
    staffName,
    collectionsitesid,
    permission,
    status
  } = req.body;

  return new Promise((resolve, reject) => {
    mysqlPool.getConnection(async (err, connection) => {
      if (err) return reject(err);

      const conn = connection.promise(); // Use promise wrapper

      try {
        await conn.beginTransaction();

        // 1. Update user_account
        const updateUserQuery = `UPDATE user_account SET email = ?, password = ? WHERE id = ?`;
        await conn.query(updateUserQuery, [email, password, user_account_id]);

        // 2. Update collectionsitestaff
        const updateCSQuery = `
          UPDATE collectionsitestaff 
          SET collectionsite_id = ?, staffName = ?, permission = ?, status = ? 
          WHERE user_account_id = ?
        `;
        await conn.query(updateCSQuery, [
          collectionsitesid,
          staffName,
          permission,
          status,
          user_account_id
        ]);

        // 3. Get the updated collectionsitestaff.id using user_account_id
        const getCSIdQuery = `
          SELECT id FROM collectionsitestaff WHERE user_account_id = ?
        `;
        const [csRows] = await conn.query(getCSIdQuery, [user_account_id]);
        const collectionsitestaffId = csRows[0]?.id;

        if (!collectionsitestaffId) {
          throw new Error("collectionsitestaff record not found after update.");
        }

        // 4. Insert into history table
        const insertHistoryQuery = `
          INSERT INTO history (
            email, password, staffName, permission, collectionsite_id, collectionsitestaff_id, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const historyValues = [
          email,
          password,
          staffName || null,
          permission,
          collectionsitesid,
          collectionsitestaffId,
          status
        ];
        await conn.query(insertHistoryQuery, historyValues);

        // 5. Commit the transaction
        await conn.commit();
        connection.release();

        // 6. Send confirmation email
        sendEmail(
          email,
          'Welcome to Discovery Connect',
          `Dear ${staffName},\n\nYour account has been updated.\n\nRegards,\nDiscovery Connect`
        );

        resolve({
          message: 'Collection site staff updated successfully',
          userId: id
        });
      } catch (err) {
        await conn.rollback();
        connection.release();
        reject(err);
      }
    });
  });
};



module.exports = {
  create_collectionsitestaffTable,
  getAllCollectionsitestaff,
  createCollectionsiteStaff,
  updateCollectonsiteStaffStatus,
  updateCollectonsiteStaffDetail,
  getCollectionSiteStaffDetail
}