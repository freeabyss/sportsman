/**
 * 中国乒乓球超级联赛 (Chinese Table Tennis Super League, CSL / 乒超) 数据生成器
 *
 * 运行: node scripts/build_csl.cjs
 * 输出: scripts/_gen_csl.json  -> { tournaments: [...], events: [...] }
 *
 * 只输出 type === 'csl' 的赛事与项目，不修改 src/data 下任何文件。
 *
 * 史实要点（已核实，来源：维基百科「中国乒乓球超级联赛」、百度百科、
 * 中国乒协(CTTA)公告、各大媒体报道）：
 *  - 乒超联赛 1999 年举办首届（前身为 1994 年 CCTV 杯、1995 年俱乐部联赛）。
 *  - 乒超为「俱乐部团体联赛」，每赛季只产生男团、女团两个冠军俱乐部；
 *    本生成器仅收录这两个团体项目（MEN_TEAM / WOMEN_TEAM，权重 0.6）。
 *  - 每个冠军俱乐部的「主力/常规阵容」球员作为独立成绩行（rank1 / gold）写入；
 *    亚军俱乐部不收录（按用户要求只记冠军）。
 *  - 球员归属：固定 37 人名册命中者用其 id；名册外（含外援、现役非名册主力）
 *    一律以中文姓名原样存储（仅作展示，绝不臆造 id）。
 *  - 跨年赛季（2000–2001、2003–2004、2018–2019）以「起始年」作为 id 与 year，
 *    起止日期跨两年；edition 用赛季标签（如 "2000–2001"）。
 *  - participant_count 记为该赛季参赛俱乐部（男+女）总数，早期赛季为估算值。
 *  - 早期赛季的具体日期/举办地为最佳估计，已在报告中标注不确定性。
 */

const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '_gen_csl.json');

const TYPE = 'csl';
const LEVEL = 'C';

// ---------------------------------------------------------------------------
// 固定名册（37 人）。命中则用 id，否则原样保留姓名字符串（外援/名册外选手仅作展示）。
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
// 项目定义（乒超仅设男团 / 女团）
// ---------------------------------------------------------------------------
const EVENT_DEF = {
  mt: { code: 'MEN_TEAM', name: '男子团体', weight: 0.6 },
  wt: { code: 'WOMEN_TEAM', name: '女子团体', weight: 0.6 }
};

const EVENT_ORDER = ['mt', 'wt'];

// ---------------------------------------------------------------------------
// 赛季数据
//   men / women: { club: '冠军俱乐部', players: [主力球员...] }
//   球员均按该赛季冠军俱乐部阵容（最佳努力核实）列出；名次全部为冠军(gold)。
// ---------------------------------------------------------------------------
const SEASONS = [
  {
    id: '1999-csl',
    name: '1999赛季中国乒乓球超级联赛',
    year: 1999,
    edition: '1999',
    start_date: '1999-06-01',
    end_date: '1999-12-31',
    location: '全国',
    participant_count: 12, // 估算（首届，具体队数未精确核实）
    note: '首届乒超联赛，日期/举办地为最佳估计',
    men: { club: '黑龙江', players: ['孔令辉', '王飞', '张鹏'] },
    women: { club: '江苏无锡山禾', players: ['李菊', '杨影', '林菱'] }
  },
  {
    id: '2000-csl',
    name: '2000–2001赛季中国乒乓球超级联赛',
    year: 2000,
    edition: '2000–2001',
    start_date: '2000-07-01',
    end_date: '2001-03-31',
    location: '全国',
    participant_count: 16, // 估算
    note: '跨年赛季，日期为最佳估计',
    men: { club: '八一', players: ['马琳', '刘国梁', '王涛'] },
    women: { club: '河北六通', players: ['牛剑锋', '白杨'] }
  },
  {
    id: '2002-csl',
    name: '2002赛季中国乒乓球超级联赛',
    year: 2002,
    edition: '2002',
    start_date: '2002-06-01',
    end_date: '2002-12-31',
    location: '全国',
    participant_count: 12, // 估算
    note: '日期为最佳估计',
    men: { club: '山东鲁能', players: ['马琳', '刘国正', '张勇'] },
    women: { club: '河北六通', players: ['牛剑锋', '白杨'] }
  },
  {
    id: '2003-csl',
    name: '2003–2004赛季中国乒乓球超级联赛',
    year: 2003,
    edition: '2003–2004',
    start_date: '2003-07-01',
    end_date: '2004-11-30',
    location: '全国多地主客场',
    participant_count: 24, // 男12 + 女12
    note: '跨年主客场赛季（22轮），日期为最佳估计',
    men: { club: '广东全球通', players: ['马琳', '张超', '凌伟超'] },
    women: { club: '北京海菲泰', players: ['张怡宁', '李楠', '郭焱', '丁宁'] }
  },
  {
    id: '2005-csl',
    name: '2005赛季中国乒乓球超级联赛',
    year: 2005,
    edition: '2005',
    start_date: '2005-06-01',
    end_date: '2005-12-31',
    location: '全国',
    participant_count: 16, // 估算
    note: '日期为最佳估计',
    men: { club: '陕西银河', players: ['马琳', '郝帅', '高礼泽'] },
    women: { club: '山东鲁能', players: ['李晓霞', '彭陆洋'] }
  },
  {
    id: '2006-csl',
    name: '2006赛季中国乒乓球超级联赛',
    year: 2006,
    edition: '2006',
    start_date: '2006-06-01',
    end_date: '2006-12-31',
    location: '全国',
    participant_count: 16, // 估算
    note: '日期为最佳估计',
    men: { club: '陕西银河', players: ['马琳', '郝帅', '高礼泽'] },
    women: { club: '北京首创', players: ['张怡宁', '郭焱', '丁宁'] }
  },
  {
    id: '2007-csl',
    name: '2007赛季中国乒乓球超级联赛',
    year: 2007,
    edition: '2007',
    start_date: '2007-06-01',
    end_date: '2007-12-31',
    location: '全国',
    participant_count: 16, // 估算
    note: '日期为最佳估计',
    men: { club: '宁波北仑海天', players: ['马琳', '柳洋', '李静'] },
    women: { club: '北京首创', players: ['张怡宁', '郭焱', '丁宁'] }
  },
  {
    id: '2008-csl',
    name: '2008赛季中国乒乓球超级联赛',
    year: 2008,
    edition: '2008',
    start_date: '2008-06-01',
    end_date: '2008-12-31',
    location: '全国',
    participant_count: 16, // 估算
    note: '日期为最佳估计',
    men: { club: '上海冠生园', players: ['王励勤', '许昕', '高礼泽'] },
    women: { club: '山东鲁能', players: ['李晓霞', '彭陆洋'] }
  },
  {
    id: '2009-csl',
    name: '2009赛季中国乒乓球超级联赛',
    year: 2009,
    edition: '2009',
    start_date: '2009-06-01',
    end_date: '2009-12-31',
    location: '浙江宁波（北仑）',
    participant_count: 16, // 估算
    note: '日期为最佳估计',
    men: { club: '宁波北仑海天', players: ['马龙', '唐鹏', '庄智渊'] },
    women: { club: '北京时博', players: ['张怡宁', '丁宁'] }
  },
  {
    id: '2010-csl',
    name: '2010赛季中国乒乓球超级联赛',
    year: 2010,
    edition: '2010',
    start_date: '2010-06-09',
    end_date: '2010-09-26',
    location: '全国',
    participant_count: 18, // 男9 + 女9
    men: { club: '山东鲁能', players: ['张继科', '张超', '朱世赫'] },
    women: { club: '山东鲁能', players: ['李晓霞', '彭陆洋', '金暻娥'] }
  },
  {
    id: '2011-csl',
    name: '2011赛季中国乒乓球超级联赛',
    year: 2011,
    edition: '2011',
    start_date: '2011-06-01',
    end_date: '2011-12-31',
    location: '全国',
    participant_count: 18, // 估算
    note: '日期为最佳估计',
    men: { club: '浙商银行', players: ['马琳', '郝帅', '波尔'] },
    women: { club: '山东鲁能', players: ['李晓霞', '彭陆洋', '金暻娥'] }
  },
  {
    id: '2012-csl',
    name: '2012赛季中国乒乓球超级联赛',
    year: 2012,
    edition: '2012',
    start_date: '2012-06-01',
    end_date: '2012-12-31',
    location: '全国',
    participant_count: 18, // 估算
    note: '日期为最佳估计',
    men: { club: '宁波海天塑机', players: ['马龙', '闫安', '朱世赫'] },
    women: { club: '山西大土河·华东理工', players: ['刘诗雯', '冯亚兰', '饶静文'] }
  },
  {
    id: '2013-csl',
    name: '2013赛季中国乒乓球超级联赛',
    year: 2013,
    edition: '2013',
    start_date: '2013-06-01',
    end_date: '2013-12-31',
    location: '全国',
    participant_count: 18, // 估算
    note: '日期为最佳估计',
    men: { club: '宁波海天塑机', players: ['马龙', '闫安', '朱世赫'] },
    women: { club: '八一冀中能源', players: ['郭跃', '木子', '曹臻', '刘曦'] }
  },
  {
    id: '2014-csl',
    name: '2014赛季中国乒乓球超级联赛',
    year: 2014,
    edition: '2014',
    start_date: '2014-05-01',
    end_date: '2014-12-31',
    location: '全国',
    participant_count: 20, // 估算
    note: '日期为最佳估计',
    men: { club: '山东鲁能', players: ['张继科', '郝帅', '方博', '吴灏'] },
    women: { club: '山东鲁能', players: ['李晓霞', '陈梦', '顾玉婷', '顾若辰', '王璇'] }
  },
  {
    id: '2015-csl',
    name: '2015赛季中国乒乓球超级联赛',
    year: 2015,
    edition: '2015',
    start_date: '2015-05-01',
    end_date: '2015-09-13',
    location: '全国（总决赛重庆）',
    participant_count: 20, // 估算
    note: '总决赛 2015-09-13 重庆',
    men: { club: '宁波海天塑机', players: ['马龙', '闫安', '林高远', '吕翔'] },
    women: { club: '北京首钢', players: ['丁宁', '冯亚兰', '文佳', '盛丹丹', '李佳原'] }
  },
  {
    id: '2016-csl',
    name: '2016赛季中国乒乓球超级联赛',
    year: 2016,
    edition: '2016',
    start_date: '2016-05-01',
    end_date: '2016-12-31',
    location: '全国',
    participant_count: 20, // 估算
    note: '日期为最佳估计',
    men: { club: '八一大商', players: ['樊振东', '周雨', '徐晨皓', '梁靖崑'] },
    women: { club: '武汉安心百分百', players: ['刘诗雯', '冯亚兰', '刘高阳', '张瑞', '钱天一'] }
  },
  {
    id: '2017-csl',
    name: '2017赛季中国乒乓球超级联赛',
    year: 2017,
    edition: '2017',
    start_date: '2017-05-01',
    end_date: '2017-12-31',
    location: '全国',
    participant_count: 20, // 估算
    note: '日期为最佳估计',
    men: { club: '山东魏桥·向尚运动', players: ['林高远', '闫安', '薛飞', '夏易正'] },
    women: { club: '武汉安心百分百', players: ['刘诗雯', '冯亚兰', '张瑞', '钱天一', '孙艺祯', '张缤月'] }
  },
  {
    id: '2018-csl',
    name: '2018–2019赛季中国乒乓球超级联赛',
    year: 2018,
    edition: '2018–2019',
    start_date: '2018-10-10',
    end_date: '2019-02-28',
    location: '全国多地主客场',
    participant_count: 20, // 男10 + 女10
    note: '跨年主客场赛季',
    men: { club: '天津', players: ['林高远', '方博', '朱霖峰'] },
    women: { club: '山东鲁能·潍坊高新', players: ['王曼昱', '陈幸同', '刘高阳'] }
  },
  {
    id: '2020-csl',
    name: '2020赛季中国乒乓球超级联赛',
    year: 2020,
    edition: '2020',
    start_date: '2020-12-01',
    end_date: '2020-12-31',
    location: '广东（长隆）',
    participant_count: 16, // 估算（疫情缩编赛会制）
    note: '疫情赛会制，12月于广东长隆举办',
    men: { club: '山东鲁能', players: ['马龙', '王楚钦', '方博'] },
    women: { club: '深圳大学', players: ['陈梦', '孙颖莎', '王艺迪'] }
  },
  {
    id: '2021-csl',
    name: '2021赛季中国乒乓球超级联赛',
    year: 2021,
    edition: '2021',
    start_date: '2021-10-03',
    end_date: '2021-10-12',
    location: '山东威海',
    participant_count: 15, // 男9 + 女6
    men: { club: '山东魏桥·向尚运动', players: ['梁靖崑', '周启豪', '刘丁硕', '周雨', '于子洋'] },
    women: { club: '山东鲁能', players: ['陈梦', '王曼昱', '陈幸同', '钱天一', '范思琦', '王添艺'] }
  },
  {
    id: '2022-csl',
    name: '2022赛季中国乒乓球超级联赛',
    year: 2022,
    edition: '2022',
    start_date: '2022-11-01',
    end_date: '2022-12-31',
    location: '山东（威海/黄石）',
    participant_count: 15, // 估算
    note: '疫情赛会制，日期为最佳估计',
    men: { club: '山东鲁能', players: ['马龙', '袁励岑', '徐瑛彬', '刘丁硕', '闫安'] },
    women: { club: '山东鲁能', players: ['王曼昱', '陈幸同', '钱天一', '范思琦', '徐奕', '王添艺'] }
  },
  {
    id: '2023-csl',
    name: '2023赛季中国乒乓球超级联赛',
    year: 2023,
    edition: '2023',
    start_date: '2023-07-15',
    end_date: '2023-12-24',
    location: '贵州遵义/江西吉安（分站）·深圳（总决赛）',
    participant_count: 15, // 男9 + 女6
    men: { club: '山东鲁能', players: ['马龙', '袁励岑', '徐瑛彬'] },
    women: { club: '深圳大学', players: ['陈梦', '孙颖莎', '蒯曼'] }
  },
  {
    id: '2024-csl',
    name: '2024赛季中国乒乓球超级联赛',
    year: 2024,
    edition: '2024',
    start_date: '2024-12-12',
    end_date: '2025-01-01',
    location: '湖南长沙（分站）·上海（总决赛）',
    participant_count: 15, // 男9 + 女6 俱乐部，约72名运动员
    note: '总决赛 2024-12-30~2025-01-01 上海体育馆',
    men: { club: '山东魏桥·向尚运动', players: ['王楚钦', '梁靖崑', '周启豪', '于子洋', '黄友政', '林昀儒'] },
    women: { club: '山东鲁能', players: ['王曼昱', '陈幸同', '钱天一', '范思琦', '徐奕'] }
  },
  {
    id: '2025-csl',
    name: '2025赛季中国乒乓球超级联赛',
    year: 2025,
    edition: '2025',
    start_date: '2025-06-01',
    end_date: '2025-12-31',
    location: '全国',
    participant_count: 15, // 估算
    note: '2025赛季日期/举办地为最佳估计',
    men: { club: '山东魏桥·向尚运动', players: ['王楚钦', '梁靖崑', '黄友政', '周启豪', '于子洋', '林昀儒'] },
    women: { club: '深圳大学', players: ['孙颖莎', '蒯曼', '覃予萱', '平野美宇'] }
  }
];

// ---------------------------------------------------------------------------
// 构建
// ---------------------------------------------------------------------------
function buildResults(players) {
  return players.map(name => ({ athlete_id: aid(name), rank: 1, medal: 'gold' }));
}

const tournaments = [];
const events = [];

SEASONS.forEach(s => {
  tournaments.push({
    id: s.id,
    name: s.name,
    type: TYPE,
    level: LEVEL,
    year: s.year,
    start_date: s.start_date,
    end_date: s.end_date,
    location: s.location,
    edition: s.edition,
    participant_count: s.participant_count
  });

  for (const suffix of EVENT_ORDER) {
    const team = suffix === 'mt' ? s.men : s.women;
    const def = EVENT_DEF[suffix];
    events.push({
      id: `${s.id}-${suffix}`,
      tournament_id: s.id,
      name: def.name,
      code: def.code,
      weight: def.weight,
      results: buildResults(team.players)
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
  if (!/^\d{4}-csl$/.test(t.id)) problems.push(`赛事 id 不符合命名规范: ${t.id}`);
  const startYear = parseInt(t.id.slice(0, 4), 10);
  if (startYear !== t.year) problems.push(`${t.id} id 年份(${startYear}) 与 year(${t.year}) 不一致`);
  if (t.start_date > t.end_date) problems.push(`${t.id} 起止日期倒置`);
  if (!Number.isInteger(t.participant_count) || t.participant_count <= 0) {
    problems.push(`${t.id} participant_count 异常: ${t.participant_count}`);
  }
}

const seenEvent = new Set();
for (const e of events) {
  if (seenEvent.has(e.id)) problems.push(`重复项目 id: ${e.id}`);
  seenEvent.add(e.id);
  if (!seenTournament.has(e.tournament_id)) problems.push(`${e.id} 指向不存在的赛事`);
  if (e.results.length === 0) problems.push(`${e.id} 缺少冠军成绩`);
  // 团体冠军：每个主力 rank1 gold
  for (const r of e.results) {
    if (r.rank !== 1 || r.medal !== 'gold') {
      problems.push(`${e.id} 成绩应为 rank1/gold: ${JSON.stringify(r)}`);
    }
  }
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
console.log(`赛事(tournaments) ${tournaments.length} 项，项目(events) ${events.length} 个，年份 ${tournaments[0].year}-${tournaments[tournaments.length - 1].year}`);
console.log(`命中名册选手 ${rosterHits.size} 人，名册外(按姓名存储) ${outsiders.size} 人`);
console.log(`名册外选手示例: ${Array.from(outsiders).slice(0, 12).join('、')} …`);
if (problems.length) {
  console.log('\n自检发现问题:');
  problems.forEach(p => console.log('  - ' + p));
  process.exitCode = 1;
} else {
  console.log('自检通过。');
}
