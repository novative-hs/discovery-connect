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
    INSERT INTO history (organization_id, status)
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
    website,

  } = data;

  // Step 1: Get the existing record
  const selectQuery = `SELECT * FROM organization WHERE id = ?`;

  mysqlConnection.query(selectQuery, [organizationId], (selectErr, results) => {
    if (selectErr) return callback(selectErr);

    const existing = results[0];

    // Step 2: Insert existing data into history table
    const insertHistoryQuery = `
      INSERT INTO history 
      (organization_id, OrganizationName, type, HECPMDCRegistrationNo, phoneNumber, fullAddress, city, district, country, website, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  NOW())
    `;

    const historyValues = [
      organizationId,
      existing.OrganizationName,
      existing.type,
      existing.HECPMDCRegistrationNo,
      existing.phoneNumber,
      existing.fullAddress,
      existing.city,
      existing.district,
      existing.country,
      existing.website,
      'updated', // or 'previous' depending on your status tracking
    ];

    mysqlConnection.query(insertHistoryQuery, historyValues, (historyErr) => {
      if (historyErr) return callback(historyErr);

      // Step 3: Now update the main record
      const updateQuery = `
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

      const updateValues = [
        OrganizationName,
        type,
        HECPMDCRegistrationNo,
        phoneNumber,
        fullAddress,
        city,
        district,
        country,
        website,
        organizationId,
      ];

      mysqlConnection.query(updateQuery, updateValues, (updateErr, result) => {
        callback(updateErr, result);
      });
    });
  });
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
