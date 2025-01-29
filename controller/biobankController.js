const BioBankModel = require('../models/biobankModel');

const moment = require('moment');

// Controller to create a sample
const getBiobankSamples = (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }
  BioBankModel.getBiobankSamples(id, (err, results) => {
    if (err) {
      console.error('Error in model:', err);
      return res.status(500).json({ error: "Error fetching samples" });
    }
    res.status(200).json(results);
  });
};

module.exports = {
  getBiobankSamples,
  
};
