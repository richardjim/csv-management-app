class ValidationUtils {
  static validateStringsRow(row) {
    const errors = [];
    const requiredFields = ['Tier', 'Industry', 'Topic', 'Subtopic', 'Prefix', 'Fuzzing-Idx', 'Prompt', 'Risks', 'Keywords'];
    
    requiredFields.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });

    return errors;
  }

  static validateClassificationsRow(row) {
    const errors = [];
    const requiredFields = ['Topic', 'SubTopic', 'Industry', 'Classification'];
    
    requiredFields.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });

    return errors;
  }

  static normalizeHeaders(headers) {
    const headerMap = {
      'tier': 'Tier',
      'industry': 'Industry',
      'topic': 'Topic',
      'subtopic': 'Subtopic',
      'subTopic': 'SubTopic',
      'prefix': 'Prefix',
      'fuzzing-idx': 'Fuzzing-Idx',
      'fuzzingidx': 'Fuzzing-Idx',
      'prompt': 'Prompt',
      'risks': 'Risks',
      'keywords': 'Keywords',
      'classification': 'Classification'
    };

    return headers.map(header => {
      const normalized = header.toLowerCase().trim();
      return headerMap[normalized] || header;
    });
  }
}

module.exports = ValidationUtils;