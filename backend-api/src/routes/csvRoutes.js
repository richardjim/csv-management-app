const express = require('express');
const upload = require('../middleware/upload');
const csvController = require('../controllers/csvController');

const router = express.Router();

router.post(
  '/upload',
  upload.fields([
    { name: 'stringsFile', maxCount: 1 },
    { name: 'classificationsFile', maxCount: 1 }
  ]),
  csvController.uploadFiles
);

router.post('/validate', csvController.validateData);

router.post('/export', csvController.exportCSV);

module.exports = router;
