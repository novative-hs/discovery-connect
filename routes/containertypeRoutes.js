const express = require('express');
const router = express.Router();
const containertypeController = require("../controller/containertypeController");

// Route for creating the container type table
router.post('/create-containertype-table', containertypeController.createContainerTypeTable);

// Route to get all container type
router.get('/get-containertype', containertypeController.getAllContainerType);

// Route to create a new containertype
router.post('/post-containertype', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, containertypeController.createContainerType);

// Route to update an existing containertype 
router.put('/put-containertype/:id', containertypeController.updateContainerType);
// Route to delete a containertype
router.delete('/delete-containertype/:id', containertypeController.deleteContainerType);

module.exports = router;
