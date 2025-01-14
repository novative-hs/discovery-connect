const express = require('express');
const router = express.Router();
const committeememberController = require("../controller/committeememberController");

// Route for creating the committee_member table
router.get('/create-committeemember-table', committeememberController.createCommitteeMemberTable);

// Route to get all committee members
router.get('/get', committeememberController.getAllCommitteeMembers);

// Route to create a new committee member
router.post('/post', committeememberController.createCommitteeMember);

// Route to update an existing committee member
router.put('/edit/:id', committeememberController.updateCommitteeMember);

// Route to update a committee member's status
router.put('/status/edit/:id', committeememberController.updateCommitteeMemberStatus);

// Route to update a committee member's type
router.put('/committeetype/edit/:id', committeememberController.updateCommitteeMemberType);

// Route to delete a committee member
router.delete('/delete/:id', committeememberController.deleteCommitteeMember);

module.exports = router;
