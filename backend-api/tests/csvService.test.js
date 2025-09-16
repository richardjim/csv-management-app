const fs = require('fs').promises;
const path = require('path');
const CSVService = require('../src/services/csvService');

const createTempCSV = async (filePath, content) => {
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
};

describe('CSVService', () => {
  const tempDir = path.join(__dirname, 'tmp');
  const sampleCSV = `Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords
Gold,Finance,Payments,Cards,PAY,1,"Enter details","Fraud","credit, debit"
Silver,Health,Wellness,Fitness,FIT,2,"Stay healthy","Injury","exercise, gym"
`;

  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('parseCSV', () => {
  it('should parse CSV into JSON array', async () => {
    const filePath = path.join(tempDir, 'test.csv');
    await createTempCSV(filePath, sampleCSV);

    const result = await CSVService.parseCSV(filePath);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length === 2 || result.length === 3).toBe(true);
  });
});

  describe('writeCSV', () => {
    it('should write JSON data to CSV file', async () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const filePath = path.join(tempDir, 'output.csv');

      await CSVService.writeCSV(data, filePath);

      const written = await fs.readFile(filePath, 'utf8');
      expect(written).toContain('name,age');
      expect(written).toContain('Alice,30');
      expect(written).toContain('Bob,25');
    });

    it('should reject when no data is provided', async () => {
      const filePath = path.join(tempDir, 'empty.csv');
      await expect(CSVService.writeCSV([], filePath)).rejects.toThrow('No data to write');
    });
  });

  describe('validateStringsData', () => {
    it('should return empty array if all combinations are valid', async () => {
      const stringsData = [
        { Topic: 'Payments', Subtopic: 'Cards', Industry: 'Finance' }
      ];
      const classificationsData = [
        { Topic: 'Payments', SubTopic: 'Cards', Industry: 'Finance', Classification: 'A' }
      ];

      const result = await CSVService.validateStringsData(stringsData, classificationsData);
      expect(result).toEqual([]);
    });

    it('should return errors for invalid combinations', async () => {
      const stringsData = [
        { Topic: 'Payments', Subtopic: 'Loans', Industry: 'Finance' }
      ];
      const classificationsData = [
        { Topic: 'Payments', SubTopic: 'Cards', Industry: 'Finance', Classification: 'A' }
      ];

      const result = await CSVService.validateStringsData(stringsData, classificationsData);
      expect(result.length).toBe(1);
      expect(result[0].message).toContain('Invalid combination');
    });
  });

  describe('generateCSVBuffer', () => {
    it('should generate a buffer with CSV content', async () => {
      const data = [
        { name: 'Charlie', age: 40 },
        { name: 'Dana', age: 35 }
      ];

      const buffer = await CSVService.generateCSVBuffer(data);
      const csvString = buffer.toString();

      expect(csvString).toContain('name,age');
      expect(csvString).toContain('Charlie,40');
      expect(csvString).toContain('Dana,35');
    });
  });
});
