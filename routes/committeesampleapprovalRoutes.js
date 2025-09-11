const express = require('express');
const router = express.Router();
const committesampleapprovalController = require("../controller/committeesampleapprovalController");

router.post('/transfertocommittee', committesampleapprovalController.createCommitteeSample); 
router.put("/bulk-committee-approval", committesampleapprovalController.updateCommitteeStatus);
router.get('/getOrderbyCommittee/:id',committesampleapprovalController.getAllOrderByCommittee)
router.get('/getAllDocuments/:id',committesampleapprovalController.getAllDocuments)
module.exports = router;