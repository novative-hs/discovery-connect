const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email");

// Function to fetch all organizations
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
      website VARCHAR(250),
      fullAddress TEXT,
      logo LONGBLOB,
      status ENUM('active', 'inactive') DEFAULT 'inactive',
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

// Function to create organizations
const createOrganization = (req, callback) => {
  const {
    email,
    website,
    OrganizationName,
    type,
    HECPMDCRegistrationNo,
    ntnNumber,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    status
  } = req.body;

  const logo = req.files?.logo?.[0]?.buffer || null;

  // Convert city, district, country to integers (if they should be numbers)
  const cityInt = parseInt(city);
  const districtInt = parseInt(district);
  const countryInt = parseInt(country);

  console.log("Received data:", req.body);
  console.log("Logo buffer length:", logo ? logo.length : "No logo");

  mysqlPool.getConnection((err, connection) => {
    if (err) {
      console.error("Connection error:", err);
      return callback(err, null);
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Transaction start error:", err);
        connection.release();
        return callback(err, null);
      }

      const checkEmailQuery = 'SELECT * FROM user_account WHERE email = ?';
      connection.query(checkEmailQuery, [email], (err, results) => {
        if (err || results.length > 0) {
          console.error("Email check error:", err || "Email already exists.");
          connection.rollback(() => connection.release());
          return callback(new Error("Email already exists"), null);
        }

        const insertUserQuery = `INSERT INTO user_account (email, accountType) VALUES (?, ?)`;
        connection.query(insertUserQuery, [email, 'Organization'], (err, userResult) => {
          if (err) {
            console.error("Insert user error:", err);
            return connection.rollback(() => connection.release());
          }

          const userAccountId = userResult.insertId;
          console.log("User inserted with ID:", userAccountId);

          const insertOrgQuery = `INSERT INTO organization 
            (user_account_id, OrganizationName, type, HECPMDCRegistrationNo, website, phoneNumber, fullAddress, city, district, country, logo, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const orgValues = [
            userAccountId,
            OrganizationName,
            type,
            HECPMDCRegistrationNo,
            website,
            phoneNumber,
            fullAddress,
            cityInt,
            districtInt,
            countryInt,
            logo,
            status
          ];

          connection.query(insertOrgQuery, orgValues, (err, orgResult) => {
            if (err) {
              console.error("Insert organization error:", err);
              return connection.rollback(() => connection.release());
            }

            const organizationId = orgResult.insertId;
            console.log("Organization inserted with ID:", organizationId);

            const insertHistory = `
              INSERT INTO history (
                email, OrganizationName, HECPMDCRegistrationNo, website, type, phoneNumber,
                fullAddress, city, district, country, logo, organization_id, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const historyValues = [
              email,
              OrganizationName,
              HECPMDCRegistrationNo,
              website,
              type,
              phoneNumber,
              fullAddress,
              cityInt,
              districtInt,
              countryInt,
              logo,
              organizationId,
              'added'
            ];

            connection.query(insertHistory, historyValues, (err) => {
              if (err) {
                console.error("Insert history error:", err);
                return connection.rollback(() => connection.release());
              }

              connection.commit((err) => {
                if (err) {
                  console.error("Transaction commit error:", err);
                  return connection.rollback(() => connection.release());
                }

                connection.release();
                console.log("Transaction committed successfully.");

                // Send confirmation email
                sendEmail(email, "Welcome to Discovery Connect", `
                  Dear ${OrganizationName},\n\nYour account is pending approval.\n\nRegards,\nLabHazir
                `);

                callback(null, {
                  message: "Organization registered successfully",
                  userId: userAccountId
                });
              });
            });
          });
        });
      });
    });
  });
};


const getAllOrganizations = (callback) => {
  const query = `
    SELECT 
      organization.*, 
      user_account.id AS user_account_id, 
      user_account.email AS useraccount_email, 
      city.name AS city,
      city.id AS cityid,
      district.name AS district,
      district.id AS districtid,
      country.name AS country,
      country.id AS countryid
    FROM organization 
    JOIN user_account ON organization.user_account_id = user_account.id
    LEFT JOIN city ON organization.city = city.id
    LEFT JOIN district ON organization.district = district.id
    LEFT JOIN country ON organization.country = country.id
    ORDER BY organization.id DESC
  `;

  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};

function getCurrentOrganizationById(id, callback) {
  const query = 'SELECT o.*,  c.id AS cityid, c.name AS cityname, cnt.id AS countryid, cnt.name AS countryname, d.id AS districtid, d.name AS districtname, ua.email AS useraccount_email FROM organization o JOIN city c ON o.city = c.id JOIN country cnt ON o.country = cnt.id JOIN district d ON o.district = d.id JOIN user_account ua ON o.user_account_id = ua.id WHERE o.user_account_id = ?';
  mysqlConnection.query(query, [id], callback);
}

function getOrganizationById(id, callback) {
  const query = 'SELECT * FROM organization WHERE id = ?';
  mysqlConnection.query(query, [id], callback);
}

// Function to update organization status
const updateOrganizationStatus = async (id, status) => {
  const insertHistoryQuery = `
  INSERT INTO registrationadmin_history (organization_id, status)
  VALUES (?, ?)
`;
  const updateQuery = "UPDATE organization SET status = ? WHERE id = ?";
  const getEmailQuery = `
    SELECT ua.email ,o.OrganizationName
    FROM organization o
    JOIN user_account ua ON o.user_account_id = ua.id
    WHERE o.id = ?
  `;

  try {
    // Update organization status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No organization found with the given ID.");
    }
    const [insertResult] = await mysqlConnection.promise().query(insertHistoryQuery, [id, status]);
    // Fetch email in parallel
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);

    // Check if email exists
    if (emailResults.length === 0) {
      throw new Error("Organization email not found.");
    }

    const email = emailResults[0].email;
    const name = emailResults[0].OrganizationName;
    let emailText = `
  Dear ${name},

  We hope this message finds you well! 

  We would like to update you about the status of your organization’s account. 

  - **Status:** InActive

  Your account is currently <b>inactive</b>. Rest assured, we are reviewing your details, and you will be notified once your account has been approved. In the meantime, please feel free to reach out to us if you have any questions or require further assistance.

  Thank you for your patience and cooperation.

  Best regards,
  The Discovery Connect Team
`;

    if (status === "active") {
      emailText = `
  Dear ${name},

  Congratulations! 🎉

  We are thrilled to inform you that your organization’s account has been successfully <b>approved</b>! You can now log in and access your account to manage your information and interact with the Discovery Connect platform.

  Here are a few next steps:
  - Log in to your account and explore all the features: [Log in to Discovery Connect](http://discovery-connect.com/login).
  - Get in touch with our support team if you have any questions or need assistance.

  We are excited to have you on board and look forward to seeing how you’ll benefit from our platform!

  Best regards,
  The Discovery Connect Team
`;

    }


    // Send email asynchronously (does not block response)
    sendEmail(email, "Welcome to Discovery Connect", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated and email sent" };
  } catch (error) {
    console.error("Error updating organization status:", error);
    throw error;
  }
};

const updateOrganization = (data, user_account_id, callback) => {
  const {
    OrganizationName,
    type,
    HECPMDCRegistrationNo,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    website,
    useraccount_email,
  } = data;

  const query = `
    UPDATE organization AS org
    JOIN user_account AS ua ON ua.id = org.user_account_id
    SET 
      org.OrganizationName = ?, 
      org.type = ?, 
      org.HECPMDCRegistrationNo = ?, 
      org.phoneNumber = ?, 
      org.fullAddress = ?, 
      org.city = ?, 
      org.district = ?, 
      org.country = ?, 
      org.website = ?, 
      ua.email = ?
    WHERE org.user_account_id= ?;
  `;

  const values = [
    OrganizationName,
    type,
    HECPMDCRegistrationNo,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    website,
    useraccount_email,
    user_account_id,
  ];

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
  });

};

// Function to delete a collection site
const deleteOrganization = async (id, status) => {
  const insertHistoryQuery = `
  INSERT INTO registrationadmin_history (organization_id, status)
  VALUES (?, ?)
`;
  const updateQuery = 'UPDATE organization SET status = ? WHERE id = ?';
  const getEmailQuery = `
    SELECT ua.email, o.OrganizationName
    FROM organization o
    JOIN user_account ua ON o.user_account_id = ua.id
    WHERE o.id = ?
  `;
  try {
    // Update organization status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No organization found with the given ID.");
    }
    // Fetch email
    const [insertResult] = await mysqlConnection.promise().query(insertHistoryQuery, [id, status]);
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);
    if (emailResults.length === 0) {
      throw new Error("Organization email not found.");
    }
    const email = emailResults[0].email;
    const name = emailResults[0].OrganizationName;

    // Construct email content based on status
    let emailText = "";
    if (status === "inactive") {
      emailText = `
      Dear ${name},
      
      We hope you're doing well.

      We wanted to inform you that your organization's account on Discovery Connect has been set to <b>inactive</b>. This means you will no longer be able to access the platform or its services until reactivation.

      If you believe this was done in error or you need further assistance, please reach out to our support team.

      Thank you for being a part of Discovery Connect.

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
    console.error("Error updating organization status:", error);
    throw error;
  }
};

module.exports = {
  create_organizationTable,
  createOrganization,
  getCurrentOrganizationById,
  getOrganizationById,
  getAllOrganizations,
  updateOrganizationStatus,
  updateOrganization
};
