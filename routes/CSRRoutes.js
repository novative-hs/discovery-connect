const express = require("express");
const router = express.Router();
const CSRController = require("../controller/CSRController");
const collectionsiteController=require("../controller/collectionsiteController")
router.post('/create-csr-table', CSRController.create_CSRTable);
// Register CSR through registration admin dashboard
router.post('/createcsr', CSRController.createCSR);
router.get("/get",CSRController.getAllCSR)
router.delete("/delete/:id",CSRController.deleteCSR)
router.put("/edit/:id",CSRController.updateCSRStatus)
router.get('/getCollectionsiteName',collectionsiteController.getAllCollectionSiteNamesInCSR)
module.exports=router