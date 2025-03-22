const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");

const createCartTable = () => {
  const cartTableQuery = `
  CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    sample_id VARCHAR(36),
    price FLOAT,
    quantity INT,
    payment_method VARCHAR(255),
    totalpayment DECIMAL(10, 2),
     payment_status ENUM('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
    order_status ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_account(id),
    FOREIGN KEY (sample_id) REFERENCES sample(id)
  )`;

  mysqlConnection.query(cartTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating cart table:", err);
    } else {
      console.log("Cart table created or already exists.");
    }
  });
};


// cartModel.js
const createCart = (data, callback) => {
  console.log("Incoming request body:", data);

  const { researcher_id, cart_items, payment_method } = data;

  if (!researcher_id || !cart_items || !payment_method) {
    return callback(new Error("Missing required fields"));
  }

  let insertCount = 0;
  let errors = [];

  cart_items.forEach((item) => {
    const insertQuery = `
      INSERT INTO cart (user_id, sample_id, price, quantity, payment_method, totalpayment)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [
      researcher_id,
      item.sample_id || null,
      item.price,
      item.samplequantity,
      payment_method,
      item.total,
    ];

    mysqlConnection.query(insertQuery, insertValues, (err) => {
      if (err) {
        console.error("Error inserting into cart:", err);
        errors.push(err);
      }

      if (errors.length > 0) return callback(errors[0]); // Return first error

      // **Step 2: Update stock only if insert succeeds**
      const updateQuery = `
        UPDATE sample 
        SET quantity = quantity - ? 
        WHERE id = ? AND quantity >= ?
      `;
      const updateValues = [item.samplequantity, item.sample_id, item.samplequantity];

      mysqlConnection.query(updateQuery, updateValues, (err, result) => {
        if (err || result.affectedRows === 0) {
          console.error("Error updating sample quantity or insufficient stock:", err);
          errors.push(err || new Error("Insufficient stock"));
        }

        insertCount++;

        // **Final callback after all insertions & updates**
        if (insertCount === cart_items.length && errors.length === 0) {
          callback(null, { message: "Cart items added successfully and stock updated" });
        } else if (insertCount === cart_items.length) {
          callback(errors[0]); // Return first encountered error
        }
      });
    });
  });
};


const getAllCart = (id, callback, res) => {
  const sqlQuery = `
  SELECT 
      s.id AS sampleid, 
      s.samplename AS samplename,
      s.discount AS discount,
      s. user_account_id AS user_account_id,
      cs.CollectionSiteName,
      c.quantity AS samplequantity, 
      c.*
  FROM cart c
  JOIN sample s ON c.sample_id = s.id
  JOIN collectionsite cs ON c.collectionsite_id = cs.user_account_id
  WHERE c.user_id = ?
`;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      callback(null, results);
    }
    else{
      callback(null, results);
    }
  });
};
const getCartCount = (id, callback, res) => {
  const sqlQuery = `
    
 SELECT 
      count(c.id) as Count
  FROM cart c
  WHERE c.user_id = ?
  `;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      callback(err, results);
    }
    else{
      callback(null, results);
    }
  });
};

const deleteCart = (id, callback, res) => {
  const sqlQuery = `
    DELETE FROM cart 
WHERE user_id = ?;
    `;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error deleting cart:", err);
    } else {
      console.log("Cart deleted successfully", results);
    }
  });
};
const deleteSingleCartItem = (id, callback, res) => {
  const sqlQuery = `
      DELETE FROM cart 
  WHERE sample_id = ?;
      `;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error deleting cart item :", err);
    } else {
      console.log("Cart Item deleted successfully", results);
    }
  });
};
const updateCart = (id,data, callback, res) => {
  const {
    researcher_id,
    user_account_id,
    price,
    samplequantity,
    total,
  } = data;

  const updateQuery = `
    UPDATE cart 
    SET price = ?, quantity = ?, totalpayment = ?
    WHERE user_id = ? AND sample_id = ? AND collectionsite_id = ?
  `;

  const values = [
    price,
    samplequantity,
    total,
    researcher_id,
    id,
    user_account_id,
  ];

  console.log(updateQuery, values);
  mysqlConnection.query(updateQuery, values, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      console.log("Update Result:", result); // Debugging result
      callback(null, result);
    }
  });
};
const getAllOrder = (callback, res) => {
  const sqlQuery = `
 SELECT 
    c.id AS order_id, 
    c.user_id, 
    u.email AS user_email,
    r.ResearcherName AS researcher_name, 
    org.OrganizationName AS organization_name,
    c.sample_id, 
    s.samplename, 
    s.age, s.gender, s.ethnicity, s.samplecondition, s.storagetemp, s.ContainerType, 
    s.CountryofCollection, s.QuantityUnit, s.SampleTypeMatrix, s.SmokingStatus, 
    s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting, s.InfectiousDiseaseResult, 
    s.FreezeThawCycles, s.DateofCollection, s.ConcurrentMedicalConditions, 
    s.ConcurrentMedications, s.DiagnosisTestParameter, s.TestResult, 
    s.TestResultUnit, s.TestMethod, s.TestKitManufacturer, s.TestSystem, 
    s.TestSystemManufacturer, s.SamplePriceCurrency,
    c.price, 
    c.quantity, 
    c.payment_method, 
    c.totalpayment, 
    c.order_status,
    c.created_at,
    IFNULL(ra.registration_admin_status, NULL) AS registration_admin_status,

    -- Ensure proper handling of NULL values in committee status
    CASE 
        WHEN COUNT(ca.committee_status) = 0 THEN NULL  -- No committee records exist
        WHEN SUM(CASE WHEN ca.committee_status = 'rejected' THEN 1 ELSE 0 END) > 0 
            THEN 'rejected'
        WHEN SUM(CASE WHEN ca.committee_status = 'pending' THEN 1 ELSE 0 END) > 0 
            THEN 'pending'
        ELSE 'accepted' 
    END AS final_committee_status,

    GROUP_CONCAT(DISTINCT ca.comments SEPARATOR ', ') AS committee_comments

FROM cart c
JOIN user_account u ON c.user_id = u.id
LEFT JOIN researcher r ON u.id = r.user_account_id 
LEFT JOIN organization org ON r.nameofOrganization = org.id
JOIN sample s ON c.sample_id = s.id
LEFT JOIN registrationadminsampleapproval ra ON c.id = ra.cart_id
LEFT JOIN committeesampleapproval ca ON c.id = ca.cart_id 

GROUP BY c.id, u.email, r.ResearcherName, org.OrganizationName, c.sample_id, s.samplename, 
         s.age, s.gender, s.ethnicity, s.samplecondition, s.storagetemp, s.ContainerType, 
         s.CountryofCollection, s.QuantityUnit, s.SampleTypeMatrix, s.SmokingStatus, 
         s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting, s.InfectiousDiseaseResult, 
         s.FreezeThawCycles, s.DateofCollection, s.ConcurrentMedicalConditions, 
         s.ConcurrentMedications, s.DiagnosisTestParameter, s.TestResult, 
         s.TestResultUnit, s.TestMethod, s.TestKitManufacturer, s.TestSystem, 
         s.TestSystemManufacturer, s.SamplePriceCurrency, c.price, 
         c.quantity, c.payment_method, c.totalpayment, c.order_status, c.created_at, 
         ra.registration_admin_status

ORDER BY c.created_at ASC;

  `;

  mysqlConnection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};
const getAllOrderByCommittee = (committeeMemberId, callback) => {
  console.log(committeeMemberId)
  const sqlQuery = `
    SELECT 
      c.id AS cart_id, 
      c.user_id, 
      u.email AS user_email,
      r.ResearcherName AS researcher_name, 
      org.OrganizationName AS organization_name,
      s.id AS sample_id,
      s.samplename, 
      s.age, s.gender, s.ethnicity, s.samplecondition, s.storagetemp, s.ContainerType, 
      s.CountryofCollection, s.QuantityUnit, s.SampleTypeMatrix, s.SmokingStatus, 
      s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting, s.InfectiousDiseaseResult, 
      s.FreezeThawCycles, s.DateofCollection, s.ConcurrentMedicalConditions, 
      s.ConcurrentMedications, s.DiagnosisTestParameter, s.TestResult, 
      s.TestResultUnit, s.TestMethod, s.TestKitManufacturer, s.TestSystem, 
      s.TestSystemManufacturer, s.SamplePriceCurrency,
      c.price, 
      c.quantity, 
      c.payment_method, 
      c.totalpayment, 
      c.order_status,  
      c.created_at,
      ca.committee_status,  
      ca.comments           
    FROM committeesampleapproval ca
    JOIN cart c ON ca.cart_id = c.id  
    JOIN user_account u ON c.user_id = u.id
    LEFT JOIN researcher r ON u.id = r.user_account_id 
    LEFT JOIN organization org ON r.nameofOrganization = org.id
    JOIN sample s ON c.sample_id = s.id  
    WHERE ca.committee_member_id = ?  
    ORDER BY c.created_at ASC;
  `;

  mysqlConnection.query(sqlQuery, [committeeMemberId], (err, results) => {
    if (err) {
      console.error("Error fetching committee member's orders:", err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


const updateRegistrationAdminStatus = (id, registration_admin_status, callback) => {
  console.log("Received Body", registration_admin_status);

  const sqlQuery = `
    UPDATE registrationadminsampleapproval 
    SET registration_admin_status = ? 
    WHERE cart_id = ?
  `;

  mysqlConnection.query(sqlQuery, [registration_admin_status, id], (err, results) => {
    if (err) {
      console.error("Error updating registration admin status:", err);
      return callback(err, null);
    }

    console.log("Registration Admin Status updated successfully!");

    if (registration_admin_status === "Rejected") {
      // Fetch user email correctly
      const getEmailQuery = `
        SELECT ua.email 
        FROM user_account ua
        JOIN cart c ON ua.id = c.user_id
        JOIN registrationadminsampleapproval sa ON c.id = sa.cart_id
        WHERE sa.cart_id = ?
      `;

      mysqlConnection.query(getEmailQuery, [id], (emailErr, emailResults) => {
        if (emailErr) {
          console.error("Error fetching email:", emailErr);
          return callback(emailErr, null);
        }

        if (emailResults.length > 0) {
          const userEmail = emailResults[0].email;
          const subject = "Sample Request Rejected";
          const text = `Dear User, your sample request for cart ID ${id} has been rejected. Please contact support for details.`;

          sendEmail(userEmail, subject, text)
            .then(() => console.log("Email notification sent."))
            .catch((emailError) => console.error("Failed to send rejection email:", emailError));
        }
      });
    }

    callback(null, { message: "Registration Admin Status updated successfully!" });
  });
};

const updateCartStatus = (id, cartStatus, callback) => {
  console.log("Received Body", cartStatus);

  const sqlQuery = `
    UPDATE cart 
    SET order_status = ? 
    WHERE id = ?
  `;

  mysqlConnection.query(sqlQuery, [cartStatus, id], (err, results) => {
    if (err) {
      console.error("Error updating cart  status:", err);
      return callback(err, null);
    }

    console.log("Cart Status updated successfully!");

   
    callback(null, { message: "Cart Status updated successfully!" });
  });
};

module.exports = {
  createCartTable,
  getAllCart,
  createCart,
  getCartCount,
  deleteCart,
  deleteSingleCartItem,
  updateCart,
  getAllOrder,
  getAllOrderByCommittee,
  updateRegistrationAdminStatus,
  updateCartStatus
};
