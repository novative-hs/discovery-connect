const express = require('express');
const router = express.Router();
const multer = require('multer');
const collectionsitestaffController=require("../controller/collectionsitestaffController")

router.post('/createcollectionsitestaff',collectionsitestaffController.createCollectionsiteStaff)
router.get('/get',collectionsitestaffController.getAllCollectionsitestaff)
router.put('/edit/:id',collectionsitestaffController.updateCollectonsiteStaffStatus)
router.put('/updatedetail/:id',collectionsitestaffController.updateCollectonsiteStaffDetail)
module.exports = router;