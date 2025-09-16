import {
  STRINGS_REQUIRED_FIELDS,
  CLASSIFICATIONS_REQUIRED_FIELDS,
  validateCSVData,
  normalizeCSVHeaders,
  downloadCSV,
  parseCSVText,
  validateDataIntegrity,
  cleanCSVData,
  getDataStatistics,
  formatDataForDisplay
} from '../utils/csvUtils';

describe('CSV Utils', () => {

  describe('Constants', () => {
    test('STRINGS_REQUIRED_FIELDS contains expected fields', () => {
      expect(STRINGS_REQUIRED_FIELDS).toEqual([
        'Tier', 'Industry', 'Topic', 'Subtopic', 'Prefix', 
        'Fuzzing-Idx', 'Prompt', 'Risks', 'Keywords'
      ]);
    });

    test('CLASSIFICATIONS_REQUIRED_FIELDS contains expected fields', () => {
      expect(CLASSIFICATIONS_REQUIRED_FIELDS).toEqual([
        'Topic', 'SubTopic', 'Industry', 'Classification'
      ]);
    });
  });

  describe('validateCSVData', () => {
    const validData = [
      { Name: 'John', Age: '30', Email: 'john@example.com' },
      { Name: 'Jane', Age: '25', Email: 'jane@example.com' }
    ];
    const requiredFields = ['Name', 'Age', 'Email'];

    test('returns no errors for valid data', () => {
      expect(validateCSVData(validData, requiredFields)).toEqual([]);
    });

    test('returns errors for invalid data format', () => {
      expect(validateCSVData(null, requiredFields)).toEqual([{ message: 'Invalid data format' }]);
      expect(validateCSVData('not an array', requiredFields)).toEqual([{ message: 'Invalid data format' }]);
      expect(validateCSVData([], requiredFields)).toEqual([{ message: 'No data to validate' }]);
    });

    test('returns errors for missing/empty fields', () => {
      const dataWithMissing = [{ Name: 'John', Age: '30' }];
      const dataWithEmpty = [
        { Name: 'John', Age: '', Email: 'john@example.com' },
        { Name: '', Age: '25', Email: 'jane@example.com' }
      ];
      const dataWithWhitespace = [{ Name: '   ', Age: '30', Email: 'john@example.com' }];

      expect(validateCSVData(dataWithMissing, requiredFields)).toContainEqual({ message: 'Missing required fields: Email' });
      expect(validateCSVData(dataWithEmpty, requiredFields)).toEqual(
        expect.arrayContaining([
          { row: 1, field: 'Age', message: 'Age is required in row 1' },
          { row: 2, field: 'Name', message: 'Name is required in row 2' }
        ])
      );
      expect(validateCSVData(dataWithWhitespace, requiredFields)).toContainEqual({ row: 1, field: 'Name', message: 'Name is required in row 1' });
    });

    test('handles no required fields', () => {
      expect(validateCSVData(validData, [])).toEqual([]);
      expect(validateCSVData(validData)).toEqual([]);
    });
  });

  describe('normalizeCSVHeaders', () => {
    test('normalizes headers', () => {
      const headers = [
        'tier', 'INDUSTRY', 'Topic', 'sub-topic', 'Sub_Topic',
        'prefix', 'fuzzing-idx', 'FuzzingIdx', 'fuzzing_idx',
        'Prompt', 'RISKS', 'keywords', 'Classification'
      ];
      expect(normalizeCSVHeaders(headers)).toEqual([
        'Tier', 'Industry', 'Topic', 'SubTopic', 'SubTopic',
        'Prefix', 'Fuzzing-Idx', 'Fuzzing-Idx', 'Fuzzing-Idx',
        'Prompt', 'Risks', 'Keywords', 'Classification'
      ]);
    });

    test('preserves unknown headers and trims whitespace', () => {
      expect(normalizeCSVHeaders(['CustomField', '  space '] )).toEqual(['CustomField', 'space']);
    });

    test('handles spaces in header names', () => {
      expect(normalizeCSVHeaders(['Sub Topic', 'Fuzzing Idx'])).toEqual(['SubTopic', 'Fuzzing-Idx']);
    });
  });

  describe('downloadCSV', () => {
    const sampleData = [{ Name: 'John', Age: 30, City: 'NY' }, { Name: 'Jane', Age: 25, City: 'LA' }];
    
    beforeEach(() => jest.clearAllMocks());

    test('throws for empty data', () => {
      expect(() => downloadCSV([], 'test')).toThrow('No data to download');
      expect(() => downloadCSV(null, 'test')).toThrow('No data to download');
    });
  });

  describe('parseCSVText', () => {
    test('parses CSV correctly', () => {
      const csv = 'Name,Age\nJohn,30\nJane,25';
      expect(parseCSVText(csv)).toEqual([{ Name: 'John', Age: '30' }, { Name: 'Jane', Age: '25' }]);
    });

    test('handles quotes, commas, empty lines, trimming', () => {
      const csv = 'Name,Note\n"John, Doe","Hello ""World"""';
      expect(parseCSVText(csv)).toEqual([{ Name: 'John, Doe', Note: 'Hello "World"' }]);
      expect(parseCSVText('')).toEqual([]);
      expect(parseCSVText(null)).toEqual([]);
    });

    test('handles custom delimiter and header normalization', () => {
      const csv = 'tier;sub-topic;industry\nTier1;SubTopic1;Industry1';
      expect(parseCSVText(csv, { delimiter: ';' })).toEqual([{ Tier: 'Tier1', SubTopic: 'SubTopic1', Industry: 'Industry1' }]);
    });
  });

  describe('validateDataIntegrity', () => {
    const classificationsData = [{ Topic: 'Tech', SubTopic: 'AI', Industry: 'Software', Classification: 'High' }];
    const validStringsData = [{ Topic: 'Tech', Subtopic: 'AI', Industry: 'Software', Prompt: 'Test' }];
    const invalidStringsData = [{ Topic: 'Unknown', Subtopic: 'Unknown', Industry: 'Unknown', Prompt: 'Invalid' }];

    test('valid combinations return no errors', () => {
      expect(validateDataIntegrity(validStringsData, classificationsData)).toEqual([]);
    });

    test('invalid combinations return errors', () => {
      expect(validateDataIntegrity(invalidStringsData, classificationsData)).toHaveLength(1);
    });

    test('handles missing or case-insensitive data', () => {
      expect(validateDataIntegrity(null, classificationsData)).toEqual([{ message: 'Both datasets are required for validation' }]);
      expect(validateDataIntegrity(validStringsData, null)).toEqual([{ message: 'Both datasets are required for validation' }]);
      expect(validateDataIntegrity([{ Topic: 'TECH', Subtopic: 'ai', Industry: 'SOFTWARE', Prompt: 'Test' }], classificationsData)).toEqual([]);
    });
  });

  describe('cleanCSVData', () => {
    test('trims, converts to strings and handles empty input', () => {
      const dirtyData = [{ Name: '  John  ', Age: 30, City: null }];
      expect(cleanCSVData(dirtyData)).toEqual([{ Name: 'John', Age: '30', City: '' }]);
      expect(cleanCSVData(null)).toEqual([]);
      expect(cleanCSVData('abc')).toEqual([]);
    });

    test('handles mixed data types', () => {
      const mixedData = [{ string: 'text', number: 42, boolean: true, array: [1], object: { key: 'v' } }];
      expect(cleanCSVData(mixedData)).toEqual([{ string: 'text', number: '42', boolean: 'true', array: '1', object: '[object Object]' }]);
    });
  });

  describe('getDataStatistics', () => {
    const sampleData = [{ Name: 'John', Age: '30', City: 'NY' }, { Name: 'Jane', Age: '', City: '' }];
    test('calculates stats correctly', () => {
      expect(getDataStatistics(sampleData)).toEqual({
        rowCount: 2,
        columnCount: 3,
        emptyFields: 2,
        completeness: '66.7'
      });
      expect(getDataStatistics([])).toEqual({ rowCount: 0, columnCount: 0, emptyFields: 0, completeness: 0 });
    });
  });

  describe('formatDataForDisplay', () => {
    const sampleData = [{ Name: 'John Doe', Age: 30, Bio: 'Long bio text' }];
    test('formats data with options and nulls', () => {
      const formatted = formatDataForDisplay(sampleData, { maxCellLength: 5, showRowNumbers: false, highlightEmptyFields: false });
      expect(formatted[0]._rowNumber).toBeUndefined();
      expect(formatted[0].Bio.value).toBe('Long ...');
    });

    test('handles empty or invalid input', () => {
      expect(formatDataForDisplay(null)).toEqual([]);
      expect(formatDataForDisplay('abc')).toEqual([]);
      expect(formatDataForDisplay([])).toEqual([]);
    });
  });

});
