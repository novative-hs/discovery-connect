const mysqlConnection = require("../config/db");


function createResearcher(data, callback) {
  console.log("Researcher Model", data)
  const { userID, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo, added_by } = data;
  const query = `
    INSERT INTO researcher (user_account_id,ResearcherName, phoneNumber, nameofOrganization, fullAddress, city,district,country,added_by)
    VALUES (?,?, ?, ?, ?, ?,?,?,?)
  `;

  mysqlConnection.query(query, [userID, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, nameofOrganization], callback);
}

// Function to fetch all researchers
function getAllResearchers(callback) {
  const query = `
    SELECT researcher.id,researcher.added_by, researcher.ResearcherName, researcher.phoneNumber, researcher.fullAddress, researcher.city, researcher.district, researcher.country, researcher.nameofOrganization, researcher.logo, researcher.status,
           user_account.email,
           organization.id AS organization_id, organization.OrganizationName
    FROM researcher
    JOIN user_account ON researcher.user_account_id = user_account.id
    JOIN organization ON researcher.nameofOrganization = organization.id
    ORDER BY researcher.id ASC
  `;
  mysqlConnection.query(query, callback);
}


function getResearchersByOrganization(organizationId, callback) {
  const query = `
    SELECT 
    researcher.*,
    city.id AS city_id,
    city.name AS city_name,
    district.id AS district_id,
    district.name AS district_name,
    country.id AS country_id,
    country.name AS country_name,
    organization.id AS organization_id,
    user_account.email,
    user_account.password,
    organization.OrganizationName AS organization_name,
    user_account.created_at,
    user_account.updated_at
FROM 
    researcher
LEFT JOIN city ON researcher.city = city.id
LEFT JOIN district ON researcher.district = district.id
LEFT JOIN country ON researcher.country = country.id
LEFT JOIN organization ON researcher.nameofOrganization = organization.id
LEFT JOIN user_account ON researcher.user_account_id = user_account.id
WHERE 
    researcher.nameofOrganization = ?;
  `;
  mysqlConnection.query(query, [organizationId], callback);
}

// Function to fetch a single researcher by ID
function getResearcherById(id, callback) {
  const query = `SELECT 
    researcher.*,
    city.id AS cityid,
    city.name AS cityname,
    district.id AS districtid,
    district.name AS districtname,
    country.id AS countryid,
    country.name AS countryname,
    organization.id AS organization_id,
    organization.OrganizationName AS OrganizationName,
    user_account.email AS useraccount_email
FROM 
    researcher
LEFT JOIN city ON researcher.city = city.id
LEFT JOIN district ON researcher.district = district.id
LEFT JOIN country ON researcher.country = country.id
LEFT JOIN organization ON researcher.nameofOrganization = organization.id
LEFT JOIN user_account ON researcher.user_account_id = user_account.id
WHERE 
    researcher.user_account_id = ?;
  `;
  mysqlConnection.query(query, id, callback);
}


// Function to update a researcher's details
function updateResearcher(id, data, callback) {
  const { userID, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo } = data;
  console.log(data)
  const query = `
    UPDATE researcher
    SET ResearcherName = ?, phoneNumber = ?, nameofOrganization = ?, fullAddress = ?,city=?,district=?, country = ?, logo = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo, id], callback);
}


function updateResearcherDetail(id, data, callback) {
  const { userID, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo } = data;




  mysqlConnection.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return callback(err);
    }

    // Update user_account email
    const updateEmailQuery = `
      UPDATE user_account
      SET email = ?
      WHERE id = ?
    `;

    mysqlConnection.query(updateEmailQuery, [useraccount_email, id], (err, result) => {
      if (err) {
        return mysqlConnection.rollback(() => {
          console.error('Error updating email:', err);
          return callback(err);
        });
      }

      // Now update the collectionsite table, passing file path for logo
      const updateCollectionSiteQuery = `
        UPDATE collectionsite
        SET
          CollectionSiteName = ?,
          phoneNumber = ?,
          ntnNumber = ?,
          fullAddress = ?,
          city = ?,
          district = ?,
          country = ?,
          type = ?,
          logo = ?  
        WHERE user_account_id = ?
      `;

      mysqlConnection.query(
        updateCollectionSiteQuery,
        [CollectionSiteName, phoneNumber, ntnNumber, fullAddress, cityid, districtid, countryid, type, file, id],
        (err, result) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              console.error('Error updating collectionsite:', err);
              return callback(err);
            });
          }

          // Commit the transaction if both queries succeed
          mysqlConnection.commit((err) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                console.error('Error committing transaction:', err);
                return callback(err);
              });
            }

            console.log('Both email and collectionsite updated successfully');
            return callback(null, 'Both updates were successful');
          });
        }
      );
    });
  });




}

const deleteResearcher = (id, callback) => {
  const query = 'UPDATE researcher SET status = ? WHERE id = ?';
  mysqlConnection.query(query, ['unapproved', id], (err, result) => {
    callback(err, result);
  });
};

// (Registration Admin) Function to update researcher status
function updateResearcherStatus(id, status, callback) {
  const updateQuery = 'UPDATE researcher SET status = ? WHERE id = ?';

  mysqlConnection.query(updateQuery, [status, id], (err, results) => {
    if (err) return callback(err);

    if (results.affectedRows > 0) {
      const insertHistoryQuery = `
        INSERT INTO RegistrationAdmin_History (resaercher_id, status, updated_at)
        VALUES (?, ?, NOW())
      `;

      mysqlConnection.query(insertHistoryQuery, [id, status], callback);
    } else {
      callback(new Error('No researcher found with the given ID.'));
    }
  });
}



module.exports = {
  createResearcher,
  updateResearcherDetail,
  getResearchersByOrganization,
  getAllResearchers,
  getResearcherById,
  updateResearcher,
  deleteResearcher,
  updateResearcherStatus,
};
