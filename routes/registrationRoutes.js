const express = require('express');
const router = express.Router();
const multer = require('multer');
const registrationController = require("../controller/registrationController");
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post('/create-account-table', registrationController.createuser_accountTable);
router.post('/create-researcher-table', registrationController.create_researcherTable);
router.post('/create-organization-table', registrationController.create_organizationTable);
router.post('/create-collectionsite-table', registrationController.create_collectionsiteTable);
router.post('/signup', upload.single('logo'), registrationController.createAccount);
router.post('/login', registrationController.loginAccount);
router.get('/:id', registrationController.getUserEmail);

router.put('/changepassword',registrationController.changepassword);
router.put('/changepassword', (req, res) => {
    console.log('Request received at /user/changepassword:', req.body);
    res.send('Debugging endpoint reached');
});
module.exports = router;
