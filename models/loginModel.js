const mysqlConnection = require("../config/db");

// Query to check login credentials in user_account, researcher, collectionsite, organization, and registrationadmin tables
function verifyUserLogin(email, password, callback) {
  const query = `
    SELECT 'researcher' AS accountType, id, email FROM researcher WHERE email = ? AND password = ?
    UNION
    SELECT 'collectionsite' AS accountType, id, email FROM collectionsite WHERE email = ? AND password = ?
    UNION
    SELECT 'organization' AS accountType, id, email FROM organization WHERE email = ? AND password = ?
    UNION
    SELECT 'registrationadmin' AS accountType, id, email FROM user_account WHERE email = ? AND password = ? AND accountType = 'registrationadmin'
  `;

  mysqlConnection.query(query, [email, password, email, password, email, password, email, password], (err, results) => {
    if (err) {
      console.error("Database query error:", err);  // Log the error
      return callback(err, null);  // Pass the error to the callback
    }

    console.log("Query Results:", results);  // Log the results to verify what data is returned
    callback(null, results);  // Pass the results to the callback
  });
}
const getTableCounts = (callback) => {
  console.log("callfunction")
    // Queries to get the record count for each table
    const queries = {
      totalCities: 'SELECT COUNT(*) AS count FROM city',
      totalDistricts: 'SELECT COUNT(*) AS count FROM district',
      totalCountries: 'SELECT COUNT(*) AS count FROM country',
      totalResearchers: 'SELECT COUNT(*) AS count FROM researcher',
      totalOrganizations: 'SELECT COUNT(*) AS count FROM organization',
      totalCommitteeMembers: 'SELECT COUNT(*) AS count FROM committee_member',
      totalCollectionSites: 'SELECT COUNT(*) AS count FROM collectionsite',
      totalOrders: 'SELECT COUNT(*) AS count FROM cart'
    };
  
    let results = {};
  
    // Function to execute queries sequentially
    const executeQuery = (key, query) => {
      return new Promise((resolve, reject) => {
        mysqlConnection.query(query, (err, result) => {
          if (err) {
            console.log(`Error executing query for ${key}:`, err);
            reject(err); // Reject the promise on error
          } else {
            console.log(`${key} result:`, result); // Log the result of the query
            results[key] = result[0].count; // Store the count for each table
            resolve();
          }
        });
        
      });
    };
  
    // Run all queries concurrently
    Promise.all(Object.entries(queries).map(([key, query]) => executeQuery(key, query)))
      .then(() => {
        callback(null, results); // Return the counts when all queries have completed
      })
      .catch((err) => {
        callback(err, null); // If any error occurs, pass the error to the callback
      });
  };

module.exports = {
  verifyUserLogin,
  getTableCounts
};
