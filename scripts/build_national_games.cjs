/**
 * 全运会（National Games of China）乒乓球比赛数据生成器
 *
 * 运行：node scripts/build_national_games.cjs
 * 输出：scripts/_gen_national_games.json
 *   { "tournaments": [...仅 national_games...], "events": [...仅 national_games...] }
 *
 * 本脚本只读 src/data/*.json，绝不修改它们。
 *
 * 数据口径：
 *  - 单打：冠军 rank1 gold / 亚军 rank2 silver / 半决赛负者 rank3 bronze（早期两枚铜牌，
 *    设有铜牌赛的届次为一枚铜牌）。
 *  - 双打、混双：仅记录冠军组合，两行 rank1 gold。
 *  - 团体：仅记录冠军队队员，rank1 gold。
 *  - athlete_id：命中 athletes.json（37 人名册）用其 id，否则直接存中文姓名字符串。
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'data');
const athletes = JSON.parse(fs.readFileSync(path.join(dataDir, 'athletes.json'), 'utf8'));
const tournamentsSrc = JSON.parse(fs.readFileSync(path.join(dataDir, 'tournaments.json'), 'utf8'));
const eventsSrc = JSON.parse(fs.readFileSync(path.join(dataDir, 'events.json'), 'utf8'));

const nameToId = Object.fromEntries(athletes.map(a => [a.name, a.id]));
/** 命中 37 人名册则返回 id，否则原样返回中文姓名 */
function aid(name) {
  return nameToId[name] || name;
}

const TYPE = 'national_games';
const LEVEL = 'A+';

const WEIGHT = {
  MEN_SINGLES: 1.5,
  WOMEN_SINGLES: 1.5,
  MIXED_DOUBLES: 1.2,
  MEN_DOUBLES: 1.0,
  WOMEN_DOUBLES: 1.0,
  MEN_TEAM: 0.6,
  WOMEN_TEAM: 0.6
};
const SUFFIX = {
  MEN_SINGLES: 'ms',
  WOMEN_SINGLES: 'ws',
  MIXED_DOUBLES: 'xd',
  MEN_DOUBLES: 'md',
  WOMEN_DOUBLES: 'wd',
  MEN_TEAM: 'mt',
  WOMEN_TEAM: 'wt'
};
const EVENT_NAME = {
  MEN_SINGLES: '男子单打',
  WOMEN_SINGLES: '女子单打',
  MIXED_DOUBLES: '混合双打',
  MEN_DOUBLES: '男子双打',
  WOMEN_DOUBLES: '女子双打',
  MEN_TEAM: '男子团体',
  WOMEN_TEAM: '女子团体'
};
// events.json 中的输出顺序
const EVENT_ORDER = [
  'MEN_SINGLES',
  'WOMEN_SINGLES',
  'MEN_DOUBLES',
  'WOMEN_DOUBLES',
  'MIXED_DOUBLES',
  'MEN_TEAM',
  'WOMEN_TEAM'
];

/**
 * 历届全运会乒乓球数据
 *
 * ms / ws: { gold, silver, bronze: [...] }
 * md / wd / xd: [选手A, 选手B]  —— 仅冠军组合
 * mt / wt: { team: '队名', members: [...] } —— 仅冠军队
 *
 * 资料来源：新华社各届《全运会乒乓球比赛成绩公报》、维基百科「中华人民共和国全国运动会
 * 乒乓球比赛」历届获胜者表、国家体育总局赛事报道，以及多方冠军名录交叉核对。
 */
const EDITIONS = [
  {
    year: 1959,
    edition: '第1届',
    location: '北京',
    start_date: '1959-09-13',
    end_date: '1959-10-03',
    ms: { gold: '王传耀', silver: '庄家富', bronze: ['姜永宁'] },
    ws: { gold: '胡克明', silver: '叶佩琼', bronze: ['孙梅英'] },
    md: ['姜永宁', '庄家富'],
    wd: ['邱钟惠', '叶佩琼'],
    xd: ['庄则栋', '邱钟惠'],
    mt: { team: '上海队', members: ['杨瑞华', '徐寅生', '李富荣', '薛伟初', '张燮林'] },
    wt: { team: '北京队', members: ['孙梅英', '邱钟惠', '叶佩琼', '王健', '刘美英'] }
  },
  {
    year: 1965,
    edition: '第2届',
    location: '北京',
    start_date: '1965-09-12',
    end_date: '1965-09-28',
    ms: { gold: '庄则栋', silver: '何祖彬', bronze: ['张燮林'] },
    ws: { gold: '林慧卿', silver: '李赫男', bronze: ['李莉'] },
    md: ['李富荣', '徐寅生'],
    wd: ['梁丽珍', '黄玉环'],
    xd: ['陆巨芳', '梁丽珍'],
    mt: { team: '上海队', members: ['张燮林', '徐寅生', '李富荣', '余长春', '于贻泽'] },
    wt: { team: '上海队', members: ['林慧卿', '郑敏之', '李赫男', '周一玲', '林秀英'] }
  },
  {
    year: 1975,
    edition: '第3届',
    location: '北京',
    start_date: '1975-09-12',
    end_date: '1975-09-28',
    ms: { gold: '王文荣', silver: '郭跃华', bronze: ['刁文元', '王健强'] },
    ws: { gold: '阎桂丽', silver: '魏力婕', bronze: ['余锦佳', '黄锡萍'] },
    md: ['梁戈亮', '李卓敏'],
    wd: ['刘新艳', '李明'],
    xd: ['李鹏', '李明'],
    mt: { team: '辽宁队', members: ['谷振江', '宋良', '李鹏', '王俊'] },
    wt: { team: '北京队', members: ['阎桂丽', '魏力婕', '刘世旭', '王碧玲'] }
  },
  {
    year: 1979,
    edition: '第4届',
    location: '北京',
    start_date: '1979-09-15',
    end_date: '1979-09-30',
    ms: { gold: '王会元', silver: '王燕生', bronze: ['滕毅'] },
    ws: { gold: '齐宝香', silver: '倪夏莲', bronze: ['卜启娟'] },
    md: ['廖福民', '黄坚果'],
    wd: ['沈剑萍', '戴丽丽'],
    xd: ['王会元', '刘新艳'],
    mt: { team: '八一队', members: ['李振恃', '施之皓', '李隼', '丁毅'] },
    wt: { team: '天津队', members: ['刘扬', '宋霞', '赵虹', '段建萍'] }
  },
  {
    year: 1983,
    edition: '第5届',
    location: '上海',
    start_date: '1983-09-18',
    end_date: '1983-10-01',
    ms: { gold: '惠钧', silver: '谢赛克', bronze: ['王宝军'] },
    ws: { gold: '焦志敏', silver: '戴丽丽', bronze: ['曹燕华'] },
    md: ['江嘉良', '黄文冠'],
    wd: ['沈剑萍', '戴丽丽'],
    xd: ['滕义', '赵小云'],
    mt: { team: '八一队', members: ['范长茂', '施之皓', '梁猛', '丁毅'] },
    wt: { team: '上海队', members: ['曹燕华', '倪夏莲', '何智丽', '卜启娟'] }
  },
  {
    year: 1987,
    edition: '第6届',
    location: '广东',
    start_date: '1987-11-20',
    end_date: '1987-12-05',
    ms: { gold: '王涛', silver: '万国辉', bronze: ['范宝忠', '滕毅'] },
    ws: { gold: '焦志敏', silver: '乔红', bronze: ['陈静', '樊建欣'] },
    md: ['陈龙灿', '成应华'],
    wd: ['耿丽娟', '李惠芬'],
    xd: ['王振义', '刘伟'],
    mt: { team: '八一队', members: ['王涛', '万国辉', '杨建华', '范长茂', '孙灵'] },
    wt: { team: '山东队', members: ['刘伟', '韩艳', '乔云丽', '乔云萍', '高辉'] }
  },
  {
    year: 1993,
    edition: '第7届',
    location: '北京',
    start_date: '1993-09-04',
    end_date: '1993-09-15',
    ms: { gold: '吕林', silver: '林志刚', bronze: ['李静', '熊柯'] },
    ws: { gold: '邓亚萍', silver: '樊建欣', bronze: ['唐薇依', '赵多多'] },
    md: ['王涛', '刘国梁'],
    wd: ['邬娜', '李菊'],
    xd: ['王振义', '乔云萍'],
    mt: { team: '北京队', members: ['陈志斌', '张雷', '熊柯', '赵谨', '雷洋'] },
    wt: { team: '河北队', members: ['樊建欣', '高军', '郑源', '满丽', '王秀明'] }
  },
  {
    year: 1997,
    edition: '第8届',
    location: '上海',
    start_date: '1997-10-12',
    end_date: '1997-10-24',
    ms: { gold: '王涛', silver: '马琳', bronze: ['冯喆', '王励勤'] },
    ws: { gold: '邓亚萍', silver: '王辉', bronze: ['王楠', '李菊'] },
    md: ['王涛', '刘国梁'],
    wd: ['邓亚萍', '张辉'],
    xd: ['秦志戬', '杨影'],
    mt: { team: '广东队', members: ['马琳', '刘国正', '林志刚', '李静', '李肇民'] },
    wt: { team: '江苏队', members: ['李菊', '杨影', '邬娜', '管蓓', '张莹莹'] }
  },
  {
    year: 2001,
    edition: '第9届',
    location: '广东',
    start_date: '2001-11-11',
    end_date: '2001-11-25',
    ms: { gold: '马琳', silver: '秦志戬', bronze: ['孔令辉', '王励勤'] },
    ws: { gold: '王楠', silver: '张怡宁', bronze: ['张莹莹', '李菊'] },
    md: ['马琳', '刘国正'],
    wd: ['王楠', '张瑞'],
    xd: ['秦志戬', '杨影'],
    mt: { team: '八一队', members: ['王涛', '刘国梁', '王皓', '韩阳', '白石'] },
    wt: { team: '北京队', members: ['张怡宁', '郭焱', '李嫱冰', '朱虹', '贾贝贝'] }
  },
  {
    year: 2005,
    edition: '第10届',
    location: '江苏',
    start_date: '2005-10-12',
    end_date: '2005-10-23',
    ms: { gold: '王励勤', silver: '王皓', bronze: ['马龙'] },
    ws: { gold: '张怡宁', silver: '王楠', bronze: ['郭跃'] },
    md: ['王励勤', '刘杉'],
    wd: ['李晓霞', '彭陆洋'],
    xd: ['徐辉', '郭跃'],
    mt: { team: '江苏队', members: ['陈玘', '单明杰', '秦志戬', '阎森', '张勇'] },
    wt: { team: '北京队', members: ['张怡宁', '郭焱', '丁宁', '朱虹', '贾贝贝'] }
  },
  {
    year: 2009,
    edition: '第11届',
    location: '山东',
    start_date: '2009-10-16',
    end_date: '2009-10-28',
    ms: { gold: '王皓', silver: '马龙', bronze: ['王励勤'] },
    ws: { gold: '张怡宁', silver: '郭跃', bronze: ['郭焱'] },
    md: ['许昕', '王励勤'],
    wd: ['侯晓旭', '郭跃'],
    xd: ['王皓', '文佳'],
    mt: { team: '八一队', members: ['王皓', '雷振华', '张继科', '李木桥', '尹航'] },
    wt: { team: '北京队', members: ['张怡宁', '郭焱', '丁宁', '朱虹', '卢璐'] }
  },
  {
    year: 2013,
    edition: '第12届',
    location: '辽宁',
    start_date: '2013-08-31',
    end_date: '2013-09-12',
    ms: { gold: '马龙', silver: '樊振东', bronze: ['许昕'] },
    ws: { gold: '李晓霞', silver: '陈梦', bronze: ['刘诗雯'] },
    md: ['周雨', '樊振东'],
    wd: ['曹臻', '木子'],
    xd: ['马龙', '丁宁'],
    mt: { team: '八一队', members: ['王皓', '周雨', '樊振东', '陈玘', '尹航'] },
    wt: { team: '山东队', members: ['李晓霞', '陈梦', '顾玉婷', '杨艳梅', '商圆圆'] }
  },
  {
    year: 2017,
    edition: '第13届',
    location: '天津',
    start_date: '2017-08-28',
    end_date: '2017-09-06',
    ms: { gold: '马龙', silver: '樊振东', bronze: ['王楚钦'] },
    ws: { gold: '丁宁', silver: '刘诗雯', bronze: ['朱雨玲'] },
    md: ['周雨', '樊振东'],
    wd: ['木子', '顾玉婷'],
    xd: ['于子洋', '王曼昱'],
    mt: { team: '上海队', members: ['许昕', '尚坤', '赵子豪'] },
    wt: { team: '四川队', members: ['朱雨玲', '郭艳', '范思琦'] }
  },
  {
    year: 2021,
    edition: '第14届',
    location: '陕西',
    start_date: '2021-09-17',
    end_date: '2021-09-26',
    ms: { gold: '樊振东', silver: '刘丁硕', bronze: ['梁靖崑'] },
    ws: { gold: '王曼昱', silver: '孙颖莎', bronze: ['刘诗雯'] },
    md: ['马龙', '王楚钦'],
    wd: ['王曼昱', '车晓曦'],
    xd: ['许昕', '刘诗雯'],
    mt: { team: '广东队', members: ['樊振东', '林高远', '周启豪'] },
    wt: { team: '辽宁队', members: ['王艺迪', '陈幸同', '李佳燚'] }
  },
  {
    year: 2025,
    edition: '第15届',
    location: '广东·香港·澳门',
    start_date: '2025-11-09',
    end_date: '2025-11-21',
    ms: { gold: '樊振东', silver: '林诗栋', bronze: ['王楚钦'] },
    ws: { gold: '王曼昱', silver: '孙颖莎', bronze: ['陈梦'] },
    // 第15届全运会乒乓球成年组仅设男/女单打、男/女团体、混双 5 个项目，未设男双、女双
    md: null,
    wd: null,
    xd: ['林高远', '刘诗雯'],
    mt: { team: '北京队', members: ['马龙', '王楚钦', '黄友政', '闫安', '徐晨皓'] },
    wt: { team: '山东队', members: ['陈梦', '范思琦', '王晓彤', '徐奕', '孙艺祯'] }
  }
];

// ---- 构建 ----------------------------------------------------------------

const existingTournamentById = Object.fromEntries(tournamentsSrc.map(t => [t.id, t]));
const existingEventIds = new Set(eventsSrc.map(e => e.id));

const tournaments = [];
const events = [];
const preservedTournamentIds = [];
const preservedEventIds = [];

for (const ed of EDITIONS) {
  const tid = `${ed.year}-national-games`;
  const prev = existingTournamentById[tid];
  if (prev) preservedTournamentIds.push(tid);

  tournaments.push({
    id: tid,
    name: '全国运动会',
    type: TYPE,
    level: LEVEL,
    year: ed.year,
    // 已存在的赛事：沿用原有日期 / 地点 / 参赛人数
    start_date: prev ? prev.start_date : ed.start_date,
    end_date: prev ? prev.end_date : ed.end_date,
    location: prev ? prev.location : ed.location,
    edition: prev ? prev.edition : ed.edition,
    participant_count: prev ? prev.participant_count : null
  });

  const byCode = {};

  function put(code, results) {
    if (!results || !results.length) return;
    byCode[code] = {
      id: `${tid}-${SUFFIX[code]}`,
      tournament_id: tid,
      name: EVENT_NAME[code],
      code,
      weight: WEIGHT[code],
      results
    };
  }

  // 单打：冠 / 亚 / 铜（1~2 枚）
  function singles(code, s) {
    if (!s) return;
    const results = [{ athlete_id: aid(s.gold), rank: 1, medal: 'gold' }];
    if (s.silver) results.push({ athlete_id: aid(s.silver), rank: 2, medal: 'silver' });
    for (const b of s.bronze || []) {
      results.push({ athlete_id: aid(b), rank: 3, medal: 'bronze' });
    }
    put(code, results);
  }

  // 双打 / 混双：仅冠军组合，两行 rank1 gold
  function doubles(code, pair) {
    if (!pair) return;
    put(code, pair.map(p => ({ athlete_id: aid(p), rank: 1, medal: 'gold' })));
  }

  // 团体：仅冠军队队员，rank1 gold
  function team(code, t) {
    if (!t) return;
    put(code, t.members.map(m => ({ athlete_id: aid(m), rank: 1, medal: 'gold' })));
  }

  singles('MEN_SINGLES', ed.ms);
  singles('WOMEN_SINGLES', ed.ws);
  doubles('MEN_DOUBLES', ed.md);
  doubles('WOMEN_DOUBLES', ed.wd);
  doubles('MIXED_DOUBLES', ed.xd);
  team('MEN_TEAM', ed.mt);
  team('WOMEN_TEAM', ed.wt);

  for (const code of EVENT_ORDER) {
    const ev = byCode[code];
    if (!ev) continue;
    if (existingEventIds.has(ev.id)) preservedEventIds.push(ev.id);
    events.push(ev);
  }
}

const out = { tournaments, events };
const outPath = path.join(__dirname, '_gen_national_games.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');

// ---- 报告 ----------------------------------------------------------------

const years = tournaments.map(t => t.year);
const byCodeCount = events.reduce((a, e) => ((a[e.code] = (a[e.code] || 0) + 1), a), {});
const rosterHits = new Set();
const plainNames = new Set();
for (const e of events) {
  for (const r of e.results) {
    if (athletes.some(a => a.id === r.athlete_id)) rosterHits.add(r.athlete_id);
    else plainNames.add(r.athlete_id);
  }
}

console.log('输出文件:', path.relative(path.join(__dirname, '..'), outPath));
console.log('赛事数:', tournaments.length, `| 年份范围: ${Math.min(...years)}–${Math.max(...years)}`);
console.log('项目数:', events.length);
console.log('项目分布:', JSON.stringify(byCodeCount));
console.log('沿用已有赛事 id:', preservedTournamentIds.join(', ') || '(无)');
console.log('沿用已有项目 id:', preservedEventIds.join(', ') || '(无)');
console.log('命中 37 人名册的选手数:', rosterHits.size, '| 以中文姓名存储的选手数:', plainNames.size);
console.log('缺项: 2025 年（第15届）未设男子双打、女子双打');
