const express = require('express');
const router = express.Router();
const diagnosistestparameterController=require('../controller/diagnosistestparameterController')

router.post('/post-diagnosis',diagnosistestparameterController.creatediagnosistestparameter)
router.get('/get-diagnosis',diagnosistestparameterController.getAlldiagnosisname)

router.put('/update-diagnosis/:id', diagnosistestparameterController.updateDagnosisname);
router.delete('/delete-diagnosis/:id',diagnosistestparameterController.deleteDagnosisname)

module.exports = router;