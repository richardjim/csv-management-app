import {
  validateCSVData,
  normalizeCSVHeaders,
  downloadCSV,
  parseCSVText,
  validateDataIntegrity,
  cleanCSVData,
  getDataStatistics,
  formatDataForDisplay,
  STRINGS_REQUIRED_FIELDS,
  CLASSIFICATIONS_REQUIRED_FIELDS
} from '../utils/csvUtils';

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  }
});

describe('csvUtils', () => {
  describe('validateCSVData', () => {
    it('should validate required fields correctly', () => {
      const data = [
        { Name: 'John', Age: '30' },
        { Name: '', Age: '25' },
        { Name: 'Bob', Age: '' }
      ];
      const requiredFields = ['Name', 'Age'];
      
      const errors = validateCSVData(data, requiredFields);
      expect(errors).toHaveLength(2);
      expect(errors[0]).toMatchObject({
        row: 2,
        field: 'Name',
        message: 'Name is required in row 2'
      });
      expect(errors[1]).toMatchObject({
        row: 3,
        field: 'Age',
        message: 'Age is required in row 3'
      });
    });

    it('should return no errors for valid data', () => {
      const data = [
        { Name: 'John', Age: '30' },
        { Name: 'Jane', Age: '25' }
      ];
      const requiredFields = ['Name', 'Age'];
      
      const errors = validateCSVData(data, requiredFields);
      expect(errors).toHaveLength(0);
    });

    it('should handle empty data', () => {
      const errors = validateCSVData([], ['Name']);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('No data to validate');
    });

    it('should handle invalid data format', () => {
      const errors = validateCSVData('invalid', ['Name']);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Invalid data format');
    });

    it('should detect missing required fields', () => {
      const data = [{ Name: 'John' }];
      const requiredFields = ['Name', 'Age', 'City'];
      
      const errors = validateCSVData(data, requiredFields);
      expect(errors[0].message).toContain('Missing required fields: Age, City');
    });
  });

  describe('normalizeCSVHeaders', () => {
    it('should normalize common header variations', () => {
      const headers = ['tier', 'Industry', 'TOPIC', 'sub-topic', 'fuzzing_idx'];
      const normalized = normalizeCSVHeaders(headers);
      
      expect(normalized).toContain('Tier');
      expect(normalized).toContain('Industry');
      expect(normalized).toContain('Topic');
      expect(normalized).toContain('SubTopic');
      expect(normalized).toContain('Fuzzing-Idx');
    });

    it('should preserve unknown headers', () => {
      const headers = ['CustomField', 'unknown_header'];
      const normalized = normalizeCSVHeaders(headers);
      
      expect(normalized).toContain('CustomField');
      expect(normalized).toContain('unknown_header');
    });

    it('should handle whitespace in headers', () => {
      const headers = [' tier ', ' industry  ', 'topic '];
      const normalized = normalizeCSVHeaders(headers);
      
      expect(normalized).toContain('Tier');
      expect(normalized).toContain('Industry');
      expect(normalized).toContain('Topic');
    });
  });

  describe('downloadCSV', () => {
    beforeEach(() => {
      // Mock DOM methods
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      HTMLAnchorElement.prototype.click = jest.fn();
    });

    it('should generate and trigger download', () => {
      const data = [
        { Name: 'John', Age: '30' },
        { Name: 'Jane', Age: '25' }
      ];
      
      expect(() => downloadCSV(data, 'test.csv')).not.toThrow();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should throw error for empty data', () => {
      expect(() => downloadCSV([], 'test.csv')).toThrow('No data to download');
    });

    it('should handle data with commas and quotes', () => {
      const data = [
        { Name: 'John, Jr.', Description: 'A "good" person' }
      ];
      
      expect(() => downloadCSV(data, 'test.csv')).not.toThrow();
    });
  });

  describe('parseCSVText', () => {
    it('should parse simple CSV text', () => {
      const csvText = 'Name,Age\nJohn,30\nJane,25';
      const result = parseCSVText(csvText);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ Name: 'John', Age: '30' });
      expect(result[1]).toEqual({ Name: 'Jane', Age: '25' });
    });

    it('should handle quoted values with commas', () => {
      const csvText = 'Name,Description\n"John, Jr.","A good person"\n"Jane Smith","Works at ""ABC"" Corp"';
      const result = parseCSVText(csvText);
      
      expect(result[0].Name).toBe('John, Jr.');
      expect(result[0].Description).toBe('A good person');
      expect(result[1].Description).toBe('Works at "ABC" Corp');
    });

    it('should skip empty lines when configured', () => {
      const csvText = 'Name,Age\nJohn,30\n\nJane,25\n';
      const result = parseCSVText(csvText, { skipEmptyLines: true });
      
      expect(result).toHaveLength(2);
    });

    it('should handle empty CSV text', () => {
      expect(parseCSVText('')).toEqual([]);
      expect(parseCSVText(null)).toEqual([]);
    });
  });

  describe('validateDataIntegrity', () => {
    const classificationsData = [
      { Topic: 'AI', SubTopic: 'Machine Learning', Industry: 'Tech' },
      { Topic: 'Finance', SubTopic: 'Banking', Industry: 'Financial' }
    ];

    it('should return no errors for valid combinations', () => {
      const stringsData = [
        { Topic: 'AI', Subtopic: 'Machine Learning', Industry: 'Tech' }
      ];

      const errors = validateDataIntegrity(stringsData, classificationsData);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid combinations', () => {
      const stringsData = [
        { Topic: 'InvalidTopic', Subtopic: 'InvalidSubtopic', Industry: 'InvalidIndustry' }
      ];

      const errors = validateDataIntegrity(stringsData, classificationsData);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        row: 1,
        topic: 'InvalidTopic',
        subtopic: 'InvalidSubtopic',
        industry: 'InvalidIndustry'
      });
      expect(errors[0].message).toContain('Invalid combination');
    });

    it('should handle case insensitive matching', () => {
      const stringsData = [
        { Topic: 'ai', Subtopic: 'machine learning', Industry: 'tech' }
      ];

      const errors = validateDataIntegrity(stringsData, classificationsData);
      expect(errors).toHaveLength(0);
    });

    it('should handle missing data gracefully', () => {
      const errors = validateDataIntegrity(null, null);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Both datasets are required for validation');
    });
  });

  describe('cleanCSVData', () => {
    it('should clean data properly', () => {
      const dirtyData = [
        { Name: '  John  ', Age: null, City: undefined },
        { Name: 'Jane', Age: '', City: '  LA  ' }
      ];

      const cleaned = cleanCSVData(dirtyData);
      expect(cleaned[0]).toEqual({ Name: 'John', Age: '', City: '' });
      expect(cleaned[1]).toEqual({ Name: 'Jane', Age: '', City: 'LA' });
    });

    it('should handle non-array input', () => {
      expect(cleanCSVData('invalid')).toEqual([]);
      expect(cleanCSVData(null)).toEqual([]);
    });
  });

  describe('getDataStatistics', () => {
    it('should calculate statistics correctly', () => {
      const data = [
        { Name: 'John', Age: '30', City: '' },
        { Name: '', Age: '25', City: 'LA' }
      ];

      const stats = getDataStatistics(data);
      expect(stats.rowCount).toBe(2);
      expect(stats.columnCount).toBe(3);
      expect(stats.emptyFields).toBe(2);
      expect(stats.completeness).toBe('66.7');
    });

    it('should handle empty data', () => {
      const stats = getDataStatistics([]);
      expect(stats.rowCount).toBe(0);
      expect(stats.columnCount).toBe(0);
      expect(stats.emptyFields).toBe(0);
      expect(stats.completeness).toBe(0);
    });
  });

  describe('formatDataForDisplay', () => {
    it('should format data for display', () => {
      const data = [
        { Name: 'John', Age: '30' },
        { Name: '', Age: '25' }
      ];

      const formatted = formatDataForDisplay(data);
      expect(formatted[0]._rowNumber).toBe(1);
      expect(formatted[0].Name.value).toBe('John');
      expect(formatted[0].Name.isEmpty).toBe(false);
      expect(formatted[1].Name.isEmpty).toBe(true);
    });

    it('should truncate long values', () => {
      const longText = 'A'.repeat(150);
      const data = [{ Description: longText }];

      const formatted = formatDataForDisplay(data, { maxCellLength: 100 });
      expect(formatted[0].Description.value).toContain('...');
      expect(formatted[0].Description.value.length).toBeLessThanOrEqual(103);
    });

    it('should handle non-array input', () => {
      expect(formatDataForDisplay('invalid')).toEqual([]);
    });
  });

  describe('Constants', () => {
    it('should have correct required fields for strings', () => {
      expect(STRINGS_REQUIRED_FIELDS).toContain('Tier');
      expect(STRINGS_REQUIRED_FIELDS).toContain('Industry');
      expect(STRINGS_REQUIRED_FIELDS).toContain('Topic');
      expect(STRINGS_REQUIRED_FIELDS).toContain('Subtopic');
      expect(STRINGS_REQUIRED_FIELDS).toContain('Prefix');
      expect(STRINGS_REQUIRED_FIELDS).toContain('Fuzzing-Idx');
      expect(STRINGS_REQUIRED_FIELDS).toContain('Prompt');
      expect(STRINGS_REQUIRED_FIELDS).toContain('Risks');
      expect(STRINGS_REQUIRED_FIELDS).toContain('Keywords');
    });

    it('should have correct required fields for classifications', () => {
      expect(CLASSIFICATIONS_REQUIRED_FIELDS).toContain('Topic');
      expect(CLASSIFICATIONS_REQUIRED_FIELDS).toContain('SubTopic');
      expect(CLASSIFICATIONS_REQUIRED_FIELDS).toContain('Industry');
      expect(CLASSIFICATIONS_REQUIRED_FIELDS).toContain('Classification');
    });
  });
});