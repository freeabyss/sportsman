const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');

// 参考表（用户提供的10届奥运乒乓球比赛）
const REF = [
  { year: 1988, id: '1988-seoul-olympics',      name: '首尔奥运会',     edition: 1,  start: '1988-09-18', end: '1988-10-02', city: '首尔',     country: '韩国' },
  { year: 1992, id: '1992-barcelona-olympics', name: '巴塞罗那奥运会', edition: 2,  start: '1992-07-26', end: '1992-08-08', city: '巴塞罗那', country: '西班牙' },
  { year: 1996, id: '1996-atlanta-olympics',   name: '亚特兰大奥运会', edition: 3,  start: '1996-07-19', end: '1996-08-04', city: '亚特兰大', country: '美国' },
  { year: 2000, id: '2000-sydney-olympics',    name: '悉尼奥运会',     edition: 4,  start: '2000-09-13', end: '2000-10-01', city: '悉尼',     country: '澳大利亚' },
  { year: 2004, id: '2004-athens-olympics',    name: '雅典奥运会',     edition: 5,  start: '2004-08-13', end: '2004-08-29', city: '雅典',     country: '希腊' },
  { year: 2008, id: '2008-beijing-olympics',   name: '北京奥运会',     edition: 6,  start: '2008-08-13', end: '2008-08-23', city: '北京',     country: '中国' },
  { year: 2012, id: '2012-london-olympics',    name: '伦敦奥运会',     edition: 7,  start: '2012-07-28', end: '2012-08-08', city: '伦敦',     country: '英国' },
  { year: 2016, id: '2016-rio-olympics',       name: '里约热内卢奥运会', edition: 8, start: '2016-08-06', end: '2016-08-17', city: '里约热内卢', country: '巴西' },
  { year: 2020, id: '2020-tokyo-olympics',     name: '东京奥运会',     edition: 9,  start: '2021-07-24', end: '2021-08-06', city: '东京',     country: '日本' },
  { year: 2024, id: '2024-paris-olympics',     name: '巴黎奥运会',     edition: 10, start: '2024-07-27', end: '2024-08-10', city: '巴黎',     country: '法国' }
];

const tournaments = JSON.parse(fs.readFileSync(path.join(dir, 'tournaments.json'), 'utf8'));
const byId = Object.fromEntries(tournaments.map(t => [t.id, t]));

let added = 0, updated = 0;
const refIds = new Set(REF.map(r => r.id));

for (const r of REF) {
  const existing = byId[r.id];
  if (!existing) {
    tournaments.push({
      id: r.id,
      name: r.name,
      type: 'olympics',
      level: 'S',
      year: r.year,
      start_date: r.start,
      end_date: r.end,
      location: r.city,
      edition: `第${r.edition}届`,
      participant_count: 160
    });
    added++;
  } else {
    existing.year = r.year;
    existing.start_date = r.start;
    existing.end_date = r.end;
    existing.location = r.city;
    existing.edition = `第${r.edition}届`;
    // participant_count 与 name 保留原有值
    updated++;
  }
}

// 移除任何非参考表的 olympics 残留（理论上不存在）
const before = tournaments.length;
const cleaned = tournaments.filter(t => t.type !== 'olympics' || refIds.has(t.id));

fs.writeFileSync(path.join(dir, 'tournaments.json'), JSON.stringify(cleaned, null, 2) + '\n', 'utf8');
console.log(`奥运会赛事: 新增 ${added}, 更新 ${updated}, 总数 ${cleaned.filter(t=>t.type==='olympics').length}`);
console.log('移除残留:', before - cleaned.length);
