const mysqlConnection = require("../config/db");

// Function to get all samples with 'In Stock' status
const getBiobankSamples = (id, callback) => {
    // Validate and parse `id`
    const user_account_id = parseInt(id);
    if (isNaN(user_account_id)) {
      console.error("Invalid user_account_id:", id);
      return callback(new Error("Invalid user_account_id"), null);
    }
    const query = `
    SELECT *
    FROM sample
    WHERE status = "In Stock" 
      AND is_deleted = FALSE;
  `;
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

module.exports = {
    getBiobankSamples,
  
};
