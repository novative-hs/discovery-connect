// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const mysqlConnection = require('./config/db');  // Updated import
const multer = require('multer');
const path = require('path');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS for all routes and origins
app.use(cors());
// Middleware setup
app.use(cors());
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
    accountType, username, email, password, confirmPassword, ResearcherName, OrganizationName, CollectionSiteName, phoneNumber, fullAddress, city,district, country, nameofOrganization, type, HECPMDCRegistrationNo, ntnNumber
  } = req.body;

// Insert into user_account table
const userAccountQuery = `
INSERT INTO user_account (username, password, confirmPassword, email, accountType)
VALUES (?, ?, ?, ?, ?)`;

const userAccountValues = [username, password, confirmPassword, email, accountType];

mysqlConnection.query(userAccountQuery, userAccountValues, (err, userAccountResults) => {
if (err) {
  console.error('Database Query Error:', err);
  return res.status(500).json({ error: 'Database query failed' });
}

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
      console.error('Database Query Error:', err); // Log the full error
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.status(201).json({ message: 'User registered successfully', userId: results.insertId });
  });
});
})

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
  const { title, age, gender, price, quantity, endTime, logo } = req.body;

  // Validate input data
  if (!title || !age || !gender || !price || !quantity || !endTime ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO sample (title, age, gender, price, quantity, endTime, logo)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, age, gender, price, quantity, endTime, logo], (err, result) => {
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
  const { title, age, gender, price, quantity, endTime, logo } = req.body;

  // Validate input data
  if (!title || !age || !gender || !price || !quantity || !endTime) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Format endTime to 'YYYY-MM-DD HH:mm:ss' using moment
  const formattedEndTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss');

  const query = `
    UPDATE sample
    SET title = ?, age = ?, gender = ?, price = ?, quantity = ?, endTime = ?, logo = ?
    WHERE id = ?
  `;

  mysqlConnection.query(query, [title, age, gender, price, quantity, formattedEndTime, logo, id], (err, result) => {
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

//  { Add Researcher }
app.get('/api/addresearcher/get', (req, res) => {
  const query = 'SELECT * FROM addresearcher';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from addresearcher table:', err);
      return res.status(500).json({ error: 'An error occurred while fetching data' });
    }
    res.json(results);
  });
});

app.post('/api/addresearcher/add', (req, res) => {
  console.log('Request body:', req.body); // Log the request body

  const { name, email, phone, requiredsample, description, organizationname } = req.body;

  // Check if all required fields are provided
  if (!name || !email ||! phone || !requiredsample || !description || !organizationname  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    INSERT INTO addresearcher (name, email, phone, requiredsample, description, organizationname)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  mysqlConnection.query(query, [name, email, phone, requiredsample, description, organizationname], (err, results) => {
    if (err) {
      // Check if the error is due to a duplicate email
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      console.error('Error inserting into addresearcher table:', err);
      return res.status(500).json({ error: 'An error occurred while adding the addresearcher' });
    }
    
    // Return success response with the new ID
    res.status(201).json({ message: 'Add Researcher added successfully', addresearcherId: results.insertId });
  });
});

// Get a single addresearcher by ID
app.get('/api/addresearcher/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id);

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'Invalid ID passed' });
  }

  const query = 'SELECT * FROM addresearcher WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching addresearcher:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'addresearcher not found' });
    }
    res.status(200).json(result[0]);
  });
});
// addresearcher PUT
app.put('/api/addresearcher/edit/:id', (req, res) => {
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

// addlab GET
app.get('/api/addlab/get', (req, res) => {
  const query = 'SELECT * FROM addlab';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from addlab table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single addlab by ID
app.get('/api/addlab/:id', (req, res) => {
  console.log('Received request for addlab with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM addlab WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching addlab:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('addlab not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'addlab not found' });
    }
    res.status(200).json(result[0]);
  });
});

// addlab POST
app.post('/api/addlabs/post', (req, res) => {
  const { title, email, phone, } = req.body;

  // Validate input data
  if (!title || !email || !phone  ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO addlab (title, email, phone)
  VALUES (?, ?, ?)
`;
  mysqlConnection.query(query, [title, email, phone], (err, result) => {
    if (err) {
      console.error('Error inserting data into addlab table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'addlab created successfully', id: result.insertId });
  });
});

// addlab PUT
app.put('/api/addlabs/edit/:id', (req, res) => {
  const { id } = req.params;
  const { title, email, phone, status } = req.body;

  // Validate input data
  if (!title || !email || !phone || !status ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  UPDATE addlab
  SET title = ?, email = ?, phone = ?, status= ?
  WHERE id = ?
`;

  mysqlConnection.query(query, [title, email, phone, status, id], (err, result) => {
    if (err) {
      console.error('Error updating data in addlab table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'addlab not found' });
    }
    res.status(200).json({ message: 'addlab updated successfully' });
  });
});

// addlab Delete
app.delete('/api/addlabs/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'addlab ID must be provided' });
  }

  const query = 'DELETE FROM addlab WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from addlab table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'addlab not found' });
    }

    res.status(200).json({ message: 'addlab deleted successfully' });
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
// app.post('/api/labspending/post', (req, res) => {
//   const { title, email, phone, logo } = req.body;

//   // Validate input data
//   if (!title || !email || !phone ) {
//     return res.status(400).json({ error: 'All required fields must be provided' });
//   }

//   const query = `
//   INSERT INTO labpending (title, email, phone, logo)
//   VALUES (?, ?, ?, ?)
// `;
//   mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
//     if (err) {
//       console.error('Error inserting data into labpending table:', err);
//       return res.status(500).json({ error: 'An error occurred' });
//     }
//     res.status(201).json({ message: 'labpending created successfully', id: result.insertId });
//   });
// });

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
// app.post('/api/labsapproved/post', (req, res) => {
//   const { title, email, phone, logo } = req.body;

//   // Validate input data
//   if (!title || !email || !phone ) {
//     return res.status(400).json({ error: 'All required fields must be provided' });
//   }

//   const query = `
//   INSERT INTO labapproved (title, email, phone, logo)
//   VALUES (?, ?, ?, ?)
// `;
//   mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
//     if (err) {
//       console.error('Error inserting data into labapproved table:', err);
//       return res.status(500).json({ error: 'An error occurred' });
//     }
//     res.status(201).json({ message: 'labapproved created successfully', id: result.insertId });
//   });
// });

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
// app.post('/api/labsunapproved/post', (req, res) => {
//   const { title, email, phone, logo } = req.body;

//   // Validate input data
//   if (!title || !email || !phone ) {
//     return res.status(400).json({ error: 'All required fields must be provided' });
//   }

//   const query = `
//   INSERT INTO labunapproved (title, email, phone, logo)
//   VALUES (?, ?, ?, ?)
// `;
//   mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
//     if (err) {
//       console.error('Error inserting data into labunapproved table:', err);
//       return res.status(500).json({ error: 'An error occurred' });
//     }
//     res.status(201).json({ message: 'labunapproved created successfully', id: result.insertId });
//   });
// });

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


// addinstitute GET
app.get('/api/addinstitute/get', (req, res) => {
  const query = 'SELECT * FROM addinstitute';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from addinstitute table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single addinstitute by ID
app.get('/api/addinstitute/:id', (req, res) => {
  console.log('Received request for addinstitute with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM addinstitute WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching addinstitute:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('addinstitute not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'addinstitute not found' });
    }
    res.status(200).json(result[0]);
  });
});

// addinstitute POST
app.post('/api/addinstitutes/post', (req, res) => {
  const { title, email, phone, logo } = req.body;

  // Validate input data
  if (!title || !email || !phone ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  INSERT INTO addinstitute (title, email, phone, logo)
  VALUES (?, ?, ?, ?)
`;
  mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
    if (err) {
      console.error('Error inserting data into addinstitute table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(201).json({ message: 'addinstitute created successfully', id: result.insertId });
  });
});

// addinstitute PUT
app.put('/api/addinstitutes/edit/:id', (req, res) => {
  const { id } = req.params;
  const { title, email, phone, status } = req.body;

  // Validate input data
  if (!title || !email || !phone || !status ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const query = `
  UPDATE addinstitute
  SET title = ?, email = ?, phone = ?, status= ?
  WHERE id = ?
`;

  mysqlConnection.query(query, [title, email, phone, status, id], (err, result) => {
    if (err) {
      console.error('Error updating data in addinstitute table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'addinstitute not found' });
    }
    res.status(200).json({ message: 'addinstitute updated successfully' });
  });
});

// addinstitute Delete
app.delete('/api/addinstitutes/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'addinstitute ID must be provided' });
  }

  const query = 'DELETE FROM addinstitute WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from addinstitute table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'addinstitute not found' });
    }

    res.status(200).json({ message: 'addinstitute deleted successfully' });
  });
});


// institutepending GET
app.get('/api/institutepending/get', (req, res) => {
  const query = 'SELECT * FROM addinstitute WHERE status = "pending"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from institutepending table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single institutepending by ID
app.get('/api/institutepending/:id', (req, res) => {
  console.log('Received request for institutepending with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM addinstitute WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching institutepending:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('institutepending not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'institutepending not found' });
    }
    res.status(200).json(result[0]);
  });
});

// institutepending POST
// app.post('/api/institutespending/post', (req, res) => {
//   const { title, email, phone, logo } = req.body;

//   // Validate input data
//   if (!title || !email || !phone ) {
//     return res.status(400).json({ error: 'All required fields must be provided' });
//   }

//   const query = `
//   INSERT INTO institutepending (title, email, phone, logo)
//   VALUES (?, ?, ?, ?)
// `;
//   mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
//     if (err) {
//       console.error('Error inserting data into institutepending table:', err);
//       return res.status(500).json({ error: 'An error occurred' });
//     }
//     res.status(201).json({ message: 'institutepending created successfully', id: result.insertId });
//   });
// });

// institutepending PUT
app.put('/api/institutespending/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE addinstitute SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating institute status:', err);
      return res.status(500).json({ error: 'An error occurred while updating institute status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'institute not found or no changes made' });
    }

    res.status(200).json({ message: 'institute status updated successfully' });
  });
});

// institutepending Delete
app.delete('/api/institutespending/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'institutepending ID must be provided' });
  }

  const query = 'DELETE FROM institutepending WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from institutepending table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'institutepending not found' });
    }

    res.status(200).json({ message: 'institutepending deleted successfully' });
  });
});


// instituteapproved GET
app.get('/api/instituteapproved/get', (req, res) => {
  const query = 'SELECT * FROM addinstitute WHERE status = "approved"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from instituteapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single instituteapproved by ID
app.get('/api/instituteapproved/:id', (req, res) => {
  console.log('Received request for addinstitute with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM addinstitute WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching instituteapproved:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('instituteapproved not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'instituteapproved not found' });
    }
    res.status(200).json(result[0]);
  });
});

// instituteapproved POST
// app.post('/api/institutesapproved/post', (req, res) => {
//   const { title, email, phone, logo } = req.body;

//   // Validate input data
//   if (!title || !email || !phone ) {
//     return res.status(400).json({ error: 'All required fields must be provided' });
//   }

//   const query = `
//   INSERT INTO instituteapproved (title, email, phone, logo)
//   VALUES (?, ?, ?, ?)
// `;
//   mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
//     if (err) {
//       console.error('Error inserting data into instituteapproved table:', err);
//       return res.status(500).json({ error: 'An error occurred' });
//     }
//     res.status(201).json({ message: 'instituteapproved created successfully', id: result.insertId });
//   });
// });

// institutesapproved PUT
app.put('/api/institutesapproved/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE addinstitute SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating institute status:', err);
      return res.status(500).json({ error: 'An error occurred while updating institute status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'institute not found or no changes made' });
    }

    res.status(200).json({ message: 'institute status updated successfully' });
  });
});

// instituteapproved Delete
app.delete('/api/institutesapproved/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'instituteapproved ID must be provided' });
  }

  const query = 'DELETE FROM instituteapproved WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from instituteapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'instituteapproved not found' });
    }

    res.status(200).json({ message: 'instituteapproved deleted successfully' });
  });
});

// instituteunapproved GET
app.get('/api/instituteunapproved/get', (req, res) => {
  const query = 'SELECT * FROM addinstitute WHERE status = "unapproved"';
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from instituteunapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
});

// Get a single instituteunapproved by ID
app.get('/api/instituteunapproved/:id', (req, res) => {
  console.log('Received request for addinstitute with ID:', req.params.id); // Debugging line
  const { id } = req.params;
  const query = 'SELECT * FROM addinstitute WHERE id = ?';
  
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching instituteunapproved:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.length === 0) {
      console.log('instituteunapproved not found for ID:', id); // Debugging line
      return res.status(404).json({ error: 'instituteunapproved not found' });
    }
    res.status(200).json(result[0]);
  });
});

// instituteunapproved POST
// app.post('/api/institutesunapproved/post', (req, res) => {
//   const { title, email, phone, logo } = req.body;

//   // Validate input data
//   if (!title || !email || !phone ) {
//     return res.status(400).json({ error: 'All required fields must be provided' });
//   }

//   const query = `
//   INSERT INTO instituteunapproved (title, email, phone, logo)
//   VALUES (?, ?, ?, ?)
// `;
//   mysqlConnection.query(query, [title, email, phone, logo], (err, result) => {
//     if (err) {
//       console.error('Error inserting data into instituteunapproved table:', err);
//       return res.status(500).json({ error: 'An error occurred' });
//     }
//     res.status(201).json({ message: 'instituteunapproved created successfully', id: result.insertId });
//   });
// });

// institutesunapproved PUT
app.put('/api/institutesunapproved/edit/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if status is provided in the request body
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update query to change the status based on the lab ID
  const query = 'UPDATE addinstitute SET status = ? WHERE id = ?';

  mysqlConnection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating institute status:', err);
      return res.status(500).json({ error: 'An error occurred while updating institute status' });
    }

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'institute not found or no changes made' });
    }

    res.status(200).json({ message: 'institute status updated successfully' });
  });
});

// instituteunapproved Delete
app.delete('/api/institutesunapproved/delete/:id', (req, res) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Debugging line

  if (!id) {
    return res.status(400).json({ error: 'instituteunapproved ID must be provided' });
  }

  const query = 'DELETE FROM instituteunapproved WHERE id = ?';

  mysqlConnection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from instituteunapproved table:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'instituteunapproved not found' });
    }

    res.status(200).json({ message: 'instituteunapproved deleted successfully' });
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
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
