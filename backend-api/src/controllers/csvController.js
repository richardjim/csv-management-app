const express = require('express');
const upload = require('../middleware/upload');
const CSVService = require('../services/csvService');
const ValidationUtils = require('../utils/validation');
const path = require('path');

const router = express.Router();

// Upload CSV files
router.post('/upload', upload.fields([
  { name: 'stringsFile', maxCount: 1 },
  { name: 'classificationsFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { stringsFile, classificationsFile } = req.files;

    if (!stringsFile || !classificationsFile) {
      return res.status(400).json({ 
        error: 'Both strings and classifications files are required' 
      });
    }

    // Parse CSV files
    const [stringsData, classificationsData] = await Promise.all([
      CSVService.parseCSV(stringsFile[0].path),
      CSVService.parseCSV(classificationsFile[0].path)
    ]);

    // Validate data integrity
    const validationErrors = await CSVService.validateStringsData(
      stringsData, 
      classificationsData
    );

    res.json({
      stringsData,
      classificationsData,
      validationErrors,
      files: {
        strings: stringsFile[0].filename,
        classifications: classificationsFile[0].filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process files', message: error.message });
  }
});

// Validate and save updated data
router.post('/validate', async (req, res) => {
  try {
    const { stringsData, classificationsData } = req.body;

    if (!stringsData || !classificationsData) {
      return res.status(400).json({ error: 'Both data sets are required' });
    }

    // Validate data integrity
    const validationErrors = await CSVService.validateStringsData(
      stringsData, 
      classificationsData
    );

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        valid: false, 
        errors: validationErrors 
      });
    }

    res.json({ valid: true, errors: [] });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed', message: error.message });
  }
});

// Export CSV files
router.post('/export', async (req, res) => {
  try {
    const { stringsData, classificationsData, filename } = req.body;
    const dataType = filename.includes('strings') ? 'strings' : 'classifications';
    const data = dataType === 'strings' ? stringsData : classificationsData;

    // Generate CSV buffer
    const csvBuffer = await CSVService.generateCSVBuffer(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvBuffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
});

module.exports = router;