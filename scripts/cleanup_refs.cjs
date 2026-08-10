const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');

const REMOVED = new Set(['lu-lin','yan-sen','chen-qi','lin-shidong','fang-bo','liu-dingshuo',
  'chen-xingtong','qian-tianyi','zhang-rui','mu-zi','liu-wei']);

// events.json: drop results referencing removed ids
const events = JSON.parse(fs.readFileSync(path.join(dir, 'events.json'), 'utf8'));
let droppedResults = 0;
for (const ev of events) {
  const before = ev.results.length;
  ev.results = ev.results.filter(r => !REMOVED.has(r.athlete_id));
  droppedResults += (before - ev.results.length);
}
fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(events, null, 2) + '\n', 'utf8');
console.log('events.json: dropped', droppedResults, 'result rows for removed players');

// matches.json: drop whole matches referencing removed ids
const matches = JSON.parse(fs.readFileSync(path.join(dir, 'matches.json'), 'utf8'));
const beforeM = matches.length;
const kept = matches.filter(m =>
  !REMOVED.has(m.player_a.athlete_id) && !REMOVED.has(m.player_b.athlete_id) && !REMOVED.has(m.winner_id));
fs.writeFileSync(path.join(dir, 'matches.json'), JSON.stringify(kept, null, 2) + '\n', 'utf8');
console.log('matches.json: dropped', beforeM - kept.length, 'matches for removed players (kept', kept.length, ')');
