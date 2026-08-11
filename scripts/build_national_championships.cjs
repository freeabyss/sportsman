/**
 * 全国乒乓球锦标赛 (China National Table Tennis Championships) 数据生成器
 *
 * 数据源（按优先级）:
 *  1. Wikipedia 历届冠军表 (jiongchan mirror) —— 1952–2024 全部 7 个项目冠军（含双打配对、团体省市）
 *  2. 百度百科 / 中国乒协(CTTA) 赛事详情 —— 2010–2024 单项与团体冠军佐证
 *  3. kaiqiuwang《历届全国锦标赛乒乓球单打冠军》 —— 早期单打冠亚军佐证
 *  4. 既有 tournaments.json 中 2023-national-championships 条目（保留其原始字段）
 *
 * 说明:
 *  - 全运会年 (1959/1965/1975/1979/1983/1987/1993/1997/2001/2005/2009/2013/2017/2021) 不单独举办全锦赛，故无条目。
 *  - 2025 年为第十五届全运会年，未举办全锦赛（网传“2025全锦赛”结果经查证为 AI 生成的虚假内容，已排除）。
 *  - 本脚本仅输出 champions（金牌冠军）。前五名/前四名的亚军、季军深度未系统收录，作为已知限制报告。
 *  - 团体项目：仅记录冠军。已知具体队员的年份(2023/2024)记录个人，其余年份记录冠军队/省市名称。
 *  - 运动员 id 仅在 37 人固定花名册中才转换为 id，其余一律以中文姓名字符串存储（仅作展示用途）。
 *
 * 输出: scripts/_gen_national_championships.json
 *   { tournaments:[仅 national_championships], events:[仅 national_championships] }
 * 该文件不直接覆盖 src/data/*（由合并脚本或人工审阅后接入）。
 */

const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');

const athletes = JSON.parse(fs.readFileSync(path.join(dir, 'athletes.json'), 'utf8'));
const tournaments = JSON.parse(fs.readFileSync(path.join(dir, 'tournaments.json'), 'utf8'));

const nameToId = Object.fromEntries(athletes.map(a => [a.name, a.id]));
function aid(name) { return nameToId[name] || name; }

const WEIGHT = {
  MEN_SINGLES: 1.5, WOMEN_SINGLES: 1.5, MIXED_DOUBLES: 1.2,
  MEN_DOUBLES: 1.0, WOMEN_DOUBLES: 1.0, MEN_TEAM: 0.6, WOMEN_TEAM: 0.6
};
const NAME = {
  MEN_SINGLES: '男子单打', WOMEN_SINGLES: '女子单打', MIXED_DOUBLES: '混合双打',
  MEN_DOUBLES: '男子双打', WOMEN_DOUBLES: '女子双打', MEN_TEAM: '男子团体', WOMEN_TEAM: '女子团体'
};
const CODE_SUFFIX = {
  MEN_SINGLES: 'ms', WOMEN_SINGLES: 'ws', MEN_DOUBLES: 'md',
  WOMEN_DOUBLES: 'wd', MIXED_DOUBLES: 'xd', MEN_TEAM: 'mt', WOMEN_TEAM: 'wt'
};

// 每个年份: [year, location, start_date, end_date, participant_count, ms, ws, md, wd, xd, mt, wt]
//   ms/ws: 冠军姓名(字符串)
//   md/wd/xd: [p1, p2] 或 null
//   mt/wt: 队名/省市字符串，或 [队员1, 队员2, ...]（已知具体队员时），或 null
const YEARS = [
  [1952, null, null, null, null, '姜永宁', '孙梅英', null, null, null, null, null],
  [1956, null, null, null, null, '王传耀', '孙梅英', null, null, null, null, null],
  [1957, null, null, null, null, '王传耀', '叶佩琼', ['胡炳权', '王传耀'], ['邓竹君', '李麟书'], ['庄则栋', '章宝娣'], '北京市', '北京市'],
  [1958, null, null, null, null, '容国团', '叶佩琼', ['傅其芳', '王传耀'], ['池惠芳', '朱培民'], ['王传耀', '孙梅英'], '上海市', '上海市'],
  [1960, null, null, null, null, '王传耀', '邱钟惠', ['李富荣', '庄则栋'], ['孙梅英', '王健'], ['庄则栋', '邱钟惠'], null, null],
  [1961, null, null, null, null, '李富荣', '邱钟惠', ['李富荣', '庄则栋'], ['邱钟惠', '王健'], ['李富荣', '韩玉珍'], '上海市', '黑龙江省'],
  [1962, null, null, null, null, '杨瑞华', '邱钟惠', ['李富荣', '王家声'], ['林希孟', '郑敏之'], ['胡道本', '梁丽珍'], null, null],
  [1963, null, null, null, null, '张燮林', '林慧卿', ['许大皖', '王雪坤'], ['林慧卿', '郑敏之'], ['余长春', '周一玲'], '北京市', '北京市'],
  [1964, null, null, null, null, '庄则栋', '韩玉珍', ['余长春', '周兰荪'], ['韩玉珍', '李赫男'], ['张燮林', '林慧卿'], null, null],
  [1966, null, null, null, null, '庄则栋', '仇宝琴', ['李景光', '庄则栋'], ['李赫男', '李莉'], ['王家声', '李赫男'], '上海市', '上海市'],
  [1972, null, null, null, null, '刁文元', '胡玉兰', ['刁文元', '李景光'], ['冯梦雅', '朱乃桢'], ['李德泽', '胡玉兰'], '河北省', '山西省'],
  [1973, null, null, null, null, '李振恃', '黄锡萍', ['李卓敏', '梁戈亮'], ['胡玉兰', '刘新艳'], ['李振恃', '伍时宝'], '辽宁省', '上海市'],
  [1974, null, null, null, null, '王文荣', '林美群', null, null, null, '北京市', '黑龙江省'],
  [1977, null, null, null, null, '郭跃华', '黄锡萍', ['李宇翔', '王建强'], ['仇晨燕', '黄锡萍'], ['郭跃华', '张立'], '北京市', '上海市'],
  [1978, null, null, null, null, '施之皓', '黄锡萍', ['鲁尧华', '滕义'], ['黄锡萍', '李明'], ['李振恃', '张德英'], '中国人民解放军', '上海市'],
  [1980, null, null, null, null, '滕义', '陈莉莉', ['赵虹', '刘扬'], null, null, '中国人民解放军', '浙江省'],
  [1981, null, null, null, null, '陈新华', '戴丽丽', ['陈新华', '许增才'], ['戴丽丽', '沈剑萍'], ['梁猛', '沈剑萍'], '北京市', '上海市'],
  [1982, null, null, null, null, '郭跃华', '耿丽娟', ['陈龙灿', '成应华'], ['戴丽丽', '沈剑萍'], ['顾万云', '耿丽娟'], '北京市', '上海市'],
  [1984, null, null, null, null, '韦晴光', '焦志敏', ['谢赛克', '周宏'], ['戴丽丽', '沈剑萍'], ['韦晴光', '李春丽'], '四川省', '河北省'],
  [1985, null, null, null, null, '马文革', '李惠芬', ['韦晴光', '周宏'], ['耿丽娟', '李惠芬'], ['韦晴光', '李春丽'], '北京市', '河北省'],
  [1986, null, null, null, null, '周宏', '刘伟', ['李勇', '赵镝'], ['谢小燕', '陈江'], ['唐成', '刘伟'], '北京市', '河南省'],
  [1988, null, null, null, null, '王涛', '姚佳音', ['董建立', '张广隆'], ['邓亚萍', '应荣辉'], ['赵卫国', '李隽'], '北京市', '湖北省'],
  [1989, null, null, null, null, '陈志斌', '邓亚萍', ['陈志斌', '于沈潼'], ['陈静', '胡小新'], ['马文革', '邓亚萍'], '中国人民解放军', '湖北省'],
  [1990, null, null, null, null, '张雷', '应荣辉', ['吕林', '王涛'], ['樊建欣', '乔云萍'], ['林志刚', '刘伟'], '辽宁省', '河北省'],
  [1991, null, null, null, null, '马文革', '邓亚萍', ['马文革', '于沈潼'], ['邓亚萍', '乔红'], ['马文革', '乔云萍'], '黑龙江省', '山东省'],
  [1992, null, null, null, null, '马文革', '乔云萍', ['吕林', '王涛'], ['邓亚萍', '乔红'], ['林志刚', '邓亚萍'], '天津市', '河南省'],
  [1994, null, null, null, null, '王涛', '邓亚萍', ['林志刚', '王涛'], ['邓亚萍', '乔红'], ['王涛', '刘伟'], '中国人民解放军', '山东省'],
  [1995, null, null, null, null, '丁松', '邓亚萍', ['王涛', '张雷'], ['邓亚萍', '乔红'], ['王涛', '刘伟'], '中国人民解放军', '江苏省'],
  [1996, null, null, null, null, '张勇', '王辉', ['孔令辉', '王飞'], ['曹冬梅', '朱芳'], ['熊柯', '王晨'], '广东省', '江苏省'],
  [1998, null, null, null, null, '孔令辉', '李菊', ['冯喆', '张勇'], ['李菊', '王楠'], ['马琳', '孙晋'], '汕头市', '江苏省'],
  [1999, null, null, null, null, '马琳', '王楠', ['马琳', '秦志戬'], ['李菊', '王楠'], ['刘国正', '李楠'], '上海市', '北京市'],
  [2000, null, null, null, null, '侯英超', '白杨', ['单明杰', '谭瑞午'], ['姜华珺', '李佳'], null, '辽宁省', '河北省'],
  [2002, null, null, null, null, '唐鹏', '李晓霞', ['秦志戬', '詹健'], ['郭跃', '李晓霞'], ['詹健', '白杨'], '江苏省', '辽宁省'],
  [2003, null, null, null, null, '王皓', '张怡宁', ['孔令辉', '王皓'], ['王楠', '张怡宁'], ['马琳', '王楠'], '汕头市', '北京市'],
  [2004, null, null, null, null, '王励勤', '郭焱', ['曾佳', '余世钦'], ['陈晴', '张晓武'], ['徐辉', '郭跃'], '江苏省', '北京市'],
  [2006, null, null, null, null, '马琳', '彭陆洋', ['陈玘', '马琳'], ['丁宁', '刘诗雯'], ['马琳', '王楠'], '中国人民解放军', '辽宁省'],
  [2007, null, null, null, null, '王皓', '刘诗雯', ['马琳', '王励勤'], ['郭跃', '李晓霞'], ['郝帅', '刘诗雯'], '中国人民解放军', '辽宁省'],
  [2008, null, null, null, null, '张继科', '文佳', ['王励勤', '许昕'], ['丁宁', '郭焱'], ['陈玘', '陈晴'], '中国人民解放军', '北京市'],
  [2010, '张家港', '2010-10-03', '2010-10-10', null, '张继科', '丁宁', ['马龙', '王皓'], ['郭跃', '李晓霞'], ['吴灏', '木子'], '广东省', '北京市'],
  [2011, '张家港', '2011-10-05', '2011-10-13', null, '马龙', '刘诗雯', ['马琳', '王皓'], ['郭焱', '郭跃'], ['张超', '曹臻'], '北京市', '山东省'],
  [2012, '张家港', '2012-10-06', '2012-10-14', null, '周雨', '曹臻', ['王励勤', '许昕'], ['曹臻', '木子'], ['马龙', '丁宁'], '北京市', '辽宁省'],
  [2014, '黄石', '2014-11-02', '2014-11-09', null, '樊振东', '朱雨玲', ['樊振东', '许昕'], ['丁宁', '刘诗雯'], ['闫安', '盛丹丹'], '上海市', '黑龙江省'],
  [2015, '哈尔滨', '2015-10-05', '2015-10-12', null, '许昕', '朱雨玲', ['马龙', '许昕'], ['刘诗雯', '朱雨玲'], ['樊振东', '木子'], '上海市', '山西省'],
  [2016, '鞍山', '2016-09-20', '2016-09-28', null, '樊振东', '朱雨玲', ['樊振东', '周雨'], ['陈幸同', '文佳'], ['林高远', '刘诗雯'], '上海市', '四川省'],
  [2018, '鞍山', '2018-09-07', '2018-09-16', null, '梁靖崑', '王曼昱', ['尚坤', '张超'], ['陈梦', '朱雨玲'], ['王楚钦', '孙颖莎'], '北京市', '辽宁省'],
  [2019, '天津武清', '2019-07-25', '2019-08-02', null, '侯英超', '孙颖莎', ['林高远', '王曼昱'], null, null, '八一南昌队', '山东省'],
  [2020, '威海', '2020-10-01', '2020-10-10', null, '樊振东', '陈梦', ['马龙', '许昕'], ['陈梦', '王曼昱'], ['王楚钦', '王曼昱'], '广东省', '河北省'],
  [2022, '黄石', '2022-11-03', '2022-11-12', null, '樊振东', '王艺迪', ['林高远', '周启豪'], ['陈幸同', '钱天一'], ['林高远', '王曼昱'], '上海市', '辽宁省'],
  [2023, '扬州', '2023-10-09', '2023-10-15', 300, '林诗栋', '王艺迪', null, null, ['林诗栋', '蒯曼'], ['周恺', '樊振东', '许昕'], ['石洵瑶', '蒯曼', '钱天一']],
  [2024, '鄂尔多斯', '2024-10-11', '2024-10-19', 274, '黄友政', '刘炜珊', null, null, ['林高远', '刘诗雯'], ['樊振东', '许昕', '周恺'], ['石洵瑶', '蒯曼', '钱天一']]
];

// 保留既有 2023 条目原始字段（不被覆盖）
const existing2023 = tournaments.find(t => t.id === '2023-national-championships');

const newTournaments = [];
const newEvents = [];

for (const row of YEARS) {
  const [year, location, start, end, pc, ms, ws, md, wd, xd, mt, wt] = row;
  const tid = `${year}-national-championships`;

  // 2023 使用既有文件中的原始字段，确保 id/level/dates/location 等完全一致
  let tObj;
  if (existing2023 && tid === '2023-national-championships') {
    tObj = {
      id: existing2023.id,
      name: existing2023.name,
      type: existing2023.type,
      level: existing2023.level,
      year: existing2023.year,
      start_date: existing2023.start_date,
      end_date: existing2023.end_date,
      location: existing2023.location,
      edition: existing2023.edition,
      participant_count: existing2023.participant_count
    };
  } else {
    tObj = {
      id: tid,
      name: '全国乒乓球锦标赛',
      type: 'national_championships',
      level: 'C',
      year,
      start_date: start,
      end_date: end,
      location,
      edition: String(year),
      participant_count: pc
    };
  }
  newTournaments.push(tObj);

  function addEvent(code, results) {
    if (!results || !results.length) return;
    newEvents.push({
      id: `${tid}-${CODE_SUFFIX[code]}`,
      tournament_id: tid,
      name: NAME[code],
      code,
      weight: WEIGHT[code],
      results
    });
  }

  // 单打：冠军 = 金牌
  if (ms) addEvent('MEN_SINGLES', [{ athlete_id: aid(ms), rank: 1, medal: 'gold' }]);
  if (ws) addEvent('WOMEN_SINGLES', [{ athlete_id: aid(ws), rank: 1, medal: 'gold' }]);

  // 双打/混双：冠军队两人各记一金
  if (md && md.length === 2) addEvent('MEN_DOUBLES', md.map(p => ({ athlete_id: aid(p), rank: 1, medal: 'gold' })));
  if (wd && wd.length === 2) addEvent('WOMEN_DOUBLES', wd.map(p => ({ athlete_id: aid(p), rank: 1, medal: 'gold' })));
  if (xd && xd.length === 2) addEvent('MIXED_DOUBLES', xd.map(p => ({ athlete_id: aid(p), rank: 1, medal: 'gold' })));

  // 团体：仅冠军。已知具体队员记录个人，否则记录队名/省市
  function teamResults(val) {
    if (!val) return null;
    if (Array.isArray(val)) return val.map(p => ({ athlete_id: aid(p), rank: 1, medal: 'gold' }));
    return [{ athlete_id: aid(val), rank: 1, medal: 'gold' }];
  }
  addEvent('MEN_TEAM', teamResults(mt));
  addEvent('WOMEN_TEAM', teamResults(wt));
}

const out = { tournaments: newTournaments, events: newEvents };
fs.writeFileSync(path.join(__dirname, '_gen_national_championships.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');

console.log('全国乒乓球锦标赛 赛事(tournaments):', newTournaments.length, '届');
console.log('年份范围:', newTournaments[0].year, '–', newTournaments[newTournaments.length - 1].year);
console.log('项目(events):', newEvents.length, '项');
const byCode = {};
newEvents.forEach(e => byCode[e.code] = (byCode[e.code] || 0) + 1);
console.log('项目分布:', JSON.stringify(byCode, null, 0));
// 统计使用 roster id 的条目数 vs 纯姓名字符串
let idCount = 0, nameCount = 0;
newEvents.forEach(e => e.results.forEach(r => { if (typeof r.athlete_id === 'string' && /^[a-z-]+$/.test(r.athlete_id)) idCount++; else nameCount++; }));
console.log('结果行中 roster-id:', idCount, '| 纯姓名字符串:', nameCount);
