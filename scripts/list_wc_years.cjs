const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');
const tournaments = JSON.parse(fs.readFileSync(path.join(dir, 'tournaments.json'), 'utf8'));
const events = JSON.parse(fs.readFileSync(path.join(dir, 'events.json'), 'utf8'));

const wcTours = tournaments.filter(t => t.type === 'world_championships').sort((a,b)=>a.year-b.year);
const years = wcTours.map(t=>t.year);
console.log('世锦赛届数:', years.length);
console.log('年份列表:', years.join(', '));

// 找出 1926-2026 之间缺失的"应有年份"
// 世乒赛规律: 1926-1939 每年; 1940/1941 取消; 1947-1957 每年; 1959起每两年(奇数年); 2020延至2021; 2024(团体)特殊
const expected = [];
for (let y=1926; y<=1939; y++) expected.push(y);
// 1940,1941 cancelled
for (let y=1947; y<=1957; y++) expected.push(y);
for (let y=1959; y<=2023; y+=2) expected.push(y);
expected.push(2024); // busan team
expected.push(2025);
expected.push(2026);
const present = new Set(years);
const missing = expected.filter(y=>!present.has(y));
console.log('\n应有但未出现(按世乒赛规律):', missing.join(', '));

// 每个年份有哪些项目
for (const t of wcTours) {
  const evs = events.filter(e=>e.tournament_id===t.id);
  console.log(t.year, '->', evs.map(e=>e.code).join(','));
}
