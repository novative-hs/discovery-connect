const mysqlConnection = require("../config/db");

const createSampleApprovalTable = () => {
  const sampleapprovalableQuery = `
  CREATE TABLE IF NOT EXISTS sample_approval( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  user_id INT, 
  sample_id VARCHAR(36), 
  sample_studycopy LONGBLOB, 
  reporting_mechanism VARCHAR(250), 
  institutional_board LONGBLOB, 
  NBC LONGBLOB,
  status ENUM('approved', 'pending', 'unapproved') NOT NULL DEFAULT 'pending',
  committee_member_id INT,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE,
  FOREIGN KEY (sample_id) REFERENCES sample(id) ON DELETE CASCADE 
);
`;

  mysqlConnection.query(sampleapprovalableQuery, (err, result) => {
    if (err) {
      console.error("Error creating sample approval table:", err);
    } else {
      console.log("Sample Approval table created or already exists.");
    }
  });
};
module.exports = {
 createSampleApprovalTable
};