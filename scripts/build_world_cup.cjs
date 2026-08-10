const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');

const athletes = JSON.parse(fs.readFileSync(path.join(dir, 'athletes.json'), 'utf8'));
const tournaments = JSON.parse(fs.readFileSync(path.join(dir, 'tournaments.json'), 'utf8'));
const events = JSON.parse(fs.readFileSync(path.join(dir, 'events.json'), 'utf8'));

const nameToId = Object.fromEntries(athletes.map(a => [a.name, a.id]));
function aid(name) { return nameToId[name] || name; }

const WEIGHT = {
  MEN_SINGLES: 1.5, WOMEN_SINGLES: 1.5,
  MEN_TEAM: 0.6, WOMEN_TEAM: 0.6, MIXED_TEAM: 0.6
};
const NAME = {
  MEN_SINGLES: '男子单打', WOMEN_SINGLES: '女子单打',
  MEN_TEAM: '男子团体', WOMEN_TEAM: '女子团体', MIXED_TEAM: '混合团体'
};
const CODE_SUFFIX = {
  MEN_SINGLES: 'ms', WOMEN_SINGLES: 'ws',
  MEN_TEAM: 'mt', WOMEN_TEAM: 'wt', MIXED_TEAM: 'mxt'
};

// 清理单打姓名：去掉（国家）后缀与 [n] 脚注
function cleanName(s) {
  return s.replace(/[（(][^）)]*[）)]/g, '').replace(/\[[0-9]+\]/g, '').replace(/\s+/g, ' ').trim();
}
// 从团体冠军串中提取队员：国家（成员/成员）
function teamMembers(champion) {
  const m = champion.match(/[（(]([^）)]*)[）)]/);
  if (m) {
    return m[1].split('/').map(x => cleanName(x)).filter(Boolean);
  }
  return [cleanName(champion)];
}

// [year, location, champion, runnerup, thirdA, thirdB?]
const MS = [
  [1980,'中国香港','郭跃华（中国）','李振恃（中国）','德沃拉切克（捷克斯洛伐克）'],
  [1981,'吉隆坡','克兰帕尔（匈牙利）','谢赛克（中国）','郭跃华（中国）'],
  [1982,'中国香港','郭跃华（中国）','阿佩伊伦（瑞典）','谢赛克（中国）'],
  [1983,'巴巴多斯','米克尔·阿佩伊伦（瑞典）','瓦尔德内尔（瑞典）','林德（瑞典）'],
  [1984,'吉隆坡','江嘉良（中国）','金浣（韩国）','本特森（瑞典）'],
  [1985,'中国佛山','陈新华（中国）','格鲁巴（波兰）','江嘉良（中国）'],
  [1986,'特立尼达和多巴哥','陈龙灿（中国）','江嘉良（中国）','金浣（韩国）'],
  [1987,'中国澳门','滕毅（中国）','江嘉良（中国）','格鲁巴（波兰）'],
  [1988,'中国武汉','格鲁巴（波兰）','陈龙灿（中国）','江嘉良（中国）'],
  [1989,'肯尼亚内罗毕','马文革（中国）','格鲁巴（波兰）','米克尔·阿佩伊伦（瑞典）'],
  [1990,'日本千叶','瓦尔德内尔（瑞典）','马文革（中国）','陈龙灿（中国）'],
  [1991,'吉隆坡','佩尔森（瑞典）','盖亭（法国）','瓦尔德内尔（瑞典）'],
  [1992,'越南胡志明市','马文革（中国）','金泽洙（韩国）','刘南奎（韩国）'],
  [1993,'中国广州','普里莫拉茨（克罗地亚）','王涛（中国）','黄文冠（加拿大）'],
  [1994,'中国台北','盖亭（法国）','塞弗（比利时）','普里莫拉茨（克罗地亚）'],
  [1995,'法国尼姆','孔令辉（中国）','罗斯科夫（德国）','刘国梁（中国）'],
  [1996,'法国尼姆','刘国梁（中国）','瓦尔德内尔（瑞典）','萨姆索诺夫（白俄罗斯）'],
  [1997,'法国尼姆','普里莫拉茨（克罗地亚）','孔令辉（中国）','萨姆索诺夫（白俄罗斯）'],
  [1998,'中国汕头','罗斯科夫（德国）','金泽洙（韩国）','普里莫拉茨（克罗地亚）'],
  [1999,'中国中山','萨姆索诺夫（白俄罗斯）','施拉格（奥地利）','普里莫拉茨（克罗地亚）'],
  [2000,'中国扬州','马琳（中国）','金泽洙（韩国）','王励勤（中国）'],
  [2001,'意大利库马约','萨姆索诺夫（白俄罗斯）','王励勤（中国）','罗斯科夫（德国）'],
  [2002,'中国济南','波尔（德国）','孔令辉（中国）','普里莫拉茨（克罗地亚）'],
  [2003,'中国江阴','马琳（中国）','格林卡（希腊）','王励勤（中国）'],
  [2004,'中国萧山','马琳（中国）','格林卡（希腊）','王皓（中国）'],
  [2005,'比利时列日','波尔（德国）','王皓（中国）','马琳（中国）'],
  [2006,'法国巴黎','马琳（中国）','王皓（中国）','王励勤（中国）'],
  [2007,'西班牙巴塞罗那','王皓（中国）','柳承敏（韩国）','王励勤（中国）'],
  [2008,'比利时列日','王皓（中国）','波尔（德国）','马龙（中国）'],
  [2009,'俄罗斯莫斯科','萨姆索诺夫（白俄罗斯）','陈玘（中国）','马龙（中国）'],
  [2010,'德国马格德堡','王皓 （中国）','张继科（中国）','波尔（德国）'],
  [2011,'法国巴黎','张继科（中国）','王皓（中国）','朱世赫（韩国）'],
  [2012,'英国利物浦','马龙（中国）','波尔（德国）','萨姆索诺夫（白俄罗斯）'],
  [2013,'比利时韦尔维耶','许昕（中国）','萨姆索诺夫（白俄罗斯）','奥恰洛夫（德国）'],
  [2014,'德国杜塞尔多夫','张继科（中国）','马龙（中国）','波尔（德国）'],
  [2015,'瑞典哈尔姆斯塔德','马龙（中国）','樊振东（中国）','奥恰洛夫（德国）'],
  [2016,'德国萨尔布吕肯','樊振东（中国）','许昕（中国）','黄镇廷（中国香港）'],
  [2017,'法国巴黎','奥恰洛夫（德国）','波尔（德国）','马龙（中国）'],
  [2018,'法国巴黎','樊振东（中国）','波尔（德国）','林高远（中国）'],
  [2019,'中国成都','樊振东（中国）','张本智和（日本）','林昀儒（中国台北）'],
  [2020,'中国威海','樊振东（中国）','马龙（中国）','张本智和（日本）'],
  [2024,'中国澳门','马龙（中国）','林高远（中国）','王楚钦（中国）','张本智和（日本）'],
  [2025,'中国澳门','雨果·卡尔德拉诺（巴西）','林诗栋（中国）','王楚钦（中国）','梁靖崑（中国）'],
  [2026,'中国澳门','王楚钦（中国）','松岛辉空（日本）','林昀儒（中国台北）','雨果·卡尔德拉诺（巴西）']
];

const WS = [
  [1996,'中国香港','邓亚萍（中国）','杨影（中国）','王晨（中国）'],
  [1997,'中国上海','王楠（中国）','李菊（中国）','李春丽（新西兰）'],
  [1998,'中国台北','王楠（中国）','李菊（中国）','童飞鸣（中国台北）'],
  [2000,'柬埔寨金边','李菊（中国）','王楠（中国）','孙晋（中国）'],
  [2001,'中国芜湖','张怡宁（中国）','金英姬（朝鲜）','斯蒂夫（罗马尼亚）'],
  [2002,'新加坡','张怡宁（中国）','李楠（中国）','帖雅娜（中国香港）'],
  [2003,'中国香港','王楠（中国）','牛剑锋（中国）','张怡宁（中国）'],
  [2004,'中国萧山','张怡宁（中国）','王楠（中国）','帖雅娜（中国香港）'],
  [2005,'中国广州','张怡宁（中国）','郭焱（中国）','福原爱（日本）'],
  [2006,'中国新疆','郭焱（中国）','张怡宁（中国）','李佳薇（新加坡）'],
  [2007,'中国成都','王楠（中国）','张怡宁（中国）','郭跃（中国）'],
  [2008,'马来西亚吉隆坡','李晓霞（中国）','帖雅娜（中国香港）','冯天薇（新加坡）'],
  [2009,'中国广州','刘诗雯（中国）','郭跃（中国）','李晓霞（中国）'],
  [2010,'马来西亚吉隆坡','郭焱（中国）','姜华珺（中国香港）','郭跃（中国）'],
  [2011,'新加坡','丁宁（中国）','李晓霞（中国）','帖雅娜（中国香港）'],
  [2012,'中国黄石','刘诗雯（中国）','萨马拉（罗马尼亚）','沈燕飞（西班牙）'],
  [2013,'日本神户','刘诗雯（中国）','武杨（中国）','冯天薇（新加坡）'],
  [2014,'奥地利林茨','丁宁（中国）','李晓霞（中国）','石川佳纯（日本）'],
  [2015,'日本仙台','刘诗雯（中国）','石川佳纯（日本）','索尔佳（德国）'],
  [2016,'美国费城','平野美宇（日本）','郑怡静（中国台北）','冯天薇（新加坡）'],
  [2017,'加拿大万锦','朱雨玲（中国）','刘诗雯（中国）','郑怡静（中国台北）'],
  [2018,'中国成都','丁宁（中国）','朱雨玲（中国）','郑怡静（中国台北）'],
  [2019,'中国成都','刘诗雯（中国）','朱雨玲（中国）','冯天薇（新加坡）'],
  [2020,'中国威海','陈梦（中国）','孙颖莎（中国）','伊藤美诚（日本）'],
  [2024,'中国澳门','孙颖莎（中国）','王曼昱（中国）','陈梦（中国）','张本美和（日本）'],
  [2025,'中国澳门','孙颖莎（中国）','蒯曼（中国）','陈幸同（中国）','伊藤美诚（日本）'],
  [2026,'中国澳门','孙颖莎（中国）','王曼昱（中国）','莎宾·温特（德国）','申裕斌（韩国）']
];

// [year, location, champion(含队员), runnerup, third]
const MT = [
  [1990,'日本千叶','瑞典（阿佩伊伦/瓦尔德内尔/佩尔森/林德）','中国','韩国/英国'],
  [1991,'西班牙巴塞罗那','中国（马文革/王涛/王浩/张雷/谢超杰）','瑞典','朝鲜/法国'],
  [1994,'法国尼姆','中国（刘国梁/丁松/林志刚/王浩/秦志戬）','瑞典','法国/比利时'],
  [1995,'美国亚特兰大','韩国（金泽洙/李哲承/刘南奎）','德国','美国/日本'],
  [2007,'德国马格德堡','中国（马琳/王皓/王励勤/陈玘）','中国香港','奥地利/韩国'],
  [2009,'奥地利林茨','中国（马龙/张继科/许昕/邱贻可）','韩国','德国/中国香港'],
  [2010,'阿联酋迪拜','中国（马龙/王皓/张继科/许昕/郝帅）','韩国','德国/奥地利'],
  [2011,'德国马格德堡','中国（马龙/王皓/许昕/马琳/王励勤）','韩国','德国/日本'],
  [2013,'中国广州','中国（张继科/马龙/许昕/王皓/王励勤）','中国台北','日本/埃及'],
  [2015,'阿联酋迪拜','中国（张继科/马龙/许昕/樊振东/方博）','奥地利','中国台北/葡萄牙'],
  [2018,'英国伦敦','中国（马龙/樊振东/许昕/林高远/于子洋）','日本','英格兰/韩国'],
  [2019,'日本东京','中国（马龙/樊振东/许昕/梁靖崑/林高远）','韩国','-']
];

const WT = [
  [1990,'日本千叶','中国（邓亚萍/乔红/高军/陈子荷）','朝鲜','韩国/日本'],
  [1991,'西班牙巴塞罗那','中国（邓亚萍/乔红/刘伟/陈子荷）','韩国','朝鲜/日本'],
  [1994,'法国尼姆','俄罗斯（梅利尼克/帕琳娜/提米娜）','德国','中国/荷兰'],
  [1995,'美国亚特兰大','中国（杨影/乔红/刘伟/乔云萍/邓亚萍）','罗马尼亚','匈牙利/韩国'],
  [2007,'德国马格德堡','中国（张怡宁/郭跃/李晓霞/王楠）','韩国','中国香港/匈牙利'],
  [2009,'奥地利林茨','中国（郭跃/李晓霞/刘诗雯/丁宁）','新加坡','日本/中国香港'],
  [2010,'阿联酋迪拜','中国（郭跃/李晓霞/郭焱/刘诗雯/丁宁）','新加坡','日本/韩国'],
  [2011,'德国马格德堡','中国（郭跃/李晓霞/郭焱/丁宁/范瑛）','日本','新加坡/中国香港'],
  [2013,'中国广州','中国（李晓霞/丁宁/刘诗雯/常晨晨/武杨）','日本','新加坡/中国香港'],
  [2015,'阿联酋迪拜','中国（丁宁/李晓霞/刘诗雯/朱雨玲/陈梦）','朝鲜','新加坡/日本'],
  [2018,'英国伦敦','中国（丁宁/刘诗雯/朱雨玲/陈幸同/王曼昱）','日本','中国香港/朝鲜'],
  [2019,'日本东京','中国 （丁宁/刘诗雯/陈梦/孙颖莎/王曼昱）','日本','-']
];

const MXT = [
  [2023,'中国成都','中国（王楚钦/马龙/孙颖莎/王艺迪/王曼昱/樊振东/陈梦/林高远）','韩国','日本'],
  [2024,'中国成都','中国（王楚钦/梁靖崑/林高远/林诗栋/孙颖莎/王曼昱/王艺迪/蒯曼）','韩国','中国香港'],
  [2025,'中国成都','中国（王楚钦/梁靖崑/林诗栋/徐瑛彬/孙颖莎/王曼昱/王艺迪/蒯曼）','日本','德国']
];

// 收集每年所有出现过的地点
const yearLocations = {};
function addLoc(year, loc) {
  if (!loc) return;
  (yearLocations[year] = yearLocations[year] || new Set()).add(loc);
}
[...MS, ...WS].forEach(r => addLoc(r[0], r[1]));
[...MT, ...WT, ...MXT].forEach(r => addLoc(r[0], r[1]));

// 各表按 year 索引
const msByYear = Object.fromEntries(MS.map(r => [r[0], r]));
const wsByYear = Object.fromEntries(WS.map(r => [r[0], r]));
const mtByYear = Object.fromEntries(MT.map(r => [r[0], r]));
const wtByYear = Object.fromEntries(WT.map(r => [r[0], r]));
const mxtByYear = Object.fromEntries(MXT.map(r => [r[0], r]));

const allYears = new Set([
  ...MS.map(r=>r[0]), ...WS.map(r=>r[0]),
  ...MT.map(r=>r[0]), ...WT.map(r=>r[0]), ...MXT.map(r=>r[0])
]);

// 保留已有 world_cup 赛事日期（兼容旧碎片 id）
function existingForYear(year) {
  return tournaments.find(t => t.type === 'world_cup' && t.id.startsWith(`${year}-world-cup`));
}

const newTournaments = [];
const newEvents = [];

for (const year of [...allYears].sort((a,b)=>a-b)) {
  const tid = `${year}-world-cup`;
  const locs = [...(yearLocations[year] || [])];
  const location = locs.length ? locs.join(' / ') : null;
  const ex = existingForYear(year);
  newTournaments.push({
    id: tid,
    name: `${year}年世界杯乒乓球赛`,
    type: 'world_cup',
    level: 'S',
    year,
    start_date: ex ? ex.start_date : null,
    end_date: ex ? ex.end_date : null,
    location,
    edition: null,
    participant_count: ex ? ex.participant_count : null
  });

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

  function addSingles(row) {
    if (!row) return;
    const players = row.slice(2).map(cleanName).filter(Boolean);
    const medals = ['gold','silver','bronze', null];
    addEvent(row._code, players.map((p, i) => ({
      athlete_id: aid(p), rank: i + 1, medal: medals[i] || null
    })));
  }
  function addTeam(row) {
    if (!row) return;
    const members = teamMembers(row[2]);
    addEvent(row._code, members.map(p => ({ athlete_id: aid(p), rank: 1, medal: 'gold' })));
  }

  const msRow = msByYear[year]; if (msRow) { msRow._code = 'MEN_SINGLES'; addSingles(msRow); }
  const wsRow = wsByYear[year]; if (wsRow) { wsRow._code = 'WOMEN_SINGLES'; addSingles(wsRow); }
  const mtRow = mtByYear[year]; if (mtRow) { mtRow._code = 'MEN_TEAM'; addTeam(mtRow); }
  const wtRow = wtByYear[year]; if (wtRow) { wtRow._code = 'WOMEN_TEAM'; addTeam(wtRow); }
  const mxtRow = mxtByYear[year]; if (mxtRow) { mxtRow._code = 'MIXED_TEAM'; addTeam(mxtRow); }
}

// merge: 保留非 world_cup，替换全部 world_cup
const otherTournaments = tournaments.filter(t => t.type !== 'world_cup');
const mergedTournaments = [...otherTournaments, ...newTournaments];
const wcIds = new Set(newTournaments.map(t => t.id));
const keptEvents = events.filter(e => !wcIds.has(e.tournament_id));
const mergedEvents = [...keptEvents, ...newEvents];

fs.writeFileSync(path.join(dir, 'tournaments.json'), JSON.stringify(mergedTournaments, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(mergedEvents, null, 2) + '\n', 'utf8');

console.log('世界杯赛事:', newTournaments.length, '届');
console.log('世界杯项目(events):', newEvents.length, '项');
console.log('总赛事:', mergedTournaments.length, '| 总项目:', mergedEvents.length);
const byCode = {};
newEvents.forEach(e => byCode[e.code] = (byCode[e.code]||0)+1);
console.log('项目分布:', JSON.stringify(byCode));
