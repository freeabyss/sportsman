const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');
const athletes = JSON.parse(fs.readFileSync(path.join(dir, 'athletes.json'), 'utf8'));
const events = JSON.parse(fs.readFileSync(path.join(dir, 'events.json'), 'utf8'));
const matches = JSON.parse(fs.readFileSync(path.join(dir, 'matches.json'), 'utf8'));
const athleteIds = new Set(athletes.map(a => a.id));
const eventRefs = new Set(events.map(e => e.id));

let foreignIds = 0;        // 境外选手 id(全英文, 不在roster) -> 显示用, 非错误
let displayNames = 0;      // 中文显示名 -> 非错误
let realBrokenRefs = [];   // 既非roster id, 又非纯中文显示名 -> 可能是错误
for (const e of events) {
  for (const r of (e.results || [])) {
    const id = r.athlete_id;
    if (!athleteIds.has(id)) {
      if (/[一-龥]/.test(id)) displayNames++;
      else if (/^[A-Za-z-]+$/.test(id)) foreignIds++;
      else realBrokenRefs.push({ event: e.id, athlete_id: id });
    }
  }
}

let brokenMatchRefs = [];
for (const m of matches) {
  const ev = m.event_id;
  if (ev && !eventRefs.has(ev)) brokenMatchRefs.push({ match: m.id, event_id: ev });
}

console.log('运动员总数:', athletes.length, '| 项目总数:', events.length, '| 比赛总数:', matches.length);
console.log('境外选手id引用(显示用,正常):', foreignIds);
console.log('中文显示名引用(显示用,正常):', displayNames);
console.log('疑似错误引用(非id非中文名):', realBrokenRefs.length, realBrokenRefs.slice(0,10));
console.log('matches 失效 event_id 引用:', brokenMatchRefs.length, brokenMatchRefs.slice(0,10));
