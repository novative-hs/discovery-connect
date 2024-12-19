// server.js
const express = require('express');
const mysqlConnection = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const researcherRoutes = require('./routes/researcherRoutes');
const committeememberRoutes = require('./routes/committeememberRoutes');
const sampleRoutes = require('./routes/sampleRoutes');
const sampleDispatchRoutes = require('./routes/sampledispatchRoutes');
const collectionSiteRoutes = require('./routes/collectionsiteRoutes');
const organizationRoutes = require("./routes/organizationRoutes");
const signupRoutes = require("./routes/signupRoutes");


const { fetchProducts, getProductById, } = require('./controller/productController');

// Enable CORS for all routes and origins
app.use(cors());
// Middleware setup 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


// Routes
app.use('/api', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.get('/api/products/show', fetchProducts);
app.get('/api/products/:id', getProductById);
app.use('/api', researcherRoutes);
app.use('/api/committeemember', committeememberRoutes);
app.use('/api', sampleRoutes);
app.use('/api/sampledispatch', sampleDispatchRoutes);
app.use('/api/collectionsite', collectionSiteRoutes);
app.use("/api/admin/organization", organizationRoutes);
app.use("/api/user", signupRoutes);


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
      query = `SELECT  ua.email, r.phoneNumber, r.city, r.fullAddress 
               FROM user_account ua 
               JOIN researcher r ON ua.id = r.id 
               WHERE ua.id = ?`;
      break;

    case 'Organization':
      query = `SELECT ua.email, o.phoneNumber, o.city, o.ntnNumber, o.fullAddress 
               FROM user_account ua 
               JOIN organization o ON ua.id = o.id 
               WHERE ua.id = ?`;
      break;

    case 'CollectionSites':
      query = `SELECT ua.email, c.phoneNumber, c.city, c.ntnNumber,  c.fullAddress 
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


// // User Sign Up (User Account)
// app.post('/api/user/signup', (req, res) => {
//   console.log(req.body);
//   const {
//     accountType, email, password, confirmPassword, ResearcherName, OrganizationName, CollectionSiteName, phoneNumber, fullAddress, city, district, country, nameofOrganization, type, HECPMDCRegistrationNo, ntnNumber
//   } = req.body;

//   // Insert into user_account table
//   const userAccountQuery = `
// INSERT INTO user_account ( email, password, confirmPassword, accountType)
// VALUES (?, ?, ?, ?)`;

//   const userAccountValues = [email, password, confirmPassword, accountType];

//   mysqlConnection.query(userAccountQuery, userAccountValues, (err, userAccountResults) => {
//     if (err) {
//       console.error('Database Query Error:', err);
//       return res.status(500).json({ error: 'Database query failed' });
//     }

//     // Capture the insertId of the user_account to use as user_account_id in related tables
//     const userAccountId = userAccountResults.insertId;

//     let query, values;

//     switch (accountType) {
//       case 'Researcher':
//         query = 'INSERT INTO researcher (user_account_id, email, password, confirmPassword, accountType, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
//         values = [userAccountId, email, password, confirmPassword, accountType, ResearcherName, phoneNumber, fullAddress, city, district, country, nameofOrganization];
//         break;
//       case 'Organization':
//         query = 'INSERT INTO organization (user_account_id, email, password, confirmPassword, accountType, OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
//         values = [userAccountId, email, password, confirmPassword, accountType, OrganizationName, type, HECPMDCRegistrationNo, ntnNumber, phoneNumber, fullAddress, city, district, country];
//         break;
//       case 'CollectionSites':
//         query = 'INSERT INTO collectionsite (user_account_id, email, password, confirmPassword, accountType, CollectionSiteName, phoneNumber, ntnNumber, fullAddress, city, district, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
//         values = [userAccountId, email, password, confirmPassword, accountType, CollectionSiteName, phoneNumber, ntnNumber, fullAddress, city, district, country];
//         break;
//       case 'registrationadmin':
//         query = 'INSERT INTO user_account ( email, password, confirmPassword, accountType) VALUES (?, ?, ?, ?)';
//         values = [ email, password, confirmPassword, accountType];
//         break;
//       default:

//         return res.status(400).json({ error: 'Invalid account type' });
//     }

//     mysqlConnection.query(query, values, (err, results) => {
//       if (err) {
//         console.error('Database Query Error:', err); // Log the full error
//         return res.status(500).json({ error: 'Database query failed' });
//       }
//       res.status(201).json({ message: 'User registered successfully', userId: results.insertId });
//     });
//   });
// })

// User Account delete
app.delete('/api/user_account/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Delete associated entries in researcher, organization, and collectionsite tables
    await mysqlConnection.query('DELETE FROM researcher WHERE user_account_id = ?', [userId]);
    await mysqlConnection.query('DELETE FROM organization WHERE user_account_id = ?', [userId]);
    await mysqlConnection.query('DELETE FROM collectionsite WHERE user_account_id = ?', [userId]);

    // Then, delete the user account
    await mysqlConnection.query('DELETE FROM user_account WHERE id = ?', [userId]);

    res.status(200).json({ message: 'User and associated entries deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account and associated entries:', error);
    res.status(500).json({ message: 'An error occurred while deleting user account and associated entries' });
  }
});

app.delete('/api/researcher/:id', async (req, res) => {
  const researcherId = req.params.id;

  try {
    // Delete the researcher entry (user_account entry will be automatically deleted)
    await mysqlConnection.query('DELETE FROM researcher WHERE id = ?', [researcherId]);

    res.status(200).json({ message: 'Researcher and corresponding user account deleted successfully' });
  } catch (error) {
    console.error('Error deleting researcher and user account:', error);
    res.status(500).json({ message: 'An error occurred while deleting researcher and user account' });
  }
});

// User Login
app.post("/api/user/login", (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) {
    return res.status(400).json({ status: "fail", error: "Email and password are required" });
  }

  // Query to find the user with matching email and password in any of the tables, including registrationadmin in user_account table
  const query = `
      SELECT 'researcher' AS accountType, id, email FROM researcher WHERE email = ? AND password = ?
      UNION
      SELECT 'collectionsite' AS accountType, id, email FROM collectionsite WHERE email = ? AND password = ?
      UNION
      SELECT 'organization' AS accountType, id, email FROM organization WHERE email = ? AND password = ?
      UNION
      SELECT 'registrationadmin' AS accountType, id, email FROM user_account WHERE email = ? AND password = ? AND accountType = 'registrationadmin'
      `;

  mysqlConnection.query(query, [email, password, email, password, email, password, email, password], (err, results) => {
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
