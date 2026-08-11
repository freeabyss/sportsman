const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');

const TYPES = ['wtt_grand_smash','wtt_champions','wtt_finals','asian_championships','national_games','asian_games','csl','national_championships'];
const TYPE_KEYS = ['wtt_grand_smash','wtt_champions','wtt_finals','asian_championships','national_games','asian_games','csl','national_championships'];

const tournaments = JSON.parse(fs.readFileSync(path.join(dir, 'tournaments.json'), 'utf8'));
const events = JSON.parse(fs.readFileSync(path.join(dir, 'events.json'), 'utf8'));

let addT = [];
let addE = [];
const missing = [];
for (const tk of TYPE_KEYS) {
  const f = path.join(__dirname, `_gen_${tk}.json`);
  if (!fs.existsSync(f)) { missing.push(tk); continue; }
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  addT = addT.concat(d.tournaments || []);
  addE = addE.concat(d.events || []);
}
if (missing.length) { console.error('缺失生成文件:', missing.join(', ')); process.exit(1); }

const typeSet = new Set(TYPES);
const oldTypeTournamentIds = new Set(tournaments.filter(t => typeSet.has(t.type)).map(t => t.id));

const keptT = tournaments.filter(t => !typeSet.has(t.type));
const keptE = events.filter(e => !oldTypeTournamentIds.has(e.tournament_id));

const mergedT = [...keptT, ...addT];
const mergedE = [...keptE, ...addE];

// 重复 id 检查
const tIds = new Set();
let dupT = 0;
mergedT.forEach(t => { if (tIds.has(t.id)) dupT++; tIds.add(t.id); });
const eIds = new Set();
let dupE = 0;
mergedE.forEach(e => { if (eIds.has(e.id)) dupE++; eIds.add(e.id); });

fs.writeFileSync(path.join(dir, 'tournaments.json'), JSON.stringify(mergedT, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(mergedE, null, 2) + '\n', 'utf8');

console.log('并入赛事:', addT.length, '| 并入项目:', addE.length);
console.log('总赛事:', mergedT.length, '| 总项目:', mergedE.length);
console.log('重复赛事id:', dupT, '| 重复项目id:', dupE);
console.log('各类型赛事数:', JSON.stringify(addT.reduce((a,t)=>{a[t.type]=(a[t.type]||0)+1;return a;},{})));
