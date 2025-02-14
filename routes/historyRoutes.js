const express = require('express');
const router = express.Router();
const historyController = require("../controller/historyController");

router.get("/get-reg-history/:filterType/:id", historyController.getHistory);

module.exports = router;