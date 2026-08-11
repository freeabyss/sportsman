/**
 * WTT 冠军赛 (WTT Champions) 数据生成器
 *
 * 运行: node scripts/build_wtt_champions.cjs
 * 输出: scripts/_gen_wtt_champions.json  -> { tournaments: [...], events: [...] }
 *
 * 只输出 type === 'wtt_champions' 的赛事与项目，不修改 src/data 下任何文件。
 *
 * 史实要点（已核实）：
 *  - WTT 冠军赛（Champions，第二层级、仅设单打）自 2022 年起步，首站为
 *    布达佩斯「欧洲夏季系列赛」。2021 年并不存在冠军赛分站。
 *  - 每站冠军赛男女各 32 人（合计 64 人），无资格赛、无双打。
 *  - 用户最初列出的 Goa / Ljubljana / Tunis / Bucharest / Rio 均为 WTT 球星挑战赛
 *    （Star Contender），并非冠军赛，已排除。
 *  - 截至 2026-08-11，2026 年冠军赛已举办 3 站（多哈、重庆、横滨）；
 *    澳门(9.8-9.13)、蒙彼利埃(10.27-11.1)、德国法兰克福(11.3-11.8) 尚未开赛，故不收录。
 */

const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '_gen_wtt_champions.json');

const TYPE = 'wtt_champions';
const LEVEL = 'B';

// ---------------------------------------------------------------------------
// 固定名册（37 人）。命中则用 id，否则原样保留姓名字符串（外协/名册外选手仅作展示）。
// 注意：林诗栋、向鹏、陈幸同、蒯曼 等现役主力不在名册内，将以姓名字符串存储。
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
// 项目定义（冠军赛仅设单打）
// ---------------------------------------------------------------------------
const EVENT_DEF = {
  ms: { code: 'MEN_SINGLES', name: '男子单打', weight: 1.5 },
  ws: { code: 'WOMEN_SINGLES', name: '女子单打', weight: 1.5 }
};

const EVENT_ORDER = ['ms', 'ws'];

// ---------------------------------------------------------------------------
// 赛事数据
//
// 每个项目写成 { g: [冠军], s: [亚军], b: [[半决赛负者A], [半决赛负者B]] }
//   - 单打每组 1 人；b 为两名半决赛负者（均获铜牌）
// ---------------------------------------------------------------------------
const EDITIONS = [
  // ===================== 2022 =====================
  {
    id: '2022-wtt-champions-budapest',
    name: 'WTT布达佩斯冠军赛',
    year: 2022,
    start_date: '2022-07-18',
    end_date: '2022-07-23',
    location: '匈牙利布达佩斯',
    note: 'WTT Champions 欧洲夏季系列赛（首站）',
    events: {
      ms: { g: ['张本智和'], s: ['林高远'], b: [['帕特里克·弗朗西斯卡'], ['庄智渊']] },
      ws: { g: ['王曼昱'], s: ['王艺迪'], b: [['陈梦'], ['孙颖莎']] }
    }
  },
  {
    id: '2022-wtt-champions-macao',
    name: 'WTT澳门冠军赛',
    year: 2022,
    start_date: '2022-10-19',
    end_date: '2022-10-23',
    location: '中国澳门',
    events: {
      ms: { g: ['王楚钦'], s: ['樊振东'], b: [['林昀儒'], ['特鲁斯·莫雷加德']] },
      ws: { g: ['孙颖莎'], s: ['陈幸同'], b: [['伊藤美诚'], ['袁嘉楠']] }
    }
  },
  // ===================== 2023 =====================
  {
    id: '2023-wtt-champions-xinxiang',
    name: 'WTT新乡冠军赛',
    year: 2023,
    start_date: '2023-04-09',
    end_date: '2023-04-15',
    location: '中国新乡',
    events: {
      ms: { g: ['樊振东'], s: ['梁靖崑'], b: [['林昀儒'], ['林钟勋']] },
      ws: { g: ['孙颖莎'], s: ['王艺迪'], b: [['陈幸同'], ['陈梦']] }
    }
  },
  {
    id: '2023-wtt-champions-macao',
    name: 'WTT澳门冠军赛',
    year: 2023,
    start_date: '2023-04-17',
    end_date: '2023-04-23',
    location: '中国澳门',
    events: {
      ms: { g: ['王楚钦'], s: ['马龙'], b: [['张本智和'], ['艾利克斯·勒布伦']] },
      ws: { g: ['王曼昱'], s: ['陈梦'], b: [['王艺迪'], ['孙颖莎']] }
    }
  },
  {
    id: '2023-wtt-champions-frankfurt',
    name: 'WTT法兰克福冠军赛',
    year: 2023,
    start_date: '2023-10-29',
    end_date: '2023-11-05',
    location: '德国法兰克福',
    events: {
      ms: { g: ['林昀儒'], s: ['马龙'], b: [['王楚钦'], ['费利克斯·勒布伦']] },
      ws: { g: ['王艺迪'], s: ['王曼昱'], b: [['孙颖莎'], ['早田希娜']] }
    }
  },
  // ===================== 2024 =====================
  {
    id: '2024-wtt-champions-incheon',
    name: 'WTT仁川冠军赛',
    year: 2024,
    start_date: '2024-03-21',
    end_date: '2024-03-31',
    location: '韩国仁川',
    events: {
      ms: { g: ['梁靖崑'], s: ['雨果·卡尔德拉诺'], b: [['马龙'], ['樊振东']] },
      ws: { g: ['孙颖莎'], s: ['王曼昱'], b: [['王艺迪'], ['陈梦']] }
    }
  },
  {
    id: '2024-wtt-champions-chongqing',
    name: 'WTT重庆冠军赛',
    year: 2024,
    start_date: '2024-05-30',
    end_date: '2024-06-03',
    location: '中国重庆',
    events: {
      ms: { g: ['樊振东'], s: ['王楚钦'], b: [['雨果·卡尔德拉诺'], ['邱党']] },
      ws: { g: ['孙颖莎'], s: ['王曼昱'], b: [['陈梦'], ['王艺迪']] }
    }
  },
  {
    id: '2024-wtt-champions-macao',
    name: 'WTT澳门冠军赛',
    year: 2024,
    start_date: '2024-09-09',
    end_date: '2024-09-15',
    location: '中国澳门',
    events: {
      ms: { g: ['林诗栋'], s: ['邱党'], b: [['王楚钦'], ['高承睿']] },
      ws: { g: ['孙颖莎'], s: ['王艺迪'], b: [['张本美和'], ['王曼昱']] }
    }
  },
  {
    id: '2024-wtt-champions-montpellier',
    name: 'WTT蒙彼利埃冠军赛',
    year: 2024,
    start_date: '2024-10-22',
    end_date: '2024-10-27',
    location: '法国蒙彼利埃',
    events: {
      ms: { g: ['费利克斯·勒布伦'], s: ['张本智和'], b: [['林诗栋'], ['贝内迪克特·杜达']] },
      ws: { g: ['大藤沙月'], s: ['张本美和'], b: [['郑怡静'], ['钱天一']] }
    }
  },
  {
    id: '2024-wtt-champions-frankfurt',
    name: 'WTT法兰克福冠军赛',
    year: 2024,
    start_date: '2024-11-03',
    end_date: '2024-11-10',
    location: '德国法兰克福',
    events: {
      ms: { g: ['林诗栋'], s: ['卡尔伯格'], b: [['林昀儒'], ['特鲁斯·莫雷加德']] },
      ws: { g: ['王曼昱'], s: ['王艺迪'], b: [['陈幸同'], ['张本美和']] }
    }
  },
  // ===================== 2025 =====================
  {
    id: '2025-wtt-champions-chongqing',
    name: 'WTT重庆冠军赛',
    year: 2025,
    start_date: '2025-03-11',
    end_date: '2025-03-16',
    location: '中国重庆',
    events: {
      ms: { g: ['王楚钦'], s: ['林诗栋'], b: [['张本智和'], ['梁靖崑']] },
      ws: { g: ['孙颖莎'], s: ['陈幸同'], b: [['王艺迪'], ['王曼昱']] }
    }
  },
  {
    id: '2025-wtt-champions-incheon',
    name: 'WTT仁川冠军赛',
    year: 2025,
    start_date: '2025-04-01',
    end_date: '2025-04-06',
    location: '韩国仁川',
    events: {
      ms: { g: ['向鹏'], s: ['李尚洙'], b: [['帕特里克·弗朗西斯卡'], ['林昀儒']] },
      ws: { g: ['王艺迪'], s: ['陈幸同'], b: [['朱雨玲'], ['张本美和']] }
    }
  },
  {
    id: '2025-wtt-champions-yokohama',
    name: 'WTT横滨冠军赛',
    year: 2025,
    start_date: '2025-08-07',
    end_date: '2025-08-11',
    location: '日本横滨',
    events: {
      ms: { g: ['张本智和'], s: ['王楚钦'], b: [['卡纳克·贾哈'], ['特鲁斯·莫雷加德']] },
      ws: { g: ['陈幸同'], s: ['孙颖莎'], b: [['王艺迪'], ['石洵瑶']] }
    }
  },
  {
    id: '2025-wtt-champions-macao',
    name: 'WTT澳门冠军赛',
    year: 2025,
    start_date: '2025-09-09',
    end_date: '2025-09-14',
    location: '中国澳门',
    events: {
      ms: { g: ['王楚钦'], s: ['雨果·卡尔德拉诺'], b: [['张禹珍'], ['安德斯·林德']] },
      ws: { g: ['孙颖莎'], s: ['王曼昱'], b: [['蒯曼'], ['陈幸同']] }
    }
  },
  {
    id: '2025-wtt-champions-montpellier',
    name: 'WTT蒙彼利埃冠军赛',
    year: 2025,
    start_date: '2025-10-28',
    end_date: '2025-11-02',
    location: '法国蒙彼利埃',
    events: {
      ms: { g: ['特鲁斯·莫雷加德'], s: ['松岛辉空'], b: [['张禹珍'], ['艾利克斯·勒布伦']] },
      ws: { g: ['王艺迪'], s: ['萨比娜·温特'], b: [['朱芊曦'], ['申裕斌']] }
    }
  },
  {
    id: '2025-wtt-champions-frankfurt',
    name: 'WTT法兰克福冠军赛',
    year: 2025,
    start_date: '2025-11-04',
    end_date: '2025-11-09',
    location: '德国法兰克福',
    events: {
      ms: { g: ['松岛辉空'], s: ['邱党'], b: [['安德斯·林德'], ['李尚洙']] },
      ws: { g: ['早田希娜'], s: ['张本美和'], b: [['伊藤美诚'], ['申裕斌']] }
    }
  },
  // ===================== 2026（截至 2026-08-11 已结束） =====================
  {
    id: '2026-wtt-champions-doha',
    name: 'WTT多哈冠军赛',
    year: 2026,
    start_date: '2026-01-07',
    end_date: '2026-01-11',
    location: '卡塔尔多哈',
    events: {
      ms: { g: ['林昀儒'], s: ['张禹珍'], b: [['林诗栋'], ['张本智和']] },
      ws: { g: ['朱雨玲'], s: ['陈幸同'], b: [['韩莹'], ['蒯曼']] }
    }
  },
  {
    id: '2026-wtt-champions-chongqing',
    name: 'WTT重庆冠军赛',
    year: 2026,
    start_date: '2026-03-10',
    end_date: '2026-03-15',
    location: '中国重庆',
    events: {
      ms: { g: ['费利克斯·勒布伦'], s: ['温瑞博'], b: [['松岛辉空'], ['张本智和']] },
      ws: { g: ['张本美和'], s: ['蒯曼'], b: [['王艺迪'], ['大藤沙月']] }
    }
  },
  {
    id: '2026-wtt-champions-yokohama',
    name: 'WTT横滨冠军赛',
    year: 2026,
    start_date: '2026-08-04',
    end_date: '2026-08-09',
    location: '日本横滨',
    events: {
      ms: { g: ['张本智和'], s: ['吴晙诚'], b: [['松岛辉空'], ['篠塚大登']] },
      ws: { g: ['张本美和'], s: ['陈幸同'], b: [['蒯曼'], ['王艺迪']] }
    }
  }
];

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

EDITIONS.forEach((ed, i) => {
  tournaments.push({
    id: ed.id,
    name: ed.name,
    type: TYPE,
    level: LEVEL,
    year: ed.year,
    start_date: ed.start_date,
    end_date: ed.end_date,
    location: ed.location,
    edition: `第${i + 1}站`,
    participant_count: 64
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
});

// ---------------------------------------------------------------------------
// 自检
// ---------------------------------------------------------------------------
const problems = [];

const seenTournament = new Set();
for (const t of tournaments) {
  if (seenTournament.has(t.id)) problems.push(`重复赛事 id: ${t.id}`);
  seenTournament.add(t.id);
  if (!/^\d{4}-wtt-champions-[a-z]+$/.test(t.id)) problems.push(`赛事 id 不符合命名规范: ${t.id}`);
  if (t.start_date > t.end_date) problems.push(`${t.id} 起止日期倒置`);
  if (t.participant_count !== 64) problems.push(`${t.id} 参赛人数异常(应为64): ${t.participant_count}`);
}

const seenEvent = new Set();
for (const e of events) {
  if (seenEvent.has(e.id)) problems.push(`重复项目 id: ${e.id}`);
  seenEvent.add(e.id);
  if (!seenTournament.has(e.tournament_id)) problems.push(`${e.id} 指向不存在的赛事`);
  if (!e.results.some(r => r.rank === 1)) problems.push(`${e.id} 缺少冠军`);
  // 单打应有 1 金 1 银 2 铜 = 4 条成绩
  if (e.results.length !== 4) problems.push(`${e.id} 成绩条数异常(应为4): ${e.results.length}`);
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
console.log(`命中名册选手 ${rosterHits.size} 人，名册外(按姓名存储) ${outsiders.size} 人`);
if (problems.length) {
  console.log('\n自检发现问题:');
  problems.forEach(p => console.log('  - ' + p));
  process.exitCode = 1;
} else {
  console.log('自检通过。');
}
