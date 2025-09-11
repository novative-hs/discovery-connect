const express = require('express');
const router = express.Router();
const technicaladminsampleapproval=require("../controller/technicalapprovalController")

router.get('/getOrderbyTechnical',technicaladminsampleapproval.getOrderbyTechnical)
router.get('/getDocuments/:id',technicaladminsampleapproval.getDocuments)
router.get('/getHistory',technicaladminsampleapproval.getHistory)
router.put('/update-Technicalstatus',technicaladminsampleapproval.updateTechnicalAdminStatus)
module.exports = router;