require("dotenv").config();
const mysql = require("mysql2");

const mysqlPool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "kholla@123",
    database: "discovery-connect",
});

mysqlPool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database Connection Error", err);
    } else {
        console.log("✅ Connection Successful to MySQL");
        connection.release(); // Release connection back to pool
    }
});

module.exports = mysqlPool;