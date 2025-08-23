const mysqlConnection = require("../config/db");

const createSampleApprovalTable = () => {
  const sampleapprovalableQuery = `
 CREATE TABLE IF NOT EXISTS technicaladminsampleapproval( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  cart_id INT NOT NULL, 
  technical_admin_id INT NOT NULL,
  Comments VARCHAR(500), 
  technical_admin_status ENUM('Pending', 'Accepted', 'Rejected') NOT NULL DEFAULT 'Pending',
    Approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES cart(id),
  FOREIGN KEY (technical_admin_id) REFERENCES user_account(id)
);

`;

  mysqlConnection.query(sampleapprovalableQuery, (err, result) => {
    if (err) {
      console.error("Error creating Technical admin sample approval table:", err);
    } else {
      console.log("Sample Approval table created or already exists.");
    }
  });
};

const createSampleDocumentTable = () => {
  const sampledocumentQuery = `
CREATE TABLE IF NOT EXISTS sampledocuments( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  cart_id INT, 
  study_copy LONGBLOB,  
  reporting_mechanism TEXT,  
  irb_file LONGBLOB,  
  nbc_file LONGBLOB NULL, 
  role VARCHAR(50),
  added_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
);
`;

  mysqlConnection.query(sampledocumentQuery, (err, result) => {
    if (err) {
      console.error("Error creating sample document table:", err);
    } else {
      console.log("Sample document  table created or already exists.");
    }
  });
};
module.exports = {
 createSampleApprovalTable,
 createSampleDocumentTable
};