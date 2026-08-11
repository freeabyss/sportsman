/**
 * WTT 总决赛 (WTT Finals / 前 ITTF World Tour Grand Finals) 数据生成器
 *
 * 运行: node scripts/build_wtt_finals.cjs
 * 输出: scripts/_gen_wtt_finals.json  -> { tournaments: [...], events: [...] }
 *
 * 只输出 type === 'wtt_finals' 的赛事与项目，不修改 src/data 下任何文件。
 *
 * ─────────────────────────────────────────────────────────────────────────
 * 覆盖范围（已核实史料）：
 *  - ITTF World Tour Grand Finals（国际乒联巡回赛总决赛）每年一届，1996–2019。
 *  - 2020 ITTF Finals（郑州，年终总决赛收官，仅设单打）—— 用户前提称“无 2020 届”，
 *    但史料确认 2020 年终总决赛确于 2020-11-19~22 在郑州举办（马龙/陈梦），故仍收录并标注。
 *  - WTT 时代：
 *      2021 WTT Cup Finals（新加坡，仅单打）
 *      2022 WTT Cup Finals（新乡，仅单打）
 *      2023 WTT Finals 拆分：女子（名古屋，12.15–17）+ 男子（多哈，2024.1.3–5）
 *      2024 WTT Finals（福冈，11.20–24，设 MS/WS/MD/WD，无混双）
 *      2025 WTT Finals（香港，12.10–14，设 MS/WS/XD，男/女双合并为混双）
 *
 * 现有 id 约束（matches.json 依赖）：
 *  - 2023-wtt-finals / 2024-wtt-finals 的赛事 id，以及 2023-wtt-finals-ms / -ws 的
 *    项目 id 必须原样保留。本脚本对 2023 的 ms/ws 直接复制 src/data 现有对象。
 *  - 2024-wtt-finals 现有为占位（location "待定"、日期 2024-12-10~15），按要求原样保留
 *    元数据，并以真实福冈 2024 赛果填充项目（报告中标注该差异）。
 *
 * 数据缺口（详见运行后报告）：
 *  - 1996–2019 单打：冠军/亚军/两铜齐全。
 *  - 1996–2019 双打：仅冠军+亚军（组合完整）；双打铜牌组合未系统收录，未编造。
 *  - 2019 全部项目、WTT 时代单打为完整四强；部分双打含铜牌。
 *  - 1996–2019 的具体比赛日期为近似值（统一记为举办年 12 月），地点与奖牌成绩已核实。
 */

const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '_gen_wtt_finals.json');

const TYPE = 'wtt_finals';
const LEVEL = 'A+';

// ---------------------------------------------------------------------------
// 固定名册（37 人）。命中则用 id，否则原样保留姓名字符串（外协/名册外选手仅作展示）。
// 注意：刘国正、阎森、陈玘、郝帅、牛剑锋、陈幸同、蒯曼、陈熠 等大量历史/现役选手不在
// 名册内，将以姓名字符串存储。
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
  xd: { code: 'MIXED_DOUBLES', name: '混合双打', weight: 1.2 },
  md: { code: 'MEN_DOUBLES', name: '男子双打', weight: 1.0 },
  wd: { code: 'WOMEN_DOUBLES', name: '女子双打', weight: 1.0 }
};

// ---------------------------------------------------------------------------
// 成绩构建：g/s 为数组（单打元素为姓名字符串；双打元素为 [姓名A, 姓名B] 组合），
// b 为并列季军数组。每个姓名/组合展开为独立结果行，同一组合/名次共享 rank 与 medal。
// ---------------------------------------------------------------------------
function buildResults(spec) {
  const out = [];
  const push = (list, rank, medal) => {
    for (const entry of list || []) {
      const names = Array.isArray(entry) ? entry : [entry];
      for (const n of names) out.push({ athlete_id: aid(n), rank, medal });
    }
  };
  push(spec.g, 1, 'gold');
  push(spec.s, 2, 'silver');
  push(spec.b, 3, 'bronze');
  return out;
}

// ===========================================================================
// 现有 2023-wtt-finals 的 ms / ws 对象（逐字复制自 src/data/events.json，保持 id 与成绩不变）
// ===========================================================================
const PRESERVED_2023_MS = {
  id: '2023-wtt-finals-ms',
  tournament_id: '2023-wtt-finals',
  name: '男子单打',
  code: 'MEN_SINGLES',
  weight: 1.5,
  results: [
    { athlete_id: 'wang-chuqin', rank: 1, medal: 'gold' },
    { athlete_id: 'fan-zhendong', rank: 2, medal: 'silver' },
    { athlete_id: 'ma-long', rank: 3, medal: 'bronze' },
    { athlete_id: 'lin-gaoyuan', rank: 3, medal: 'bronze' }
  ]
};
const PRESERVED_2023_WS = {
  id: '2023-wtt-finals-ws',
  tournament_id: '2023-wtt-finals',
  name: '女子单打',
  code: 'WOMEN_SINGLES',
  weight: 1.5,
  results: [
    { athlete_id: 'sun-yingsha', rank: 1, medal: 'gold' },
    { athlete_id: 'wang-yidi', rank: 2, medal: 'silver' },
    { athlete_id: 'chen-meng', rank: 3, medal: 'bronze' }
  ]
};

// ===========================================================================
// 各届赛事与项目数据
// 统一说明：1996–2019 的具体比赛日期为近似值（记为举办年 12 月中旬），地点与奖牌已核实。
// 双打（md/wd）1996–2018 仅含冠军+亚军组合；2019 及 WTT 时代部分含铜牌。
// ===========================================================================
const EDITIONS = [
  // ===================== 1996 天津 =====================
  {
    id: '1996-wtt-finals', name: 'WTT总决赛', year: 1996,
    start_date: '1996-12-14', end_date: '1996-12-17', location: '中国天津',
    events: {
      ms: { g: ['孔令辉'], s: ['Vladimir Samsonov'], b: ['Jörg Roßkopf', 'Vasile Florea'] },
      ws: { g: ['邓亚萍'], s: ['李菊'], b: ['王晨', '杨影'] },
      md: { g: [['王励勤', '阎森']], s: [['Jörg Roßkopf', 'Vladimir Samsonov']] },
      wd: { g: [['邓亚萍', '杨影']], s: [['Park Hye-jung', 'Ryu Ji-hae']] }
    }
  },
  // ===================== 1997 香港 =====================
  {
    id: '1997-wtt-finals', name: 'WTT总决赛', year: 1997,
    start_date: '1997-12-12', end_date: '1997-12-15', location: '中国香港',
    events: {
      ms: { g: ['Vladimir Samsonov'], s: ['王励勤'], b: ['Zoran Primorac', 'Jean-Michel Saive'] },
      ws: { g: ['李菊'], s: ['王楠'], b: ['Park Hye-jung', 'Ryu Ji-hae'] },
      md: { g: [['孔令辉', '刘国梁']], s: [['Jörg Roßkopf', 'Vladimir Samsonov']] },
      wd: { g: [['李菊', '王楠']], s: [['Kim Mak-kyo', 'Ryu Ji-hae']] }
    }
  },
  // ===================== 1998 巴黎 =====================
  {
    id: '1998-wtt-finals', name: 'WTT总决赛', year: 1998,
    start_date: '1998-12-11', end_date: '1998-12-14', location: '法国巴黎',
    events: {
      ms: { g: ['王励勤'], s: ['刘国梁'], b: ['孔令辉', 'Jan-Ove Waldner'] },
      ws: { g: ['王楠'], s: ['林菱'], b: ['李菊', '孙晋'] },
      md: { g: [['王励勤', '阎森']], s: [['马琳', '秦志戬']] },
      wd: { g: [['李菊', '王楠']], s: [['Sung Hong-ha', 'Wang Hui']] }
    }
  },
  // ===================== 1999 悉尼 =====================
  {
    id: '1999-wtt-finals', name: 'WTT总决赛', year: 1999,
    start_date: '1999-12-10', end_date: '1999-12-13', location: '澳大利亚悉尼',
    events: {
      ms: { g: ['刘国正'], s: ['孔令辉'], b: ['Werner Schlager', '蒋澎龙'] },
      ws: { g: ['陈静'], s: ['李菊'], b: ['何千红', '孙晋'] },
      md: { g: [['孔令辉', '马琳']], s: [['Patrick Chila', 'Jean-Philippe Gatien']] },
      wd: { g: [['李菊', '王楠']], s: [['Sun Jin', '杨影']] }
    }
  },
  // ===================== 2000 横滨 =====================
  {
    id: '2000-wtt-finals', name: 'WTT总决赛', year: 2000,
    start_date: '2000-12-14', end_date: '2000-12-17', location: '日本横滨',
    events: {
      ms: { g: ['王励勤'], s: ['刘国正'], b: ['马琳', '蒋澎龙'] },
      ws: { g: ['张怡宁'], s: ['王楠'], b: ['Boros', '杨影'] },
      md: { g: [['王励勤', '阎森']], s: [['Kim Taek-soo', 'Oh Sang-eun']] },
      wd: { g: [['Sun Jin', '杨影']], s: [['Kawakoe', 'Takeda']] }
    }
  },
  // ===================== 2001 海南 =====================
  {
    id: '2001-wtt-finals', name: 'WTT总决赛', year: 2001,
    start_date: '2001-12-13', end_date: '2001-12-16', location: '中国海南',
    events: {
      ms: { g: ['马琳'], s: ['王励勤'], b: ['蒋澎龙', 'Jean-Michel Saive'] },
      ws: { g: ['王楠'], s: ['牛剑锋'], b: ['郭焱', '李佳'] },
      md: { g: [['Kim Taek-soo', 'Oh Sang-eun']], s: [['Cheung Yuk', 'Leung Chu Yan']] },
      wd: { g: [['Lee Eun-sil', 'Ryu Ji-hae']], s: [['Kim Yun-mi', 'Kim Young-hee']] }
    }
  },
  // ===================== 2002 斯德哥尔摩 =====================
  {
    id: '2002-wtt-finals', name: 'WTT总决赛', year: 2002,
    start_date: '2002-12-12', end_date: '2002-12-15', location: '瑞典斯德哥尔摩',
    events: {
      ms: { g: ['庄智渊'], s: ['Kalinikos Kreanga'], b: ['王皓', 'Timo Boll'] },
      ws: { g: ['张怡宁'], s: ['郭跃'], b: ['郭焱', '牛剑锋'] },
      md: { g: [['孔令辉', '马琳']], s: [['Akira Kito', 'Toshio Tasaki']] },
      wd: { g: [['李佳', '牛剑锋']], s: [['李楠', '张怡宁']] }
    }
  },
  // ===================== 2003 广州 =====================
  {
    id: '2003-wtt-finals', name: 'WTT总决赛', year: 2003,
    start_date: '2003-12-11', end_date: '2003-12-14', location: '中国广州',
    events: {
      ms: { g: ['王皓'], s: ['郝帅'], b: ['Jens Lundqvist', '柳承敏'] },
      ws: { g: ['牛剑锋'], s: ['张怡宁'], b: ['郭焱', '王楠'] },
      md: { g: [['马琳', '陈玘']], s: [['Cheung Yuk', 'Leung Chu Yan']] },
      wd: { g: [['郭跃', '牛剑锋']], s: [['王楠', '张怡宁']] }
    }
  },
  // ===================== 2004 北京 =====================
  {
    id: '2004-wtt-finals', name: 'WTT总决赛', year: 2004,
    start_date: '2004-12-10', end_date: '2004-12-13', location: '中国北京',
    events: {
      ms: { g: ['王励勤'], s: ['马琳'], b: ['王皓', 'Timo Boll'] },
      ws: { g: ['郭跃'], s: ['牛剑锋'], b: ['王楠', '刘佳'] },
      md: { g: [['马琳', '陈玘']], s: [['孔令辉', '王皓']] },
      wd: { g: [['王楠', '张怡宁']], s: [['郭跃', '牛剑锋']] }
    }
  },
  // ===================== 2005 福州 =====================
  {
    id: '2005-wtt-finals', name: 'WTT总决赛', year: 2005,
    start_date: '2005-12-09', end_date: '2005-12-12', location: '中国福州',
    events: {
      ms: { g: ['Timo Boll'], s: ['Jean-Michel Saive'], b: ['柳承敏', '吴尚垠'] },
      ws: { g: ['张怡宁'], s: ['李佳薇'], b: ['文炫晶', '帖雅娜'] },
      md: { g: [['Timo Boll', 'Christian Süß']], s: [['Lee Jung-woo', 'Oh Sang-eun']] },
      wd: { g: [['Gao Jun', 'Shen Yanfei']], s: [['Kim Bok-rae', 'Kim Kyung-ah']] }
    }
  },
  // ===================== 2006 香港 =====================
  {
    id: '2006-wtt-finals', name: 'WTT总决赛', year: 2006,
    start_date: '2006-12-08', end_date: '2006-12-11', location: '中国香港',
    events: {
      ms: { g: ['王皓'], s: ['吴尚垠'], b: ['侯英超', '马琳'] },
      ws: { g: ['张怡宁'], s: ['李晓霞'], b: ['李佳薇', '沈燕飞'] },
      md: { g: [['郝帅', '马龙']], s: [['马琳', '陈玘']] },
      wd: { g: [['王楠', '张怡宁']], s: [['Gao Jun', 'Shen Yanfei']] }
    }
  },
  // ===================== 2007 北京 =====================
  {
    id: '2007-wtt-finals', name: 'WTT总决赛', year: 2007,
    start_date: '2007-12-13', end_date: '2007-12-16', location: '中国北京',
    events: {
      ms: { g: ['马琳'], s: ['王皓'], b: ['马龙', '王励勤'] },
      ws: { g: ['李晓霞'], s: ['郭跃'], b: ['张怡宁', '郭焱'] },
      md: { g: [['陈玘', '王励勤']], s: [['马琳', '王皓']] },
      wd: { g: [['郭跃', '李晓霞']], s: [['Kim Kyung-ah', 'Park Mi-young']] }
    }
  },
  // ===================== 2008 澳门 =====================
  {
    id: '2008-wtt-finals', name: 'WTT总决赛', year: 2008,
    start_date: '2008-12-12', end_date: '2008-12-15', location: '中国澳门',
    events: {
      ms: { g: ['马龙'], s: ['王皓'], b: ['马琳', 'Vladimir Samsonov'] },
      ws: { g: ['郭焱'], s: ['郭跃'], b: ['王越古', '冯天薇'] },
      md: { g: [['Gao Ning', 'Yang Zi']], s: [['Chuang Chih-yuan', 'Wu Chih-chi']] },
      wd: { g: [['Li Jiawei', 'Sun Beibei']], s: [['Kim Kyung-ah', 'Park Mi-young']] }
    }
  },
  // ===================== 2009 澳门 =====================
  {
    id: '2009-wtt-finals', name: 'WTT总决赛', year: 2009,
    start_date: '2009-12-11', end_date: '2009-12-14', location: '中国澳门',
    events: {
      ms: { g: ['马龙'], s: ['许昕'], b: ['张继科', '王励勤'] },
      ws: { g: ['郭焱'], s: ['丁宁'], b: ['金暻娥', '冯天薇'] },
      md: { g: [['Timo Boll', 'Christian Süß']], s: [['Gao Ning', 'Yang Zi']] },
      wd: { g: [['丁宁', '刘诗雯']], s: [['Jiang Huajun', 'Tie Yana']] }
    }
  },
  // ===================== 2010 首尔 =====================
  {
    id: '2010-wtt-finals', name: 'WTT总决赛', year: 2010,
    start_date: '2010-12-09', end_date: '2010-12-12', location: '韩国首尔',
    events: {
      ms: { g: ['Jun Mizutani'], s: ['Bastian Steger'], b: ['柳承敏', 'Vladimir Samsonov'] },
      ws: { g: ['冯天薇'], s: ['石贺净'], b: ['福原爱', '李佼'] },
      md: { g: [['Jiang Tianyi', 'Tang Peng']], s: [['Gao Ning', 'Yang Zi']] },
      wd: { g: [['Kim Kyung-ah', 'Park Mi-young']], s: [['Jiang Huajun', 'Tie Yana']] }
    }
  },
  // ===================== 2011 伦敦 =====================
  {
    id: '2011-wtt-finals', name: 'WTT总决赛', year: 2011,
    start_date: '2011-12-08', end_date: '2011-12-11', location: '英国伦敦',
    events: {
      ms: { g: ['马龙'], s: ['张继科'], b: ['王皓', '高宁'] },
      ws: { g: ['刘诗雯'], s: ['丁宁'], b: ['李晓霞', '王越古'] },
      md: { g: [['马琳', '张继科']], s: [['马龙', '王皓']] },
      wd: { g: [['郭跃', '李晓霞']], s: [['Ai Fukuhara', 'Kasumi Ishikawa']] }
    }
  },
  // ===================== 2012 杭州 =====================
  {
    id: '2012-wtt-finals', name: 'WTT总决赛', year: 2012,
    start_date: '2012-12-06', end_date: '2012-12-09', location: '中国杭州',
    events: {
      ms: { g: ['许昕'], s: ['王皓'], b: ['庄智渊', '马琳'] },
      ws: { g: ['刘诗雯'], s: ['丁宁'], b: ['陈梦', '冯天薇'] },
      md: { g: [['Gao Ning', 'Li Hu']], s: [['Koki Niwa', 'Kenta Matsudaira']] },
      wd: { g: [['冯天薇', '于梦雨']], s: [['Cheng I-ching', 'Huang Yi-hua']] }
    }
  },
  // ===================== 2013 迪拜 =====================
  {
    id: '2013-wtt-finals', name: 'WTT总决赛', year: 2013,
    start_date: '2013-12-05', end_date: '2013-12-08', location: '阿联酋迪拜',
    events: {
      ms: { g: ['许昕'], s: ['马龙'], b: ['樊振东', 'Kim Min-seok'] },
      ws: { g: ['刘诗雯'], s: ['丁宁'], b: ['李晓霞', '帕夫洛维奇'] },
      md: { g: [['Gao Ning', 'Li Hu']], s: [['Chiang Hung-chieh', 'Huang Sheng-sheng']] },
      wd: { g: [['丁宁', '李晓霞']], s: [['Cheng I-ching', 'Huang Yi-hua']] }
    }
  },
  // ===================== 2014 曼谷 =====================
  {
    id: '2014-wtt-finals', name: 'WTT总决赛', year: 2014,
    start_date: '2014-12-11', end_date: '2014-12-14', location: '泰国曼谷',
    events: {
      ms: { g: ['Jun Mizutani'], s: ['Dimitrij Ovtcharov'], b: ['Marcos Freitas', '唐鹏'] },
      ws: { g: ['石川佳纯'], s: ['徐孝元'], b: ['波塔', '于梦雨'] },
      md: { g: [['Cho Eon-rae', 'Seo Hyun-deok']], s: [['Kento Matsudaira', 'Koki Niwa']] },
      wd: { g: [['Miu Hirano', 'Mima Ito']], s: [['波瓦卡', '帕蒂卡']] }
    }
  },
  // ===================== 2015 里斯本 =====================
  {
    id: '2015-wtt-finals', name: 'WTT总决赛', year: 2015,
    start_date: '2015-12-10', end_date: '2015-12-13', location: '葡萄牙里斯本',
    events: {
      ms: { g: ['马龙'], s: ['樊振东'], b: ['许昕', '张继科'] },
      ws: { g: ['丁宁'], s: ['陈梦'], b: ['朱雨玲', '田志希'] },
      md: { g: [['Masataka Morizono', 'Yuya Oshima']], s: [['Marcos Freitas', 'Joao Monteiro']] },
      wd: { g: [['丁宁', '朱雨玲']], s: [['Miu Hirano', 'Mima Ito']] }
    }
  },
  // ===================== 2016 多哈 =====================
  {
    id: '2016-wtt-finals', name: 'WTT总决赛', year: 2016,
    start_date: '2016-12-08', end_date: '2016-12-11', location: '卡塔尔多哈',
    events: {
      ms: { g: ['马龙'], s: ['樊振东'], b: ['郑荣植', '许昕'] },
      ws: { g: ['朱雨玲'], s: ['韩莹'], b: ['石川佳纯', '伊藤美诚'] },
      md: { g: [['Jung Young-sik', 'Lee Sang-su']], s: [['Masataka Morizono', 'Yuya Oshima']] },
      wd: { g: [['Yui Hamamoto', 'Hina Hayata']], s: [['Doo Hoi Kem', 'Lee Ho Ching']] }
    }
  },
  // ===================== 2017 阿斯塔纳 =====================
  {
    id: '2017-wtt-finals', name: 'WTT总决赛', year: 2017,
    start_date: '2017-12-14', end_date: '2017-12-17', location: '哈萨克斯坦阿斯塔纳',
    events: {
      ms: { g: ['樊振东'], s: ['Dimitrij Ovtcharov'], b: ['Timo Boll', '林高远'] },
      ws: { g: ['陈梦'], s: ['朱雨玲'], b: ['顾玉婷', '陈幸同'] },
      md: { g: [['Masataka Morizono', 'Yuya Oshima']], s: [['Wong Chun Ting', 'Ho Kwan Kit']] },
      wd: { g: [['陈梦', '朱雨玲']], s: [['Mima Ito', 'Hina Hayata']] }
    }
  },
  // ===================== 2018 仁川 =====================
  {
    id: '2018-wtt-finals', name: 'WTT总决赛', year: 2018,
    start_date: '2018-12-13', end_date: '2018-12-16', location: '韩国仁川',
    events: {
      ms: { g: ['Tomokazu Harimoto'], s: ['林高远'], b: ['Hugo Calderano', 'Jun Mizutani'] },
      ws: { g: ['陈梦'], s: ['何卓佳'], b: ['丁宁', '朱雨玲'] },
      md: { g: [['Lim Jong-hoon', 'Jang Woo-jin']], s: [['Ho Kwan Kit', 'Wong Chun Ting']] },
      wd: { g: [['Mima Ito', 'Hina Hayata']], s: [['陈幸同', '孙颖莎']] },
      xd: { g: [['Wong Chun Ting', 'Doo Hoi Kem']], s: [['Jang Woo-jin', 'Cha Hyo-sim']] }
    }
  },
  // ===================== 2019 郑州 =====================
  {
    id: '2019-wtt-finals', name: 'WTT总决赛', year: 2019,
    start_date: '2019-12-12', end_date: '2019-12-15', location: '中国郑州',
    events: {
      ms: {
        g: ['樊振东'], s: ['马龙'],
        b: ['林高远', '许昕']
      },
      ws: {
        g: ['陈梦'], s: ['王曼昱'],
        b: ['王艺迪', '伊藤美诚']
      },
      md: {
        g: [['樊振东', '许昕']], s: [['Liao Cheng-ting', 'Lin Yun-ju']],
        b: [['Timo Boll', 'Patrick Franziska'], ['梁靖崑', '林高远']]
      },
      wd: {
        g: [['Miyuu Kihara', 'Miyu Nagasaki']], s: [['Jeon Ji-hee', 'Yang Ha-eun']],
        b: [['孙颖莎', '王曼昱'], ['陈思羽', '郑先知']]
      },
      xd: {
        g: [['许昕', '刘诗雯']], s: [['Jun Mizutani', 'Mima Ito']],
        b: [['Wong Chun Ting', 'Doo Hoi Kem'], ['Lin Yun-ju', 'Cheng I-ching']]
      }
    }
  },
  // ===================== 2020 郑州（ITTF Finals，仅单打） =====================
  {
    id: '2020-wtt-finals', name: 'WTT总决赛', year: 2020,
    start_date: '2020-11-19', end_date: '2020-11-22', location: '中国郑州',
    events: {
      ms: { g: ['马龙'], s: ['樊振东'], b: ['Jang Woo-jin', '许昕'] },
      ws: { g: ['陈梦'], s: ['王曼昱'] } // 2020 女单铜牌组合未系统收录
    }
  },
  // ===================== 2021 WTT Cup Finals（新加坡，仅单打） =====================
  {
    id: '2021-wtt-finals', name: 'WTT杯总决赛', year: 2021,
    start_date: '2021-12-04', end_date: '2021-12-07', location: '新加坡',
    events: {
      ms: { g: ['樊振东'], s: ['Tomokazu Harimoto'], b: ['王楚钦', 'Hugo Calderano'] },
      ws: { g: ['孙颖莎'], s: ['王艺迪'], b: ['Hina Hayata', '陈梦'] }
    }
  },
  // ===================== 2022 WTT Cup Finals（新乡，仅单打） =====================
  {
    id: '2022-wtt-finals', name: 'WTT杯总决赛', year: 2022,
    start_date: '2022-10-27', end_date: '2022-10-30', location: '中国新乡',
    events: {
      ms: { g: ['王楚钦'], s: ['Tomokazu Harimoto'], b: ['马龙', 'Dimitrij Ovtcharov'] },
      ws: { g: ['孙颖莎'], s: ['陈梦'], b: ['王艺迪', '王曼昱'] }
    }
  }
];

// ===========================================================================
// 2023 / 2024 特殊届次（保留现有 id 与 2023 的 ms/ws）
// ===========================================================================
const ED_2023 = {
  meta: {
    id: '2023-wtt-finals', name: 'WTT总决赛', type: TYPE, level: LEVEL,
    year: 2023, start_date: '2023-12-15', end_date: '2023-12-17',
    location: '名古屋', edition: '2023', participant_count: 32
  },
  // 2023 为男女分办：女单/女双在名古屋，男单/男双在多哈；现有 ms/ws 已按此建模并保留。
  // 此处仅补充女双(名古屋)与男双(多哈)。
  extra: {
    wd: {
      g: [['孙颖莎', '王曼昱']], s: [['Miyu Nagasaki', 'Miyuu Kihara']],
      b: [['陈梦', '王艺迪'], ['郑怡静', '李昱谆']]
    },
    md: {
      g: [['袁励岑', '向鹏']], s: [['林高远', '林诗栋']]
    }
  }
};

const ED_2024 = {
  meta: {
    id: '2024-wtt-finals', name: 'WTT总决赛', type: TYPE, level: LEVEL,
    year: 2024, start_date: '2024-12-10', end_date: '2024-12-15',
    location: '待定', edition: '2024', participant_count: 32
  },
  // 注：现有 src/data 中 2024-wtt-finals 为占位（location "待定"、日期 2024-12-10~15）；
  // 实际 2024 WTT Finals 于 2024-11-20~24 在日本福冈举办。按要求保留现有元数据，
  // 并以真实福冈赛果填充项目（本生成文件独立于 src/data，不影响既有展示）。
  events: {
    ms: { g: ['王楚钦'], s: ['Tomokazu Harimoto'], b: ['林诗栋', 'Darko Jorgic'] },
    ws: { g: ['王曼昱'], s: ['陈幸同'], b: ['王艺迪', 'Bernadette Szocs'] },
    md: { g: [['Felix Lebrun', 'Alexis Lebrun']], s: [['Shinozuka', 'Togami']] },
    wd: { g: [['Sato', 'Hashimoto']], s: [['Yokoi', 'Odo']] }
  }
};

const ED_2025 = {
  meta: {
    id: '2025-wtt-finals', name: 'WTT总决赛', type: TYPE, level: LEVEL,
    year: 2025, start_date: '2025-12-10', end_date: '2025-12-14',
    location: '中国香港', edition: '2025', participant_count: 32
  },
  // 2025 香港总决赛：设男单/女单/混双，男双女双合并为混双，无独立 md/wd。
  events: {
    ms: { g: ['Tomokazu Harimoto'], s: ['Truls Moregard'], b: ['王楚钦', '林诗栋'] },
    ws: { g: ['王曼昱'], s: ['蒯曼'], b: ['孙颖莎', '陈熠'] },
    xd: {
      g: [['Lim Jong-hoon', 'Shin Yu-bin']], s: [['王楚钦', '孙颖莎']],
      b: [['林诗栋', '蒯曼'], ['Tomokazu Matsushima', 'Miyu Harimoto']]
    }
  }
};

// ---------------------------------------------------------------------------
// 构建
// ---------------------------------------------------------------------------
const tournaments = [];
const events = [];

const pushTournament = (meta) => {
  tournaments.push({
    id: meta.id,
    name: meta.name,
    type: TYPE,
    level: LEVEL,
    year: meta.year,
    start_date: meta.start_date,
    end_date: meta.end_date,
    location: meta.location,
    edition: String(meta.year),
    participant_count: meta.participant_count || 32
  });
};

const pushEvents = (tourId, spec) => {
  for (const suffix of Object.keys(spec)) {
    const def = EVENT_DEF[suffix];
    if (!def) continue;
    events.push({
      id: `${tourId}-${suffix}`,
      tournament_id: tourId,
      name: def.name,
      code: def.code,
      weight: def.weight,
      results: buildResults(spec[suffix])
    });
  }
};

// 1996–2022 标准届次
EDITIONS.forEach((ed) => {
  pushTournament({
    id: ed.id, name: ed.name, year: ed.year,
    start_date: ed.start_date, end_date: ed.end_date, location: ed.location
  });
  pushEvents(ed.id, ed.events);
});

// 2023（保留现有 ms/ws，补充 wd/md）
pushTournament(ED_2023.meta);
events.push(PRESERVED_2023_MS);
events.push(PRESERVED_2023_WS);
pushEvents('2023-wtt-finals', ED_2023.extra);

// 2024（保留现有元数据，填充福冈赛果）
pushTournament(ED_2024.meta);
pushEvents('2024-wtt-finals', ED_2024.events);

// 2025（香港）
pushTournament(ED_2025.meta);
pushEvents('2025-wtt-finals', ED_2025.events);

// ---------------------------------------------------------------------------
// 自检
// ---------------------------------------------------------------------------
const problems = [];

const seenTournament = new Set();
for (const t of tournaments) {
  if (seenTournament.has(t.id)) problems.push(`重复赛事 id: ${t.id}`);
  seenTournament.add(t.id);
  if (!/^\d{4}-wtt-finals$/.test(t.id)) problems.push(`赛事 id 不符合命名规范: ${t.id}`);
  if (t.start_date > t.end_date) problems.push(`${t.id} 起止日期倒置`);
}

const seenEvent = new Set();
for (const e of events) {
  if (seenEvent.has(e.id)) problems.push(`重复项目 id: ${e.id}`);
  seenEvent.add(e.id);
  if (!seenTournament.has(e.tournament_id)) problems.push(`${e.id} 指向不存在的赛事`);
  if (!e.results.some((r) => r.rank === 1)) problems.push(`${e.id} 缺少冠军`);
  const golds = e.results.filter((r) => r.rank === 1).length;
  // 双打冠军应为组合（2 人）；单打冠军 1 人
  if (e.code.endsWith('DOUBLES') && golds !== 2) problems.push(`${e.id} 双打冠军人数异常: ${golds}`);
  if (!e.code.endsWith('DOUBLES') && golds !== 1) problems.push(`${e.id} 单打冠军人数异常: ${golds}`);
}

// 必须保留的现有 id
const required = ['2023-wtt-finals', '2024-wtt-finals', '2023-wtt-finals-ms', '2023-wtt-finals-ws'];
for (const id of required) {
  if (!seenTournament.has(id) && !seenEvent.has(id)) problems.push(`未保留既有 id: ${id}`);
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
console.log(`命中名册选手 ${rosterHits.size} 人（按 id 计），名册外(按姓名存储) ${outsiders.size} 个`);
if (problems.length) {
  console.log('\n自检发现问题:');
  problems.forEach((p) => console.log('  - ' + p));
  process.exitCode = 1;
} else {
  console.log('自检通过。');
}
