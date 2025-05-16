const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email");

// Function to fetch all organizations
const create_organizationTable = () => {
  const create_organizationTable = `
    CREATE TABLE IF NOT EXISTS organization (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
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
      FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE
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
    website,
    OrganizationName,
    type,
    HECPMDCRegistrationNo,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    status
  } = req.body;

  const logo = req.files?.logo?.[0]?.buffer || null;

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

      const insertOrgQuery = `
        INSERT INTO organization 
        (OrganizationName, type, HECPMDCRegistrationNo, website, phoneNumber, fullAddress, city, district, country, logo, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const orgValues = [
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
            OrganizationName, HECPMDCRegistrationNo, website, type, phoneNumber,
            fullAddress, city, district, country, logo, organization_id, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const historyValues = [
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

            callback(null, {
              message: "Organization registered successfully",
              organizationId: organizationId
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
      city.name AS city,
      city.id AS cityid,
      district.name AS district,
      district.id AS districtid,
      country.name AS country,
      country.id AS countryid
    FROM organization 
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
  const query = `
    SELECT 
      o.*,  
      c.id AS cityid, c.name AS cityname, 
      cnt.id AS countryid, cnt.name AS countryname, 
      d.id AS districtid, d.name AS districtname
    FROM organization o 
    JOIN city c ON o.city = c.id 
    JOIN country cnt ON o.country = cnt.id 
    JOIN district d ON o.district = d.id 
    WHERE o.id = ?;
  `;

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

  try {
    // Update organization status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No organization found with the given ID.");
    }

    // Insert into history
    await mysqlConnection.promise().query(insertHistoryQuery, [id, status]);

    return { message: "Status updated successfully" };
  } catch (error) {
    console.error("Error updating organization status:", error);
    throw error;
  }
};

const updateOrganization = (data, organizationId, callback) => {
  const {
    OrganizationName,
    type,
    HECPMDCRegistrationNo,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    website
  } = data;

  const query = `
    UPDATE organization
    SET 
      OrganizationName = ?, 
      type = ?, 
      HECPMDCRegistrationNo = ?, 
      phoneNumber = ?, 
      fullAddress = ?, 
      city = ?, 
      district = ?, 
      country = ?, 
      website = ?
    WHERE id = ?;
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
    organizationId
  ];

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
  });
};

// Function to delete a collection site
// const deleteOrganization = async (id, status) => {
//   const insertHistoryQuery = `
//   INSERT INTO registrationadmin_history (organization_id, status)
//   VALUES (?, ?)
// `;
//   const updateQuery = 'UPDATE organization SET status = ? WHERE id = ?';
//   const getEmailQuery = `
//     SELECT ua.email, o.OrganizationName
//     FROM organization o
//     JOIN user_account ua ON o.user_account_id = ua.id
//     WHERE o.id = ?
//   `;
//   try {
//     // Update organization status
//     const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
//     if (updateResult.affectedRows === 0) {
//       throw new Error("No organization found with the given ID.");
//     }
//     // Fetch email
//     const [insertResult] = await mysqlConnection.promise().query(insertHistoryQuery, [id, status]);
//     const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);
//     if (emailResults.length === 0) {
//       throw new Error("Organization email not found.");
//     }
//     const email = emailResults[0].email;
//     const name = emailResults[0].OrganizationName;

//     // Construct email content based on status
//     let emailText = "";
//     if (status === "inactive") {
//       emailText = `
//       Dear ${name},

//       We hope you're doing well.

//       We wanted to inform you that your organization's account on Discovery Connect has been set to <b>inactive</b>. This means you will no longer be able to access the platform or its services until reactivation.

//       If you believe this was done in error or you need further assistance, please reach out to our support team.

//       Thank you for being a part of Discovery Connect.

//       Best regards,  
//       The Discovery Connect Team
//       `;
//     }

//     // Send email asynchronously
//     sendEmail(email, "Account Status Update", emailText)
//       .then(() => console.log("Email sent successfully"))
//       .catch((emailErr) => console.error("Error sending email:", emailErr));

//     return { message: "Status updated and email sent" };
//   } catch (error) {
//     console.error("Error updating organization status:", error);
//     throw error;
//   }
// };

module.exports = {
  create_organizationTable,
  createOrganization,
  getCurrentOrganizationById,
  getOrganizationById,
  getAllOrganizations,
  updateOrganizationStatus,
  updateOrganization
};
