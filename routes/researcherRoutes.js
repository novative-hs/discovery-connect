// routes/researcherRoutes.js
const express = require('express');
const router = express.Router();
const researcherController = require('../controller/researcherController');

router.post('/create-researcher-table', researcherController.create_researcherTable);

router.post('/researcher/post', researcherController.createResearcher);
router.get('/researcher/get/:id', researcherController.getResearchersByOrganization);
router.get('/researcher/get', researcherController.getAllResearchers);
router.get('/researchers/:id', researcherController.getResearcherById);
// router.put('/researchers/edit/:id', researcherController.updateResearcher);
router.delete('/researchers/delete/:id', researcherController.deleteResearcher);

// technical Admin
router.get('/admin/researcher/get', researcherController.getResearchersAdmin);
router.put('/admin/researchers/edit/:id', researcherController.updateResearcherStatus);


module.exports = router;
