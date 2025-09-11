const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
const { decryptAndShort } = require("../config/encryptdecrptUtils");

const createOrderTable = () => {
  const orderTableQuery = `
  CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,      
    tracking_id VARCHAR(20) UNIQUE NOT NULL, 
    user_id INT NOT NULL,
    totalpayment DECIMAL(10, 2) NOT NULL,
    order_status ENUM('Pending', 'Accepted', 'Rejected', 'Shipped', 'Dispatched', 'Completed') DEFAULT 'Pending',
    payment_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payment(id) ON DELETE SET NULL
  );
  `;

  mysqlConnection.query(orderTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating order table:", err);
    } else {
      console.log("Order table created or already exists.");
    }
  });
};

const createOrderDispatch = () => {
  const orderDispatchtable = `
  CREATE TABLE IF NOT EXISTS order_dispatch (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  delivered_at DATETIME,
  dispatch_via VARCHAR(50),
  dispatch_slip LONGBLOB,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
`
  mysqlConnection.query(orderDispatchtable, (err, result) => {
    if (err) {
      console.error("Error creating order dispatch table:", err);
    } else {
      console.log("Order dispatch table created or already exists.");
    }
  });
}


function generateTrackingId() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

const createOrder = (data, callback) => {
  const {
    researcher_id,
    cart_items,
    payment_id,
    study_copy,
    reporting_mechanism,
    irb_file,
    nbc_file,
  } = data;

  if (!researcher_id || !cart_items || !payment_id || !study_copy || !reporting_mechanism || !irb_file) {
    return callback(new Error("Missing required fields (Payment ID, Study Copy, Reporting Mechanism, and IRB File are required)"));
  }

  const tracking_id = generateTrackingId();
  const totalpayment = cart_items.reduce((sum, item) => sum + item.total, 0);

  // 1️⃣ Insert order
  mysqlConnection.query(
    `INSERT INTO orders (tracking_id, user_id, totalpayment, payment_id) VALUES (?, ?, ?, ?)`,
    [tracking_id, researcher_id, totalpayment, payment_id],
    (err, orderResult) => {
      if (err) return callback(err);

      const orderId = orderResult.insertId;

      // 2️⃣ Insert cart items and update stock
      const itemTasks = cart_items.map((item) => {
        return new Promise((resolve, reject) => {
          mysqlConnection.query(
            `INSERT INTO cart (order_id, sample_id, price, quantity, volume, VolumeUnit) VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, item.sample_id, item.price, item.samplequantity, item.volume, item.VolumeUnit],
            (err) => {
              if (err) return reject(err);

              mysqlConnection.query(
                `UPDATE sample SET quantity = quantity - ?, quantity_allocated = IFNULL(quantity_allocated,0) + ? WHERE id = ? AND quantity >= ?`,
                [item.samplequantity, item.samplequantity, item.sample_id, item.samplequantity],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            }
          );
        });
      });

      // 3️⃣ Get Technical Admin ID
      mysqlConnection.query(
        `SELECT id FROM user_account WHERE accountType = 'TechnicalAdmin' LIMIT 1`,
        async (err, adminResults) => {
          if (err) return callback(err);
          if (!adminResults.length) return callback(new Error("No Technical Admin found"));

          const technicalAdminId = adminResults[0].id;

          mysqlConnection.query(
            `INSERT INTO technicaladminsampleapproval (order_id, technical_admin_id, technical_admin_status) VALUES (?, ?, 'pending')`,
            [orderId, technicalAdminId],
            async (err) => {
              if (err) return callback(err);

              // Wait for all cart item inserts
              try {
                await Promise.all(itemTasks);

                // 4️⃣ Insert documents
                mysqlConnection.query(
                  `INSERT INTO sampledocuments (order_id, study_copy, reporting_mechanism, irb_file, nbc_file, added_by, role)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [orderId, study_copy, reporting_mechanism, irb_file, nbc_file || null, researcher_id, "Researcher"],
                  (err) => {
                    if (err) return callback(err);

                    // 5️⃣ Fetch created_at
                    mysqlConnection.query(
                      `SELECT created_at FROM orders WHERE id = ?`,
                      [orderId],
                      (err, orderData) => {
                        if (err) return callback(err);

                        const created_at = orderData[0].created_at;

                        // 6️⃣ Send email
                        mysqlConnection.query(
                          `SELECT email FROM user_account WHERE id = ?`,
                          [researcher_id],
                          async (err, user) => {
                            if (err) return callback(err);

                            if (user.length) {
                              const subject = "✨ Sample Request Created - Discovery Connect";
                              const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0px 4px 10px rgba(0,0,0,0.08);
      }
      .header {
        text-align: center;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      .header h2 {
        color: #0d6efd;
        margin: 0;
      }
      .content {
        padding: 20px 0;
        font-size: 15px;
        color: #444;
        line-height: 1.6;
      }
      .highlight {
        background: #e8f3ff;
        color: #0d6efd;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 16px;
        text-align: center;
        font-weight: bold;
        margin: 15px 0;
      }
      .btn {
        display: inline-block;
        background: #0d6efd;
        color: #fff !important;
        text-decoration: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 15px;
        margin-top: 15px;
      }
      .footer {
        margin-top: 25px;
        font-size: 12px;
        text-align: center;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Discovery Connect</h2>
      </div>
      <div class="content">
        <p>Dear User,</p>
        <p>We are excited to let you know that your <b>sample request</b> has been created successfully.</p>
        <div class="highlight">
          Tracking ID: ${tracking_id}
        </div>
        <p>You can track the status of your request by visiting your dashboard.</p>
        <p style="text-align:center;">
          <a href="https://discovery-connect.com" class="btn">View My Requests</a>
        </p>
        <p>Thank you for choosing <b>Discovery Connect</b>.<br/>We’re here to support your journey!</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Discovery Connect. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
                              try {
                                await sendEmail(user[0].email, subject, emailMessage);
                              } catch (emailErr) {
                                console.error("Failed to send email:", emailErr);
                              }
                            }


                            // ✅ Final callback
                            return callback(null, {
                              message: "Order created successfully",
                              order_id: orderId,
                              tracking_id,
                              created_at,
                            });
                          }
                        );
                      }
                    );
                  }
                );
              } catch (promiseErr) {
                return callback(promiseErr);
              }
            }
          );
        }
      );
    }
  );
};


const getOrderByResearcher = (userId, callback) => {
  const query = `
    SELECT
      s.*,
      o.tracking_id,
      o.order_status,
      o.totalpayment,
      sm.Analyte,
      sm.age,
      sm.gender,
      sm.ethnicity,
      sm.samplecondition,
      sm.storagetemp,
      sm.ContainerType,
      sm.CountryOfCollection,
      country.name AS CountryName,
      sm.price,
      sm.SamplePriceCurrency,
      sm.SampleTypeMatrix,
      sm.SmokingStatus,
      sm.AlcoholOrDrugAbuse,
      sm.InfectiousDiseaseTesting,
      sm.InfectiousDiseaseResult,
      sm.FreezeThawCycles,
      sm.DateOfSampling,
      sm.ConcurrentMedicalConditions,
      sm.ConcurrentMedications,
      sm.TestResult,
      sm.TestResultUnit,
      sm.TestMethod,
      sm.TestKitManufacturer,
      sm.TestSystem,
      sm.TestSystemManufacturer,
      sm.status,
      sm.sample_visibility,
      sm.logo,
      cs.CollectionSiteName,
      bb.Name AS BiobankName,
      c.name AS CityName,
      d.name AS DistrictName,
      p.payment_type AS payment_method,
      p.payment_status AS payment_status,
      s.quantity AS orderquantity,
      ra.technical_admin_status,
      sm.masterID,
      b.name AS BankName,
      CASE
          WHEN COUNT(ca.committee_status) = 0 THEN NULL
          WHEN SUM(CASE WHEN ca.committee_status = 'refused' THEN 1 ELSE 0 END) > 0 THEN 'rejected'
          WHEN SUM(CASE WHEN ca.committee_status = 'UnderReview' THEN 1 ELSE 0 END) > 0 THEN 'UnderReview'
          ELSE 'accepted'
      END AS committee_status

    FROM cart s
    JOIN orders o ON s.order_id = o.id        -- ✅ link cart to order
    JOIN user_account ua ON o.user_id = ua.id -- ✅ use order's user_id now
    LEFT JOIN sample sm ON s.sample_id = sm.id
    LEFT JOIN collectionsitestaff css ON sm.user_account_id = css.user_account_id
    LEFT JOIN collectionsite cs ON cs.id = css.collectionsite_id
    LEFT JOIN biobank bb ON sm.user_account_id = bb.id
    LEFT JOIN city c ON cs.city = c.id
    LEFT JOIN district d ON cs.district = d.id
    LEFT JOIN country ON sm.CountryOfCollection = country.id
    JOIN payment p ON o.payment_id = p.id     -- ✅ payment now comes from orders
    JOIN bank b ON p.bank_id = b.id
    LEFT JOIN technicaladminsampleapproval ra ON o.id = ra.order_id
    LEFT JOIN committeesampleapproval ca ON o.id = ca.order_id

    WHERE o.user_id = ?   -- ✅ replaced s.user_id

    GROUP BY s.id, sm.id, cs.id, bb.id, c.id, d.id, country.id, ra.technical_admin_status

    ORDER BY s.created_at DESC;
  `;

  mysqlConnection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, { error: "No samples found" });
    }

    const decryptedResults = results.map(sample => ({
      ...sample,
      masterID: sample.masterID ? decryptAndShort(sample.masterID) : null
    }));

    callback(null, decryptedResults);
  });
};

const getOrderByCSR = (csrUserId, staffAction, callback) => {
  let sqlQuery = `
  SELECT 
    o.*, 
    o.user_id, 
    u.email AS user_email,
    r.ResearcherName AS researcher_name,
    r.phoneNumber,
    r.fullAddress,
    org.OrganizationName AS organization_name,
    s.id AS sample_id,
    s.Analyte, 
    s.SamplePriceCurrency,
    c.quantity,
    c.price,
    s.volume,
    s.volumeUnit,
    s.TestResult,
    s.TestResultUnit,
    s.gender,
    s.age,
    o.order_status,  
    o.created_at,
    city.name AS city_name,
    country.name AS country_name,
    district.name AS district_name,
    cs.CollectionSiteName,
    bb.Name AS BiobankName
  FROM orders o
  LEFT JOIN cart c ON c.order_id = o.id
  JOIN user_account u ON o.user_id = u.id
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
  JOIN technicaladminsampleapproval t 
      ON t.order_id = o.id AND t.technical_admin_status = 'Accepted'
`;

  const params = [];

  if (staffAction !== "all_order") {
    sqlQuery += ` WHERE csr.user_account_id = ? `;
    params.push(csrUserId);
  }

  sqlQuery += " ORDER BY o.created_at ASC;";

  mysqlConnection.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return callback(err, null);
    }
    callback(null, results);
  });
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

const updateCartStatusbyCSR = async (req, dispatchSlip, callback) => {
  try {
    const id = req.body.orderid; // single order id
    const { cartStatus, deliveryDate, deliveryTime, dispatchVia } = req.body;

    const subject = "Sample Request Status Update";
    const deliveredAt = `${deliveryDate} ${deliveryTime}:00`; // Ensure DATETIME format

    // --- Step 1 & 2: Run update and insert in parallel ---
    await Promise.all([
      queryAsync(
        `UPDATE orders SET order_status = ? WHERE id = ?`,
        [cartStatus, id]
      ),
      queryAsync(
        `INSERT INTO order_dispatch 
         (order_id, delivered_at, dispatch_via, dispatch_slip) 
         VALUES (?, ?, ?, ?)`,
        [id, deliveredAt, dispatchVia, dispatchSlip]
      )
    ]);

    // --- Step 3: Get researcher email for this order ---
    const orderDetails = await queryAsync(
      `
      SELECT ua.email, o.tracking_id
      FROM user_account ua
      JOIN orders o ON ua.id = o.user_id
      WHERE o.id = ?
      `,
      [id]
    );

    if (!orderDetails.length) {
      throw new Error(`No researcher found for provided order ID`);
    }

    const { email, tracking_id } = orderDetails[0];

    // --- Step 4: Build email message ---
    const message = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">
            Dear Researcher,
          </p>
          <p style="font-size: 15px; color: #555;">
            ${cartStatus === "Dispatched"
        ? "📦 Your sample request has been <b style='color:#007bff;'>Dispatched</b> and is on its way."
        : "ℹ️ Your sample request status has been updated."
      }
          </p>
          <p><strong>Tracking ID:</strong> ${tracking_id}</p>
          <p style="font-size: 15px; color: #555;">Please check your dashboard for more details.</p>
          <p style="font-size: 15px; color: #333; margin-top: 20px;">
            Regards,<br>
            <strong>Discovery Connect Team</strong>
          </p>
        </div>
      </div>
    `;

    // --- Step 5: Respond immediately ---
    if (typeof callback === "function") {
      callback(null, "Order status updated");
    } else {
      return "Order status updated";
    }

    // --- Step 6: Send email in background (non-blocking) ---
    sendEmail(email, subject, message)
      .catch((err) => console.error("❌ Failed to send email:", err));

  } catch (err) {
    console.error("Error in update and notify:", err);
    if (typeof callback === "function") {
      callback(err, null);
    } else {
      throw err;
    }
  }
};


const updateOrderStatus = async (
  orderid,
  cartStatus,
  deliveryDate,
  deliveryTime,
  dispatchSlip,
  callback
) => {
  try {
    const deliveredAt = `${deliveryDate} ${deliveryTime}:00`;

    // 1. Update cart table
    await queryAsync(
      `UPDATE orders 
       SET order_status = ? 
       WHERE id = ?`,
      [cartStatus, orderid]
    );

    if (dispatchSlip) {
      // Update both slip + completed_at
      await queryAsync(
        `UPDATE order_dispatch 
           SET dispatch_slip = ?, completed_at = ?
           WHERE order_id = ?`,
        [dispatchSlip, deliveredAt, orderid]
      );
    } else {
      // Only update completed_at
      await queryAsync(
        `UPDATE order_dispatch 
           SET completed_at = ?
           WHERE order_id = ?`,
        [deliveredAt, orderid]
      );
    }


    // 4. Callback after success
    if (typeof callback === "function") {
      callback();
    }
  } catch (err) {
    console.error("Error updating order status:", err);
  }
};


const getAllSampleinDiscover = (filters, callback) => {
  let baseWhere = `(s.quantity > 0 OR s.quantity_allocated>0) AND s.sample_visibility = "Public" AND s.status = "In Stock"`;
  let queryParams = [];

  const {
    ageMin,
    ageMax,
    gender,
    sampleType,
    smokingStatus,
    search,
    TestResult,
    exactAge,
  } = filters;

  if (exactAge !== null) {
    baseWhere += ` AND s.age = ?`;
    queryParams.push(exactAge);
  } else {
    if (ageMin !== null) {
      baseWhere += ` AND s.age >= ?`;
      queryParams.push(ageMin);
    }
    if (ageMax !== null) {
      baseWhere += ` AND s.age <= ?`;
      queryParams.push(ageMax);
    }
  }

  if (gender) {
    baseWhere += ` AND s.gender = ?`;
    queryParams.push(gender);
  }

  if (sampleType) {
    baseWhere += ` AND s.sampleType = ?`;
    queryParams.push(sampleType);
  }

  if (smokingStatus) {
    baseWhere += ` AND s.smokingStatus = ?`;
    queryParams.push(smokingStatus);
  }

  if (TestResult) {
    baseWhere += ` AND s.TestResult = ?`;
    queryParams.push(TestResult);
  }

  if (search) {
    baseWhere += ` AND (s.PatientName LIKE ? OR s.masterID LIKE ?)`;
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  // Query 1: Get all samples
  const sampleQuery = `
    SELECT s.*
    FROM sample s
    WHERE ${baseWhere}
  `;

  // Query 2: Get all analyte images (distinct analyte)
  const imageQuery = `
    SELECT a.name AS analyteName, a.image AS analyteImage
    FROM analyte a
  `;


  // Step 1: Get all samples
  mysqlConnection.query(sampleQuery, queryParams, (err, samples) => {
    if (err) {
      console.error("Database query error (samples):", err);
      return callback(err, null);
    }

    const countParams = queryParams.slice(0, queryParams.length - 2);

    // Step 2: Get analyte images
    mysqlConnection.query(imageQuery, [], (err, images) => {
      if (err) {
        console.error("Database query error (images):", err);
        return callback(err, null);
      }

      // Map analyte name → image
      const imageMap = {};
      images.forEach(img => {
        imageMap[img.analyteName] = img.analyteImage;
      });

      // Step 3: Merge images into samples
      const mergedResults = samples.map(sample => {
        let safeMasterID = null;
        try {
          safeMasterID = decryptAndShort(sample.masterID)

        } catch (err) {
          console.error("Error decrypting masterID:", sample.masterID, err.message);
          safeMasterID = null;
        }

        return {
          ...sample,
          masterID: safeMasterID,
          analyteImage: imageMap[sample.Analyte] || null
        };
      });

      // Step 4: Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM sample s
        WHERE ${baseWhere};
      `;
      mysqlConnection.query(countQuery, countParams, (err, countResults) => {
        if (err) {
          console.error("Database query error (count):", err);
          return callback(err, null);
        }

        callback(null, {
          data: mergedResults,
          total: countResults[0].total,
        });
      });
    });
  });
};
module.exports = {
  createOrderTable,
  createOrderDispatch,
  createOrder,
  getOrderByResearcher,
  getOrderByCSR,
  updateCartStatusbyCSR,
  updateOrderStatus,
  getAllSampleinDiscover
}