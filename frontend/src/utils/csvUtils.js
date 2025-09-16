/**
 * CSV Utility Functions for Frontend Processing
 */

// Constants for CSV validation
export const STRINGS_REQUIRED_FIELDS = [
  'Tier', 'Industry', 'Topic', 'Subtopic', 'Prefix', 
  'Fuzzing-Idx', 'Prompt', 'Risks', 'Keywords'
];

export const CLASSIFICATIONS_REQUIRED_FIELDS = [
  'Topic', 'SubTopic', 'Industry', 'Classification'
];

/**
 * Validate CSV data against required fields
 * @param {Array} data - Array of CSV row objects
 * @param {Array} requiredFields - Array of required field names
 * @returns {Array} Array of validation errors
 */
export const validateCSVData = (data, requiredFields = []) => {
  const errors = [];
  
  if (!data || !Array.isArray(data)) {
    return [{ message: 'Invalid data format' }];
  }

  if (data.length === 0) {
    return [{ message: 'No data to validate' }];
  }

  // Check if all required fields exist in the data
  const dataFields = Object.keys(data[0] || {});
  const missingFields = requiredFields.filter(field => !dataFields.includes(field));
  
  if (missingFields.length > 0) {
    errors.push({
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  // Validate each row
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      const value = row[field];
      if (!value || value.toString().trim() === '') {
        errors.push({
          row: index + 1,
          field,
          message: `${field} is required in row ${index + 1}`
        });
      }
    });
  });
  
  return errors;
};

/**
 * Normalize CSV headers to handle variations in naming
 * @param {Array} headers - Array of header strings
 * @returns {Array} Array of normalized headers
 */
export const normalizeCSVHeaders = (headers) => {
  const headerMap = {
    'tier': 'Tier',
    'industry': 'Industry',
    'topic': 'Topic',
    'subtopic': 'Subtopic',
    'sub-topic': 'SubTopic',
    'sub_topic': 'SubTopic',
    'prefix': 'Prefix',
    'fuzzing-idx': 'Fuzzing-Idx',
    'fuzzingidx': 'Fuzzing-Idx',
    'fuzzing_idx': 'Fuzzing-Idx',
    'prompt': 'Prompt',
    'risks': 'Risks',
    'keywords': 'Keywords',
    'classification': 'Classification'
  };

  return headers.map(header => {
    const trimmed = header.trim();
    const normalized = trimmed.toLowerCase().replace(/\s+/g, '-');
    return headerMap[normalized] || trimmed;
  });
};

/**
 * Download CSV data as a file
 * @param {Array} data - Array of data objects
 * @param {string} filename - Name for the downloaded file
 */
export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) {
    throw new Error('No data to download');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = (row[header] || '').toString();
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Parse CSV text content into array of objects
 * @param {string} csvText - Raw CSV text
 * @param {Object} options - Parsing options
 * @returns {Array} Array of data objects
 */
export const parseCSVText = (csvText, options = {}) => {
  const {
    delimiter = ',',
    skipEmptyLines = true,
    trimValues = true
  } = options;

  if (!csvText || typeof csvText !== 'string') {
    return [];
  }

  const lines = csvText.split('\n');
  if (lines.length === 0) return [];

  // Parse headers
  const headers = lines[0].split(delimiter).map(header => 
    trimValues ? header.trim().replace(/^"(.*)"$/, '$1') : header
  );

  const normalizedHeaders = normalizeCSVHeaders(headers);
  const data = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (skipEmptyLines && !line.trim()) {
      continue;
    }

    const values = parseCSVLine(line, delimiter);
    
    if (values.length === 0) continue;

    const row = {};
    normalizedHeaders.forEach((header, index) => {
      const value = values[index] || '';
      row[header] = trimValues ? value.trim() : value;
    });

    data.push(row);
  }

  return data;
};

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line to parse
 * @param {string} delimiter - Field delimiter
 * @returns {Array} Array of field values
 */
const parseCSVLine = (line, delimiter = ',') => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
};

/**
 * Validate data integrity between strings and classifications
 * @param {Array} stringsData - Strings CSV data
 * @param {Array} classificationsData - Classifications CSV data
 * @returns {Array} Array of validation errors
 */
export const validateDataIntegrity = (stringsData, classificationsData) => {
  const errors = [];
  
  if (!stringsData || !classificationsData) {
    return [{ message: 'Both datasets are required for validation' }];
  }

  // Create lookup set for valid combinations
  const validCombinations = new Set();
  classificationsData.forEach(row => {
    const key = `${row.Topic || ''}-${row.SubTopic || ''}-${row.Industry || ''}`.toLowerCase();
    validCombinations.add(key);
  });

  // Check each string data row
  stringsData.forEach((row, index) => {
    const key = `${row.Topic || ''}-${row.Subtopic || ''}-${row.Industry || ''}`.toLowerCase();
    
    if (!validCombinations.has(key)) {
      errors.push({
        row: index + 1,
        topic: row.Topic,
        subtopic: row.Subtopic,
        industry: row.Industry,
        message: `Invalid combination: Topic "${row.Topic}", Subtopic "${row.Subtopic}", Industry "${row.Industry}" not found in classifications`
      });
    }
  });

  return errors;
};

/**
 * Clean and prepare data for processing
 * @param {Array} data - Raw data array
 * @returns {Array} Cleaned data array
 */
export const cleanCSVData = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(row => {
    const cleanedRow = {};
    Object.keys(row).forEach(key => {
      const value = row[key];
      // Clean up the value
      if (value === null || value === undefined) {
        cleanedRow[key] = '';
      } else {
        cleanedRow[key] = value.toString().trim();
      }
    });
    return cleanedRow;
  });
};

/**
 * Get statistics about CSV data
 * @param {Array} data - CSV data array
 * @returns {Object} Statistics object
 */
export const getDataStatistics = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      emptyFields: 0,
      completeness: 0
    };
  }

  const columns = Object.keys(data[0]);
  let emptyFields = 0;
  const totalFields = data.length * columns.length;

  data.forEach(row => {
    columns.forEach(column => {
      if (!row[column] || row[column].toString().trim() === '') {
        emptyFields++;
      }
    });
  });

  return {
    rowCount: data.length,
    columnCount: columns.length,
    emptyFields,
    completeness: ((totalFields - emptyFields) / totalFields * 100).toFixed(1)
  };
};

/**
 * Format data for display in tables
 * @param {Array} data - Raw CSV data
 * @param {Object} options - Formatting options
 * @returns {Array} Formatted data
 */
export const formatDataForDisplay = (data, options = {}) => {
  const {
    maxCellLength = 100,
    showRowNumbers = true,
    highlightEmptyFields = true
  } = options;

  if (!Array.isArray(data)) return [];

  return data.map((row, index) => {
    const formattedRow = {};
    
    if (showRowNumbers) {
      formattedRow._rowNumber = index + 1;
    }

    Object.keys(row).forEach(key => {
      let value = row[key] || '';
      
      // Truncate long values
      if (value.length > maxCellLength) {
        value = value.substring(0, maxCellLength) + '...';
      }

      // Mark empty fields for highlighting
      if (highlightEmptyFields && !value.trim()) {
        formattedRow[key] = { value: '', isEmpty: true };
      } else {
        formattedRow[key] = { value, isEmpty: false };
      }
    });

    return formattedRow;
  });
};