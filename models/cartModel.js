const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");

const notifyResearcher = (cartIds, message, subject) => {
  return new Promise((resolve, reject) => {
    // Ensure cartIds is an array
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];

    // Build a query that fetches emails and created_at for multiple cart IDs
    const placeholders = ids.map(() => '?').join(',');
    const getResearcherEmailQuery = `
      SELECT ua.email, c.created_at, c.id AS cartId
      FROM user_account ua
      JOIN cart c ON ua.id = c.user_id
      WHERE c.id IN (${placeholders})
    `;

    // Fetch all cart details in one query
    mysqlConnection.query(getResearcherEmailQuery, ids, (emailErr, emailResults) => {
      if (emailErr) {
        return reject(emailErr);
      }

      if (emailResults.length === 0) {
        return reject(new Error('No data found for provided cart IDs'));
      }

      // Assuming all cart items belong to the same researcher, use the first result
      const researcherEmail = emailResults[0].email;
      const cartIdsList = emailResults
        .map((detail) => `Cart ID: ${detail.cartId} (Created At: ${detail.created_at})`)
        .join("\n");

      // Build the message
      const emailMessage = `Dear Researcher,<br/>${message}<br/>Details for the following carts:${cartIdsList}<br/>Best regards`;

      // Start email sending process concurrently (non-blocking)
      sendEmail(researcherEmail, subject, emailMessage)
        .then(() => {
          resolve(); // Resolve after email is sent successfully
        })
        .catch((emailError) => {
          reject(emailError); // Reject if email fails
        });
    });
  });
};



const updateCartStatusToCompleted = (cartId, callback) => {
  const getCartDetailsQuery = `
    SELECT delivered_at, order_status
    FROM cart
    WHERE id = ?`;

  mysqlConnection.query(getCartDetailsQuery, [cartId], (err, results) => {
    if (err) {
      console.error("Error retrieving cart details:", err);
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(new Error("Cart not found"), null);
    }

    const deliveredAt = results[0].delivered_at;
    const currentOrderStatus = results[0].order_status;

    // ✅ Check if delivered_at is null
    if (!deliveredAt) {
      return callback(null, null); // No update, since delivery hasn't been recorded yet
    }

    const now = new Date();
    const deliveredAtDate = new Date(deliveredAt);

    // Add 1 day to the delivered_at date
    deliveredAtDate.setDate(deliveredAtDate.getDate() + 1);

    // Normalize both dates to ignore time
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deliveredDateOnly = new Date(deliveredAtDate.getFullYear(), deliveredAtDate.getMonth(), deliveredAtDate.getDate());

    if (deliveredDateOnly <= nowDateOnly && currentOrderStatus === 'Dispatched') {
      const updateStatusQuery = `
        UPDATE cart 
        SET order_status = 'Completed' 
        WHERE id = ?`;

      mysqlConnection.query(updateStatusQuery, [cartId], (updateErr, updateResults) => {
        if (updateErr) {
          console.error("Error updating cart status to 'Completed':", updateErr);
          return callback(updateErr, null);
        }

        notifyResearcher(cartId, "Your sample request has been completed.<br/>", "Sample Request Status Update", (notifyErr) => {
          if (notifyErr) {
            return callback(notifyErr, null);
          }

          return callback(null, updateResults);
        });
      });
    } else {
      return callback(null, null);
    }
  });
};


const createCartTable = () => {
  const cartTableQuery = `
  CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sample_id VARCHAR(36) NOT NULL,
    price FLOAT NOT NULL,
    quantity INT NOT NULL,
    totalpayment DECIMAL(10, 2) NOT NULL,
    payment_id INT DEFAULT NULL,
    order_status ENUM('Pending', 'Accepted', 'UnderReview', 'Rejected', 'Shipped', 'Dispatched', 'Completed') DEFAULT 'Pending',
   delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE,
    FOREIGN KEY (sample_id) REFERENCES sample(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payment(id) ON DELETE SET NULL
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

  const getAdminIdQuery = `SELECT id FROM user_account WHERE accountType = 'TechnicalAdmin' LIMIT 1`;

  mysqlConnection.query(getAdminIdQuery, (err, adminResults) => {
    if (err) return callback(err);

    if (adminResults.length === 0) {
      return callback(new Error("No Technical Admin found"));
    }

    const technicalAdminId = adminResults[0].id;

    let insertPromises = cart_items.map((item) => {
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
          if (err) return reject(err);

          const cartId = cartResult.insertId;
          const getCreatedAtQuery = `SELECT created_at FROM cart WHERE id = ?`;

          mysqlConnection.query(getCreatedAtQuery, [cartId], (err, createdAtResult) => {
            if (err) return reject(err);

            const created_at = createdAtResult?.[0]?.created_at;
            const insertApprovalQuery = `
              INSERT INTO technicaladminsampleapproval (cart_id, technical_admin_id, technical_admin_status)
              VALUES (?, ?, 'pending')
            `;

            mysqlConnection.query(insertApprovalQuery, [cartId, technicalAdminId], (err) => {
              if (err) return reject(err);

              const insertDocumentsQuery = `
                INSERT INTO sampledocuments (cart_id, study_copy, reporting_mechanism, irb_file, nbc_file)
                VALUES (?, ?, ?, ?, ?)
              `;
              const documentValues = [cartId, study_copy, reporting_mechanism, irb_file, nbc_file || null];

              mysqlConnection.query(insertDocumentsQuery, documentValues, (err) => {
                if (err) return reject(err);

                const updateQuery = `
                  UPDATE sample 
                  SET 
                    quantity = quantity - ?, 
                    quantity_allocated = IFNULL(quantity_allocated, 0) + ?
                  WHERE id = ? AND quantity >= ?
                `;
                const updateValues = [
                  item.samplequantity,
                  item.samplequantity,
                  item.sample_id,
                  item.samplequantity,
                ];

                mysqlConnection.query(updateQuery, updateValues, (err) => {
                  if (err) return reject(err);
                  resolve({ cartId, created_at });
                });
              });
            });
          });
        });
      });
    });

    Promise.all(insertPromises)
      .then((results) => {
        const cartIds = results.map((result) => result.cartId);
        const message = 'Your sample request has been <b>successfully created</b>. Please check your dashboard for more details.';
        const subject = "Sample Request Status Update";

        // ✅ Inline notifyResearcher logic
        const placeholders = cartIds.map(() => '?').join(',');
        const getResearcherEmailQuery = `
          SELECT ua.email, c.created_at, c.id AS cartId
          FROM user_account ua
          JOIN cart c ON ua.id = c.user_id
          WHERE c.id IN (${placeholders})
        `;

        mysqlConnection.query(getResearcherEmailQuery, cartIds, (emailErr, emailResults) => {
          if (emailErr) return callback(emailErr);

          if (emailResults.length === 0) {
            return callback(new Error("No data found for provided cart IDs"));
          }

          const researcherEmail = emailResults[0].email;
          const cartIdsList = emailResults
            .map((detail) => `Cart ID: ${detail.cartId} (Created At: ${detail.created_at})`)
            .join("\n");

          const emailMessage = `Dear Researcher,<br/>${message}<br/>Details for the following carts:<br/>${cartIdsList}<br/>Best regards, <br/>Lab Hazir`;

          sendEmail(researcherEmail, subject, emailMessage)
            .then(() => {
             
              callback(null, { message: 'Cart created successfully', results });
            })
            .catch((emailSendErr) => {
              console.error("Failed to send researcher email:", emailSendErr);
              callback(emailSendErr);
            });
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

  mysqlConnection.query(updateQuery, values, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};
const baseCommitteeStatus = (committeeType) => `
  (
    SELECT 
      CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM committeesampleapproval ca
            JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
            WHERE ca.cart_id = c.id AND cm.committeetype = '${committeeType}'
        ) AND EXISTS (
            SELECT 1 FROM committeesampleapproval ca
            JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
            WHERE ca.cart_id = c.id AND cm.committeetype = '${committeeType === 'Scientific' ? 'Ethical' : 'Scientific'}'
        ) THEN 'Not Sent'
        WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Refused') > 0 THEN 'Refused'
        WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'UnderReview') > 0 THEN 'UnderReview'
        WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Approved') = COUNT(*) THEN 'Approved'
        ELSE NULL
      END
    FROM committeesampleapproval ca 
    JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
    WHERE ca.cart_id = c.id AND cm.committeetype = '${committeeType}'
  )
`;

const getAllOrder = (page, pageSize, searchField, searchValue, status, callback) => {
  const offset = (page - 1) * pageSize;
  const queryParams = [];

  let whereClauses = [];
  let searchCondition = '';

  // Map searchField to actual DB fields
  const searchFieldMap = {
    order_id: 'c.id',
    researcher_name: 'r.ResearcherName',
    organization_name: 'org.OrganizationName',
    scientific_committee_status: baseCommitteeStatus('Scientific'),
    ethical_committee_status: baseCommitteeStatus('Ethical')
  };

  const dbField = searchFieldMap[searchField];

  if (dbField && searchValue) {
    searchCondition = `${dbField} LIKE ?`;
    queryParams.push(`%${searchValue}%`);
    whereClauses.push(searchCondition);
  }

  if (status === 'Rejected') {
    whereClauses.push("c.order_status = 'Rejected'");
  } else if (status === 'Accepted') {
    whereClauses.push("c.order_status != 'Rejected'");
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

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
      IFNULL(ra.technical_admin_status, NULL) AS technical_admin_status,

      ${baseCommitteeStatus('Ethical')} AS ethical_committee_status,
      ${baseCommitteeStatus('Scientific')} AS scientific_committee_status,

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
    LEFT JOIN technicaladminsampleapproval ra ON c.id = ra.cart_id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;

  queryParams.push(parseInt(pageSize), parseInt(offset));

  const countQuery = `
    SELECT COUNT(*) AS totalCount
    FROM cart c
    JOIN user_account u ON c.user_id = u.id
    LEFT JOIN researcher r ON u.id = r.user_account_id 
    LEFT JOIN organization org ON r.nameofOrganization = org.id
    JOIN sample s ON c.sample_id = s.id
    LEFT JOIN technicaladminsampleapproval ra ON c.id = ra.cart_id
    ${whereClause}
  `;

  mysqlConnection.query(countQuery, queryParams.slice(0, queryParams.length - 2), (countErr, countResults) => {
    if (countErr) {
      console.error("Error getting total count:", countErr);
      callback(countErr, null);
    } else {
      const totalCount = countResults[0].totalCount;

      mysqlConnection.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
          console.error("Error fetching cart data:", err);
          callback(err, null);
        } else {
          results.forEach(order => {
            updateCartStatusToCompleted(order.order_id, (updateErr) => {
              if (updateErr) {
                console.error(`Error updating status for order ${order.order_id}:`, updateErr);
              }
            });
          });

          callback(null, {
            results,
            totalCount,
          });
        }
      });
    }
  });
};


const getAllOrderByCommittee = ( id,page, pageSize, searchField, searchValue, callback) => {
  const offset = (page - 1) * pageSize;

  const params = [id];
  let whereClause = `WHERE ca.committee_member_id = ?`;

  if (searchField && searchValue) {
    let dbField = searchField;

    // Mapping fields to DB fields
    if (searchField === "cart_id") {
      dbField = "c.id";
    } else if (searchField === "researcher_name") {
      dbField = "r.ResearcherName";
    } else if (searchField === "user_email") {
      dbField = "u.email";
    } else if (searchField === "organization_name") {
      dbField = "org.OrganizationName";
    }
    whereClause += ` AND ${dbField} LIKE ?`;
    params.push(`%${searchValue}%`);
  }

  // SQL Query to get orders with pagination
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
      ca.comments
    FROM committeesampleapproval ca
    JOIN cart c ON ca.cart_id = c.id  
    JOIN user_account u ON c.user_id = u.id
    LEFT JOIN researcher r ON u.id = r.user_account_id 
    LEFT JOIN organization org ON r.nameofOrganization = org.id
    JOIN sample s ON c.sample_id = s.id  
    LEFT JOIN sampledocuments sd ON c.id = sd.cart_id 
    ${whereClause}
    ORDER BY c.created_at ASC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS totalCount
    FROM committeesampleapproval ca
    JOIN cart c ON ca.cart_id = c.id  
    JOIN user_account u ON c.user_id = u.id
    LEFT JOIN researcher r ON u.id = r.user_account_id 
    LEFT JOIN organization org ON r.nameofOrganization = org.id
    JOIN sample s ON c.sample_id = s.id  
    ${whereClause};
  `;

  const queryParams = [...params, pageSize, offset];

  mysqlConnection.query(sqlQuery, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching committee member's orders:", err);
      callback(err, null);
    } else {
      mysqlConnection.query(countQuery, params, (countErr, countResults) => {
        if (countErr) {
          console.error("Error fetching total count:", countErr);
          callback(countErr, null);
        } else {
          callback(null, {
            results,
            totalCount: countResults[0].totalCount,
          });
        }
      });
    }
  });
};

const getAllDocuments = (page, pageSize, searchField, searchValue, id, callback) => {
  const offset = (page - 1) * pageSize;

  let whereClause = "WHERE 1=1";
  const params = [];

  // Filter by search field
  if (searchField && searchValue) {
    let dbField = searchField;

    // Map fields to DB fields
    if (searchField === "cart_id") {
      dbField = "c.id";
    }

    whereClause += ` AND ${dbField} LIKE ?`;
    params.push(`%${searchValue}%`);
  }

  // Filter by committee member ID
  if (id) {
    whereClause += " AND csa.committee_member_id = ?";
    params.push(id);
  }

  const sqlQuery = `
    SELECT 
      c.id AS cart_id, 
      sd.study_copy,
      sd.reporting_mechanism,
      sd.irb_file,
      sd.nbc_file
    FROM sampledocuments sd
    JOIN cart c ON sd.cart_id = c.id
    JOIN committeesampleapproval csa ON c.id = csa.cart_id
    ${whereClause}
    ORDER BY c.created_at ASC
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, pageSize, offset];

  mysqlConnection.query(sqlQuery, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching documents:", err);
      callback(err, null);
    } else {
      callback(null, { results });
    }
  });
};

const getAllOrderByOrderPacking = (csrUserId, callback) => {
  const sqlQuery = `
    SELECT 
      c.*, 
      c.user_id, 
      u.email AS user_email,
      r.ResearcherName AS researcher_name,
      r.phoneNumber,
      r.fullAddress,
      org.OrganizationName AS organization_name,
      s.id AS sample_id,
      s.samplename, 
      c.order_status,  
      c.created_at,

      city.name AS city_name,
      country.name AS country_name,
      district.name AS district_name

    FROM cart c
    JOIN user_account u ON c.user_id = u.id
    LEFT JOIN researcher r ON u.id = r.user_account_id 
    LEFT JOIN organization org ON r.nameofOrganization = org.id
    JOIN sample s ON c.sample_id = s.id
    LEFT JOIN city ON r.city = city.id
    LEFT JOIN country ON r.country = country.id
    LEFT JOIN district ON r.district = district.id

    -- Join collectionsite_staff to match sample ownership
    JOIN collectionsitestaff cs_staff 
      ON cs_staff.user_account_id = s.user_account_id

    -- Join CSR to get the collection site they belong to
    JOIN csr 
      ON csr.collection_id = cs_staff.collectionsite_id

    -- Only get samples where the CSR is from the same collection site
    WHERE csr.user_account_id = ?

    ORDER BY c.created_at ASC;
  `;

  mysqlConnection.query(sqlQuery, [csrUserId], (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return callback(err, null);
    }
    callback(null, results);
  });
};


const updateTechnicalAdminStatus = async (id, technical_admin_status) => {
  try {

    // Step 1: Update Technical admin status
    const sqlQuery = `
      UPDATE technicaladminsampleapproval 
      SET technical_admin_status = ? 
      WHERE cart_id = ?`;

    // Use promise-based query to avoid blocking
    await queryAsync(sqlQuery, [technical_admin_status, id]);

    

    // Step 2: Determine new cart status based on Technical admin status
    let newCartStatus = null;

    if (technical_admin_status === 'Accepted') {
      newCartStatus = 'Pending';  // or 'Accepted', depending on business logic
    } else if (technical_admin_status === 'Rejected') {
      newCartStatus = 'Rejected';
    }
    

if (newCartStatus) {
  await updateCartStatus(id, newCartStatus);
}


    // Step 3.5: If rejected, revert quantity back to the sample table asynchronously
    const revertQuantityPromise = technical_admin_status === 'Rejected'
      ? revertSampleQuantity(id)
      : Promise.resolve(null);  // Skip if not rejected

    // Wait for both the cart status update and quantity revert in parallel
    await Promise.all([revertQuantityPromise]);

    // Step 4: Prepare the notification message
    const message =
      technical_admin_status === 'Accepted'
        ? "Your sample request has been <b>approved</b> by the Technical Admin.<br/>"
        : technical_admin_status === 'Rejected'
        ? "Your sample request has been <b>rejected</b> by the Technical Admin.<br/>"
        : "Your sample request is still <b>pending</b> approval by the Technical Admin.<br/>";

    // Step 5: Notify the researcher asynchronously (no blocking)
    const notifyPromise = notifyResearcher(id, message, "Sample Request Status Update");

    // Wait for notification to be sent
    await notifyPromise;

    return { message: "Technical Admin and Cart status updated. Researcher notified." };
  } catch (err) {
    console.error("Error updating Technical admin status:", err);
    throw new Error("Error updating status");
  }
};

const updateCartStatusbyCSR = async (ids, req, callback) => {
  try {
    const { cartStatus, deliveryDate, deliveryTime } = req.body;
    const message =
      cartStatus === 'Shipped'
        ? "Your sample request has been <b>Shipped</b> and is on its way.<br/>"
        : "Your sample request status has been updated.<br/>";

    const subject = "Sample Request Status Update";

    const deliveredAt = `${deliveryDate} ${deliveryTime}:00`; // Ensuring full DATETIME format

    // Step 1: Update each cart status + delivered_at
    for (const id of ids) {
      await queryAsync(
        `UPDATE cart SET order_status = ?, delivered_at = ? WHERE id = ?`,
        [cartStatus, deliveredAt, id]
      );
    }

    // Step 2: Get email info for the FIRST cart only
    const getFirstCartEmailQuery = `
      SELECT ua.email, c.created_at, c.id AS cartId
      FROM user_account ua
      JOIN cart c ON ua.id = c.user_id
      WHERE c.id = ?`;

    const result = await queryAsync(getFirstCartEmailQuery, [ids[0]]);

    if (!result || result.length === 0) {
      throw new Error(`No researcher found for cart ID: ${ids[0]}`);
    }

    const { email, created_at, cartId } = result[0];

    const cartList = ids.map(id => `Cart ID: ${id}`).join("<br/>");
    const emailMessage = `Dear Researcher,<br/>${message}<br/>Updated Cart(s):<br/>${cartList}<br/><br/>Best regards,<br/>Lab Hazir`;

    await sendEmail(email, subject, emailMessage);

    // Send success message
    if (typeof callback === 'function') {
      callback(null, "Cart status updated and researcher notified.");
    } else {
      return "Cart status updated and researcher notified.";
    }
  } catch (err) {
    console.error("Error in update and notify:", err);
    if (typeof callback === 'function') {
      callback(err, null);
    } else {
      throw err;
    }
  }
};

// Helper function to revert sample quantity if the request is rejected
const revertSampleQuantity = async (cartId) => {
  const getQuantitySql = `
    SELECT sample_id, quantity 
    FROM cart 
    WHERE id = ?`;

  const [cartItem] = await queryAsync(getQuantitySql, [cartId]);

  if (cartItem) {
    const { sample_id, quantity } = cartItem;

    const updateSampleSql = `
      UPDATE sample 
      SET quantity = quantity + ?, 
          quantity_allocated = quantity_allocated - ? 
      WHERE id = ?`;

    await queryAsync(updateSampleSql, [quantity, quantity, sample_id]);
    
  } else {
    console.warn("Cart item not found for rejection.");
  }
};

const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    mysqlConnection.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const updateCartStatus = async (cartIds, cartStatus, callback) => {
  try {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];

    const message =
      cartStatus === 'Rejected'
        ? "Your sample request has been <b>rejected</b>.<br/>"
        : cartStatus === 'UnderReview'
        ? "Your sample documents have been <b>reviewed by a committee member</b>.<br/>"
        : cartStatus === 'Dispatched'
        ? "Your sample request has been <b>dispatched</b> and is on its way.<br/>"
        : "Your sample request status has been updated.<br/>";

    const subject = "Sample Request Status Update";

    // Step 1: Update each cart status
    for (const id of ids) {
      await queryAsync(`UPDATE cart SET order_status = ? WHERE id = ?`, [cartStatus, id]);
    }

    // Step 2: Get email info for the FIRST cart only
    const getFirstCartEmailQuery = `
      SELECT ua.email, c.created_at, c.id AS cartId
      FROM user_account ua
      JOIN cart c ON ua.id = c.user_id
      WHERE c.id = ?
    `;
    const result = await queryAsync(getFirstCartEmailQuery, [ids[0]]);

    if (!result || result.length === 0) {
      throw new Error(`No researcher found for cart ID: ${ids[0]}`);
    }

    const { email, created_at, cartId } = result[0];

    // Step 3: Build email message (include all updated cart IDs for context)
    const cartList = ids.map(id => `Cart ID: ${id}`).join("\n");
    const emailMessage = `Dear Researcher,<br/>${message}<br/>Updated Cart(s):\n${cartList}<br/>Best regards,<br/>Lab Hazir`;

    // Step 4: Send the email
    await sendEmail(email, subject, emailMessage);

    

    if (typeof callback === 'function') {
      callback(null, "Cart status updated and researcher notified.");
    } else {
      return "Cart status updated and researcher notified.";
    }
  } catch (err) {
    console.error("Error in update and notify:", err);
    if (typeof callback === 'function') {
      callback(err, null);
    } else {
      throw err;
    }
  }
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
  getAllDocuments,
  getAllOrderByOrderPacking,
  updateTechnicalAdminStatus,
  updateCartStatus,
  updateCartStatusbyCSR
};
