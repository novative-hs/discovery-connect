const mysql = require("mysql2");
const mysqlConnection = require("../config/db");

// Function to create tables
function createTables() {
    // Define the table creation queries
    const createuser_accountTable = `
    CREATE TABLE IF NOT EXISTS user_account (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      confirmPassword VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      accountType VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

    const researcherTable = `
    CREATE TABLE IF NOT EXISTS researcher (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100),
        confirmPassword VARCHAR(100),
        accountType VARCHAR(255),
        ResearcherName VARCHAR(100),
        phoneNumber VARCHAR(15),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        nameofOrganization VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        logo VARCHAR(255),
        age VARCHAR(100),
        gender VARCHAR(100)
    )`;

    const organizationTable = `
    CREATE TABLE IF NOT EXISTS organization (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100),
        confirmPassword VARCHAR(100),
        accountType VARCHAR(255) NOT NULL,
        OrganizationName VARCHAR(100),
        type VARCHAR(50),
        HECPMDCRegistrationNo VARCHAR(50),
        ntnNumber VARCHAR(50),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        phoneNumber VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const collectionsiteTable = `
    CREATE TABLE IF NOT EXISTS collectionsite (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100),
        accountType VARCHAR(255) NOT NULL,
        CollectionSiteName VARCHAR(100),
        confirmPassword VARCHAR(100),
        ntnNumber VARCHAR(50),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending',
        phoneNumber VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const committememberTable = `
    CREATE TABLE IF NOT EXISTS committe_member (
        id INT AUTO_INCREMENT PRIMARY KEY,
        CommitteMemberName VARCHAR(100),
        email VARCHAR(100),
        phoneNumber VARCHAR(15),
        cnic VARCHAR(15),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        organization VARCHAR(50),
        status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const createAdminSignupTable = `
    CREATE TABLE IF NOT EXISTS admin_signup (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const createsampleTable = `
    CREATE TABLE IF NOT EXISTS sample (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      storagetemp VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quantity VARCHAR(255) NOT NULL,
      labname VARCHAR(255) NOT NULL,
      endTime DATETIME NOT NULL,
      logo VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

   

    // const createlabpendingTable = `
    // CREATE TABLE IF NOT EXISTS labpending (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   title VARCHAR(255) NOT NULL,
    //   email VARCHAR(255) NOT NULL,
    //   phone VARCHAR(255) NOT NULL,
    //   logo VARCHAR(255),
    //   status VARCHAR(255) DEFAULT 'pending',
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    // )`;

    // const createlabapprovedTable = `
    // CREATE TABLE IF NOT EXISTS labapproved (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   title VARCHAR(255) NOT NULL,
    //   email VARCHAR(255) NOT NULL,
    //   phone VARCHAR(255) NOT NULL,
    //   status VARCHAR(255) NOT NULL,
    //   logo VARCHAR(255),
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    // )`;

    // const createlabunapprovedTable = `
    // CREATE TABLE IF NOT EXISTS labunapproved (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   title VARCHAR(255) NOT NULL,
    //   email VARCHAR(255) NOT NULL,
    //   phone VARCHAR(255) NOT NULL,
    //   logo VARCHAR(255),
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    // )`;

    

    // const createcorporatependingTable = `
    // CREATE TABLE IF NOT EXISTS corporatepending (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   title VARCHAR(255) NOT NULL,
    //   email VARCHAR(255) NOT NULL,
    //   phone VARCHAR(255) NOT NULL,
    //   logo VARCHAR(255),
    //   status VARCHAR(255) DEFAULT 'pending',
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    // )`;

    // const createcorporateapprovedTable = `
    // CREATE TABLE IF NOT EXISTS corporateapproved (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   title VARCHAR(255) NOT NULL,
    //   email VARCHAR(255) NOT NULL,
    //   phone VARCHAR(255) NOT NULL,
    //   status VARCHAR(255) NOT NULL,
    //   logo VARCHAR(255),
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    // )`;

    // const createcorporateunapprovedTable = `
    // CREATE TABLE IF NOT EXISTS corporateunapproved (
    //   id INT AUTO_INCREMENT PRIMARY KEY,
    //   title VARCHAR(255) NOT NULL,
    //   email VARCHAR(255) NOT NULL,
    //   phone VARCHAR(255) NOT NULL,
    //   logo VARCHAR(255),
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    // )`;

    const createstaffTable = `
    CREATE TABLE IF NOT EXISTS staff (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255),
      phone VARCHAR(20),
      joiningDate DATE NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;


    // Query

    mysqlConnection.query(createuser_accountTable, (err, results) => {
      if (err) console.error("Error creating useraccount table: ", err);
      else console.log("useraccount table created or already exists");
   });

    mysqlConnection.query(researcherTable, (err, results) => {
        if (err) console.error("Error creating Researcher table: ", err);
        else console.log("Researcher table created or already exists");
    });

    mysqlConnection.query(organizationTable, (err, results) => {
        if (err) console.error("Error creating Organization table: ", err);
        else console.log("Crganization table created or already exists");
    });

    mysqlConnection.query(collectionsiteTable, (err, results) => {
        if (err) console.error("Error creating CollectionSites table: ", err);
        else console.log("CollectionSites table created or already exists");
    });

    mysqlConnection.query(committememberTable, (err, results) => {
       if (err) console.error("Error creating committemember table: ", err);
       else console.log("committemember table created or already exists");
    });

    mysqlConnection.query(createAdminSignupTable, (err, result) => {
        if (err) {
          console.error("Error creating admin_signup table:", err);
        } else {
          console.log("AdminSignup table created or already exists.");
        }
      });

    mysqlConnection.query(createsampleTable, (err, result) => {
        if (err) {
          console.error("Error creating sample table:", err);
        } else {
          console.log("Sample table created or already exists.");
        }
      });

  

    // mysqlConnection.query(createlabpendingTable, (err, result) => {
    //     if (err) {
    //       console.error("Error creating labpending table:", err);
    //     } else {
    //       console.log("labpending table created or already exists.");
    //     }
    //   });

    // mysqlConnection.query(createlabapprovedTable, (err, result) => {
    //     if (err) {
    //       console.error("Error creating labapproved table:", err);
    //     } else {
    //       console.log("labapproved table created or already exists.");
    //     }
    //   });

    // mysqlConnection.query(createlabunapprovedTable, (err, result) => {
    //     if (err) {
    //       console.error("Error creating labunapproved table:", err);
    //     } else {
    //       console.log("labunapproved table created or already exists.");
    //     }
    //   });


    // mysqlConnection.query(createcorporatependingTable, (err, result) => {
    //     if (err) {
    //       console.error("Error creating corporatepending table:", err);
    //     } else {
    //       console.log("corporatepending table created or already exists.");
    //     }
    //   });

    // mysqlConnection.query(createcorporateapprovedTable, (err, result) => {
    //     if (err) {
    //       console.error("Error creating corporateapproved table:", err);
    //     } else {
    //       console.log("corporateapproved table created or already exists.");
    //     }
    //   });

    // mysqlConnection.query(createcorporateunapprovedTable, (err, result) => {
    //     if (err) {
    //       console.error("Error creating corporateunapproved table:", err);
    //     } else {
    //       console.log("corporateunapproved table created or already exists.");
    //     }
    //   });

    mysqlConnection.query(createstaffTable, (err, result) => {
        if (err) {
          console.error("Error creating staff table:", err);
        } else {
          console.log("Staff table created or already exists.");
        }
      });
}

createTables();
