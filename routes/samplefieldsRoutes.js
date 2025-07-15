const express = require('express');
const router = express.Router();
const samplefieldsController = require("../controller/samplefieldsController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Set up destination folder for analyte images
const analyteImagePath = "public/assets/img/analytes";

if (!fs.existsSync(analyteImagePath)) {
  fs.mkdirSync(analyteImagePath, { recursive: true });
}

// ✅ Disk storage to save files physically
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, analyteImagePath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.get('/get-samplefields/:tableName', samplefieldsController.getAllSampleFields);
router.post('/post-samplefields/:tableName', (req, res, next) => {
    next();}, upload.fields([
        { name: 'image', maxCount: 1 },
    ]),samplefieldsController.createSampleFields);
    
router.post('/post-analytes/:tableName',
  upload.single('image'),
  samplefieldsController.createAnalyte
);

router.put(
  '/put-samplefields/:tableName/:id',
  upload.single('image'),
  samplefieldsController.updateSampleFields
);

router.delete('/delete-samplefields/:tableName/:id', samplefieldsController.deleteSampleFields);
router.get('/:tableName', samplefieldsController.getSampleFieldsNames);
router.get('/get/analyte',samplefieldsController.getAllAnalytes)

module.exports = router;
