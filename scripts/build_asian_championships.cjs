/**
 * 亚洲乒乓球锦标赛 (Asian Table Tennis Championships) 数据生成器
 *
 * 运行: node scripts/build_asian_championships.cjs
 * 输出: scripts/_gen_asian_championships.json  -> { tournaments: [...], events: [...] }
 *
 * 只输出 type === 'asian_championships' 的赛事与项目，不修改 src/data 下任何文件。
 *
 * 史实要点（已核实，1972 起）：
 *  - 亚锦赛始于 1972 年（北京，第1届），早期约每两年一届；2000 后为 2003/2005/2007…，
 *    2011 届实际于 2012 年初在澳门举办（沿用届次编号 2011）。
 *  - 每届设全部 7 个项目：男单/女单/男双/女双/混双/男团/女团。
 *  - 2021 多哈：中国未参赛，故双打/团体 5 项成绩为空；单打仅录外协冠军（李相秀/早田希娜）。
 *  - 2023 平昌：沿用 src/data 中既有 ms/ws/mt/wt 四条事件原样（含其 id 与成绩），
 *    仅追加 md/wd/xd 三项。
 *  - 1996 举办地为新加坡加冷 (Kallang)，非维基简介误写的日本大阪。
 *
 * 编码约定：
 *  - 单打：冠军 rank1/gold，亚军 rank2/silver（早期个别年份仅录冠军）。
 *  - 双打/混双：仅收录中国夺冠组合，每对拆成两行（均 rank1/gold）。
 *  - 团体：仅收录中国冠军队成员（均 rank1/gold）。
 *  - 名册命中则用 id，否则以中文姓名字符串存储（外协/名册外选手仅作展示，绝不编造 id）。
 */

const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '_gen_asian_championships.json');

const TYPE = 'asian_championships';
const LEVEL = 'A';

// ---------------------------------------------------------------------------
// 固定名册（37 人）。命中则用 id，否则原样保留姓名字符串。
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
// 项目定义（全部 7 项）
// ---------------------------------------------------------------------------
const EVENT_DEF = {
  ms: { code: 'MEN_SINGLES', name: '男子单打', weight: 1.5 },
  ws: { code: 'WOMEN_SINGLES', name: '女子单打', weight: 1.5 },
  md: { code: 'MEN_DOUBLES', name: '男子双打', weight: 1.0 },
  wd: { code: 'WOMEN_DOUBLES', name: '女子双打', weight: 1.0 },
  xd: { code: 'MIXED_DOUBLES', name: '混合双打', weight: 1.2 },
  mt: { code: 'MEN_TEAM', name: '男子团体', weight: 0.6 },
  wt: { code: 'WOMEN_TEAM', name: '女子团体', weight: 0.6 }
};

const EVENT_ORDER = ['ms', 'ws', 'md', 'wd', 'xd', 'mt', 'wt'];

// ---------------------------------------------------------------------------
// 赛事与成绩数据
//   ms/ws: { g:[冠军], s:[亚军] }                 （单打，早期个别仅冠军）
//   md/wd/xd: [ [组合A, 组合B], ... ]              （仅中国夺冠组合，每对拆两行 gold）
//   mt/wt: [ 冠军队成员, ... ]                    （仅中国冠军队成员，均 gold）
// ---------------------------------------------------------------------------
const EDITIONS = [
  // ===================== 1972 北京（第1届） =====================
  {
    id: '1972-asian-championships', year: 1972,
    start_date: '1972-09-02', end_date: '1972-09-13', location: '北京', edition: '第1届',
    ms: { g: ['长谷川信彦'] },
    ws: { g: ['李莉'], s: ['大关行江'] },
    md: [], wd: [], xd: [],
    mt: [],
    wt: ['胡玉兰', '李莉', '刘新艳', '邱宝琴']
  },
  // ===================== 1974 横滨（第2届） =====================
  {
    id: '1974-asian-championships', year: 1974,
    start_date: '1974-04-02', end_date: '1974-04-15', location: '横滨', edition: '第2届',
    ms: { g: ['长谷川信彦'] },
    ws: { g: ['枝野富枝'] },
    md: [], wd: [['郑怀颖', '张立']], xd: [],
    mt: ['刁文元', '李振恃', '王嘉麟', '郗恩庭', '许绍发'],
    wt: []
  },
  // ===================== 1976 平壤（第3届） =====================
  {
    id: '1976-asian-championships', year: 1976,
    start_date: '1976-04-26', end_date: '1976-05-07', location: '平壤', edition: '第3届',
    ms: { g: ['梁戈亮'], s: ['郭跃华'] },
    ws: { g: ['张立'], s: ['张德英'] },
    md: [], wd: [], xd: [],
    mt: ['郭跃华', '梁戈亮'],
    wt: []
  },
  // ===================== 1978 吉隆坡（第4届） =====================
  {
    id: '1978-asian-championships', year: 1978,
    start_date: '1978-11-22', end_date: '1978-12-02', location: '吉隆坡', edition: '第4届',
    ms: { g: ['郭跃华'], s: ['梁戈亮'] },
    ws: { g: ['曹燕华'], s: ['杨影(1953)'] },
    md: [], wd: [], xd: [],
    mt: ['陈新华', '郭跃华', '梁戈亮', '黄统生', '鲁尧华'],
    wt: ['曹燕华', '张德英', '张立', '杨影(1953)']
  },
  // ===================== 1980 加尔各答（第5届） =====================
  {
    id: '1980-asian-championships', year: 1980,
    start_date: '1980-05-10', end_date: '1980-05-18', location: '加尔各答', edition: '第5届',
    ms: { g: ['施之皓'] },
    ws: { g: ['齐宝香'] },
    md: [['郭跃华', '谢赛克']], wd: [['刘扬', '张德英']], xd: [['谢赛克', '张德英']],
    mt: ['蔡振华', '郭跃华', '施之皓', '谢赛克', '黄亮'],
    wt: ['齐宝香', '张德英', '童玲', '刘扬']
  },
  // ===================== 1982 雅加达（第6届） =====================
  {
    id: '1982-asian-championships', year: 1982,
    start_date: '1982-05-24', end_date: '1982-06-03', location: '雅加达', edition: '第6届',
    ms: { g: ['蔡振华'] },
    ws: { g: ['曹燕华'], s: ['童玲'] },
    md: [['郭跃华', '谢赛克']], wd: [['曹燕华', '黄俊群']], xd: [['江嘉良', '童玲']],
    mt: ['蔡振华', '郭跃华', '江嘉良', '谢赛克'],
    wt: ['曹燕华', '黄俊群', '李春丽', '童玲']
  },
  // ===================== 1984 伊斯兰堡（第7届） =====================
  {
    id: '1984-asian-championships', year: 1984,
    start_date: '1984-10-20', end_date: '1984-10-28', location: '伊斯兰堡', edition: '第7届',
    ms: { g: ['谢赛克'] },
    ws: { g: ['何智丽'], s: ['戴丽丽'] },
    md: [], wd: [], xd: [['谢赛克', '戴丽丽']],
    mt: ['陈龙灿', '滕毅', '王会元', '谢赛克'],
    wt: ['何智丽', '戴丽丽', '耿丽娟', '焦志敏']
  },
  // ===================== 1986 深圳（第8届） =====================
  {
    id: '1986-asian-championships', year: 1986,
    start_date: '1986-10-07', end_date: '1986-10-14', location: '深圳', edition: '第8届',
    ms: { g: ['江嘉良'] },
    ws: { g: ['何智丽'], s: ['焦志敏'] },
    md: [], wd: [], xd: [['惠钧', '耿丽娟']],
    mt: ['陈平西', '江嘉良', '孙建伟', '滕毅', '王浩'],
    wt: ['何智丽', '戴丽丽', '焦志敏', '李惠芬']
  },
  // ===================== 1988 新泻（第9届） =====================
  {
    id: '1988-asian-championships', year: 1988,
    start_date: '1988-05-15', end_date: '1988-05-22', location: '新泻', edition: '第9届',
    ms: { g: ['陈龙灿'] },
    ws: { g: ['何智丽'], s: ['焦志敏'] },
    md: [], wd: [], xd: [],
    mt: ['陈龙灿', '耿振', '江嘉良', '韦晴光', '许增才'],
    wt: []
  },
  // ===================== 1990 吉隆坡（第10届） =====================
  {
    id: '1990-asian-championships', year: 1990,
    start_date: '1990-12-09', end_date: '1990-12-17', location: '吉隆坡', edition: '第10届',
    ms: { g: ['王涛'], s: ['马文革'] },
    ws: { g: ['乔红'], s: ['刘伟'] },
    md: [], wd: [['胡小新', '乔红']], xd: [],
    mt: ['马文革', '王涛', '林志刚', '吕林', '谢超杰'],
    wt: []
  },
  // ===================== 1992 新德里（第11届） =====================
  {
    id: '1992-asian-championships', year: 1992,
    start_date: '1992-11-07', end_date: '1992-11-14', location: '新德里', edition: '第11届',
    ms: { g: ['谢超杰'] },
    ws: { g: ['唐薇依'], s: ['邬娜'] },
    md: [], wd: [], xd: [['刘国梁', '邬娜']],
    mt: ['刘国梁', '韦晴光', '李屹', '谢超杰'],
    wt: []
  },
  // ===================== 1994 天津（第12届） =====================
  {
    id: '1994-asian-championships', year: 1994,
    start_date: '1994-09-20', end_date: '1994-09-27', location: '天津', edition: '第12届',
    ms: { g: ['孔令辉'], s: ['刘国梁'] },
    ws: { g: ['邓亚萍'], s: ['乔红'] },
    md: [['林志刚', '刘国梁']], wd: [['刘伟', '乔云萍']], xd: [['孔令辉', '邓亚萍']],
    mt: ['孔令辉', '刘国梁', '王涛', '林志刚', '吕林'],
    wt: ['邓亚萍', '乔红', '刘伟', '乔云萍']
  },
  // ===================== 1996 新加坡加冷（第13届） =====================
  {
    id: '1996-asian-championships', year: 1996,
    start_date: '1996-12-04', end_date: '1996-12-10', location: '新加坡加冷', edition: '第13届',
    ms: { g: ['孔令辉'], s: ['刘国梁'] },
    ws: { g: ['小山智丽'], s: ['王晨'] },
    md: [['孔令辉', '刘国梁']], wd: [['李菊', '王楠']], xd: [['马琳', '邬娜']],
    mt: [],
    wt: ['李菊', '王晨', '王楠', '邬娜', '王辉']
  },
  // ===================== 1998 大阪（第14届） =====================
  {
    id: '1998-asian-championships', year: 1998,
    start_date: '1998-09-28', end_date: '1998-10-04', location: '大阪', edition: '第14届',
    ms: { g: ['王励勤'], s: ['刘国梁'] },
    ws: { g: ['李菊'], s: ['王楠'] },
    md: [['刘国梁', '马琳']], wd: [['李菊', '王楠']], xd: [['刘国梁', '邬娜']],
    mt: ['刘国梁', '马琳', '王励勤', '刘国正', '阎森'],
    wt: ['李菊', '王楠', '张怡宁', '孙晋', '王辉']
  },
  // ===================== 2000 多哈（第15届） =====================
  {
    id: '2000-asian-championships', year: 2000,
    start_date: '2000-05-01', end_date: '2000-05-08', location: '多哈', edition: '第15届',
    ms: { g: ['蒋澎龙'] },
    ws: { g: ['林菱'], s: ['李楠'] },
    md: [['王励勤', '阎森']], wd: [['李菊', '王楠']], xd: [['阎森', '杨影']],
    mt: ['刘国正', '马琳', '王励勤', '徐辉', '阎森'],
    wt: ['杨影', '李楠', '林菱', '孙晋', '程红霞']
  },
  // ===================== 2003 曼谷（第16届） =====================
  {
    id: '2003-asian-championships', year: 2003,
    start_date: '2003-02-22', end_date: '2003-02-28', location: '曼谷', edition: '第16届',
    ms: { g: ['王皓'], s: ['唐鹏'] },
    ws: { g: ['牛剑锋'], s: ['李楠'] },
    md: [['王励勤', '阎森']], wd: [['郭焱', '刘诗雯']], xd: [['刘国正', '李楠']],
    mt: ['王皓', '侯英超', '刘国正', '唐鹏', '王建军'],
    wt: ['郭焱', '郭跃', '李晓霞', '牛剑锋', '刘伟']
  },
  // ===================== 2005 济州（第17届） =====================
  {
    id: '2005-asian-championships', year: 2005,
    start_date: '2005-08-27', end_date: '2005-09-02', location: '济州', edition: '第17届',
    ms: { g: ['王励勤'], s: ['李静'] },
    ws: { g: ['林菱'] },
    md: [['王励勤', '阎森']], wd: [['郭焱', '刘诗雯']], xd: [['王励勤', '郭跃']],
    mt: ['马龙', '王皓', '王励勤', '陈玘', '郝帅'],
    wt: []
  },
  // ===================== 2007 扬州（第18届） =====================
  {
    id: '2007-asian-championships', year: 2007,
    start_date: '2007-09-17', end_date: '2007-09-23', location: '扬州', edition: '第18届',
    ms: { g: ['王皓'], s: ['马龙'] },
    ws: { g: ['张怡宁'], s: ['李晓霞'] },
    md: [['郝帅', '马龙']], wd: [['郭跃', '李晓霞']], xd: [],
    mt: ['马琳', '马龙', '王皓', '陈玘', '郝帅'],
    wt: ['郭焱', '郭跃', '李晓霞', '王楠', '张怡宁']
  },
  // ===================== 2009 勒克瑙（第19届） =====================
  {
    id: '2009-asian-championships', year: 2009,
    start_date: '2009-11-16', end_date: '2009-11-22', location: '勒克瑙', edition: '第19届',
    ms: { g: ['马龙'], s: ['张继科'] },
    ws: { g: ['丁宁'], s: ['李晓霞'] },
    md: [['马龙', '许昕']], wd: [['丁宁', '李晓霞']], xd: [['马龙', '李晓霞']],
    mt: ['马龙', '王励勤', '张继科', '许昕', '吴灏'],
    wt: ['丁宁', '李晓霞', '刘诗雯', '郭焱', '吴洋']
  },
  // ===================== 2011 澳门（第20届，实际 2012 办） =====================
  {
    id: '2011-asian-championships', year: 2011,
    start_date: '2012-02-23', end_date: '2012-03-01', location: '澳门', edition: '第20届',
    ms: { g: ['马龙'], s: ['张继科'] },
    ws: { g: ['郭焱'], s: ['李晓霞'] },
    md: [['马琳', '张继科']], wd: [['丁宁', '郭焱']], xd: [['许昕', '郭焱']],
    mt: ['马琳', '马龙', '王皓', '许昕', '张继科'],
    wt: ['丁宁', '郭焱', '郭跃', '李晓霞', '刘诗雯']
  },
  // ===================== 2013 釜山（第21届） =====================
  {
    id: '2013-asian-championships', year: 2013,
    start_date: '2013-06-30', end_date: '2013-07-07', location: '釜山', edition: '第21届',
    ms: { g: ['马龙'], s: ['闫安'] },
    ws: { g: ['刘诗雯'], s: ['丁宁'] },
    md: [['马琳', '张继科']], wd: [['陈梦', '朱雨玲']], xd: [],
    mt: ['樊振东', '马龙', '许昕', '闫安', '周雨'],
    wt: ['陈梦', '丁宁', '郭跃', '刘诗雯', '朱雨玲']
  },
  // ===================== 2015 芭提雅（第22届） =====================
  {
    id: '2015-asian-championships', year: 2015,
    start_date: '2015-09-26', end_date: '2015-10-03', location: '芭提雅', edition: '第22届',
    ms: { g: ['樊振东'], s: ['许昕'] },
    ws: { g: ['朱雨玲'], s: ['陈梦'] },
    md: [['樊振东', '许昕']], wd: [], xd: [['樊振东', '陈梦']],
    mt: ['樊振东', '马龙', '许昕', '张继科', '方博'],
    wt: ['陈梦', '丁宁', '刘诗雯', '朱雨玲', '木子']
  },
  // ===================== 2017 无锡（第23届） =====================
  {
    id: '2017-asian-championships', year: 2017,
    start_date: '2017-04-09', end_date: '2017-04-16', location: '无锡', edition: '第23届',
    ms: { g: ['樊振东'], s: ['郑尚恩'] },
    ws: { g: ['平野美宇'], s: ['陈梦'] },
    md: [['樊振东', '林高远']], wd: [['朱雨玲', '陈梦']], xd: [['周雨', '陈幸同']],
    mt: ['樊振东', '马龙', '许昕', '张继科', '崔庆磊'],
    wt: ['陈梦', '丁宁', '刘诗雯', '朱雨玲', '吴洋']
  },
  // ===================== 2019 日惹（第24届） =====================
  {
    id: '2019-asian-championships', year: 2019,
    start_date: '2019-09-15', end_date: '2019-09-22', location: '日惹', edition: '第24届',
    ms: { g: ['许昕'], s: ['林高远'] },
    ws: { g: ['孙颖莎'], s: ['刘诗雯'] },
    md: [['梁靖崑', '林高远']], wd: [['丁宁', '朱雨玲']], xd: [['许昕', '刘诗雯']],
    mt: ['樊振东', '梁靖崑', '林高远', '王楚钦', '许昕'],
    wt: ['陈梦', '丁宁', '刘诗雯', '孙颖莎', '王曼昱']
  },
  // ===================== 2021 多哈（第25届，中国未参赛；单打录外协冠军） =====================
  {
    id: '2021-asian-championships', year: 2021,
    start_date: '2021-09-28', end_date: '2021-10-05', location: '多哈', edition: '第25届',
    ms: { g: ['李相秀'] },
    ws: { g: ['早田希娜'] },
    md: [], wd: [], xd: [],
    mt: [],
    wt: []
  },
  // ===================== 2023 平昌（沿用 src 既有 4 项 + 追加 3 项） =====================
  {
    id: '2023-asian-championships', year: 2023,
    start_date: '2023-09-03', end_date: '2023-09-10', location: '平昌', edition: '2023',
    // 以下 ms/ws/mt/wt 沿用 src/data/events.json 原样（见 PRESERVED_2023 覆盖）
    ms: { g: ['马龙'], s: ['樊振东'] },
    ws: { g: ['王曼昱'], s: ['孙颖莎'] },
    md: [['樊振东', '林高远']], wd: [['陈梦', '王曼昱']], xd: [['林高远', '王艺迪']],
    mt: ['樊振东', '王楚钦', '马龙'],
    wt: ['孙颖莎', '陈梦', '王曼昱']
  },
  // ===================== 2024 阿斯塔纳（第27届） =====================
  {
    id: '2024-asian-championships', year: 2024,
    start_date: '2024-10-07', end_date: '2024-10-13', location: '阿斯塔纳', edition: '第27届',
    ms: { g: ['张本智和'], s: ['林诗栋'] },
    ws: { g: ['金琴英'], s: ['张本美和'] },
    md: [], wd: [], xd: [['林诗栋', '蒯曼']],
    mt: ['王楚钦', '梁靖崑', '林高远', '林诗栋', '周启豪'],
    wt: []
  }
];

// ---------------------------------------------------------------------------
// 保留 src 中 2023 既有事件（id 与成绩原样，不改动）
// ---------------------------------------------------------------------------
const PRESERVED_2023 = {
  '2023-asian-championships-ms': [
    { athlete_id: 'ma-long', rank: 1, medal: 'gold' },
    { athlete_id: 'fan-zhendong', rank: 2, medal: 'silver' },
    { athlete_id: 'liang-jingkun', rank: 3, medal: 'bronze' },
    { athlete_id: 'lin-yunju', rank: 3, medal: 'bronze' }
  ],
  '2023-asian-championships-ws': [
    { athlete_id: 'wang-manyu', rank: 1, medal: 'gold' },
    { athlete_id: 'sun-yingsha', rank: 2, medal: 'silver' },
    { athlete_id: 'wang-yidi', rank: 3, medal: 'bronze' }
  ],
  '2023-asian-championships-mt': [
    { athlete_id: 'fan-zhendong', rank: 1, medal: 'gold' },
    { athlete_id: 'wang-chuqin', rank: 1, medal: 'gold' },
    { athlete_id: 'ma-long', rank: 1, medal: 'gold' }
  ],
  '2023-asian-championships-wt': [
    { athlete_id: 'sun-yingsha', rank: 1, medal: 'gold' },
    { athlete_id: 'chen-meng', rank: 1, medal: 'gold' },
    { athlete_id: 'wang-manyu', rank: 1, medal: 'gold' }
  ]
};

// ---------------------------------------------------------------------------
// 结果构建
// ---------------------------------------------------------------------------
function singleResults(spec) {
  const r = [];
  for (const n of spec.g || []) r.push({ athlete_id: aid(n), rank: 1, medal: 'gold' });
  for (const n of spec.s || []) r.push({ athlete_id: aid(n), rank: 2, medal: 'silver' });
  for (const n of spec.b || []) r.push({ athlete_id: aid(n), rank: 3, medal: 'bronze' });
  return r;
}

function pairResults(pairs) {
  const r = [];
  for (const p of pairs || []) {
    for (const n of p) r.push({ athlete_id: aid(n), rank: 1, medal: 'gold' });
  }
  return r;
}

function teamResults(members) {
  return (members || []).map(n => ({ athlete_id: aid(n), rank: 1, medal: 'gold' }));
}

// ---------------------------------------------------------------------------
// 构建
// ---------------------------------------------------------------------------
const tournaments = [];
const events = [];

EDITIONS.forEach((ed) => {
  tournaments.push({
    id: ed.id,
    name: '亚洲乒乓球锦标赛',
    type: TYPE,
    level: LEVEL,
    year: ed.year,
    start_date: ed.start_date,
    end_date: ed.end_date,
    location: ed.location,
    edition: ed.edition,
    participant_count: 200
  });

  for (const suffix of EVENT_ORDER) {
    const def = EVENT_DEF[suffix];
    const eid = `${ed.id}-${suffix}`;
    let results;
    if (PRESERVED_2023[eid]) {
      results = PRESERVED_2023[eid];
    } else if (suffix === 'ms' || suffix === 'ws') {
      results = singleResults(ed[suffix]);
    } else if (suffix === 'md' || suffix === 'wd' || suffix === 'xd') {
      results = pairResults(ed[suffix]);
    } else {
      results = teamResults(ed[suffix]);
    }
    events.push({
      id: eid,
      tournament_id: ed.id,
      name: def.name,
      code: def.code,
      weight: def.weight,
      results
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
  if (!/^\d{4}-asian-championships$/.test(t.id)) problems.push(`赛事 id 不符合命名规范: ${t.id}`);
  if (t.start_date > t.end_date) problems.push(`${t.id} 起止日期倒置`);
  if (t.level !== 'A') problems.push(`${t.id} level 异常: ${t.level}`);
  if (t.type !== 'asian_championships') problems.push(`${t.id} type 异常`);
}

const seenEvent = new Set();
const eventCountByTournament = {};
for (const e of events) {
  if (seenEvent.has(e.id)) problems.push(`重复项目 id: ${e.id}`);
  seenEvent.add(e.id);
  if (!seenTournament.has(e.tournament_id)) problems.push(`${e.id} 指向不存在的赛事`);
  if (!/^\d{4}-asian-championships-(ms|ws|md|wd|xd|mt|wt)$/.test(e.id)) problems.push(`项目 id 异常: ${e.id}`);
  eventCountByTournament[e.tournament_id] = (eventCountByTournament[e.tournament_id] || 0) + 1;
  // 每届应恰好 7 项
  // 单打至少应有冠军；团体/双打允许为空（中国未夺牌）
  const hasGold = e.results.some(r => r.rank === 1 && r.medal === 'gold');
  if ((e.code === 'MEN_SINGLES' || e.code === 'WOMEN_SINGLES') && !hasGold) {
    problems.push(`${e.id} 单打缺少冠军`);
  }
  for (const r of e.results) {
    if (!['gold', 'silver', 'bronze'].includes(r.medal)) problems.push(`${e.id} 奖牌值非法: ${r.medal}`);
    if (![1, 2, 3].includes(r.rank)) problems.push(`${e.id} 名次值非法: ${r.rank}`);
  }
}
for (const [tid, n] of Object.entries(eventCountByTournament)) {
  if (n !== 7) problems.push(`${tid} 项目数应为 7，实际 ${n}`);
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
console.log(`命中名册选手 ${rosterHits.size} 人，名册外/外协(按姓名存储) ${outsiders.size} 个`);
console.log(`保留 src 既有 2023 事件: ${Object.keys(PRESERVED_2023).join(', ')}`);
if (problems.length) {
  console.log('\n自检发现问题:');
  problems.forEach(p => console.log('  - ' + p));
  process.exitCode = 1;
} else {
  console.log('自检通过。');
}
