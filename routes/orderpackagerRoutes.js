const express = require("express");
const router = express.Router();
const orderpackagerController = require("../controller/orderpackagerController");
router.get("/get",orderpackagerController.getAllOrderpackager)
router.delete("/delete/:id",orderpackagerController.deleteOrderpackager)
router.put("/edit/:id",orderpackagerController.updateOrderpackagerStatus)
module.exports=router