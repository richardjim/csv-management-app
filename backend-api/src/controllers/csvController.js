const CSVService = require('../services/csvService');

const uploadFiles = async (req, res) => {
  try {
    const { stringsFile, classificationsFile } = req.files;

    if (!stringsFile || !classificationsFile) {
      return res.status(400).json({ error: 'Both strings and classifications files are required' });
    }

    const [stringsData, classificationsData] = await Promise.all([
      CSVService.parseCSV(stringsFile[0].path),
      CSVService.parseCSV(classificationsFile[0].path)
    ]);

    const validationErrors = await CSVService.validateStringsData(stringsData, classificationsData);

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
};

const validateData = async (req, res) => {
  try {
    const { stringsData, classificationsData } = req.body;

    if (!stringsData || !classificationsData) {
      return res.status(400).json({ error: 'Both data sets are required' });
    }

    const validationErrors = await CSVService.validateStringsData(stringsData, classificationsData);

    if (validationErrors.length > 0) {
      return res.status(400).json({ valid: false, errors: validationErrors });
    }

    res.json({ valid: true, errors: [] });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed', message: error.message });
  }
};

const exportCSV = async (req, res) => {
  try {
    const { stringsData, classificationsData, filename } = req.body;
    const dataType = filename.includes('strings') ? 'strings' : 'classifications';
    const data = dataType === 'strings' ? stringsData : classificationsData;

    const csvBuffer = await CSVService.generateCSVBuffer(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvBuffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed', message: error.message });
  }
};

module.exports = {
  uploadFiles,
  validateData,
  exportCSV
};
