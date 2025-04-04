const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");

const notifyResearcher = (cartIds, message, subject, callback) => {
  // Ensure cartIds is an array
  const ids = Array.isArray(cartIds) ? cartIds : [cartIds];

  // Fetch all cart IDs and their corresponding created_at timestamps
  const cartDetailsPromises = ids.map((cart_id) => {
    return new Promise((resolve, reject) => {
      const getResearcherEmailQuery = `
        SELECT ua.email, c.created_at
        FROM user_account ua
        JOIN cart c ON ua.id = c.user_id
        WHERE c.id = ?
      `;

      mysqlConnection.query(getResearcherEmailQuery, [cart_id], (emailErr, emailResults) => {
        if (emailErr) {
          return reject(emailErr);
        }

        if (emailResults.length > 0) {
          resolve({
            email: emailResults[0].email,
            createdAt: emailResults[0].created_at,
            cartId: cart_id,
          });
        } else {
          reject(new Error(`No email found for cart ID: ${cart_id}`));
        }
      });
    });
  });

  // Wait for all cart details to be fetched
  Promise.all(cartDetailsPromises)
    .then((cartDetails) => {
      const researcherEmail = cartDetails[0].email; // Assuming all cart items are for the same researcher
      const cartIdsList = cartDetails.map((detail) => `Cart ID: ${detail.cartId} (Created At: ${detail.createdAt})`).join("\n");

      // Build the message
      const emailMessage = `Dear Researcher,\n\n${message}\n\nDetails for the following carts:\n\n${cartIdsList}\n\nBest regards,\nYour Team`;

      // Send email with dynamic message
      sendEmail(researcherEmail, subject, emailMessage)
        .then(() => {
          console.log("Email notification sent to researcher for all cart IDs.");
          callback(null);
        })
        .catch((emailError) => {
          console.error("Failed to send researcher email:", emailError);
          callback(emailError);
        });
    })
    .catch((err) => {
      console.error("Error fetching cart details:", err);
      callback(err);
    });
};

const updateCartStatusToShipping = (cartId, callback) => {
  // SQL query to check if all committee statuses (Ethical & Scientific) are "Approved"
  const committeeStatusQuery = `
    SELECT 
      (SELECT COUNT(*) 
       FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND cm.committeetype = 'Ethical' AND ca.committee_status = 'Approved') AS ethical_approved,
    
      (SELECT COUNT(*) 
       FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND cm.committeetype = 'Scientific' AND ca.committee_status = 'Approved') AS scientific_approved,
    
      (SELECT COUNT(*) 
       FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND cm.committeetype = 'Ethical') AS ethical_total,
    
      (SELECT COUNT(*) 
       FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND cm.committeetype = 'Scientific') AS scientific_total,
    
      c.order_status AS current_order_status
    FROM cart c
    WHERE c.id = ?`;

  // Run the query to check the statuses and current order status
  mysqlConnection.query(committeeStatusQuery, [cartId, cartId, cartId, cartId, cartId], (err, results) => {
    if (err) {
      console.error("Error checking committee approval status:", err);
      return callback(err, null);
    }

    const ethicalApproved = results[0].ethical_approved;
    const scientificApproved = results[0].scientific_approved;
    const ethicalTotal = results[0].ethical_total;
    const scientificTotal = results[0].scientific_total;
    const currentOrderStatus = results[0].current_order_status;

    // Ensure that there is data for either ethical or scientific committee before proceeding
    if (ethicalTotal === 0 && scientificTotal === 0) {
      
      return callback(null, null); // No committees, no update to shipping
    }

    // Check if all required approvals are completed
    const ethicalApprovedComplete = (ethicalTotal === 0 || ethicalApproved === ethicalTotal); // if no ethical members, treat as complete
    const scientificApprovedComplete = (scientificTotal === 0 || scientificApproved === scientificTotal); // if no scientific members, treat as complete

    // If both committees' approvals are complete, or if the cart doesn't have one of the committees, we can proceed
    if (ethicalApprovedComplete && scientificApprovedComplete) {
      // Only proceed if the status is not already 'Shipping'
      if (currentOrderStatus !== 'Shipping') {
        // All committee members approved, so update the cart status to "Shipping"
        const updateStatusQuery = `
          UPDATE cart 
          SET order_status = 'Shipping' 
          WHERE id = ?`;

        mysqlConnection.query(updateStatusQuery, [cartId], (updateErr, updateResults) => {
          if (updateErr) {
            console.error("Error updating cart status to 'Shipping':", updateErr);
            return callback(updateErr, null);
          }

          // Send email to researcher only if status is changed to 'Shipping'
          notifyResearcher(cartId, "Your sample request is now being processed for shipping.", "Sample Request Status Update", (notifyErr) => {
            if (notifyErr) {
              return callback(notifyErr, null);
            }
            
          });
          
          return callback(null, updateResults);
        });
      }
    } else {
      
      return callback(null, null); // No update performed
    }
  });
};


const createCartTable = () => {
  const cartTableQuery = `
  CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    sample_id VARCHAR(36),
    price FLOAT,
    quantity INT,
    totalpayment DECIMAL(10, 2),
    payment_id INT,
    order_status ENUM('Pending', 'Accepted','UnderReview','Rejected','Shipping', 'Dispatched', 'Completed') DEFAULT 'Pending',  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_account(id),
    FOREIGN KEY (sample_id) REFERENCES sample(id),
    FOREIGN KEY (payment_id) REFERENCES payment(id) 
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
  const {
    researcher_id,
    cart_items,
    payment_id,
    study_copy,
    reporting_mechanism,
    irb_file,
    nbc_file,
  } = data;

  if (
    !researcher_id ||
    !cart_items ||
    !payment_id ||
    !study_copy ||
    !reporting_mechanism ||
    !irb_file
  ) {
    return callback(
      new Error(
        "Missing required fields (Payment ID, Study Copy, Reporting Mechanism, and IRB File are required)"
      )
    );
  }

  // Query to get Registration Admin ID
  const getAdminIdQuery = `SELECT id FROM user_account WHERE accountType = 'RegistrationAdmin' LIMIT 1`;

  mysqlConnection.query(getAdminIdQuery, (err, adminResults) => {
    if (err) {
      console.error("Error fetching Registration Admin ID:", err);
      return callback(err);
    }

    if (adminResults.length === 0) {
      return callback(new Error("No Registration Admin found"));
    }

    const registrationAdminId = adminResults[0].id; // Get the admin ID

    let insertPromises = cart_items.map((item, index) => {
      return new Promise((resolve, reject) => {
        const insertCartQuery = `
          INSERT INTO cart (user_id, sample_id, price, quantity, payment_id, totalpayment)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        const cartValues = [
          researcher_id,
          item.sample_id || null,
          item.price,
          item.samplequantity,
          payment_id,
          item.total,
        ];

        mysqlConnection.query(insertCartQuery, cartValues, (err, cartResult) => {
          if (err) {
            console.error("Error inserting into cart:", err);
            return reject(err);
          }

          const cartId = cartResult.insertId; // Get cart ID

          // Fetch `created_at` inside this promise
          const getCreatedAtQuery = `SELECT created_at FROM cart WHERE id = ?`;
          mysqlConnection.query(getCreatedAtQuery, [cartId], (err, createdAtResult) => {
            if (err) {
              console.error("Error fetching created_at timestamp:", err);
              return reject(err);
            }

            const created_at = createdAtResult?.[0]?.created_at; // Extract created_at properly

            // Continue after fetching `created_at`
            const insertApprovalQuery = `
              INSERT INTO registrationadminsampleapproval (cart_id, registration_admin_id, registration_admin_status)
              VALUES (?, ?, 'pending')
            `;

            mysqlConnection.query(insertApprovalQuery, [cartId, registrationAdminId], (err) => {
              if (err) {
                console.error("Error inserting into registration approval:", err);
                return reject(err);
              }

              const insertDocumentsQuery = `
                INSERT INTO sampledocuments (cart_id, study_copy, reporting_mechanism, irb_file, nbc_file)
                VALUES (?, ?, ?, ?, ?)
              `;
              const documentValues = [cartId, study_copy, reporting_mechanism, irb_file, nbc_file || null];

              mysqlConnection.query(insertDocumentsQuery, documentValues, (err) => {
                if (err) {
                  console.error("Error inserting into sampledocuments:", err);
                  return reject(err);
                }

                const updateQuery = `
                  UPDATE sample 
                  SET quantity = quantity - ? 
                  WHERE id = ? AND quantity >= ?
                `;
                const updateValues = [item.samplequantity, item.sample_id, item.samplequantity];

                mysqlConnection.query(updateQuery, updateValues, (err, result) => {
                  if (err || result.affectedRows === 0) {
                    console.error("Error updating sample quantity or insufficient stock:", err);
                    return reject(err || new Error("Insufficient stock"));
                  }

                  resolve({
                    created_at, // Now properly assigned
                    cartId,
                    message: "Cart added, stock updated, and documents saved",
                  });
                });
              });
            });
          });
        });
      });
    });

    // Wait for all insert operations to complete
    Promise.all(insertPromises)
      .then((results) => {
        // Use the first cartId from the results
        const firstResult = results[0]; // Only use the first result
        const cartId = firstResult.cartId; // Store the single cartId value
        const created_at = firstResult.created_at;
const message='Your sample request has been successfully created. Please check your dashboard for more details.'

        // Now we can notify researcher for the single cartId
        notifyResearcher(cartId,message,"Sample Request Status Update", (emailErr) => {
          if (emailErr) {
            return callback(emailErr);
          }
          callback(null, { message: "Cart created successfully for the item.", results: [firstResult] });
        });
      })
      .catch((error) => callback(error));
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
    } else {
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
    } else {
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
const updateCart = (id, data, callback, res) => {
  const { researcher_id, user_account_id, price, samplequantity, total } = data;

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
    c.totalpayment, 
    c.order_status,
    c.created_at,
    IFNULL(ra.registration_admin_status, NULL) AS registration_admin_status,

    -- ✅ Ethical Committee Status (with "Not Sent" condition)
    (SELECT 
        CASE 
            WHEN NOT EXISTS (
                SELECT 1 FROM committeesampleapproval ca
                JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
                WHERE ca.cart_id = c.id AND cm.committeetype = 'Ethical'
            ) AND EXISTS (
                SELECT 1 FROM committeesampleapproval ca
                JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
                WHERE ca.cart_id = c.id AND cm.committeetype = 'Scientific'
            ) THEN 'Not Sent'
            WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Refused') > 0 THEN 'Refused'
            WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Review') > 0 THEN 'Review'
            WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Approved') = COUNT(*) THEN 'Approved'
            ELSE NULL
        END
     FROM committeesampleapproval ca 
     JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
     WHERE ca.cart_id = c.id AND cm.committeetype = 'Ethical'
    ) AS ethical_committee_status,

    -- ✅ Scientific Committee Status
    (SELECT 
        CASE 
            WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Refused') > 0 THEN 'Refused'
            WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Review') > 0 THEN 'Review'
            WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Approved') = COUNT(*) THEN 'Approved'
            ELSE NULL
        END
     FROM committeesampleapproval ca 
     JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
     WHERE ca.cart_id = c.id AND cm.committeetype = 'Scientific'
    ) AS scientific_committee_status,

    -- ✅ Collect all comments from committee members (Both Ethical & Scientific)
    (SELECT GROUP_CONCAT(
          DISTINCT CONCAT(cm.CommitteeMemberName, ' (', cm.committeetype, ') : ', ca.comments) 
          SEPARATOR ' | ')
     FROM committeesampleapproval ca
     JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
     WHERE ca.cart_id = c.id
    ) AS committee_comments

FROM cart c
JOIN user_account u ON c.user_id = u.id
LEFT JOIN researcher r ON u.id = r.user_account_id 
LEFT JOIN organization org ON r.nameofOrganization = org.id
JOIN sample s ON c.sample_id = s.id
LEFT JOIN registrationadminsampleapproval ra ON c.id = ra.cart_id

ORDER BY c.created_at ASC;


  `;

  mysqlConnection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      callback(err, null);
    } else {
      // Iterate over the fetched results and check if cart can be updated to "Shipping"
      results.forEach(cart => {
        updateCartStatusToShipping(cart.order_id, (updateErr, updateResults) => {
          if (updateErr) {
            console.error("Error updating cart status:", updateErr);
          } else if (updateResults) {
            console.log(`Cart ${cart.order_id} status updated to 'Shipping'.`);
          }
        });
      });
      callback(null, results);
    }
  });
};
const getAllOrderByCommittee = (committeeMemberId, callback) => {
  const sqlQuery = `
    SELECT 
      c.id AS cart_id, 
      c.user_id, 
      u.email AS user_email,
      r.ResearcherName AS researcher_name, 
      org.OrganizationName AS organization_name,
      s.id AS sample_id,
      s.samplename, 
      s.age, s.gender, s.ethnicity, s.samplecondition, 
      s.storagetemp, s.ContainerType, s.CountryofCollection, 
      s.QuantityUnit, s.SampleTypeMatrix, s.SmokingStatus, 
      s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting, 
      s.InfectiousDiseaseResult, s.FreezeThawCycles, 
      s.DateofCollection, s.ConcurrentMedicalConditions, 
      s.ConcurrentMedications, s.DiagnosisTestParameter, 
      s.TestResult, s.TestResultUnit, s.TestMethod, 
      s.TestKitManufacturer, s.TestSystem, 
      s.TestSystemManufacturer, s.SamplePriceCurrency,
      c.price, 
      c.quantity, 
      c.totalpayment, 
      c.order_status,  
      c.created_at,
      ca.committee_status,  
      ca.comments,
      -- Sample Documents
      sd.study_copy,
      sd.reporting_mechanism,
      sd.irb_file,
      sd.nbc_file
    FROM committeesampleapproval ca
    JOIN cart c ON ca.cart_id = c.id  
    JOIN user_account u ON c.user_id = u.id
    LEFT JOIN researcher r ON u.id = r.user_account_id 
    LEFT JOIN organization org ON r.nameofOrganization = org.id
    JOIN sample s ON c.sample_id = s.id  
    LEFT JOIN sampledocuments sd ON c.id = sd.cart_id 
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

    // Determine new cart status based on registration admin status
    const newCartStatus = registration_admin_status === 'Accepted' ? 'Accepted' :
                          registration_admin_status === 'Rejected' ? 'Rejected' : null;

    // If the status requires updating the cart
    if (newCartStatus) {
      updateCartStatus(id, newCartStatus, (cartErr) => {
        if (cartErr) {
          return callback(cartErr, null);
        }

        // After cart update, notify the researcher
        const message = registration_admin_status === 'Accepted' 
  ? "Your sample request has been approved by the Registration Admin." 
  : registration_admin_status === 'Rejected'
  ? "Your sample request has been rejected by the Registration Admin." 
  : "Your sample request is still pending approval by the Registration Admin.";

notifyResearcher(id, message,"Sample Request Status Update", (notifyErr) => {
  if (notifyErr) {
    return callback(notifyErr, null);
  }
  return callback(null, { message: "Registration Admin and Cart status updated. Researcher notified." });
});

      });
    } else {
      // If no cart update needed, just notify the researcher
      notifyResearcher(id, (notifyErr) => {
        if (notifyErr) {
          return callback(notifyErr, null);
        }
        return callback(null, { message: "Registration Admin status updated. Researcher notified." });
      });
    }
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
      console.error("Error updating cart status:", err);
      return callback(err, null);
    }

    console.log("Cart Status updated successfully!");

    const message = cartStatus === 'Accepted' 
  ? "Your sample request has been accepted and is now processing." 
  : cartStatus === 'Rejected' 
  ? "Your sample request has been rejected." 
  : cartStatus === 'UnderReview' 
  ? "Your sample documents has been review by committee member." 
  : "Your sample request status has been updated.";

notifyResearcher(id, message,"Sample Request Status Update", (notifyErr) => {
  if (notifyErr) {
    return callback(notifyErr, null);
  }
  return callback(null, "Cart status updated and researcher notified.");
});

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
  updateCartStatus,
};
