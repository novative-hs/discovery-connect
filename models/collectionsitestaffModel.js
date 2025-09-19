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

const getCollectionSiteStaffDetail = (id, callback) => {
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
              'added'
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
                  '🎉 Welcome to Discovery Connect – Your Staff Account Has Been Created',
                  `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2c3e50;">Hello ${staffName},</h2>

    <p>Welcome to <b>Discovery Connect</b>! 🎉</p>
    
    <p>Your staff account for the <b>Collection Site</b> has been successfully created.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px;">
        <strong>Status:</strong> <span style="color: #ff9800;">Pending</span>
      </p>
    </div>

    <p>Our team is reviewing your account. You’ll receive another email once your account has been <b>approved</b> and is ready to use.</p>

    <p style="margin-top: 20px;">If you have any questions, reply to this email and we’ll be happy to help.</p>

    <p style="margin-top: 30px;">Best regards,</p>
    <p><b>The Discovery Connect Team</b></p>
  </div>
  `
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
  const connection = mysqlConnection.promise();

  const updateQuery = 'UPDATE collectionsitestaff SET status = ? WHERE id = ?';
  const getStaffQuery = `
    SELECT ua.email, cs.staffName, cs.collectionsite_id
    FROM collectionsitestaff cs
    JOIN user_account ua ON cs.user_account_id = ua.id
    WHERE cs.id = ?
  `;

  try {
    // Step 1: Update status
    const [updateResult] = await connection.query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No collection site staff found with the given ID.");
    }

    // Step 2: Fetch email, name, collectionsite_id
    const [staffResults] = await connection.query(getStaffQuery, [id]);
    if (staffResults.length === 0) {
      throw new Error("Collection site staff not found.");
    }

    const { email, staffName, collectionsite_id } = staffResults[0];

    // ✅ Step 3: Insert into history table
    const insertHistoryQuery = `
      INSERT INTO history (staffName, email, collectionsite_id, collectionsitestaff_id, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.query(insertHistoryQuery, [staffName, email, collectionsite_id, id, status]);

    // Step 4: Send status email
    let emailText = "";

    if (status === "inactive") {
      emailText = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">
    <h2 style="color:#d9534f; text-align:center;">Account Deactivated</h2>
    <p>Dear <b>${staffName}</b>,</p>
    <p>
      We wanted to inform you that your <b>Collection Site Staff account</b> on 
      <b>Discovery Connect</b> has been <span style="color:#d9534f; font-weight:bold;">deactivated</span>.
    </p>
    <p>
      This means you will no longer be able to log in or access the platform until your account is reactivated.  
      If you believe this was done in error or need assistance, please contact our support team.
    </p>
    <p style="margin-top:20px;">Thank you for being a part of Discovery Connect.</p>
    <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
    <p style="font-size:13px; color:#777; text-align:center;">
      Best regards,<br><b>The Discovery Connect Team</b>
    </p>
  </div>
  `;
    } else if (status === "active") {
      emailText = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">
    <h2 style="color:#28a745; text-align:center;">Welcome Aboard 🎉</h2>
    <p>Dear <b>${staffName}</b>,</p>
    <p>
      Great news! Your <b>Collection Site Staff account</b> on 
      <b>Discovery Connect</b> has been 
      <span style="color:#28a745; font-weight:bold;">approved and activated</span>.
    </p>
    <p>
      You can now log in and start using the platform to manage your collection site and explore its features.  
      We’re excited to have you on board and look forward to your active participation!
    </p>
    <p>If you have any questions or need help, feel free to reach out to our support team.</p>
    <p style="margin-top:20px;">Welcome to <b>Discovery Connect</b>!</p>
    <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
    <p style="font-size:13px; color:#777; text-align:center;">
      Best regards,<br><b>The Discovery Connect Team</b>
    </p>
  </div>
  `;
    }


    // Send email
    sendEmail(email, "Account Status Update", emailText)
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated, history saved, and email sent" };

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

        // ✅ Convert permission to string if it's an array
        const formattedPermission = Array.isArray(permission)
          ? permission.join(',') // e.g., "add_full,edit,dispatch"
          : permission;

        // 2. Update collectionsitestaff
        const updateCSQuery = `
          UPDATE collectionsitestaff 
          SET collectionsite_id = ?, staffName = ?, permission = ?, status = ? 
          WHERE user_account_id = ?
        `;
        await conn.query(updateCSQuery, [
          collectionsitesid,
          staffName,
          formattedPermission,
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
          formattedPermission,
          collectionsitesid,
          collectionsitestaffId,
          'updated'
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