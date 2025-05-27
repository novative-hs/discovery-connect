const express = require('express');
const router = express.Router();
const infectiousdiseasetestingController=require('../controller/infectiousdiseasetestingController');


router.get('/get-infectiousdisease',infectiousdiseasetestingController.getAllinfectiousdisease);
router.post('/post-infectiousdisease',infectiousdiseasetestingController.createinfectiousdisease);
router.put('/put-infectiousdisease/:id',infectiousdiseasetestingController.updateinfectiousdisease);
router.delete('/delete-infectiousdisease/:id',infectiousdiseasetestingController.deleteinfectiousdisease)
module.exports = router;