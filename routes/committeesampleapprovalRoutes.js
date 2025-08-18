const express = require('express');
const router = express.Router();
const committesampleapprovalController = require("../controller/committeesampleapprovalController");

router.post('/transfertocommittee', committesampleapprovalController.createCommitteeSample); 
router.put("/bulk-committee-approval", committesampleapprovalController.updateCommitteeStatus);
router.get("/getHistory",committesampleapprovalController.getHistory)

module.exports = router;