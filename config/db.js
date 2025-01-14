const mysql = require("mysql2");
// databse connection
var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "discoveryconnect321",
    database: "discoveryconnect",
});


// check wether the connection is successfull or not !!
mysqlConnection.connect((err) => {
    if (err) {
        console.log(
            "Database Connection Error" + JSON.stringify(err, undefined, 2)
        );
    } else console.log("Connection Successful");
});
module.exports = mysqlConnection;