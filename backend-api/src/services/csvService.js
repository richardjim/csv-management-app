const fs = require('fs').promises;
const csv = require('csv-parser');
const { createReadStream } = require('fs');
const { format } = require('fast-csv');
const path = require('path');

class CSVService {
  static async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      createReadStream(filePath)
        .pipe(csv({
          skipEmptyLines: true,
          headers: (headers) => headers.map(h => h.trim())
        }))
        .on('data', (data) => {
          // Clean up data and handle empty values
          const cleanData = {};
          Object.keys(data).forEach(key => {
            cleanData[key] = data[key] ? data[key].toString().trim() : '';
          });
          results.push(cleanData);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  static async writeCSV(data, filePath) {
    return new Promise((resolve, reject) => {
      const writeStream = require('fs').createWriteStream(filePath);
      
      if (!data || data.length === 0) {
        reject(new Error('No data to write'));
        return;
      }

      const csvStream = format({ headers: true });
      
      csvStream.pipe(writeStream)
        .on('finish', () => resolve(filePath))
        .on('error', reject);

      data.forEach(row => csvStream.write(row));
      csvStream.end();
    });
  }

  static async validateStringsData(stringsData, classificationsData) {
    const validationErrors = [];
    
    // Create a lookup set for valid combinations
    const validCombinations = new Set();
    classificationsData.forEach(row => {
      const key = `${row.Topic}-${row.SubTopic}-${row.Industry}`.toLowerCase();
      validCombinations.add(key);
    });

    stringsData.forEach((row, index) => {
      const key = `${row.Topic}-${row.Subtopic}-${row.Industry}`.toLowerCase();
      
      if (!validCombinations.has(key)) {
        validationErrors.push({
          row: index + 1,
          topic: row.Topic,
          subtopic: row.Subtopic,
          industry: row.Industry,
          message: `Invalid combination: Topic "${row.Topic}", Subtopic "${row.Subtopic}", Industry "${row.Industry}" not found in classifications`
        });
      }
    });

    return validationErrors;
  }

  static generateCSVBuffer(data) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const csvStream = format({ headers: true });
      
      csvStream.on('data', chunk => chunks.push(chunk));
      csvStream.on('end', () => resolve(Buffer.concat(chunks)));
      csvStream.on('error', reject);
      
      data.forEach(row => csvStream.write(row));
      csvStream.end();
    });
  }
}

module.exports = CSVService;