// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const mysqlConnection = require('./config/db');  // Updated import
const multer = require('multer');
const path = require('path');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for specific origins
app.use(cors());

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Fetch User Profile
app.get('/api/user-dashboard/profile/:id', (req, res) => {
  console.log('Profile fetch request:', req.params, req.query);
  const userId = req.params.id;
  const { accountType } = req.query; // Pass accountType as a query parameter

  if (!userId || !accountType) {
    console.log("Missing userId or accountType"); // Add this line to debug
    return res.status(400).json({ error: 'User ID and account type are required' });
  }

  let query = '';
  let values = [userId];

  // Determine the query based on the account type
  switch (accountType) {
    case 'Researcher':
      query = `SELECT ua.username, ua.email, r.phoneNumber, r.city, r.fullAddress 
               FROM user_account ua 
               JOIN researcher r ON ua.id = r.id 
               WHERE ua.id = ?`;
      break;

    case 'Organization':
      query = `SELECT ua.username, ua.email, o.phoneNumber, o.city, o.ntnNumber, o.fullAddress 
               FROM user_account ua 
               JOIN organization o ON ua.id = o.id 
               WHERE ua.id = ?`;
      break;

    case 'CollectionSites':
      query = `SELECT ua.username, ua.email, c.phoneNumber, c.city, c.ntnNumber,  c.fullAddress 
               FROM user_account ua 
               JOIN collectionsite c ON ua.id = c.id 
               WHERE ua.id = ?`;
      break;

    default:
      return res.status(400).json({ error: 'Invalid account type' });
  }

  // Execute the query to fetch user details
  mysqlConnection.query(query, values, (err, results) => {
    if (err) {
      console.error('Database Query Error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (results.length > 0) {
      res.status(200).json({ status: 'success', data: results[0] });
    } else {
      res.status(404).json({ status: 'fail', error: 'User not found' });
    }
  });
});


// User Sign Up
app.post('/api/user/signup', (req, res) => {
  const {
    accountType, username, email, password, confirmPassword, ResearcherName, OrganizationName, CollectionSiteName, phoneNumber, fullAddress, city, district, country, nameofOrganization, type, HECPMDCRegistrationNo, ntnNumber
  } = req.body;

  // Step 1: Check if the email already exists in the user_account table
  const checkEmailQuery = 'SELECT * FROM user_account WHERE email = ?';
  mysqlConnection.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Database Query Error (Check Email):', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Step 2: Insert into user_account table if email is unique
    const userAccountQuery = `
      INSERT INTO user_account (username, password, confirmPassword, email, accountType)
      VALUES (?, ?, ?, ?, ?)`;

    const userAccountValues = [username, password, confirmPassword, email, accountType];

    mysqlConnection.query(userAccountQuery, userAccountValues, (err, userAccountResults) => {
      if (err) {
        console.error('Database Query Error (Insert User Account):', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      // Step 3: Insert into respective table based on account type
      let query, values;

      switch (accountType) {
        case 'Researcher':
          query = 'INSERT INTO researcher (username, email, password, confirmPassword, accountType, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          values = [username, email, password, confirmPassword, accountType, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization];
          break;
        case 'Organization':
          query = 'INSERT INTO organization (username, email, password, confirmPassword, accountType, OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          values = [username, email, password, confirmPassword, accountType, OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country];
          break;
        case 'CollectionSites':
          query = 'INSERT INTO collectionsite (username, email, password, confirmPassword, accountType, CollectionSiteName, phoneNumber, ntnNumber, fullAddress, city, district, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          values = [username, email, password, confirmPassword, accountType, CollectionSiteName, phoneNumber, ntnNumber, fullAddress, city, district, country];
          break;
        default:
          return res.status(400).json({ error: 'Invalid account type' });
      }

      mysqlConnection.query(query, values, (err, results) => {
        if (err) {
          console.error('Database Query Error (Insert Account Type):', err);
          return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: results.insertId });
      });
    });
  });
});

// User Login Up
app.post("/api/user/login", (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) {
    return res.status(400).json({ status: "fail", error: "Email and password are required" });
  }

  // Query to find the user with matching email and password in any of the three tables
  const query = `
      SELECT 'researcher' AS accountType, id, username, email FROM researcher WHERE email = ? AND password = ?
      UNION
      SELECT 'collectionsite' AS accountType, id, username, email FROM collectionsite WHERE email = ? AND password = ?
      UNION
      SELECT 'organization' AS accountType, id, username, email FROM organization WHERE email = ? AND password = ?
      `;

  mysqlConnection.query(query, [email, password, email, password, email, password], (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ status: "fail", error: err.message });
    }

    if (results.length > 0) {
      const user = results[0];  // Assuming one user matches the credentials
      res.status(200).json({ status: "success", message: "Login successful", user });
    } else {
      res.status(401).json({ status: "fail", error: "Invalid email or password" });
    }
  });
});

// Update user profile
app.put('/api/user-dashboard/update-profile/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, city, ntn, address } = req.body;

  // Validate input data
  if (!name || !email || !phone || !city || !ntn || !address) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
    UPDATE user_account
    SET name = ?, email = ?, phone = ?, city = ?, ntn = ?, address = ?
    WHERE id = ?
  `;

  mysqlConnection.query(
    query,
    [name, email, phone, city, ntn, address, id],
    (err, result) => {
      if (err) {
        console.error('Error updating data in users table:', err);
        return res.status(500).json({ error: 'An error occurred' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ message: 'Profile updated successfully' });
    }
  );
});


// Change Password
app.put("/api/user/change-password", (req, res) => {
  const { email, password, newPassword } = req.body;

  // Check if all fields are provided
  if (!email || !password || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Query to find the user in the user_account table
  const findUserQuery = `SELECT * FROM user_account WHERE email = ?`;

  // Execute the query to find the user
  mysqlConnection.query(findUserQuery, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    // Log the retrieved user password for debugging
    console.log("Stored Password:", user.password); // Password in DB
    console.log("Current Password Input:", password); // Input password

    // Compare current password directly
    if (user.password !== password) {
      console.log("Password Match Result: false");
      return res.status(401).json({ message: "Incorrect current password" });
    }
    console.log("Password Match Result: true");

    // Queries to update the password in different tables
    const updateQueries = [
      {
        query: `UPDATE user_account SET password = ?, confirmPassword = ? WHERE email = ?`,
        params: [newPassword, newPassword, email]
      },
      {
        query: `UPDATE researcher SET password = ?, confirmpassword = ? WHERE email = ?`,
        params: [newPassword, newPassword, email] // Corrected this to match placeholders
      },
      {
        query: `UPDATE collectionsite SET password = ?, confirmpassword = ? WHERE email = ?`,
        params: [newPassword, newPassword, email] // Corrected this as well
      },
      {
        query: `UPDATE organization SET password = ?, confirmpassword = ? WHERE email = ?`,
        params: [newPassword, newPassword, email] // Corrected this too
      }
    ];

    // Execute the update queries sequentially
    let updatePromises = updateQueries.map(({ query, params }) => {
      return new Promise((resolve, reject) => {
        mysqlConnection.query(query, params, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });

    // Wait for all update queries to complete
    Promise.all(updatePromises)
      .then(() => {
        return res.status(200).json({ message: "Password updated successfully in all tables" });
      })
      .catch((err) => {
        console.error("Update Error:", err);
        return res.status(500).json({ message: "Failed to update password in some tables" });
      });
  });
});

// Admin SignUp
app.post("/api/admin/signup", (req, res) => {
  const { name, email, password } = req.body;

  // Check if all fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ status: "fail", error: "All fields are required" });
  }

  // Insert the admin into the database
  const query = "INSERT INTO admin_signup (name, email, password) VALUES (?, ?, ?)";
  mysqlConnection.query(query, [name, email, password], (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ status: "fail", error: err.message });
    }

    // Respond with success message
    res.status(201).json({ status: "success", message: "Admin registered successfully" });
  });
});

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) {
    return res.status(400).json({ status: "fail", error: "Email and password are required" });
  }

  // Query to find the user with matching email and password
  const query = "SELECT * FROM admin_signup WHERE email = ? AND password = ?";
  mysqlConnection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ status: "fail", error: err.message });
    }

    if (results.length > 0) {
      const user = results[0];
      res.status(200).json({ status: "success", message: "Login successful", user });
    } else {
      res.status(401).json({ status: "fail", error: "Invalid email or password" });
    }
  });
});

// Samples GET
app.get('/api/sample/get', (req, res) => {
  const query = 'SELECT * FROM sample';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from sample table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single Sample by ID
app.get('/api/sample/:id', (req, res) => {
  console.log('Received request for sample with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM sample WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching sample:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('Sample not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Sample POST
app.post('/api/samples/post', (req, res) => {
  const { title, storagetemp, labname, price, quantity, endTime, logo } = req.body;

  // Validate input data
  if (!title || !storagetemp || !labname || !price || !quantity || !endTime ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO sample (title, storagetemp, labname, price, quantity, endTime, logo)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, storagetemp, labname, price, quantity, endTime, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into sample table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'Sample created successfully', id: result.insertId });
  });
});

// Sample PUT
app.put('/api/samples/edit/:id', (req, res) => {
  const { id } = req.params;
  const { title, storagetemp, price, quantity, labname, endTime, logo } = req.body;

  // Validate input data
  if (!title || !storagetemp || !price || !quantity || !labname || !endTime) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Format endTime to 'YYYY-MM-DD HH:mm:ss' using moment
  const formattedEndTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss');

  const query = `
    UPDATE sample
    SET title = ?, storagetemp = ?, quantity = ?, price = ?, labname = ?, endTime = ?, logo = ?
    WHERE id = ?
  `;

  mysqlConnection.query(query, [title, storagetemp, price, quantity, labname, formattedEndTime, logo, id], (err, result) => {
    if (err) {
      console.error('Error updating data in sample table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.status(200).json({ message: 'Sample updated successfully' });
  });
});

// Sample Delete
app.delete('/api/samples/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'sample ID must be provided' });
  }

  const query = 'DELETE FROM sample WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from sample table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    res.status(200).json({ message: 'Sample deleted successfully' });
  });
});


// Researchers GET
app.get('/api/researcher/get', (req, res) => {
  const query = 'SELECT * FROM researcher';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from researcher table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single Researcher by ID
app.get('/api/researcher/:id', (req, res) => {
  console.log('Received request for researcher with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM researcher WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching researcher:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('Researcher not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'Researcher not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Researcher POST
app.post('/api/researchers/post', (req, res) => {
  const { username, email, gender, phoneNumber, fullAddress, country, logo } = req.body;

  // Validate input data
  if (!username || !email || !gender || !phoneNumber || !fullAddress || !country ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO researcher (username, email, gender, phoneNumber, fullAddress, country, logo)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;
  mysqlConnection.query(query, [username, email, gender, phoneNumber, fullAddress, country, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into researcher table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'Researcher created successfully', id: result.insertId });
  });
});

// Researcher PUT
app.put('/api/Researchers/edit/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, gender, phoneNumber, fullAddress, country, logo } = req.body;

  // Validate input data
  if (!username || !email || !gender || !phoneNumber || !fullAddress || !country ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Format endTime to 'YYYY-MM-DD HH:mm:ss' using moment
  // const formattedEndTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss');

  const query = `
    UPDATE researcher
    SET username = ?, email = ?, gender = ?, phoneNumber = ?, fullAddress = ?, country = ?, logo = ?
    WHERE id = ?
  `;

  mysqlConnection.query(query, [username, email, gender, phoneNumber, fullAddress, country, logo, id], (err, result) => {
    if (err) {
      console.error('Error updating data in researcher table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    res.status(200).json({ message: 'Researcher updated successfully' });
  });
});

// Researcher Delete
app.delete('/api/researchers/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'researcher ID must be provided' });
  }

  const query = 'DELETE FROM researcher WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from researcher table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    res.status(200).json({ message: 'Researcher deleted successfully' });
  });
});


// { Reasearcher-pending APIs}
app.get('/api/researcherpending/get', (req, res) => {
  const query = 'SELECT * FROM addresearcher WHERE status = "pending"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from addresearcher table:', err);
      return res.status(500).json({ error: 'An error occurred while fetching data' });
    }
    res.json(results);
  });
});

// Get a single researcherpending by ID
app.get('/api/researcherpending/:id', (req, res) => {
  const { id } = req.params;
  

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'Invalid ID passed' });
  }

  const query = 'SELECT * FROM addresearcher WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching Researcherpending:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Researcherpending not found' });
    }
    res.status(200).json(result[0]);
  });
});
// Researcherpending PUT
app.put('/api/researcherpending/edit/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, requiredsample, description, organizationname, status } = req.body;
  
    if (!name || !email || !phone || !requiredsample || !description || !organizationname || !status) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
  
    const query = `
      UPDATE addresearcher
      SET name = ?, email = ?, phone = ?, requiredsample = ?, description = ?, organizationname = ?, status = ?
      WHERE id = ?
    `;
  
    console.log('Executing query:', query);
    console.log('With parameters:', [name, email, phone, requiredsample, description, organizationname, status, id]);
  
    mysqlConnection.query(query, [name, email, phone, requiredsample, description, organizationname, status, id], (err, result) => {
      if (err) {
        console.error('Error updating data in addresearcher table:', err);
        return res.status(500).json({ error: 'An error occurred' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'addresearcher not found' });
      }
      res.status(200).json({ message: 'addresearcher updated successfully' });
    });
  });


// Researcher approved
app.get('/api/researcherapproved/get', (req, res) => {
  const query = 'SELECT * FROM addresearcher WHERE status = "approved"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from addresearcher table:', err);
      return res.status(500).json({ error: 'An error occurred while fetching data' });
    }
    res.json(results);
  });
});

// Get a single researcherapproved by ID
app.get('/api/researcherapproved/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id);

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'Invalid ID passed' });
  }

  const query = 'SELECT * FROM addresearcher WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching Add Researcher:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'AddResearcher not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Researcherapproved PUT
app.put('/api/researcherapproved/edit/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, requiredsample, description, organizationname, status } = req.body;
  
    if (!name || !email || !phone || !requiredsample || !description || !organizationname || !status) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
  
    const query = `
      UPDATE addresearcher
      SET name = ?, email = ?, phone = ?, requiredsample = ?, description = ?, organizationname = ?, status = ?
      WHERE id = ?
    `;
  
    console.log('Executing query:', query);
    console.log('With parameters:', [name, email, phone, requiredsample, description, organizationname, status, id]);
  
    mysqlConnection.query(query, [name, email, phone, requiredsample, description, organizationname, status, id], (err, result) => {
      if (err) {
        console.error('Error updating data in addresearcher table:', err);
        return res.status(500).json({ error: 'An error occurred' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'addresearcher not found' });
      }
      res.status(200).json({ message: 'addresearcher updated successfully' });
    });
  });


//  { Researcher-unpproved APIs}
app.get('/api/researcherunapproved/get', (req, res) => {
  const query = 'SELECT * FROM addresearcher WHERE status = "unapproved"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from addresearcher table:', err);
      return res.status(500).json({ error: 'An error occurred while fetching data' });
    }
    res.json(results);
  });
});

// Get a single researcherunapproved by ID
app.get('/api/researcherunapproved/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id);

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'Invalid ID passed' });
  }

  const query = 'SELECT * FROM addresearcher WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching Add Researcher:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'AddResearcher not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Researcherunapproved PUT
app.put('/api/researcherunapproved/edit/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, requiredsample, description, organizationname, status } = req.body;
  
    if (!name || !email || !phone || !requiredsample || !description || !organizationname || !status) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
  
    const query = `
      UPDATE addresearcher
      SET name = ?, email = ?, phone = ?, requiredsample = ?, description = ?, organizationname = ?, status = ?
      WHERE id = ?
    `;
  
    console.log('Executing query:', query);
    console.log('With parameters:', [name, email, phone, requiredsample, description, organizationname, status, id]);
  
    mysqlConnection.query(query, [name, email, phone, requiredsample, description, organizationname, status, id], (err, result) => {
      if (err) {
        console.error('Error updating data in addresearcher table:', err);
        return res.status(500).json({ error: 'An error occurred' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'addresearcher not found' });
      }
      res.status(200).json({ message: 'addresearcher updated successfully' });
    });
  });



// labpending GET
app.get('/api/labpending/get', (req, res) => {
  const query = 'SELECT * FROM addlab WHERE status = "pending"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from labpending table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single labpending by ID
app.get('/api/labpending/:id', (req, res) => {
  console.log('Received request for labpending with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM addlab WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching labpending:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('labpending not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'labpending not found' });
    }
    res.status(200).json(result[0]);
  });
});

// labpending POST
app.post('/api/labspending/post', (req, res) => {
  const { title, email, phone, logo } = req.body;

  // Validate input data
  if (!title || !email || !phone ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO labpending (title, email, phone, logo)
  VALUES (?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into labpending table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'labpending created successfully', id: result.insertId });
  });
});

// labpending PUT
app.put('/api/labspending/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE addlab SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating lab status:', err);
      return res.status(500).json({ error: 'An error occurred while updating lab status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'CollectionSites not found or no changes made' });
    }

    res.status(200).json({ message: 'CollectionSites status updated successfully' });
  });
});

// labpending Delete
app.delete('/api/labspending/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'labpending ID must be provided' });
  }

  const query = 'DELETE FROM labpending WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from labpending table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'labpending not found' });
    }

    res.status(200).json({ message: 'labpending deleted successfully' });
  });
});


// labapproved GET
app.get('/api/labapproved/get', (req, res) => {
  const query = 'SELECT * FROM addlab WHERE status = "approved"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from labapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single labapproved by ID
app.get('/api/labapproved/:id', (req, res) => {
  console.log('Received request for addlab with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM addlab WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching labapproved:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('labapproved not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'labapproved not found' });
    }
    res.status(200).json(result[0]);
  });
});

// labapproved POST
app.post('/api/labsapproved/post', (req, res) => {
  const { title, email, phone, logo } = req.body;

  // Validate input data
  if (!title || !email || !phone ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO labapproved (title, email, phone, logo)
  VALUES (?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into labapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'labapproved created successfully', id: result.insertId });
  });
});

// labsapproved PUT
app.put('/api/labsapproved/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE addlab SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating lab status:', err);
      return res.status(500).json({ error: 'An error occurred while updating lab status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'CollectionSites not found or no changes made' });
    }

    res.status(200).json({ message: 'CollectionSites status updated successfully' });
  });
});

// labapproved Delete
app.delete('/api/labsapproved/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'labapproved ID must be provided' });
  }

  const query = 'DELETE FROM labapproved WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from labapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'labapproved not found' });
    }

    res.status(200).json({ message: 'labapproved deleted successfully' });
  });
});

// labunapproved GET
app.get('/api/labunapproved/get', (req, res) => {
  const query = 'SELECT * FROM addlab WHERE status = "unapproved"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from labunapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single labunapproved by ID
app.get('/api/labunapproved/:id', (req, res) => {
  console.log('Received request for addlab with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM addlab WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching labunapproved:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('labunapproved not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'labunapproved not found' });
    }
    res.status(200).json(result[0]);
  });
});

// labunapproved POST
app.post('/api/labsunapproved/post', (req, res) => {
  const { title, email, phone, logo } = req.body;

  // Validate input data
  if (!title || !email || !phone ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO labunapproved (title, email, phone, logo)
  VALUES (?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into labunapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'labunapproved created successfully', id: result.insertId });
  });
});

// labsunapproved PUT
app.put('/api/labsunapproved/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE addlab SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating lab status:', err);
      return res.status(500).json({ error: 'An error occurred while updating lab status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'CollectionSites not found or no changes made' });
    }

    res.status(200).json({ message: 'CollectionSites status updated successfully' });
  });
});

// labunapproved Delete
app.delete('/api/labsunapproved/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'labunapproved ID must be provided' });
  }

  const query = 'DELETE FROM labunapproved WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from labunapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'labunapproved not found' });
    }

    res.status(200).json({ message: 'labunapproved deleted successfully' });
  });
});


// Collectionsite GET
app.get('/api/collectionsite/get', (req, res) => {
  const query = 'SELECT * FROM collectionsite';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from collectionsite table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Collectionsite PUT
app.put('/api/collectionsites/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE collectionsite SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating collectionsite status:', err);
      return res.status(500).json({ error: 'An error occurred while updating collectionsite status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'collectionsite not found or no changes made' });
    }

    res.status(200).json({ message: 'collectionsite status updated successfully' });
  });
});


// Collectionsitepending GET
app.get('/api/collectionsitepending/get', (req, res) => {
  const query = 'SELECT * FROM collectionsite WHERE status = "pending"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from collectionsitepending table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single collectionsitepending by ID
app.get('/api/collectionsitepending/:id', (req, res) => {
  console.log('Received request for collectionsitepending with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM collectionsite WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching collectionsitepending:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('collectionsitepending not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'collectionsitepending not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Collectionsitepending POST
app.post('/api/collectionsitespending/post', (req, res) => {
  const { title, email, phone, logo } = req.body;

  // Validate input data
  if (!title || !email || !phone ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO collectionsitepending (title, email, phone, logo)
  VALUES (?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into collectionsitepending table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'collectionsitepending created successfully', id: result.insertId });
  });
});

// Collectionsitepending PUT
app.put('/api/collectionsitespending/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE collectionsite SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating collectionsite status:', err);
      return res.status(500).json({ error: 'An error occurred while updating collectionsite status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'collectionsite not found or no changes made' });
    }

    res.status(200).json({ message: 'collectionsite status updated successfully' });
  });
});

// Collectionsitepending Delete
app.delete('/api/collectionsitespending/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'collectionsitepending ID must be provided' });
  }

  const query = 'DELETE FROM collectionsitepending WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from collectionsitepending table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'collectionsitepending not found' });
    }

    res.status(200).json({ message: 'collectionsitepending deleted successfully' });
  });
});


// collectionsiteapproved GET
app.get('/api/collectionsiteapproved/get', (req, res) => {
  const query = 'SELECT * FROM collectionsite WHERE status = "approved"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from collectionsiteapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single collectionsiteapproved by ID
app.get('/api/collectionsiteapproved/:id', (req, res) => {
  console.log('Received request for collectionsite with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM collectionsite WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching collectionsiteapproved:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('collectionsiteapproved not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'collectionsiteapproved not found' });
    }
    res.status(200).json(result[0]);
  });
});

// collectionsiteapproved POST
app.post('/api/collectionsitesapproved/post', (req, res) => {
  const { title, email, phone, logo } = req.body;

  // Validate input data
  if (!title || !email || !phone ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO collectionsiteapproved (title, email, phone, logo)
  VALUES (?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into collectionsiteapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'collectionsiteapproved created successfully', id: result.insertId });
  });
});

// collectionsitesapproved PUT
app.put('/api/collectionsitesapproved/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE collectionsite SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating collectionsite status:', err);
      return res.status(500).json({ error: 'An error occurred while updating collectionsite status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'collectionsite not found or no changes made' });
    }

    res.status(200).json({ message: 'collectionsite status updated successfully' });
  });
});

// collectionsiteapproved Delete
app.delete('/api/collectionsitesapproved/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'collectionsiteapproved ID must be provided' });
  }

  const query = 'DELETE FROM collectionsiteapproved WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from collectionsiteapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'collectionsiteapproved not found' });
    }

    res.status(200).json({ message: 'collectionsiteapproved deleted successfully' });
  });
});

// collectionsiteunapproved GET
app.get('/api/collectionsiteunapproved/get', (req, res) => {
  const query = 'SELECT * FROM collectionsite WHERE status = "unapproved"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from collectionsiteunapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single collectionsiteunapproved by ID
app.get('/api/collectionsiteunapproved/:id', (req, res) => {
  console.log('Received request for collectionsite with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM collectionsite WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching collectionsiteunapproved:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('collectionsiteunapproved not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'collectionsiteunapproved not found' });
    }
    res.status(200).json(result[0]);
  });
});

// collectionsiteunapproved POST
app.post('/api/collectionsitesunapproved/post', (req, res) => {
  const { title, email, phone, logo } = req.body;

  // Validate input data
  if (!title || !email || !phone ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO collectionsiteunapproved (title, email, phone, logo)
  VALUES (?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into collectionsiteunapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'collectionsiteunapproved created successfully', id: result.insertId });
  });
});

// collectionsitesunapproved PUT
app.put('/api/collectionsitesunapproved/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE collectionsite SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating collectionsite status:', err);
      return res.status(500).json({ error: 'An error occurred while updating collectionsite status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'collectionsite not found or no changes made' });
    }

    res.status(200).json({ message: 'collectionsite status updated successfully' });
  });
});

// collectionsiteunapproved Delete
app.delete('/api/collectionsitesunapproved/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'collectionsiteunapproved ID must be provided' });
  }

  const query = 'DELETE FROM collectionsiteunapproved WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from collectionsiteunapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'collectionsiteunapproved not found' });
    }

    res.status(200).json({ message: 'collectionsiteunapproved deleted successfully' });
  });
});




// Committemember GET
app.get('/api/committemember/get', (req, res) => {
  const query = 'SELECT * FROM committe_member';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from committemember table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Committe Member POST
app.post('/api/committeemembers/post', (req, res) => {
  const { CommitteMemberName, email, phoneNumber, cnic, fullAddress, city, district, country, organization } = req.body;

  // Validate input data
  if (!CommitteMemberName || !email || !phoneNumber || !cnic || !fullAddress || !city || !district || !country || !organization) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO committe_member (CommitteMemberName, email, phoneNumber, cnic, fullAddress, city, district, country, organization)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  mysqlConnection.query(query, [CommitteMemberName, email, phoneNumber, cnic, fullAddress, city, district, country, organization], (err, result) => {
    if (err) {
      console.error('Error inserting data into committe_member table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'Committee member created successfully', id: result.insertId });
  });
});

// Collectionsite PUT
app.put('/api/committemembers/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE committe_member SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating committemember status:', err);
      return res.status(500).json({ error: 'An error occurred while updating committemember status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'committemember not found or no changes made' });
    }

    res.status(200).json({ message: 'committemember status updated successfully' });
  });
});


// Staff GET
app.get('/api/staff/get', (req, res) => {
  const query = `
    SELECT id, name, email, phone, joiningDate, role
    FROM staff
  `;
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from staff table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No staff members found' });
    }

    res.status(200).json({ staff: results });
  });
});

// Get a single staff 
app.get('/api/staff/:id', (req, res) => {
  console.log('Received request for staff with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM staff WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching staff:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('Staff not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Staff POST
app.post('/api/staff/post', (req, res) => {
  const { name, email, password, phone, joiningDate, role } = req.body;

  // Validate input data
  if (!name || !email || !password || !phone || !joiningDate || !role) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO staff (name, email, password, phone, joiningDate, role)
  VALUES (?, ?, ?, ?, ?, ?)
  `;
  mysqlConnection.query(query, [name, email, password, phone, joiningDate, role], (err, result) => {
    if (err) {
      console.error('Error inserting data into staff table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'Staff member created successfully', id: result.insertId });
  });
});

// Staff PUT
app.put('/api/staff/edit/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, joiningDate, role } = req.body;

  // Validate input data
  if (!name || !email || !password || !phone || !joiningDate || !role) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
    UPDATE staff
    SET name = ?, email = ?, password = ?, phone = ?, joiningDate = ?, role = ?
    WHERE id = ?
  `;

  mysqlConnection.query(query, [name, email, password, phone, joiningDate, role, id], (err, result) => {
    if (err) {
      console.error('Error updating data in staff table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.status(200).json({ message: 'Staff updated successfully' });
  });
});

// Staff DELETE
app.delete('/api/staff/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received staff ID backend:', id);

  const query = `
    DELETE FROM staff
    WHERE id = ?
  `;

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from staff table:', err);
      return res.status(500).json({ error: 'An error occurred while deleting the staff member' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.status(200).json({ message: 'Staff member deleted successfully' });
  });
});







// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Destination folder for uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer with the defined storage
const upload = multer({ storage: storage });

// Route for uploading images
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  console.log('Received file:', req.file);  // Log file information
  res.send('File uploaded successfully!');
});




// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
