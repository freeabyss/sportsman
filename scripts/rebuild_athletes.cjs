const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');

const athletes = JSON.parse(fs.readFileSync(path.join(dir, 'athletes.json'), 'utf8'));
const byId = Object.fromEntries(athletes.map(a => [a.id, a]));

// 8 new players (roster entries; no event data yet in our 1988+ dataset)
const NEW = {
  'rong-guotuan': {
    id: 'rong-guotuan', name: '容国团', english_name: 'Rong Guotuan',
    gender: 'male', birth_date: '1942-01-10', career_status: 'retired',
    career_start: '1958', career_end: '1961', team: '中国乒乓球队', avatar: null,
    play_style: '右手直拍正胶快攻',
    tags: ['中国首位世界冠军', '乒乓外交先驱'],
    bio_highlights: ['1959年多特蒙德世锦赛男单冠军（中国首个世界冠军）', '开创中国乒乓球辉煌时代'],
    career_milestones: [
      { year: '1959', event: '世锦赛男单冠军（中国首个世界冠军）' },
      { year: '1961', event: '世锦赛男团冠军' },
      { year: '1961', event: '退役' }
    ]
  },
  'zhuang-zedong': {
    id: 'zhuang-zedong', name: '庄则栋', english_name: 'Zhuang Zedong',
    gender: 'male', birth_date: '1940-01-25', career_status: 'retired',
    career_start: '1961', career_end: '1971', team: '中国乒乓球队', avatar: null,
    play_style: '右手直拍两面攻',
    tags: ['三届世锦赛男单冠军', '乒乓外交'],
    bio_highlights: ['1961/1963/1965 世锦赛男单三连冠', '中美乒乓外交关键人物'],
    career_milestones: [
      { year: '1961', event: '世锦赛男单冠军' },
      { year: '1963', event: '世锦赛男单冠军' },
      { year: '1965', event: '世锦赛男单冠军' },
      { year: '1971', event: '乒乓外交' }
    ]
  },
  'li-furong': {
    id: 'li-furong', name: '李富荣', english_name: 'Li Furong',
    gender: 'male', birth_date: '1942-08-09', career_status: 'retired',
    career_start: '1961', career_end: '1971', team: '中国乒乓球队', avatar: null,
    play_style: '右手直拍两面攻',
    tags: ['世锦赛男单亚军', '著名教练'],
    bio_highlights: ['1961/1963/1965 世锦赛男单亚军', '后任中国乒乓球队总教练'],
    career_milestones: [
      { year: '1961', event: '世锦赛男单亚军' },
      { year: '1965', event: '世锦赛男单亚军' }
    ]
  },
  'liang-geliang': {
    id: 'liang-geliang', name: '梁戈亮', english_name: 'Liang Geliang',
    gender: 'male', birth_date: '1950-05-05', career_status: 'retired',
    career_start: '1971', career_end: '1981', team: '中国乒乓球队', avatar: null,
    play_style: '右手横拍削球（长胶）',
    tags: ['世界冠军', '削球大师'],
    bio_highlights: ['世锦赛混双/男双冠军', '70年代中国男乒主力'],
    career_milestones: [
      { year: '1973', event: '世锦赛混双冠军' },
      { year: '1977', event: '世锦赛男双冠军' }
    ]
  },
  'guo-yuehua': {
    id: 'guo-yuehua', name: '郭跃华', english_name: 'Guo Yuehua',
    gender: 'male', birth_date: '1956-12-04', career_status: 'retired',
    career_start: '1977', career_end: '1983', team: '中国乒乓球队', avatar: null,
    play_style: '右手横拍两面反胶',
    tags: ['世锦赛男单冠军'],
    bio_highlights: ['1981/1983 世锦赛男单冠军', '80年代初中国男乒领军人物'],
    career_milestones: [
      { year: '1981', event: '世锦赛男单冠军' },
      { year: '1983', event: '世锦赛男单冠军' }
    ]
  },
  'cao-yanhua': {
    id: 'cao-yanhua', name: '曹燕华', english_name: 'Cao Yanhua',
    gender: 'female', birth_date: '1962-12-08', career_status: 'retired',
    career_start: '1979', career_end: '1985', team: '中国乒乓球队', avatar: null,
    play_style: '右手横拍两面反胶',
    tags: ['世锦赛女单冠军'],
    bio_highlights: ['1983/1985 世锦赛女单冠军', '中国女乒80年代主力'],
    career_milestones: [
      { year: '1983', event: '世锦赛女单冠军' },
      { year: '1985', event: '世锦赛女单冠军' }
    ]
  },
  'wang-chen': {
    id: 'wang-chen', name: '王晨', english_name: 'Wang Chen',
    gender: 'female', birth_date: '1971-05-01', career_status: 'retired',
    career_start: '1989', career_end: '2000', team: '中国乒乓球队', avatar: null,
    play_style: '右手横拍两面反胶',
    tags: ['世界冠军', '后代表美国队参赛'],
    bio_highlights: ['世锦赛女团冠军', '后代表美国队参加国际赛事'],
    career_milestones: [
      { year: '1993', event: '世锦赛女团冠军' }
    ]
  },
  'yang-ying': {
    id: 'yang-ying', name: '杨影', english_name: 'Yang Ying',
    gender: 'female', birth_date: '1977-07-13', career_status: 'retired',
    career_start: '1995', career_end: '2001', team: '中国乒乓球队', avatar: null,
    play_style: '右手横拍生胶快攻',
    tags: ['奥运亚军', '世界冠军'],
    bio_highlights: ['2000悉尼奥运会女双亚军', '世锦赛混双冠军'],
    career_milestones: [
      { year: '2000', event: '悉尼奥运会女双亚军' },
      { year: '2001', event: '世锦赛混双冠军' }
    ]
  }
};

// target order per user's list
const ORDER = [
  // male
  'rong-guotuan','zhuang-zedong','li-furong','liang-geliang','guo-yuehua',
  'liu-guoliang','kong-linghui','wang-tao','ma-wenge','wang-liqin','ma-lin',
  'wang-hao','zhang-jike','ma-long','xu-xin','fan-zhendong','wang-chuqin',
  'liang-jingkun','lin-gaoyuan',
  // female
  'cao-yanhua','deng-yaping','qiao-hong','wang-chen','yang-ying','li-ju',
  'wang-nan','zhang-yining','guo-yue','guo-yan','li-xiaoxia','ding-ning',
  'liu-shiwen','zhu-yuling','chen-meng','sun-yingsha','wang-manyu','wang-yidi'
];

const REMOVED = ['lu-lin','yan-sen','chen-qi','lin-shidong','fang-bo','liu-dingshuo',
  'chen-xingtong','qian-tianyi','zhang-rui','mu-zi','liu-wei'];

const result = [];
const seen = new Set();
for (const id of ORDER) {
  if (NEW[id]) result.push(NEW[id]);
  else if (byId[id]) result.push(byId[id]);
  else { console.error('MISSING in source for id:', id); process.exit(1); }
  seen.add(id);
}
// sanity: ensure no ordered id was a removed one
for (const id of REMOVED) if (seen.has(id)) console.error('WARN removed id still in order:', id);

fs.writeFileSync(path.join(dir, 'athletes.json'), JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log('athletes.json rebuilt:', result.length, 'players');
console.log('removed:', REMOVED.join(', '));
