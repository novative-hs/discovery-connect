const historyModel = require("../models/historyModel");


// Controller for creating the registration admin history
const registrationadmin_history = (req, res) => {
  historyModel.registrationadmin_history();
  res.status(200).json({ message: "Registration Admin Historytable creation process started" });
};

// Controller to get all History
const getHistory = (req, res) => {
  const { filterType, id } = req.params; // Get filter type and ID from URL params

  if (!filterType || !id) {
      return res.status(400).json({ error: "Filter type and ID are required" });
  }

  historyModel.getHistory(filterType, id, (err, results) => {
      if (err) {
          return res.status(500).json({ error: "Error fetching History" });
      }
      res.status(200).json(results);
  });
};

const create_historyTable = (req, res) => {
  historyModel.create_historyTable();
  res.status(200).json({ message: "History table creation process started" });
};

// Controller to get all History
const getSampleHistory = (req, res) => {
  const { id } = req.params; // Get the sample_id from URL

  historyModel.getSampleHistory(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching history" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No history found for this sample" });
    }
    res.status(200).json(results);
  });
};


module.exports = {
  registrationadmin_history,
  getHistory,
  create_historyTable,
  getSampleHistory
};
