const express = require('express');
const router = express.Router();
const historyController = require("../controller/historyController");

router.get("/get-reg-history/:filterType/:id", historyController.getHistory);
// Get Sample History
router.get("/get-sample-history/:id", historyController.getSampleHistory);

module.exports = router;

