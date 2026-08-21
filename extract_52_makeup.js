const fs = require('fs');

const d = fs.readFileSync('log_dump.txt', 'utf8');

const pos = d.indexOf('GENERATE 52 MAKEUP & BEAUTY PORTFOLIO CARDS');
if (pos !== -1) {
  const text = d.substring(pos, pos + 25000);
  const cleanText = text.replace(/\\"/g, '"').replace(/\\n/g, '\n');
  fs.writeFileSync('extracted_52_makeup.txt', cleanText);
  console.log('Saved 52 makeup block! Size:', cleanText.length);
} else {
  console.log('Not found GENERATE 52 MAKEUP');
}
