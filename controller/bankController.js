const bankModel = require("../models/bankModel");


// Controller to get all committee members
const getAllBank = (req, res) => {
 bankModel.getAllBank((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Bank list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a committee member
const createBank = (req, res) => {
    const newBankData = req.body;
  
    // Pass the newCityData directly to the model
    bankModel.createBank(newBankData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error creating Bank" });
      }
      res.status(201).json({ message: "Bank added successfully", id: result.insertId });
    });
};

const updateBank = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  bankModel.updateBank(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating bank" });
    }
    res.status(200).json({ message: "Bank updated successfully" });
  });
};


// Controller to delete a committee member
const deleteBank = (req, res) => {
  const { id } = req.params;
  bankModel.deleteBank(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting bank" });
    }
    res.status(200).json({ message: "Bank deleted successfully" });
  });
};

module.exports = {
  getAllBank,
  createBank,
  updateBank,
  deleteBank,
};
