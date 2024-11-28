const mysql = require("mysql2");
console.log("Connecting to DB at:", process.env.DB_HOST, process.env.DB_USER);

// Create a connection pool
const pool = mysql.createPool({
    host: "discovery-database.c1e2goekmu67.ap-south-1.rds.amazonaws.com",
    user: "discoveryadmin",
    password: "discoverylive123",
    database: "DiscoveryConnect",
    waitForConnections: true,
    connectionLimit: 10,  // Adjust based on application load
    queueLimit: 0
});

// Check the pool connection status
pool.getConnection((err, connection) => {
    if (err) {
        console.log("Database Connection Error:", JSON.stringify(err, undefined, 2));
    } else {
        console.log("Connection to database pool successful");
        connection.release();  // Release the connection back to the pool
    }
});

// Export the pool with promise support for async/await queries
module.exports = pool.promise();
