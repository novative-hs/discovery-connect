const express = require("express");
const router = express.Router();
const CSRController = require("../controller/CSRController");
router.get("/get",CSRController.getAllCSR)
router.delete("/delete/:id",CSRController.deleteCSR)
router.put("/edit/:id",CSRController.updateCSRStatus)
module.exports=router