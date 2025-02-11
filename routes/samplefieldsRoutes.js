const express = require('express');
const router = express.Router();
const ethnicityController = require("../controller/samplefieldsController");
const sampleconditionController = require("../controller/samplefieldsController");
const storagetemperatureController = require("../controller/samplefieldsController");
const containertypeController = require("../controller/samplefieldsController");
const quantityunitController = require("../controller/samplefieldsController");
const sampletypematrixController = require("../controller/samplefieldsController");
const testmethodController = require("../controller/samplefieldsController");
const testresultunitController = require("../controller/samplefieldsController");
const concurrentmedicalconditionsController = require("../controller/samplefieldsController");
const testkitmanufacturerController = require("../controller/samplefieldsController");
const testsystemController = require("../controller/samplefieldsController");
const testsystemmanufacturerController = require("../controller/samplefieldsController");

                                                // ETHNICITY ROUTES
router.post('/create-ethnicity-table', ethnicityController.createEthnicityTable);
router.get('/get-ethnicity', ethnicityController.getAllEthnicity);
router.post('/post-ethnicity', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
}, ethnicityController.createEthnicity);
router.put('/put-ethnicity/:id', ethnicityController.updateEthnicity);
router.delete('/delete-ethnicity/:id', ethnicityController.deleteEthnicity);
router.get('/ethnicitynames', ethnicityController.getEthnicityNames);

                                                // SAMPLE CONDITION ROUTES
router.post('/create-samplecondition-table', sampleconditionController.createSampleCondition);
router.get('/get-samplecondition', sampleconditionController.getAllSampleCondition);
router.post('/post-samplecondition', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, sampleconditionController.createSampleCondition);
router.put('/put-samplecondition/:id', sampleconditionController.updateSampleCondition);
router.delete('/delete-samplecondition/:id', sampleconditionController.deleteSampleCondition);
router.get('/sampleconditionnames', sampleconditionController.getSampleConditionNames);

                                                // STORAGE TEMPERATURE ROUTES
router.post('/create-storagetemperature-table', storagetemperatureController.createStorageTemperature);
router.get('/get-storagetemperature', storagetemperatureController.getAllStorageTemperature);
router.post('/post-storagetemperature', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, storagetemperatureController.createStorageTemperature);
router.put('/put-storagetemperature/:id', storagetemperatureController.updateStorageTemperature);
router.delete('/delete-storagetemperature/:id', storagetemperatureController.deleteStorageTemperature);
router.get('/storagetemperaturenames', storagetemperatureController.getStorageTemperatureNames);

                                                // CONTAINER TYPE ROUTES
router.post('/create-containertype-table', containertypeController.createContainerTypeTable);
router.get('/get-containertype', containertypeController.getAllContainerType);
router.post('/post-containertype', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, containertypeController.createContainerType);
router.put('/put-containertype/:id', containertypeController.updateContainerType);
router.delete('/delete-containertype/:id', containertypeController.deleteContainerType);
router.get('/containertypenames', containertypeController.getContainerTypeNames);

                                                // QUANTITY UNIT ROUTES
router.post('/create-quantityunit-table', quantityunitController.createQuantityUnitTable);
router.get('/get-quantityunit', quantityunitController.getAllQuantityUnit);
router.post('/post-quantityunit', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, quantityunitController.createQuantityUnit);
router.put('/put-quantityunit/:id', quantityunitController.updateQuantityUnit);
router.delete('/delete-quantityunit/:id', quantityunitController.deleteQuantityUnit);
router.get('/quantityunitnames', quantityunitController.getQuantityUnitNames);

                                                // SAMPLE TYPE MATRIX ROUTES
router.post('/create-sampletypematrix-table', sampletypematrixController.createSampleTypeMatrixTable);
router.get('/get-sampletypematrix', sampletypematrixController.getAllSampleTypeMatrix);
router.post('/post-sampletypematrix', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, sampletypematrixController.createSampleTypeMatrix);
router.put('/put-sampletypematrix/:id', sampletypematrixController.updateSampleTypeMatrix);
router.delete('/delete-sampletypematrix/:id', sampletypematrixController.deleteSampleTypeMatrix);
router.get('/sampletypematrixnames', sampletypematrixController.getSampleTypeMatrixNames);

                                                // TEST METHOD ROUTES
router.post('/create-testmethod-table', testmethodController. createTestMethodTable);
router.get('/get-testmethod', testmethodController.getAllTestMethod);
router.post('/post-testmethod', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testmethodController.createTestMethod);
router.put('/put-testmethod/:id', testmethodController.updateTestMethod);
router.delete('/delete-testmethod/:id', testmethodController.deleteTestMethod);
router.get('/testmethodnames', testmethodController.getTestMethodNames);

                                                // TEST RESULT UNIT ROUTES
router.post('/create-testresultunit-table', testresultunitController.createTestResultUnitTable);
router.get('/get-testresultunit', testresultunitController.getAllTestResultUnit);
router.post('/post-testresultunit', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testresultunitController.createTestResultUnit);
router.put('/put-testresultunit/:id', testresultunitController.updateTestResultUnit);
router.delete('/delete-testresultunit/:id', testresultunitController.deleteTestResultUnit);
router.get('/testresultunitnames', testresultunitController.getTestResultUnitNames);

                                                // CONCURRENT MEDICAL CONDITIONS ROUTES
router.post('/create-concurrentmedicalconditions-table', concurrentmedicalconditionsController.createConcurrentMedicalConditionsTable);
router.get('/get-concurrentmedicalconditions', concurrentmedicalconditionsController.getAllConcurrentMedicalConditions);
router.post('/post-concurrentmedicalconditions', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, concurrentmedicalconditionsController.createConcurrentMedicalConditions);
router.put('/put-concurrentmedicalconditions/:id', concurrentmedicalconditionsController.updateConcurrentMedicalConditions);
router.delete('/delete-concurrentmedicalconditions/:id', concurrentmedicalconditionsController.deleteConcurrentMedicalConditions);
router.get('/concurrentmedicalconditionsnames', concurrentmedicalconditionsController.getConcurrentMedicalConditionsNames);

                                                // TEST KIT MANUFACTURER ROUTES
router.post('/create-testkitmanufacturer-table', testkitmanufacturerController.createTestKitManufacturerTable);
router.get('/get-testkitmanufacturer', testkitmanufacturerController.getAllTestKitManufacturer);
router.post('/post-testkitmanufacturer', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testkitmanufacturerController. createTestKitManufacturer);
router.put('/put-testkitmanufacturer/:id', testkitmanufacturerController.updateTestKitManufacturer);
router.delete('/delete-testkitmanufacturer/:id', testkitmanufacturerController.deleteTestKitManufacturer);
router.get('/testkitmanufacturernames', testkitmanufacturerController.getTestKitManufacturerNames);

                                                // TEST SYSTEM ROUTES
router.post('/create-testsystem-table', testsystemController.createTestSystemTable);
router.get('/get-testsystem', testsystemController.getAllTestSystem);
router.post('/post-testsystem', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testsystemController.createTestSystem);
router.put('/put-testsystem/:id', testsystemController.updateTestSystem);
router.delete('/delete-testsystem/:id', testsystemController.deleteTestSystem);
router.get('/testsystemnames', testsystemController.getTestSystemNames);

                                                // TEST SYSTEM MANUFACTURER ROUTES
router.post('/create-testsystemmanufacturer-table', testsystemmanufacturerController.createTestSystemManufacturerTable);
router.get('/get-testsystemmanufacturer', testsystemmanufacturerController.getAllTestSystemManufacturer);
router.post('/post-testsystemmanufacturer', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testsystemmanufacturerController.createTestSystemManufacturer);
router.put('/put-testsystemmanufacturer/:id', testsystemmanufacturerController.updateTestSystemManufacturer);
router.delete('/delete-testsystemmanufacturer/:id', testsystemmanufacturerController.deleteTestSystemManufacturer);
router.get('/testsystemmanufacturernames', testsystemmanufacturerController.getTestSystemManufacturerNames);


module.exports = router;
