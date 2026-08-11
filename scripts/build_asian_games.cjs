/**
 * 亚运会乒乓球比赛（Asian Games table tennis）数据生成器
 *
 * 运行：node scripts/build_asian_games.cjs
 * 产出：scripts/_gen_asian_games.json  => { tournaments: [...], events: [...] }
 *
 * 说明：
 * - 只输出 type === "asian_games" 的赛事与项目，不修改 src/data/*.json。
 * - 已存在的 tournament id（2022-asian-games / 2018-asian-games）沿用原有
 *   name/year/日期/地点/届次/人数，仅补齐缺失项目。
 * - athlete_id：命中 athletes.json（37 人固定名册）用其 id，否则直接存中文/原名字符串。
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'data');
const athletes = JSON.parse(fs.readFileSync(path.join(dataDir, 'athletes.json'), 'utf8'));
const existingTournaments = JSON.parse(fs.readFileSync(path.join(dataDir, 'tournaments.json'), 'utf8'));

const nameToId = Object.fromEntries(athletes.map((a) => [a.name, a.id]));
/** 名册内 -> id；名册外（含外籍/中国香港/中国台北等）-> 原样字符串 */
function aid(name) {
  return nameToId[name] || name;
}

const EVENT_META = {
  ms: { code: 'MEN_SINGLES', name: '男子单打', weight: 1.5 },
  ws: { code: 'WOMEN_SINGLES', name: '女子单打', weight: 1.5 },
  xd: { code: 'MIXED_DOUBLES', name: '混合双打', weight: 1.2 },
  md: { code: 'MEN_DOUBLES', name: '男子双打', weight: 1.0 },
  wd: { code: 'WOMEN_DOUBLES', name: '女子双打', weight: 1.0 },
  mt: { code: 'MEN_TEAM', name: '男子团体', weight: 0.6 },
  wt: { code: 'WOMEN_TEAM', name: '女子团体', weight: 0.6 },
};
/** 项目在 events.json 中的输出顺序 */
const EVENT_ORDER = ['ms', 'ws', 'md', 'wd', 'xd', 'mt', 'wt'];

/**
 * 历届数据。
 * singles: [冠军, 亚军, ...半决赛负者(铜牌)]
 * doubles / mixed: [选手A, 选手B]（仅冠军组合）
 * team: [冠军队成员...]（仅冠军队）
 */
const EDITIONS = [
  {
    id: '1974-asian-games',
    year: 1974,
    edition: '第7届',
    location: '德黑兰',
    start_date: '1974-09-08',
    end_date: '1974-09-15',
    participant_count: 200,
    events: {
      ms: { singles: ['梁戈亮', '河野满', 'Yun Chol'] },
      ws: { singles: ['张立', '郑贤淑', '胡玉兰'] },
      md: { pair: ['河野满', '长谷川信彦'] },
      wd: { pair: ['张立', '郑怀颖'] },
      xd: { pair: ['梁戈亮', '郑怀颖'] },
      mt: { team: ['李振恃', '梁戈亮', '郗恩庭', '许绍发', '曾博雄'] },
      wt: { team: ['胡玉兰', '黄锡萍', '张立', '郑怀颖'] },
    },
  },
  {
    id: '1978-asian-games',
    year: 1978,
    edition: '第8届',
    location: '曼谷',
    start_date: '1978-12-10',
    end_date: '1978-12-19',
    participant_count: 200,
    events: {
      ms: { singles: ['梁戈亮', '郭跃华', 'Jo Yong-ho', '高岛规郎'] },
      ws: { singles: ['张立', '张德英', '金顺玉', 'Kumiko Nagahara'] },
      md: { pair: ['郭跃华', '黄统生'] },
      wd: { pair: ['张立', '张德英'] },
      xd: { pair: ['郭跃华', '张立'] },
      mt: { team: ['陈新华', '郭跃华', '黄统生', '梁戈亮'] },
      // 1978 女团中的“杨莹”(1953年生) 与名册中的“杨影”(1977年生) 并非同一人
      wt: { team: ['曹燕华', '杨莹', '张德英', '张立'] },
    },
  },
  {
    id: '1982-asian-games',
    year: 1982,
    edition: '第9届',
    location: '新德里',
    // 维基百科未给出乒乓球分项具体日期，此处采用第9届亚运会会期
    start_date: '1982-11-19',
    end_date: '1982-12-04',
    participant_count: 200,
    events: {
      ms: { singles: ['谢赛克', '斋藤清', 'Jo Yong-ho', '小野诚治'] },
      ws: { singles: ['曹燕华', '童玲', '梁英子', '尹景美'] },
      md: { pair: ['小野诚治', '阿部博幸'] },
      wd: { pair: ['曹燕华', '戴丽丽'] },
      xd: { pair: ['谢赛克', '曹燕华'] },
      mt: { team: ['蔡振华', '陈新华', '郭跃华', '惠钧', '谢赛克'] },
      wt: { team: ['曹燕华', '戴丽丽', '卜启娟', '童玲'] },
    },
  },
  {
    id: '1986-asian-games',
    year: 1986,
    edition: '第10届',
    location: '首尔',
    start_date: '1986-09-22',
    end_date: '1986-09-30',
    participant_count: 200,
    events: {
      ms: { singles: ['刘南奎', '惠钧', '宫崎义仁', '金浣'] },
      ws: { singles: ['焦志敏', '何智丽', '星野美香', '梁英子'] },
      md: { pair: ['滕义', '惠钧'] },
      wd: { pair: ['戴丽丽', '耿丽娟'] },
      xd: { pair: ['滕义', '戴丽丽'] },
      mt: { team: ['安宰亨', '金浣', '朴昌益', '朴知贤', '刘南奎'] },
      wt: { team: ['玄静和', '金英美', '李仙', '梁英子'] },
    },
  },
  {
    id: '1990-asian-games',
    year: 1990,
    edition: '第11届',
    location: '北京',
    start_date: '1990-09-24',
    end_date: '1990-10-01',
    participant_count: 200,
    events: {
      ms: { singles: ['马文革', '韦晴光', '陈龙灿', '刘南奎'] },
      ws: { singles: ['邓亚萍', '高军', '乔红', '陈子荷'] },
      md: { pair: ['马文革', '陈志斌'] },
      wd: { pair: ['玄静和', '洪次玉'] },
      xd: { pair: ['韦晴光', '邓亚萍'] },
      mt: { team: ['姜熙灿', '金泽洙', '文奎玫', '朴知贤', '刘南奎'] },
      wt: { team: ['陈子荷', '邓亚萍', '高军', '乔红'] },
    },
  },
  {
    id: '1994-asian-games',
    year: 1994,
    edition: '第12届',
    location: '广岛',
    start_date: '1994-10-05',
    end_date: '1994-10-14',
    participant_count: 200,
    events: {
      ms: { singles: ['王涛', '刘南奎', '金泽洙', '马文革'] },
      ws: { singles: ['小山智丽', '邓亚萍', '齐宝华', '乔红'] },
      md: { pair: ['秋教成', '李哲承'] },
      wd: { pair: ['刘伟', '乔云萍'] },
      xd: { pair: ['孔令辉', '邓亚萍'] },
      mt: { team: ['孔令辉', '吕林', '马文革', '王涛', '张雷'] },
      wt: { team: ['邓亚萍', '刘伟', '乔红', '乔云萍'] },
    },
  },
  {
    id: '1998-asian-games',
    year: 1998,
    edition: '第13届',
    location: '曼谷',
    start_date: '1998-12-08',
    end_date: '1998-12-16',
    participant_count: 200,
    events: {
      ms: { singles: ['金泽洙', '刘国梁', '吴尚垠', '孔令辉'] },
      ws: { singles: ['王楠', '李菊', '陈静', '柳智惠'] },
      md: { pair: ['孔令辉', '刘国梁'] },
      wd: { pair: ['李菊', '王楠'] },
      xd: { pair: ['王励勤', '王楠'] },
      mt: { team: ['孔令辉', '刘国梁', '王励勤', '阎森', '张勇'] },
      wt: { team: ['李菊', '王楠', '邬娜', '杨影', '张怡宁'] },
    },
  },
  {
    id: '2002-asian-games',
    year: 2002,
    edition: '第14届',
    location: '釜山',
    start_date: '2002-10-01',
    end_date: '2002-10-09',
    participant_count: 200,
    events: {
      ms: { singles: ['王励勤', '庄智渊', '吴尚垠', '孔令辉'] },
      ws: { singles: ['张怡宁', '王楠', '李佳薇', '柳智惠'] },
      md: { pair: ['李哲承', '柳承敏'] },
      wd: { pair: ['李恩实', '石恩美'] },
      xd: { pair: ['张钰', '帖雅娜'] },
      mt: { team: ['孔令辉', '刘国正', '马琳', '王励勤', '阎森'] },
      wt: { team: ['金香美', '金英姬', '金美英', '金云美', '廉元玉'] },
    },
  },
  {
    id: '2006-asian-games',
    year: 2006,
    edition: '第15届',
    location: '多哈',
    start_date: '2006-11-29',
    end_date: '2006-12-07',
    participant_count: 144,
    events: {
      ms: { singles: ['王皓', '马琳', '李静', '柳承敏'] },
      ws: { singles: ['郭跃', '帖雅娜', '王楠', '李佳薇'] },
      md: { pair: ['高礼泽', '李静'] },
      wd: { pair: ['郭跃', '李晓霞'] },
      xd: { pair: ['马琳', '王楠'] },
      mt: { team: ['陈玘', '郝帅', '马琳', '马龙', '王皓'] },
      wt: { team: ['陈晴', '郭焱', '郭跃', '李晓霞', '王楠'] },
    },
  },
  {
    id: '2010-asian-games',
    year: 2010,
    edition: '第16届',
    location: '广州',
    start_date: '2010-11-13',
    end_date: '2010-11-20',
    participant_count: 172,
    events: {
      ms: { singles: ['马龙', '王皓', '朱世赫', '水谷隼'] },
      ws: { singles: ['李晓霞', '郭跃', '金景娥', '福原爱'] },
      md: { pair: ['王皓', '张继科'] },
      wd: { pair: ['郭跃', '李晓霞'] },
      xd: { pair: ['许昕', '郭焱'] },
      mt: { team: ['马琳', '马龙', '王皓', '许昕', '张继科'] },
      wt: { team: ['丁宁', '郭焱', '郭跃', '李晓霞', '刘诗雯'] },
    },
  },
  {
    id: '2014-asian-games',
    year: 2014,
    edition: '第17届',
    location: '仁川',
    start_date: '2014-09-27',
    end_date: '2014-10-04',
    participant_count: 169,
    events: {
      ms: { singles: ['许昕', '樊振东', '朱世赫', '庄智渊'] },
      ws: { singles: ['刘诗雯', '朱雨玲', '梁夏银', '冯天薇'] },
      md: { pair: ['马龙', '张继科'] },
      wd: { pair: ['朱雨玲', '陈梦'] },
      xd: { pair: ['金赫峰', '金仲'] },
      mt: { team: ['樊振东', '马龙', '许昕', '张继科', '周雨'] },
      wt: { team: ['陈梦', '丁宁', '刘诗雯', '武杨', '朱雨玲'] },
    },
  },
  {
    id: '2018-asian-games',
    year: 2018,
    edition: '第18届',
    location: '雅加达',
    start_date: '2018-08-26',
    end_date: '2018-09-01',
    participant_count: 179,
    // 2018 雅加达亚运会仅设 5 个小项，未设男子双打与女子双打
    events: {
      ms: { singles: ['樊振东', '林高远', '诺沙德·阿拉米扬', '李尚洙'] },
      ws: { singles: ['王曼昱', '陈梦', '田志希', '于梦雨'] },
      xd: { pair: ['王楚钦', '孙颖莎'] },
      mt: { team: ['樊振东', '梁靖崑', '林高远', '王楚钦', '薛飞'] },
      wt: { team: ['陈梦', '陈幸同', '孙颖莎', '王曼昱', '朱雨玲'] },
    },
  },
  {
    id: '2022-asian-games',
    year: 2023,
    edition: '第19届',
    location: '杭州',
    start_date: '2023-09-22',
    end_date: '2023-10-02',
    participant_count: 174,
    events: {
      ms: { singles: ['王楚钦', '樊振东', '张禹珍', '黄镇廷'] },
      ws: { singles: ['孙颖莎', '早田希娜', '申裕斌', '王艺迪'] },
      md: { pair: ['樊振东', '王楚钦'] },
      wd: { pair: ['田志希', '申裕斌'] },
      xd: { pair: ['王楚钦', '孙颖莎'] },
      mt: { team: ['樊振东', '梁靖崑', '林高远', '马龙', '王楚钦'] },
      wt: { team: ['陈梦', '陈幸同', '孙颖莎', '王曼昱', '王艺迪'] },
    },
  },
];

/** 单打：冠军 gold / 亚军 silver / 每位半决赛负者 bronze */
function singlesResults(list) {
  return list.map((name, i) => ({
    athlete_id: aid(name),
    rank: i === 0 ? 1 : i === 1 ? 2 : 3,
    medal: i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze',
  }));
}

/** 双打 / 混双：仅记录夺冠组合，两行 rank1 gold */
function pairResults(pair) {
  return pair.map((name) => ({ athlete_id: aid(name), rank: 1, medal: 'gold' }));
}

/** 团体：仅记录冠军队成员 */
function teamResults(members) {
  return members.map((name) => ({ athlete_id: aid(name), rank: 1, medal: 'gold' }));
}

function buildResults(spec) {
  if (spec.singles) return singlesResults(spec.singles);
  if (spec.pair) return pairResults(spec.pair);
  if (spec.team) return teamResults(spec.team);
  throw new Error('未知的项目结果结构: ' + JSON.stringify(spec));
}

function build() {
  const existingById = Object.fromEntries(existingTournaments.map((t) => [t.id, t]));

  const tournaments = [];
  const events = [];

  for (const ed of EDITIONS) {
    const prev = existingById[ed.id];
    // 已存在的赛事：完整沿用原有基础信息（日期/地点/届次/人数等）
    tournaments.push({
      id: ed.id,
      name: prev ? prev.name : '亚洲运动会',
      type: 'asian_games',
      level: 'A',
      year: prev ? prev.year : ed.year,
      start_date: prev ? prev.start_date : ed.start_date,
      end_date: prev ? prev.end_date : ed.end_date,
      location: prev ? prev.location : ed.location,
      edition: prev ? prev.edition : ed.edition,
      participant_count: prev ? prev.participant_count : ed.participant_count,
    });

    for (const suffix of EVENT_ORDER) {
      const spec = ed.events[suffix];
      if (!spec) continue; // 该届未设此小项
      const meta = EVENT_META[suffix];
      events.push({
        id: `${ed.id}-${suffix}`,
        tournament_id: ed.id,
        name: meta.name,
        code: meta.code,
        weight: meta.weight,
        results: buildResults(spec),
      });
    }
  }

  return { tournaments, events };
}

function validate(out) {
  const problems = [];
  const tIds = new Set(out.tournaments.map((t) => t.id));
  const eIds = new Set();

  for (const t of out.tournaments) {
    if (!/^\d{4}-asian-games$/.test(t.id)) problems.push(`赛事 id 不符合约定: ${t.id}`);
    if (t.type !== 'asian_games' || t.level !== 'A') problems.push(`type/level 异常: ${t.id}`);
    if (new Date(t.start_date) > new Date(t.end_date)) problems.push(`日期区间异常: ${t.id}`);
  }
  for (const e of out.events) {
    if (eIds.has(e.id)) problems.push(`事件 id 重复: ${e.id}`);
    eIds.add(e.id);
    if (!tIds.has(e.tournament_id)) problems.push(`事件挂载了不存在的赛事: ${e.id}`);
    const suffix = e.id.slice(e.tournament_id.length + 1);
    const meta = EVENT_META[suffix];
    if (!meta) problems.push(`未知的事件后缀: ${e.id}`);
    else if (meta.code !== e.code || meta.weight !== e.weight || meta.name !== e.name) {
      problems.push(`事件元信息与后缀不匹配: ${e.id}`);
    }
    if (!e.results.length) problems.push(`事件无结果: ${e.id}`);
    for (const r of e.results) {
      if (!r.athlete_id) problems.push(`空 athlete_id: ${e.id}`);
      const expect = { 1: 'gold', 2: 'silver', 3: 'bronze' }[r.rank];
      if (expect !== r.medal) problems.push(`名次与奖牌不匹配: ${e.id} / ${r.athlete_id}`);
    }
    const golds = e.results.filter((r) => r.rank === 1).length;
    if (['ms', 'ws'].includes(suffix) && golds !== 1) problems.push(`单打金牌数应为 1: ${e.id}`);
    if (['md', 'wd', 'xd'].includes(suffix) && golds !== 2) problems.push(`双打金牌数应为 2: ${e.id}`);
    if (['mt', 'wt'].includes(suffix) && e.results.length !== golds) {
      problems.push(`团体只应记录冠军队: ${e.id}`);
    }
  }
  return problems;
}

const out = build();
const problems = validate(out);
const outPath = path.join(__dirname, '_gen_asian_games.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');

const knownIds = new Set(existingTournaments.map((t) => t.id));
const preserved = out.tournaments.filter((t) => knownIds.has(t.id)).map((t) => t.id);

console.log(`已写入 ${path.relative(path.join(__dirname, '..'), outPath)}`);
console.log(`赛事 ${out.tournaments.length} 项，事件 ${out.events.length} 项`);
console.log(`年份范围 ${out.tournaments[0].year} - ${out.tournaments[out.tournaments.length - 1].year}`);
console.log(`沿用既有赛事 id: ${preserved.join(', ') || '（无）'}`);
if (problems.length) {
  console.log('\n校验问题:');
  problems.forEach((p) => console.log(' - ' + p));
  process.exitCode = 1;
} else {
  console.log('校验通过：无问题');
}
