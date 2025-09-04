const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
const createTechnicalApprovalTable = () => {
  const technicalapprovalableQuery = `
 CREATE TABLE IF NOT EXISTS technicaladminsampleapproval( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  order_id INT NOT NULL, 
  technical_admin_id INT NOT NULL,
  Comments VARCHAR(500), 
  technical_admin_status ENUM('Pending', 'Accepted', 'Rejected') NOT NULL DEFAULT 'Pending',
    Approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)  ON DELETE CASCADE,
  FOREIGN KEY (technical_admin_id) REFERENCES user_account(id)  ON DELETE CASCADE
);

`;

  mysqlConnection.query(technicalapprovalableQuery, (err, result) => {
    if (err) {
      console.error("Error creating Technical admin sample approval table:", err);
    } else {
      console.log("Technical Admin Approval table created or already exists.");
    }
  });
};

const createSampleDocumentTable = () => {
  const sampledocumentQuery = `
CREATE TABLE IF NOT EXISTS sampledocuments( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  order_id INT NOT NULL, 
  study_copy LONGBLOB,  
  reporting_mechanism TEXT,  
  irb_file LONGBLOB,  
  nbc_file LONGBLOB NULL, 
  role VARCHAR(50),
  added_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
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

const baseCommitteeStatus = (committeeType) => `
  (
    SELECT 
      CASE 
        WHEN NOT EXISTS (
            SELECT 1 
            FROM committeesampleapproval ca
            JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
            WHERE ca.order_id = o.id 
              AND cm.committeetype = '${committeeType}'
              AND ca.transfer = (
                SELECT MAX(transfer) 
                FROM committeesampleapproval 
                WHERE order_id = o.id
              )
        ) 
        AND EXISTS (
            SELECT 1 
            FROM committeesampleapproval ca
            JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
            WHERE ca.order_id = o.id 
              AND cm.committeetype = '${committeeType === 'Scientific' ? 'Ethical' : 'Scientific'}'
              AND ca.transfer = (
                SELECT MAX(transfer) 
                FROM committeesampleapproval 
                WHERE order_id = o.id
              )
        ) 
        THEN 'Not Sent'

        WHEN COUNT(*) > 0 
          AND SUM(ca.committee_status = 'Refused') > 0 
        THEN 'Refused'

        WHEN COUNT(*) > 0 
          AND SUM(ca.committee_status = 'Pending') > 0 
        THEN 'Pending'

        WHEN COUNT(*) > 0 
          AND SUM(ca.committee_status = 'Approved') = COUNT(*) 
        THEN 'Approved'

        ELSE NULL
      END
    FROM committeesampleapproval ca 
    JOIN committee_member cm 
      ON cm.user_account_id = ca.committee_member_id
    WHERE ca.order_id = o.id 
      AND cm.committeetype = '${committeeType}'
      AND ca.transfer = (
        SELECT MAX(transfer) 
        FROM committeesampleapproval 
        WHERE order_id = o.id
      )
  )
`;


const getOrderbyTechnical = (page, pageSize, searchField, searchValue, status, callback) => {
  const offset = (page - 1) * pageSize;
  const queryParams = [];

  let whereClauses = [];
  let searchCondition = '';

  // Map searchField to actual DB fields
  const searchFieldMap = {
    order_id: 'o.tracking_id',  // 🔄 from orders table
    Analyte: 's.Analyte',
    researcher_name: 'r.ResearcherName',
    organization_name: 'org.OrganizationName',
    scientific_committee_status: baseCommitteeStatus('Scientific'),
    ethical_committee_status: baseCommitteeStatus('Ethical'),
    order_status: 'o.order_status', // 🔄 from orders table
    technical_admin_status: 'ra.technical_admin_status',
  };

  const dbField = searchFieldMap[searchField];

  if (dbField && searchValue) {
    searchCondition = `${dbField} LIKE ?`;
    queryParams.push(`%${searchValue}%`);
    whereClauses.push(searchCondition);
  }

  if (status === 'Pending') {
    whereClauses.push("ra.technical_admin_status = 'Pending'");
  } else if (status === 'Accepted') {
    whereClauses.push("ra.technical_admin_status != 'Pending'");
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sqlQuery = `
  SELECT 
    o.id AS order_id, 
    o.tracking_id,
    o.user_id, 
    u.email AS user_email,
    r.ResearcherName AS researcher_name,
    r.phoneNumber AS phoneNumber, 
    org.OrganizationName AS organization_name,
    cs.CollectionSiteName AS collectionsitename,
    b.Name AS biobankname,
    COALESCE(cs.CollectionSiteName, b.Name) AS source_name,

    c.id AS cart_id,
    c.sample_id, 
    s.Analyte, 
    s.VolumeUnit,
    c.volume,
    s.age, s.gender, s.ethnicity, s.samplecondition, s.storagetemp, s.ContainerType, 
    s.CountryofCollection, s.VolumeUnit, s.SampleTypeMatrix, s.SmokingStatus, 
    s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting, s.InfectiousDiseaseResult, 
    s.FreezeThawCycles, s.dateOfSampling, s.ConcurrentMedicalConditions, 
    s.ConcurrentMedications, s.Analyte, s.TestResult, 
    s.TestResultUnit, s.TestMethod, s.TestKitManufacturer, s.TestSystem, 
    s.TestSystemManufacturer, s.SamplePriceCurrency,

    c.price, 
    c.quantity,  
    o.totalpayment,   -- 🔄 now from orders table
    o.order_status,   -- 🔄 now from orders table
    o.created_at,     -- 🔄 now from orders table

    IFNULL(ra.technical_admin_status, NULL) AS technical_admin_status,
    ra.created_at AS Technicaladmindate,
    ra.Approval_date AS TechnicaladminApproval_date,
    ${baseCommitteeStatus('Ethical')} AS ethical_committee_status,
    ${baseCommitteeStatus('Scientific')} AS scientific_committee_status,
    CASE
      WHEN (${baseCommitteeStatus('Scientific')} = 'Refused' 
            OR ${baseCommitteeStatus('Ethical')} = 'Refused') 
           THEN 'Refused'
      WHEN (${baseCommitteeStatus('Scientific')} = 'Pending' 
            OR ${baseCommitteeStatus('Ethical')} = 'Pending') 
           THEN 'Pending'
      WHEN (${baseCommitteeStatus('Scientific')} = 'Approved' 
            AND ${baseCommitteeStatus('Ethical')} = 'Approved') 
           THEN 'Approved'
      WHEN (${baseCommitteeStatus('Scientific')} = 'Not Sent' 
            OR ${baseCommitteeStatus('Ethical')} = 'Not Sent') 
           THEN 'Not Sent'
      ELSE '---'
    END AS final_committee_status,

    -- Comments only
    (
      SELECT GROUP_CONCAT(
        DISTINCT CONCAT(
          cm.CommitteeMemberName, 
          ' (', cm.committeetype, ') : ', 
          ca.comments,
          ' [', ca.committee_status, ']'
        ) SEPARATOR ' | '
      )
      FROM committeesampleapproval ca
      JOIN committee_member cm 
        ON cm.user_account_id = ca.committee_member_id
      WHERE ca.order_id = o.id
    ) AS committee_comments

  FROM orders o
  JOIN cart c ON o.id = c.order_id   -- 🔄 link orders to cart
  JOIN user_account u ON o.user_id = u.id
  LEFT JOIN researcher r ON u.id = r.user_account_id 
  LEFT JOIN organization org ON r.nameofOrganization = org.id
  JOIN sample s ON c.sample_id = s.id
  LEFT JOIN biobank b ON s.user_account_id = b.user_account_id
  LEFT JOIN collectionsitestaff css ON s.user_account_id = css.user_account_id
  LEFT JOIN collectionsite cs ON css.collectionsite_id = cs.id
  LEFT JOIN technicaladminsampleapproval ra ON o.id = ra.order_id
  
  ${whereClause}
  ORDER BY o.created_at DESC
  LIMIT ? OFFSET ?
  `;

  queryParams.push(parseInt(pageSize), parseInt(offset));

  // 🔄 Count query also updated to use orders
  const countQuery = `
    SELECT COUNT(*) AS totalCount
    FROM orders o
    JOIN user_account u ON o.user_id = u.id
    LEFT JOIN researcher r ON u.id = r.user_account_id 
    LEFT JOIN organization org ON r.nameofOrganization = org.id
    LEFT JOIN technicaladminsampleapproval ra ON o.id = ra.order_id
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
          console.error("Error fetching order data:", err);
          callback(err, null);
        } else {
          callback(null, {
            results,
            totalCount,
          });
        }
      });
    }
  });
};

const getDocuments = (id, callback) => {
  const sql = `
    SELECT sd.study_copy, sd.irb_file, sd.nbc_file, sd.role, 
           o.id, o.tracking_id, 
           sd.created_at, sd.updated_at
    FROM orders o
    JOIN sampledocuments sd ON o.id = sd.order_id
    WHERE o.tracking_id = ?
    ORDER BY sd.created_at ASC
  `;
  mysqlConnection.query(sql, [id], callback);
};

const getHistory = (tracking_id, status, callback) => {
  try {
    const sql = `
      SELECT
        o.tracking_id,

        -- Technical Admin history (distinct combos)
        (
          SELECT JSON_ARRAYAGG(x)
          FROM (
            SELECT DISTINCT JSON_OBJECT(
              'Technicaladmindate', tas.created_at,
              'TechnicaladminApproval_date', tas.Approval_date,
              'technical_admin_status', tas.technical_admin_status
            ) AS x
            FROM technicaladminsampleapproval tas
            WHERE tas.order_id = o.id
              AND (tas.created_at IS NOT NULL OR tas.Approval_date IS NOT NULL)
          ) t
        ) AS technicalAdminHistory,

        -- Committee approvals
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'committee_status',       csa.committee_status,
              'committee_comment',      csa.comments,
              'CommitteeMemberName',    cm.CommitteeMemberName,
              'committeetype',          cm.committeetype,
              'committee_approval_date',csa.Approval_date,
              'committee_created_at',   csa.created_at,
              'transfer',               csa.transfer
            )
          )
          FROM committeesampleapproval csa
          LEFT JOIN committee_member cm
            ON cm.user_account_id = csa.committee_member_id
          WHERE csa.order_id = o.id
            AND csa.created_at IS NOT NULL
          ORDER BY csa.created_at
        ) AS approvals,

        -- Documents (distinct by created_at + role)
        (
          SELECT JSON_ARRAYAGG(x)
          FROM (
            SELECT DISTINCT JSON_OBJECT(
              'added_by',         sd.added_by,
              'uploaded_by_role', sd.role,
              'files',            JSON_ARRAY(
                                    IF(sd.study_copy IS NULL, NULL, 'study_copy'),
                                    IF(sd.irb_file   IS NULL, NULL, 'irb_file'),
                                    IF(sd.nbc_file   IS NULL, NULL, 'nbc_file')
                                  ),
              'created_at',       sd.created_at,
              'updated_at',       sd.updated_at
            ) AS x
            FROM sampledocuments sd
            WHERE sd.order_id = o.id
              AND (sd.study_copy IS NOT NULL OR sd.irb_file IS NOT NULL OR sd.nbc_file IS NOT NULL)
          ) t
        ) AS documents

      FROM orders o
      WHERE o.tracking_id = ?
      ORDER BY o.tracking_id;
    `;

    const params = [tracking_id];

    mysqlConnection.query(sql, params, (err, rows) => {
      if (err) return callback(err, null);

      // Parse JSON columns safely
      const results = rows.map(r => ({
        tracking_id: r.tracking_id,
        technicalAdminHistory: Array.isArray(r.technicalAdminHistory)
          ? r.technicalAdminHistory
          : (typeof r.technicalAdminHistory === 'string'
            ? JSON.parse(r.technicalAdminHistory || '[]') : []),
        approvals: Array.isArray(r.approvals)
          ? r.approvals
          : (typeof r.approvals === 'string'
            ? JSON.parse(r.approvals || '[]') : []),
        documents: (Array.isArray(r.documents)
          ? r.documents
          : (typeof r.documents === 'string'
            ? JSON.parse(r.documents || '[]') : []))
          .map(d => ({
            ...d,
            files: Array.isArray(d.files) ? d.files.filter(Boolean) : []
          }))
      }));

      callback(null, { results });
    });
  } catch (e) {
    console.error("Error fetching history:", e);
    callback(e, null);
  }
};

const updateCartStatus = async (cartId, cartStatus, callback) => {
  try {
    // 1. Update cart table
    await queryAsync(
      `UPDATE orders 
       SET order_status = ? 
       WHERE id = ?`,
      [cartStatus, cartId]
    );

    // 2. If rejected → restore sample quantities
    if (cartStatus === 'Rejected') {
      const cartSample = await queryAsync(
        `SELECT sample_id, quantity 
         FROM cart 
         WHERE order_id = ?`,
        [cartId]
      );

      if (cartSample.length > 0) {
        const cs = cartSample[0];
        await queryAsync(
          `UPDATE sample 
           SET quantity = quantity + ?, 
               quantity_allocated = quantity_allocated - ? 
           WHERE id = ?`,
          [cs.quantity, cs.quantity, cs.sample_id]
        );
      }
    }

    // 3. Callback after success
    if (typeof callback === "function") {
      callback();
    }
  } catch (err) {
    console.error("Error updating cart status:", err);
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

const updateTechnicalAdminStatus = async (order_id, technical_admin_status, comment) => {
  if (!order_id) throw new Error("No order ID provided");

  // 1. Update technicaladminsampleapproval
  await queryAsync(
    `UPDATE technicaladminsampleapproval 
     SET technical_admin_status = ?, Comments = ?, Approval_date = NOW() 
     WHERE order_id = ?`,
    [technical_admin_status, comment, order_id]
  );

  // 2. Determine new order_status
  let newOrderStatus = null;
  if (technical_admin_status === "Rejected") newOrderStatus = "Rejected";

  if (newOrderStatus) {
    await updateCartStatus(order_id, newOrderStatus, null, null, null); 
  }

  // 3. Fetch order info for emails
  const orderDetails = await queryAsync(
    `SELECT o.id AS orderId, o.tracking_id, o.created_at, o.order_status, s.Analyte, ua.email
     FROM orders o
     JOIN cart c ON c.order_id = o.id
     JOIN sample s ON s.id = c.sample_id
     JOIN user_account ua ON ua.id = o.user_id
     WHERE o.id = ?`,
    [order_id]
  );

  if (!orderDetails || orderDetails.length === 0) {
    return { success: false, message: "Order not found" };
  }

  // 4. Group by tracking_id
  const trackingMap = {};
  orderDetails.forEach((row) => {
    if (!trackingMap[row.tracking_id]) {
      trackingMap[row.tracking_id] = { email: row.email, orders: [] };
    }
    trackingMap[row.tracking_id].orders.push(row);
  });

  // 5. Send emails asynchronously
  Object.entries(trackingMap).forEach(([trackingId, data]) => {
    setImmediate(async () => {
      try {
        const baseMessage =
          technical_admin_status === "Accepted"
            ? "Your sample request has been <b>approved</b> by the Technical Admin.<br/>"
            : technical_admin_status === "Rejected"
            ? "Your sample request has been <b>rejected</b> by the Technical Admin.<br/>"
            : "Your sample request is still <b>pending</b> approval by the Technical Admin.<br/>";

        const fullMessage = comment
          ? `${baseMessage}<br/><b>Comment:</b> ${comment}`
          : baseMessage;

        const emailMessage = `
          <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: left;">
              <h2 style="color: #2c3e50; text-align: center;">Dear Researcher,</h2>
              <p style="font-size: 16px;">${fullMessage}</p>
              <p><strong>Order Date:</strong> ${
                data.orders?.[0]?.created_at
                  ? new Date(data.orders[0].created_at).toLocaleString()
                  : "N/A"
              }</p>
              <p style="font-size: 16px;">Order details for tracking ID: <strong>${trackingId}</strong></p>
              <ul style="list-style: none; padding: 0;">
                ${data.orders
                  .map(
                    (detail) => `<li style="border: 1px solid #ddd; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
                      <p><strong>Analyte:</strong> ${detail.Analyte}</p>
                    </li>`
                  )
                  .join("")}
              </ul>
              <p style="margin-top: 30px;">Best regards,<br/><strong>Discovery Connect Team</strong></p>
              <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;" />
              <p style="font-size: 12px; color: #888; text-align: center;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </div>
          </div>
        `;

        await sendEmail(
          data.email,
          "Sample Request Status Update",
          emailMessage
        );
      } catch (err) {
        console.error("Email send error:", err);
      }
    });
  });

  return { success: true, message: "Order updated successfully", order_id };

};



module.exports = {
 createTechnicalApprovalTable,
 createSampleDocumentTable,
 getOrderbyTechnical,
 getDocuments,
 getHistory,
 updateTechnicalAdminStatus
};