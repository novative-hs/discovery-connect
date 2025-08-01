const mysqlConnection = require("../config/db");
const mysqlPool = require('../config/db');
const { sendEmail } = require("../config/email");

// Function to fetch all CSR
const create_CSRTable = () => {
  const create_CSR = `
  CREATE TABLE IF NOT EXISTS csr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_account_id INT,
    CSRName VARCHAR(100),
    phoneNumber VARCHAR(15),
    fullAddress TEXT,
    city INT,
    district INT,
    country INT,
    collection_id INT,
    permission VARCHAR(15),
    status ENUM('active', 'inactive') DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
    FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
    FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES user_account(id) ON DELETE CASCADE,
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

// Function to create CSR through registration admin dashboard
const createCSR = (data, callback) => {
  const {
    email,
    password,
    accountType,
    CSRName,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    status,
    collectionsitename,
    permission
  } = data;

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err, null);

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err, null);
      }

      const checkEmailQuery = 'SELECT * FROM user_account WHERE email = ?';
      connection.query(checkEmailQuery, [email], (err, results) => {
        if (err) return rollback(err);

        if (results.length > 0) {
          return rollback(new Error("Email already exists"));
        }

        const userAccountQuery = 'INSERT INTO user_account (email, password, accountType) VALUES (?, ?, ?)';
        connection.query(userAccountQuery, [email, password, accountType], (err, accountResult) => {
          if (err) return rollback(err);

          const user_account_id = accountResult.insertId;

          const csrInsertQuery = `
          INSERT INTO csr (user_account_id, collection_id, CSRName, phoneNumber, fullAddress, city, district, country, permission,status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
          `;

          const csrValues = [
            user_account_id,
            collectionsitename,
            CSRName,
            phoneNumber,
            fullAddress,
            city,
            district,
            country,
            permission,
            status,
          ];

          connection.query(csrInsertQuery, csrValues, (err, csrResult) => {
            if (err) return rollback(err);

            const csrId = csrResult.insertId;

            const historyQuery = `
              INSERT INTO history (
                email, password, CSRName, phoneNumber, fullAddress, city,
                district, country, status, csr_id,permission
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
            `;
            const historyValues = [
              email,
              password,
              CSRName,
              phoneNumber,
              fullAddress,
              city,
              district,
              country,
              'added',
              csrId,
              permission
            ];

            connection.query(historyQuery, historyValues, (err) => {
              if (err) return rollback(err);

              connection.commit((err) => {
                if (err) return rollback(err);
                connection.release();
                callback(null, { message: "CSR registered successfully", userId: user_account_id });
              });
            });
          });
        });
      });

      function rollback(error) {
        connection.rollback(() => {
          connection.release();
          callback(error, null);
        });
      }
    });
  });
};

const getAllCSR = (callback) => {
  const query = `
   SELECT 
  c.*, 
  ua.id AS user_account_id, 
  ua.email AS useraccount_email, 
  ua.password AS useraccount_password, 
  ua.accountType,
  
  city.name AS city,
  city.id AS cityid,
  district.name AS district,
  district.id AS districtid,
  country.name AS country,
  country.id AS countryid,

  -- Get collection name from the collectionsite or biobank
  CASE 
    WHEN cs.CollectionSiteName IS NOT NULL THEN cs.CollectionSiteName
    WHEN bb.Name IS NOT NULL THEN bb.Name
    ELSE NULL
  END AS name,

  cs.id AS collectionsiteid,
  bb.id AS biobankid

FROM csr c 
JOIN user_account ua ON c.user_account_id = ua.id
LEFT JOIN city ON c.city = city.id
LEFT JOIN district ON c.district = district.id
LEFT JOIN country ON c.country = country.id

-- Use collection_id to directly join with collectionsite and biobank
LEFT JOIN collectionsite cs ON cs.id = c.collection_id
LEFT JOIN biobank bb ON bb.id = c.collection_id

ORDER BY c.id DESC;
  `;

  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};

const deleteCSR = (id, status, callback) => {
  const query = 'UPDATE csr SET status = ? WHERE id = ?';
  mysqlConnection.query(query, [status, id], (err, result) => {
    callback(err, result);
  });
}

const updateCSRStatus = async (id, status) => {
  const updateQuery = "UPDATE csr SET status = ? WHERE id = ?";
  
  // Updated: insert CSRName into history
  const insertHistoryQuery = `
    INSERT INTO history (csr_id, status, CSRName)
    VALUES (?, ?, ?)
  `;
  
  const getCSRDetailsQuery = `
    SELECT ua.email, c.CSRName
    FROM csr c
    JOIN user_account ua ON c.user_account_id = ua.id
    WHERE c.id = ?
  `;

  const conn = await mysqlConnection.promise().getConnection();

  try {
    await conn.beginTransaction();

    const [updateResult] = await conn.query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No CSR found with the given ID.");
    }

    const [csrResults] = await conn.query(getCSRDetailsQuery, [id]);
    if (csrResults.length === 0) {
      throw new Error("CSR email or name not found.");
    }

    const { email, CSRName } = csrResults[0];

    await conn.query(insertHistoryQuery, [id, status, CSRName]);

    await conn.commit();
    conn.release();

    // Prepare email
    let emailText = `Dear CSR,\n\nYour account status is currently <b>pending</b>. 
        Please wait for approval.\n\nBest regards,\nDiscovery Connect`;

    if (status === "active") {
      emailText = `Dear CSR,\n\nYour account has been <b>activated</b>! 
          You can now log in and access your account.\n\nBest regards,\nDiscovery Connect`;
    }
    if (status === "inactive") {
      emailText = `Dear CSR,\n\nYour account has been <b>deactivated</b>! 
           Please wait for further instructions.\n\nBest regards,\nDiscovery Connect`;
    }

    // Send email
    sendEmail(email, "Welcome to Discovery Connect", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated, history logged, and email sent" };
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error("Error updating CSR status:", error);
    throw error;
  }
};


module.exports = {
  create_CSRTable,
  createCSR,
  getAllCSR,
  deleteCSR,
  updateCSRStatus
}