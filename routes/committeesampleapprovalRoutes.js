const express = require('express');
const router = express.Router();
const committesampleapprovalController = require("../controller/committeesampleapprovalController");

router.post('/transfertocommittee', committesampleapprovalController.createCommitteeSample); // Add product to cart
router.put("/:id/committee-approval", committesampleapprovalController.updateCommitteeStatus);


module.exports = router;