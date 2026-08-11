/**
 * WTT 大满贯 (WTT Grand Smash) 数据生成器
 *
 * 运行: node scripts/build_wtt_grand_smash.cjs
 * 输出: scripts/_gen_wtt_grand_smash.json  -> { tournaments: [...], events: [...] }
 *
 * 只输出 type === 'wtt_grand_smash' 的赛事与项目，不修改 src/data 下任何文件。
 *
 * 史实要点（已核实）：
 *  - WTT 大满贯首站为 2022 年新加坡站，2020/2021 年不存在大满贯赛事。
 *  - 沙特大满贯仅 2024 年举办一届，2025 年起停办。
 *  - 中国大满贯自 2024 年起（北京首钢园），美国 / 欧洲(瑞典) 大满贯自 2025 年起。
 *  - 截至 2026-08-11，2026 年仅新加坡站、美国站已结束；瑞典马尔默站(8.8-8.16)进行中、
 *    北京站(10.1-10.11)未开赛，故不收录。
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const OUT_FILE = path.join(__dirname, '_gen_wtt_grand_smash.json');

const TYPE = 'wtt_grand_smash';
const LEVEL = 'A+';

// ---------------------------------------------------------------------------
// 固定名册（37 人）。命中则用 id，否则原样保留姓名字符串（外协/名册外选手仅作展示）。
// ---------------------------------------------------------------------------
const ROSTER = {
  容国团: 'rong-guotuan',
  庄则栋: 'zhuang-zedong',
  李富荣: 'li-furong',
  梁戈亮: 'liang-geliang',
  郭跃华: 'guo-yuehua',
  刘国梁: 'liu-guoliang',
  孔令辉: 'kong-linghui',
  王涛: 'wang-tao',
  马文革: 'ma-wenge',
  王励勤: 'wang-liqin',
  马琳: 'ma-lin',
  王皓: 'wang-hao',
  张继科: 'zhang-jike',
  马龙: 'ma-long',
  许昕: 'xu-xin',
  樊振东: 'fan-zhendong',
  王楚钦: 'wang-chuqin',
  梁靖崑: 'liang-jingkun',
  林高远: 'lin-gaoyuan',
  曹燕华: 'cao-yanhua',
  邓亚萍: 'deng-yaping',
  乔红: 'qiao-hong',
  王晨: 'wang-chen',
  杨影: 'yang-ying',
  李菊: 'li-ju',
  王楠: 'wang-nan',
  张怡宁: 'zhang-yining',
  郭跃: 'guo-yue',
  郭焱: 'guo-yan',
  李晓霞: 'li-xiaoxia',
  丁宁: 'ding-ning',
  刘诗雯: 'liu-shiwen',
  朱雨玲: 'zhu-yuling',
  陈梦: 'chen-meng',
  孙颖莎: 'sun-yingsha',
  王曼昱: 'wang-manyu',
  王艺迪: 'wang-yidi'
};

function aid(name) {
  return ROSTER[name] || name;
}

// ---------------------------------------------------------------------------
// 项目定义
// ---------------------------------------------------------------------------
const EVENT_DEF = {
  ms: { code: 'MEN_SINGLES', name: '男子单打', weight: 1.5 },
  ws: { code: 'WOMEN_SINGLES', name: '女子单打', weight: 1.5 },
  md: { code: 'MEN_DOUBLES', name: '男子双打', weight: 1.0 },
  wd: { code: 'WOMEN_DOUBLES', name: '女子双打', weight: 1.0 },
  xd: { code: 'MIXED_DOUBLES', name: '混合双打', weight: 1.2 }
};

// 项目在 events 数组里的输出顺序
const EVENT_ORDER = ['ms', 'ws', 'md', 'wd', 'xd'];

// ---------------------------------------------------------------------------
// 赛事数据
//
// 每个项目写成 { g: [...冠军], s: [...亚军], b: [[半决赛负者A], [半决赛负者B]] }
//   - 单打：每组 1 人；双打/混双：每组 2 人（同名次同奖牌，分行存储）
//   - b 缺省表示该项目四强资料未收录（双打四强公开资料不全）
// ---------------------------------------------------------------------------
const EDITIONS = [
  {
    id: '2022-wtt-grand-smash-singapore',
    name: 'WTT新加坡大满贯',
    year: 2022,
    start_date: '2022-03-07',
    end_date: '2022-03-20',
    location: '新加坡',
    events: {
      ms: { g: ['樊振东'], s: ['马龙'], b: [['梁靖崑'], ['宇田幸矢']] },
      ws: { g: ['陈梦'], s: ['王曼昱'], b: [['孙颖莎'], ['王艺迪']] },
      md: { g: ['樊振东', '王楚钦'], s: ['宇田幸矢', '户上隼辅'] },
      wd: { g: ['王曼昱', '孙颖莎'], s: ['早田希娜', '伊藤美诚'] },
      xd: { g: ['王楚钦', '孙颖莎'], s: ['林昀儒', '郑怡静'] }
    }
  },
  {
    id: '2023-wtt-grand-smash-singapore',
    name: 'WTT新加坡大满贯',
    year: 2023,
    start_date: '2023-03-07',
    end_date: '2023-03-19',
    location: '新加坡',
    events: {
      ms: { g: ['樊振东'], s: ['马龙'], b: [['王楚钦'], ['雨果·卡尔德拉诺']] },
      ws: { g: ['孙颖莎'], s: ['钱天一'], b: [['王曼昱'], ['张瑞']] },
      md: { g: ['樊振东', '王楚钦'], s: ['张禹珍', '林钟勋'] },
      wd: { g: ['孙颖莎', '王曼昱'], s: ['陈梦', '王艺迪'] },
      xd: { g: ['王楚钦', '孙颖莎'], s: ['张本智和', '早田希娜'] }
    }
  },
  {
    id: '2024-wtt-grand-smash-singapore',
    name: 'WTT新加坡大满贯',
    year: 2024,
    start_date: '2024-03-07',
    end_date: '2024-03-17',
    location: '新加坡',
    events: {
      ms: { g: ['王楚钦'], s: ['梁靖崑'], b: [['林昀儒'], ['费利克斯·勒布伦']] },
      ws: { g: ['王曼昱'], s: ['王艺迪'], b: [['陈梦'], ['陈幸同']] },
      md: { g: ['马龙', '林高远'], s: ['樊振东', '王楚钦'] },
      wd: { g: ['陈梦', '王曼昱'], s: ['郑怡静', '李昱谆'] },
      xd: { g: ['王楚钦', '孙颖莎'], s: ['林钟勋', '申裕斌'] }
    }
  },
  {
    id: '2024-wtt-grand-smash-saudi',
    name: 'WTT沙特大满贯',
    year: 2024,
    start_date: '2024-05-01',
    end_date: '2024-05-11',
    location: '沙特吉达',
    events: {
      ms: { g: ['王楚钦'], s: ['帕特里克·弗朗西斯卡'], b: [['林诗栋'], ['张禹珍']] },
      ws: { g: ['陈梦'], s: ['孙颖莎'], b: [['王艺迪'], ['早田希娜']] },
      md: { g: ['马龙', '王楚钦'], s: ['户上隼辅', '篠塚大登'] },
      wd: { g: ['陈梦', '王曼昱'], s: ['田志希', '申裕斌'] },
      xd: { g: ['王楚钦', '孙颖莎'], s: ['黄镇廷', '杜凯琹'] }
    }
  },
  {
    id: '2024-wtt-grand-smash-china',
    name: 'WTT中国大满贯',
    year: 2024,
    start_date: '2024-09-26',
    end_date: '2024-10-06',
    location: '中国北京',
    events: {
      ms: { g: ['林诗栋'], s: ['马龙'], b: [['梁靖崑'], ['向鹏']] },
      ws: { g: ['孙颖莎'], s: ['王曼昱'], b: [['陈幸同'], ['范思琦']] },
      md: { g: ['王楚钦', '梁靖崑'], s: ['林高远', '林诗栋'] },
      wd: { g: ['陈幸同', '钱天一'], s: ['孙颖莎', '王艺迪'] },
      xd: { g: ['林诗栋', '蒯曼'], s: ['林高远', '王艺迪'] }
    }
  },
  {
    id: '2025-wtt-grand-smash-singapore',
    name: 'WTT新加坡大满贯',
    year: 2025,
    start_date: '2025-01-30',
    end_date: '2025-02-09',
    location: '新加坡',
    events: {
      ms: { g: ['林诗栋'], s: ['梁靖崑'], b: [['王楚钦'], ['艾利克斯·勒布伦']] },
      ws: { g: ['孙颖莎'], s: ['蒯曼'], b: [['王艺迪'], ['陈幸同']] },
      md: { g: ['王楚钦', '林诗栋'], s: ['林昀儒', '高承睿'] },
      wd: { g: ['王曼昱', '蒯曼'], s: ['孙颖莎', '王艺迪'] },
      xd: { g: ['林诗栋', '蒯曼'], s: ['松岛辉空', '张本美和'] }
    }
  },
  {
    id: '2025-wtt-grand-smash-usa',
    name: 'WTT美国大满贯',
    year: 2025,
    start_date: '2025-07-03',
    end_date: '2025-07-13',
    location: '美国拉斯维加斯',
    events: {
      ms: { g: ['王楚钦'], s: ['张本智和'], b: [['林诗栋'], ['费利克斯·勒布伦']] },
      ws: { g: ['朱雨玲'], s: ['陈熠'], b: [['伊藤美诚'], ['蒯曼']] },
      md: { g: ['林钟勋', '安宰贤'], s: ['艾利克斯·勒布伦', '费利克斯·勒布伦'] },
      wd: { g: ['蒯曼', '王艺迪'], s: ['孙颖莎', '王曼昱'] },
      xd: { g: ['林诗栋', '蒯曼'], s: ['林钟勋', '申裕斌'] }
    }
  },
  {
    id: '2025-wtt-grand-smash-sweden',
    name: 'WTT欧洲大满贯瑞典站',
    year: 2025,
    start_date: '2025-08-14',
    end_date: '2025-08-24',
    location: '瑞典马尔默',
    events: {
      ms: { g: ['特鲁斯·莫雷加德'], s: ['林诗栋'], b: [['西蒙·高茨'], ['贝内迪克特·杜达']] },
      ws: { g: ['孙颖莎'], s: ['王曼昱'], b: [['陈熠'], ['石洵瑶']] },
      md: { g: ['黄镇廷', '陈颢桦'], s: ['林诗栋', '黄友政'] },
      wd: { g: ['孙颖莎', '王曼昱'], s: ['张本美和', '大藤沙月'] },
      xd: { g: ['林诗栋', '蒯曼'], s: ['林钟勋', '申裕斌'] }
    }
  },
  {
    id: '2025-wtt-grand-smash-china',
    name: 'WTT中国大满贯',
    year: 2025,
    start_date: '2025-09-25',
    end_date: '2025-10-05',
    location: '中国北京',
    events: {
      ms: { g: ['王楚钦'], s: ['费利克斯·勒布伦'], b: [['林诗栋'], ['向鹏']] },
      ws: { g: ['王曼昱'], s: ['孙颖莎'], b: [['陈幸同'], ['申裕斌']] },
      md: { g: ['王楚钦', '林诗栋'], s: ['周启豪', '陈俊菘'] },
      wd: { g: ['王曼昱', '蒯曼'], s: ['早田希娜', '朱芊曦'] },
      xd: { g: ['王楚钦', '孙颖莎'], s: ['黄友政', '陈熠'] }
    }
  },
  {
    id: '2026-wtt-grand-smash-singapore',
    name: 'WTT新加坡大满贯',
    year: 2026,
    start_date: '2026-02-19',
    end_date: '2026-03-01',
    location: '新加坡',
    events: {
      ms: { g: ['王楚钦'], s: ['林昀儒'], b: [['费利克斯·勒布伦'], ['特鲁斯·莫雷加德']] },
      ws: { g: ['孙颖莎'], s: ['王曼昱'], b: [['陈熠'], ['萨比娜·温特']] },
      md: { g: ['费利克斯·勒布伦', '艾利克斯·勒布伦'], s: ['林诗栋', '黄友政'] },
      wd: { g: ['早田希娜', '张本美和'], s: ['申裕斌', '长崎美柚'] },
      xd: { g: ['雨果·卡尔德拉诺', '布鲁娜·高桥'], s: ['林钟勋', '申裕斌'] }
    }
  },
  {
    id: '2026-wtt-grand-smash-usa',
    name: 'WTT美国大满贯',
    year: 2026,
    start_date: '2026-06-26',
    end_date: '2026-07-06',
    location: '美国拉斯维加斯',
    events: {
      ms: { g: ['松岛辉空'], s: ['弗拉基米尔·西多伦科'], b: [['费利克斯·勒布伦'], ['特鲁斯·莫雷加德']] },
      ws: { g: ['孙颖莎'], s: ['蒯曼'], b: [['王艺迪'], ['张本美和']] },
      md: { g: ['温瑞博', '袁励岑'], s: ['林诗栋', '黄友政'] },
      wd: { g: ['王曼昱', '蒯曼'], s: ['早田希娜', '张本美和'] },
      xd: { g: ['林钟勋', '申裕斌'], s: ['王楚钦', '孙颖莎'] }
    }
  }
];

// ---------------------------------------------------------------------------
// 读取现有数据，保留既有赛事的 日期 / 地点 / 名称 / 参赛人数 / 届次
// ---------------------------------------------------------------------------
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

const existingTournaments = readJson('tournaments.json');
const existingEvents = readJson('events.json');

const existingById = new Map(existingTournaments.map(t => [t.id, t]));
const existingEventIds = new Set(existingEvents.map(e => e.id));

// ---------------------------------------------------------------------------
// 构建
// ---------------------------------------------------------------------------
function buildResults(spec) {
  const results = [];
  for (const name of spec.g || []) {
    results.push({ athlete_id: aid(name), rank: 1, medal: 'gold' });
  }
  for (const name of spec.s || []) {
    results.push({ athlete_id: aid(name), rank: 2, medal: 'silver' });
  }
  for (const group of spec.b || []) {
    for (const name of group) {
      results.push({ athlete_id: aid(name), rank: 3, medal: 'bronze' });
    }
  }
  return results;
}

const tournaments = [];
const events = [];

for (const ed of EDITIONS) {
  const prev = existingById.get(ed.id);

  tournaments.push({
    id: ed.id,
    name: prev ? prev.name : ed.name,
    type: TYPE,
    level: LEVEL,
    year: ed.year,
    // 已存在的赛事保留原始日期/地点，避免与 matches.json 等既有数据冲突
    start_date: prev ? prev.start_date : ed.start_date,
    end_date: prev ? prev.end_date : ed.end_date,
    location: prev ? prev.location : ed.location,
    edition: prev ? prev.edition : String(ed.year),
    participant_count: prev ? prev.participant_count : 128
  });

  for (const suffix of EVENT_ORDER) {
    const spec = ed.events[suffix];
    if (!spec) continue;
    const def = EVENT_DEF[suffix];
    events.push({
      id: `${ed.id}-${suffix}`,
      tournament_id: ed.id,
      name: def.name,
      code: def.code,
      weight: def.weight,
      results: buildResults(spec)
    });
  }
}

// ---------------------------------------------------------------------------
// 自检
// ---------------------------------------------------------------------------
const problems = [];

const seenTournament = new Set();
for (const t of tournaments) {
  if (seenTournament.has(t.id)) problems.push(`重复赛事 id: ${t.id}`);
  seenTournament.add(t.id);
  if (!/^\d{4}-wtt-grand-smash-[a-z]+$/.test(t.id)) problems.push(`赛事 id 不符合命名规范: ${t.id}`);
  if (t.start_date > t.end_date) problems.push(`${t.id} 起止日期倒置`);
}

const seenEvent = new Set();
for (const e of events) {
  if (seenEvent.has(e.id)) problems.push(`重复项目 id: ${e.id}`);
  seenEvent.add(e.id);
  if (!seenTournament.has(e.tournament_id)) problems.push(`${e.id} 指向不存在的赛事`);
  if (!e.results.some(r => r.rank === 1)) problems.push(`${e.id} 缺少冠军`);
}

// 必须保留的、matches.json 依赖的既有项目 id
const MUST_KEEP = [
  '2023-wtt-grand-smash-singapore-ms',
  '2023-wtt-grand-smash-singapore-ws',
  '2024-wtt-grand-smash-singapore-ms',
  '2024-wtt-grand-smash-singapore-ws'
];
for (const id of MUST_KEEP) {
  if (!seenEvent.has(id)) problems.push(`丢失既有项目 id: ${id}`);
  if (!existingEventIds.has(id)) problems.push(`既有 events.json 中未找到: ${id}`);
}

// ---------------------------------------------------------------------------
// 输出
// ---------------------------------------------------------------------------
fs.writeFileSync(OUT_FILE, JSON.stringify({ tournaments, events }, null, 2) + '\n', 'utf8');

const rosterHits = new Set();
const outsiders = new Set();
for (const e of events) {
  for (const r of e.results) {
    if (Object.values(ROSTER).includes(r.athlete_id)) rosterHits.add(r.athlete_id);
    else outsiders.add(r.athlete_id);
  }
}

console.log(`已写入 ${path.relative(process.cwd(), OUT_FILE)}`);
console.log(`赛事 ${tournaments.length} 项，项目 ${events.length} 个，年份 ${tournaments[0].year}-${tournaments[tournaments.length - 1].year}`);
console.log(`保留既有赛事 id: ${tournaments.filter(t => existingById.has(t.id)).map(t => t.id).join(', ')}`);
console.log(`命中名册选手 ${rosterHits.size} 人，名册外(按姓名存储) ${outsiders.size} 人`);
if (problems.length) {
  console.log('\n自检发现问题:');
  problems.forEach(p => console.log('  - ' + p));
  process.exitCode = 1;
} else {
  console.log('自检通过。');
}
