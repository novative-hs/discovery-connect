const cityModel = require("../models/newtablefields");

const createOrUpdateTables = (req, res) => {
  cityModel.createOrUpdateTables();
  res.status(200).json({ message: "City table creation process started" });
};
module.exports= {
    createOrUpdateTables
}