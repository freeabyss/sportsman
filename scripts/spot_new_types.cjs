const fs = require('fs');
const events = JSON.parse(fs.readFileSync('src/data/events.json','utf8'));
const get = id => events.find(e => e.id === id);
const show = (label, id) => { const e = get(id); console.log(label+' ('+id+'): '+(e?JSON.stringify(e.results):'NOT FOUND')); };
// WTT
show('2024 WTT GS 新加坡 男单', '2024-wtt-grand-smash-singapore-ms');
show('2025 WTT GS 瑞典 女单', '2025-wtt-grand-smash-sweden-ws');
show('2023 WTT 总决赛 男单', '2023-wtt-finals-ms');
// 亚锦赛
show('2023 亚锦赛 男单', '2023-asian-championships-ms');
show('2023 亚锦赛 女团', '2023-asian-championships-wt');
// 亚运会
show('2022 亚运会 男单', '2022-asian-games-ms');
show('2022 亚运会 混双', '2022-asian-games-xd');
// 全运会
show('2021 全运会 男单', '2021-national-games-ms');
show('2021 全运会 男团', '2021-national-games-mt');
// 乒超
show('2024 乒超 男团', '2024-csl-mt');
// 全国锦标赛
show('2023 全锦赛 男单', '2023-national-championships-ms');
