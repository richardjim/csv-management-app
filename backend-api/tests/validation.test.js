const ValidationUtils = require('../src/utils/validation');

describe('ValidationUtils', () => {
  describe('validateStringsRow', () => {
    it('should return no errors if all required fields are present', () => {
      const row = {
        Tier: 'Gold',
        Industry: 'Finance',
        Topic: 'Payments',
        Subtopic: 'Cards',
        Prefix: 'PAY',
        'Fuzzing-Idx': '1',
        Prompt: 'Enter details',
        Risks: 'Fraud',
        Keywords: 'credit, debit'
      };

      const errors = ValidationUtils.validateStringsRow(row);
      expect(errors).toEqual([]);
    });

    it('should return errors for missing fields', () => {
      const row = { Tier: 'Gold', Industry: '' };
      const errors = ValidationUtils.validateStringsRow(row);

      expect(errors).toContain('Industry is required');
      expect(errors).toContain('Topic is required');
      expect(errors).toContain('Subtopic is required');
      expect(errors).toContain('Prefix is required');
      expect(errors).toContain('Fuzzing-Idx is required');
      expect(errors).toContain('Prompt is required');
      expect(errors).toContain('Risks is required');
      expect(errors).toContain('Keywords is required');
    });
  });

  describe('validateClassificationsRow', () => {
    it('should return no errors if all required fields are present', () => {
      const row = {
        Topic: 'Security',
        SubTopic: 'Encryption',
        Industry: 'Tech',
        Classification: 'High'
      };

      const errors = ValidationUtils.validateClassificationsRow(row);
      expect(errors).toEqual([]);
    });

    it('should return errors for missing required fields', () => {
      const row = { Topic: 'Security' };
      const errors = ValidationUtils.validateClassificationsRow(row);

      expect(errors).toContain('SubTopic is required');
      expect(errors).toContain('Industry is required');
      expect(errors).toContain('Classification is required');
    });
  });

  describe('normalizeHeaders', () => {
    it('should normalize headers to standard format', () => {
  const headers = [
    'tier',
    'industry',
    'topic',
    'subtopic',
    'subTopic',
    'prefix',
    'fuzzing-idx',
    'fuzzingidx',
    'prompt',
    'risks',
  ];

  const result = ValidationUtils.normalizeHeaders(headers);

  expect(result).toEqual([
    'Tier',
    'Industry',
    'Topic',
    'Subtopic',   // ✅ changed from SubTopic
    'Subtopic',   // ✅ changed from SubTopic
    'Prefix',
    'Fuzzing-Idx',
    'Fuzzing-Idx',
    'Prompt',
    'Risks',
  ]);
});


    it('should keep unknown headers unchanged', () => {
      const headers = ['customField', 'tier'];
      const result = ValidationUtils.normalizeHeaders(headers);

      expect(result).toEqual(['customField', 'Tier']);
    });
  });
});
