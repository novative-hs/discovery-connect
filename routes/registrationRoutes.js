const express = require('express');
const router = express.Router();
const multer = require('multer');
const registrationController = require("../controller/registrationController");
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post('/create-account-table', registrationController.createuser_accountTable);
router.post(
    '/signup',
    upload.fields([
      { name: 'CNIC', maxCount: 1 },
      { name: 'Org_card', maxCount: 1 },
      { name: 'logo', maxCount: 1 }, // <-- add this line
    ]),    
    registrationController.createAccount
  );
  
router.post('/login', registrationController.loginAccount);
router.get('/:id', registrationController.getUserEmail); 
router.post("/check-email", registrationController.getEmail); 
router.get('/getAccountDetail/:id', registrationController.getAccountDetail);
router.put('/updateProfile/:id', upload.single('logo'), registrationController.updateAccount);

router.put('/changepassword',registrationController.changepassword);
router.post("/send-otp",registrationController.sendOTP);
router.post("/verify-otp",registrationController.verifyOTP);
module.exports = router;