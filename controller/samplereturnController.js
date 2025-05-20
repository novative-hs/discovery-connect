const mysqlConnection = require("../config/db");
const samplereturnModel=require('../models/sampleReturnModel')

const getSamples = (req, res) => {
  const { id } = req.params;
  const { searchField, searchValue } = req.query;

  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 50;

  samplereturnModel.getSamples(id, page, pageSize, searchField, searchValue, (err, result) => {
    if (err) {
      console.error('Error in model:', err);
      return res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
    }

    const { results: samples, totalCount, currentPage, pageSize: ps } = result;

    res.status(200).json({
      samples,
      totalPages: Math.ceil(totalCount / ps),
      currentPage,
      pageSize: ps,
      totalCount,
    });
  });
};

module.exports = {
getSamples
}