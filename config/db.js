require("dotenv").config();
const mysql = require("mysql2");

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  connectTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0,
});

// ✅ Automatically set timezone for each new pooled connection
mysqlPool.on("connection", (connection) => {
  connection.query("SET time_zone = '+05:00'", (tzErr) => {
    if (tzErr) {
      console.error("❌ Failed to set timezone:", tzErr);
    }
  });
});

// ✅ Test single connection
mysqlPool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database Connection Error", err);
  } else {
    console.log("✅ MySQL Connection Successful");
    connection.release();
  }
});

module.exports = mysqlPool;
