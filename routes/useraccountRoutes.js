const express = require('express');
const router = express.Router();
const UserAccountController = require('../controller/useraccountController');

router.put('/user/changepassword',UserAccountController.changepassword);
router.put('/user/changepassword', (req, res) => {
  
    res.send('Debugging endpoint reached');
});

  
module.exports = router;