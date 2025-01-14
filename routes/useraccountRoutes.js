const express = require('express');
const router = express.Router();
const UserAccountController = require('../controller/useraccountController');

router.put('/user/changepassword',UserAccountController.changepassword);
router.put('/user/changepassword', (req, res) => {
    console.log('Request received at /user/changepassword:', req.body);
    res.send('Debugging endpoint reached');
});

  
module.exports = router;