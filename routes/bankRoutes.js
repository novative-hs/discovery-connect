const express = require('express');
const router = express.Router();
const bankController=require('../controller/bankController')

router.post('/create-bank',bankController.createBank)

router.get('/get-bank',bankController.getAllBank)

router.put('/update-bank/:id',bankController.updateBank)

router.delete('/delete-bank',bankController.deleteBank)
module.exports = router;