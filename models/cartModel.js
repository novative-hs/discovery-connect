const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");

const notifyResearcher = (cartIds, message, subject) => {
  return new Promise((resolve, reject) => {
    const ids = Array.isArray(cartIds) ? cartIds : [cartIds];
    const placeholders = ids.map(() => '?').join(',');

    const getResearcherEmailQuery = `
      SELECT ua.email, c.created_at, c.tracking_id, c.id AS cartId
      FROM user_account ua
      JOIN cart c ON ua.id = c.user_id
      WHERE c.id IN (${placeholders})
    `;

    mysqlConnection.query(getResearcherEmailQuery, ids, (emailErr, emailResults) => {
      if (emailErr) return reject(emailErr);
      if (emailResults.length === 0) return reject(new Error('No data found for provided cart IDs'));

      const researcherEmail = emailResults[0].email;

      // Email HTML layout
      const emailMessage = `
        <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: left;">
            
            <h2 style="color: #2c3e50; text-align: center;">Dear Researcher,</h2>
            
            <p style="font-size: 16px;">${message}</p>

            <p style="font-size: 16px;">Here are the details of your cart(s):</p>

            <ul style="list-style: none; padding: 0;">
              ${emailResults.map(detail => `
                <li style="border: 1px solid #ddd; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
                  <p><strong>Tracking ID:</strong> ${detail.tracking_id}</p>
                  <p><strong>Created At:</strong> ${new Date(detail.created_at).toLocaleString()}</p>
                </li>
              `).join('')}
            </ul>

            <p style="margin-top: 30px;">Best regards,<br/><strong>Discovery Connect Team</strong></p>

            <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;" />

            <p style="font-size: 12px; color: #888; text-align: center;">
              This is an automated message. Please do not reply directly to this email.
            </p>
          </div>
        </div>
      `;

      sendEmail(researcherEmail, subject, emailMessage)
        .then(() => resolve())
        .catch((emailError) => reject(emailError));
    });
  });
};



const createCartTable = () => {
  const cartTableQuery = `
  CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sample_id VARCHAR(36) NOT NULL,
    tracking_id VARCHAR(10),
    price FLOAT NOT NULL,
    quantity INT NOT NULL,
    VolumeUnit VARCHAR(20),
    volume VARCHAR(255) NOT NULL,
    totalpayment DECIMAL(10, 2) NOT NULL,
    payment_id INT DEFAULT NULL,
    order_status ENUM('Pending', 'Accepted', 'Rejected', 'Shipped', 'Dispatched', 'Completed') DEFAULT 'Pending',
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

const updateCartStatusToCompleted = (cartId, callback) => {
  const getCartDetailsQuery = `
    SELECT delivered_at, order_status,tracking_id
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
    const tracking_id = results[0].tracking_id;
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


function generateTrackingId() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

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
  const tracking_id = generateTrackingId();
  let created_at=0;
  // Validate required fields
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

    // Insert each cart item
    const insertPromises = cart_items.map((item) => {

      return new Promise((resolve, reject) => {
        const sample_id = item.sample_id;

        const insertCartQuery = `
          INSERT INTO cart (user_id, sample_id, price, quantity, volume, VolumeUnit, payment_id, totalpayment,tracking_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
        `;

        const cartValues = [
          researcher_id,
          sample_id,
          item.price,
          item.samplequantity,
          item.volume,
          item.VolumeUnit,
          payment_id,
          item.total,
          tracking_id
        ];

        mysqlConnection.query(insertCartQuery, cartValues, (err, cartResult) => {
          if (err) return reject(err);

          const cartId = cartResult.insertId;

          const getCreatedAtQuery = `SELECT created_at FROM cart WHERE id = ?`;
          mysqlConnection.query(getCreatedAtQuery, [cartId], (err, createdAtResult) => {
            if (err) return reject(err);

            created_at = createdAtResult?.[0]?.created_at;

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
                  sample_id,
                  item.samplequantity,
                ];

                mysqlConnection.query(updateQuery, updateValues, (err) => {
                  if (err) return reject(err);

                  resolve({ tracking_id, created_at });
                });
              });
            });
          });
        });
      });
    });

    Promise.all(insertPromises)
      .then(() => {
        const message =
          "Your sample request has been <b>successfully created</b>. Please check your dashboard for more details.";
        const subject = "Sample Request Status Update";

        const getResearcherEmailQuery = `
      SELECT ua.email, c.created_at, c.id AS cartId
      FROM user_account ua
      JOIN cart c ON ua.id = c.user_id
      WHERE c.tracking_id = ?
    `;

        mysqlConnection.query(getResearcherEmailQuery, [tracking_id], (emailErr, emailResults) => {
          if (emailErr) return callback(emailErr);

          if (emailResults.length === 0) {
            return callback(new Error("No data found for provided tracking ID"));
          }

          const researcherEmail = emailResults[0].email;
          const cartIdsList = emailResults
            .map((detail) => `Cart ID: ${detail.cartId} (Created At: ${detail.created_at})`)
            .join("<br/>");

          const emailMessage = `Dear Researcher,<br/>${message}<br/>Tracking ID: <b>${tracking_id}</b><br/>Best regards,<br/>Discovery Connect`;

          sendEmail(researcherEmail, subject, emailMessage)
            .then(() => {
              callback(null, { message: "Cart created successfully", tracking_id,created_at });
            })
            .catch((emailSendErr) => {
              console.error("Failed to send researcher email:", emailSendErr);
              callback(emailSendErr);
            });
        });
      })
  });
};

const getAllCart = (id, callback, res) => {
  const sqlQuery = `
  SELECT 
      s.id AS sampleid, 
      s.Analyte AS Analyte,
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
        WHEN COUNT(*) > 0 AND SUM(ca.committee_status = 'Pending') > 0 THEN 'Pending'
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
    order_id: 'c.tracking_id',
    Analyte: 's.Analyte',
    researcher_name: 'r.ResearcherName',
    organization_name: 'org.OrganizationName',
    scientific_committee_status: baseCommitteeStatus('Scientific'),
    ethical_committee_status: baseCommitteeStatus('Ethical'),
    order_status: 'c.order_status', // ✅ ADD THIS
    technical_admin_status: 'ra.technical_admin_status',
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
  } else {
    // Handles specific statuses like Pending, Dispatched, Shipped etc.
    whereClauses.push("c.order_status = ?");
    queryParams.push(status);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sqlQuery = `
    SELECT 
      c.id AS order_id, 
      c.tracking_id,
      c.user_id, 
      u.email AS user_email,
      r.ResearcherName AS researcher_name,
      r.phoneNumber AS phoneNumber, 
      org.OrganizationName AS organization_name,
      cs.CollectionSiteName AS collectionsitename,
      b.Name AS biobankname,
      COALESCE(cs.CollectionSiteName, b.Name) AS source_name,
      c.sample_id, 
      s.Analyte, 
      s.VolumeUnit,
      s.volume,
      s.age, s.gender, s.ethnicity, s.samplecondition, s.storagetemp, s.ContainerType, 
      s.CountryofCollection, s.VolumeUnit, s.SampleTypeMatrix, s.SmokingStatus, 
      s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting, s.InfectiousDiseaseResult, 
      s.FreezeThawCycles, s.dateOfSampling, s.ConcurrentMedicalConditions, 
      s.ConcurrentMedications, s.Analyte, s.TestResult, 
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
    LEFT JOIN biobank b ON s.user_account_id = b.user_account_id
    LEFT JOIN collectionsitestaff css ON s.user_account_id = css.user_account_id
    LEFT JOIN collectionsite cs ON css.collectionsite_id = cs.id
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
            if (order.order_status !== 'Dispatched' && order.order_status !== 'Shipped') {
              updateCartStatusToCompleted(order.order_id, (updateErr) => {
                if (updateErr) {
                  console.error(`Error updating status for order ${order.order_id}:`, updateErr);
                }
              });
            }
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

const getAllOrderByCommittee = (id, page, pageSize, searchField, searchValue, callback) => {
  const offset = (page - 1) * pageSize;

  const params = [id];
  let whereClause = `WHERE ca.committee_member_id = ?`;

  if (searchField && searchValue) {
    let dbField = searchField;

    // Mapping fields to DB fields
    if (searchField === "tracking_id") {
      dbField = "c.tracking_id";
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
      c.tracking_id,
      c.user_id, 
      u.email AS user_email,
      r.ResearcherName AS researcher_name, 
      org.OrganizationName AS organization_name,
      s.id AS sample_id,
      s.Analyte, 
      s.VolumeUnit,
      s.volume,
      s.room_number,s.freezer_id,s.box_id,
      s.age, s.gender, s.ethnicity, s.samplecondition, 
      s.storagetemp, s.ContainerType, s.CountryofCollection, 
      s.VolumeUnit, s.SampleTypeMatrix, s.SmokingStatus, 
      s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting, 
      s.InfectiousDiseaseResult, s.FreezeThawCycles, 
      s.dateOfSampling, s.ConcurrentMedicalConditions, 
      s.ConcurrentMedications, s.Analyte, 
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
          // Add locationids field to each result
          const updatedResults = results.map(sample => ({
            ...sample,
            locationids: [sample.room_number, sample.freezer_id, sample.box_id].filter(Boolean).join('-')
          }));

          callback(null, {
            results: updatedResults,
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

const getAllOrderByOrderPacking = (csrUserId, staffAction, callback) => {
  let sqlQuery = `
    SELECT 
      c.*, 
      c.user_id, 
      u.email AS user_email,
      r.ResearcherName AS researcher_name,
      r.phoneNumber,
      r.fullAddress,
      org.OrganizationName AS organization_name,
      s.id AS sample_id,
      s.Analyte, 
      c.order_status,  
      c.created_at,

      city.name AS city_name,
      country.name AS country_name,
      district.name AS district_name,

      cs.CollectionSiteName,
      bb.Name AS BiobankName

    FROM cart c
    JOIN user_account u ON c.user_id = u.id
    LEFT JOIN researcher r ON u.id = r.user_account_id 
    LEFT JOIN organization org ON r.nameofOrganization = org.id
    JOIN sample s ON c.sample_id = s.id
    LEFT JOIN city ON r.city = city.id
    LEFT JOIN country ON r.country = country.id
    LEFT JOIN district ON r.district = district.id

    LEFT JOIN collectionsitestaff css ON s.user_account_id = css.user_account_id
    LEFT JOIN collectionsite cs ON css.collectionsite_id = cs.id
    LEFT JOIN biobank bb ON s.user_account_id = bb.user_account_id

    LEFT JOIN collectionsitestaff cs_staff ON s.user_account_id = cs_staff.user_account_id
    LEFT JOIN csr ON csr.collection_id = cs_staff.collectionsite_id
  `;

  const params = [];

  if (staffAction !== "all_order") {
    sqlQuery += ` WHERE csr.user_account_id = ? `;
    params.push(csrUserId);
  }

  sqlQuery += " ORDER BY c.created_at ASC;";

  mysqlConnection.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

const updateTechnicalAdminStatus = async (cartIds, technical_admin_status, comment) => {
  try {
    const updateResults = [];

    for (const id of cartIds) {
      // Step 1: Update technical admin status
      const updateQuery = `
        UPDATE technicaladminsampleapproval 
        SET technical_admin_status = ?, Comments = ?
        WHERE cart_id = ?
      `;
      await queryAsync(updateQuery, [technical_admin_status, comment, id]);

      // Step 2: Determine new cart status
      let newCartStatus = null;
      if (technical_admin_status === 'Accepted') {
        newCartStatus = 'Dispatched';
      } else if (technical_admin_status === 'Rejected') {
        newCartStatus = 'Rejected';
      }

      if (newCartStatus) {
        await updateCartStatus(id, newCartStatus);
      }

      // Step 3: Email message
      const message =
        technical_admin_status === 'Accepted'
          ? "Your sample request has been <b>approved</b> by the Technical Admin.<br/>"
          : technical_admin_status === 'Rejected'
            ? "Your sample request has been <b>rejected</b> by the Technical Admin.<br/>"
            : "Your sample request is still <b>pending</b> approval by the Technical Admin.<br/>";

      // Optional comment addition
      const fullMessage = comment
        ? `${message}<br/><b>Comment:</b> ${comment}`
        : message;

      // Step 4: Notify researcher (email)
      await notifyResearcher(id, fullMessage, "Sample Request Status Update");

      updateResults.push({ id, status: 'updated' });
    }

    return updateResults;
  } catch (err) {
    console.error("Error in bulk update in model:", err);
    throw new Error("Bulk update in model failed");
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
        : cartStatus === 'Pending'
          ? "Your sample documents have been <b>reviewed by a committee member and Technical Admin</b>.<br/>"
          : "Your sample request status has been updated.<br/>";

    const subject = "Sample Request Status Update";

    // Step 1: Update each cart status
    for (const id of ids) {
      await queryAsync(`UPDATE cart SET order_status = ? WHERE id = ?`, [cartStatus, id]);
    }

    if (cartStatus === 'Rejected') {
      // Step 2: If Rejected, add back cart quantities to sample quantities
      const cartSamplesQuery = `
        SELECT sample_id, quantity
        FROM cart
        WHERE id IN (${ids.map(() => '?').join(',')})
      `;
      const cartSamples = await queryAsync(cartSamplesQuery, ids);

      for (const cs of cartSamples) {
        await queryAsync(
          `UPDATE sample 
           SET quantity = quantity + ?, 
               quantity_allocated = quantity_allocated - ? 
           WHERE id = ?`,
          [cs.quantity, cs.quantity, cs.sample_id]
        );
      }
    }

    // Step 3: Get email info for the FIRST cart only
    const getFirstCartEmailQuery = `
      SELECT ua.email
      FROM user_account ua
      JOIN cart c ON ua.id = c.user_id
      WHERE c.id = ?
    `;
    const result = await queryAsync(getFirstCartEmailQuery, [ids[0]]);

    if (!result || result.length === 0) {
      throw new Error(`No researcher found for cart ID: ${ids[0]}`);
    }

    const { email } = result[0];

    // Step 4: Build email message
    const cartList = ids.map(id => `Cart ID: ${id}`).join("<br/>");
    const emailMessage = `Dear Researcher,<br/>${message}<br/>Updated Cart(s):<br/>${cartList}<br/>Best regards,<br/>Lab Hazir`;

    // Step 5: Send email
    await sendEmail(email, subject, emailMessage);

    if (typeof callback === 'function') {
      callback(null, "Cart status updated, sample quantity adjusted (if rejected), and researcher notified.");
    } else {
      return "Cart status updated, sample quantity adjusted (if rejected), and researcher notified.";
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
