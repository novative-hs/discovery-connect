const express = require('express');
const router = express.Router();
const committeememberController = require("../controller/committeememberController");


router.get('/create-committeemember-table', committeememberController.createCommitteeMemberTable);
router.get('/get', committeememberController.getAllCommitteeMembers);
router.post('/post', committeememberController.createCommitteeMember); 
router.put('/edit/:id', committeememberController.updateCommitteeMember);
router.put('/status/edit/:id', committeememberController.updateCommitteeMemberStatus);
router.put('/committeetype/edit/:id', committeememberController.updateCommitteeMemberType);
router.delete('/delete/:id', committeememberController.deleteCommitteeMember);
router.get("/orderhistory/:id", committeememberController.getCommitteeOrderHistory);

module.exports = router;
