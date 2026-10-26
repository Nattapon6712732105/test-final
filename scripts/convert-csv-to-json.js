const fs = require('fs');
const path = require('path');

// Robust CSV parser supporting quotes and commas
function parseCSV(content) {
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length >= 7) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      rows.push(row);
    }
  }

  return rows;
}

const csvFilePath = path.join(__dirname, '..', 'แบบฝึกหัดบทที่2_เฉลย.csv');
const outputDir = path.join(__dirname, '..', 'src', 'data');
const jsonFilePath = path.join(outputDir, 'questions.json');

if (!fs.existsSync(csvFilePath)) {
  console.error(`CSV file not found at: ${csvFilePath}`);
  process.exit(1);
}

const csvContent = fs.readFileSync(csvFilePath, 'utf8');
const parsedRows = parseCSV(csvContent);

// Format question items
const questions = parsedRows.map((row) => {
  const id = parseInt(row['ข้อ'], 10) || 0;
  const question = row['คำถาม'] || '';
  const optA = row['ตัวเลือก ก'] || '';
  const optB = row['ตัวเลือก ข'] || '';
  const optC = row['ตัวเลือก ค'] || '';
  const optD = row['ตัวเลือก ง'] || '';
  const correctKey = (row['เฉลย'] || '').trim();
  const correctAnswer = row['คำตอบที่ถูก'] || '';

  return {
    id,
    question,
    options: [
      { key: 'ก', text: optA },
      { key: 'ข', text: optB },
      { key: 'ค', text: optC },
      { key: 'ง', text: optD }
    ],
    correctKey,
    correctAnswer
  };
});

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Full questions with answer keys for server validation
fs.writeFileSync(jsonFilePath, JSON.stringify(questions, null, 2), 'utf8');

// Public safe questions without answer keys for client
const publicQuestions = questions.map(({ id, question, options }) => ({
  id,
  question,
  options
}));
const publicJsonPath = path.join(outputDir, 'public-questions.json');
fs.writeFileSync(publicJsonPath, JSON.stringify(publicQuestions, null, 2), 'utf8');

console.log(`Successfully converted ${questions.length} questions to questions.json and public-questions.json`);
