const mysqlConnection = require("../config/db");

function createUserAccountTable(callback) {
  const query = `
    CREATE TABLE IF NOT EXISTS user_account (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      confirmPassword VARCHAR(255) NOT NULL,
      accountType ENUM('Researcher', 'Organization', 'CollectionSites') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  mysqlConnection.query(query, callback );
}

// Insert into `user_account` table
function createUserAccount(data, callback) {
  const query = `
    INSERT INTO user_account (email, password, confirmPassword, accountType)
    VALUES (?, ?, ?, ?)
  `;
  const values = [data.email, data.password, data.confirmPassword, data.accountType];
  mysqlConnection.query(query, values, callback);
}

// Insert into `researcher`, `organization`, or `collectionsite` table based on account type
function createAccountDetails(accountType, userAccountId, data, callback) {
  let query, values;

  switch (accountType) {
    case "Researcher":
      query = `
        INSERT INTO researcher (user_account_id, email, password, confirmPassword, accountType, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      values = [
        userAccountId,
        data.email,
        data.password,
        data.confirmPassword,
        accountType,
        data.ResearcherName,
        data.phoneNumber,
        data.fullAddress,
        data.city,
        data.district,
        data.country,
        data.nameofOrganization,
      ];
      break;

    case "Organization":
      query = `
        INSERT INTO organization (user_account_id, email, password, confirmPassword, accountType, OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      values = [
        userAccountId,
        data.email,
        data.password,
        data.confirmPassword,
        accountType,
        data.OrganizationName,
        data.type,
        data.HECPMDCRegistrationNo,
        data.ntnNumber,
        data.phoneNumber,
        data.fullAddress,
        data.city,
        data.district,
        data.country,
      ];
      break;

    case "CollectionSites":
      query = `
        INSERT INTO collectionsite (user_account_id, email, password, confirmPassword, accountType, CollectionSiteName, phoneNumber, ntnNumber, fullAddress, city, district, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      values = [
        userAccountId,
        data.email,
        data.password,
        data.confirmPassword,
        accountType,
        data.CollectionSiteName,
        data.phoneNumber,
        data.ntnNumber,
        data.fullAddress,
        data.city,
        data.district,
        data.country,
      ];
      break;

    default:
      return callback(new Error("Invalid account type"));
  }

  mysqlConnection.query(query, values, callback);
}

module.exports = {
  createUserAccountTable,
  createUserAccount,
  createAccountDetails,
};
