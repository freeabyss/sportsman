import config from '../data/config.json'

const SINGLES_CODES = new Set(config.category_codes?.singles || ['MEN_SINGLES', 'WOMEN_SINGLES'])

/**
 * 判断赛事是否属于三大赛（仅统计此三类）
 */
export function isMajorTournament(tournament) {
  return config.major_tournaments.includes(tournament?.type)
}

/**
 * 统计一名运动员在三大赛中的奖牌情况（按项目分类）。
 *
 * 返回：
 * - medals: 总奖牌数 { gold, silver, bronze }
 * - categories: 按 singles / doubles / team 分类的奖牌明细
 *   { gold, silver, bronze, total }
 * - achievements: 所有奖牌成绩列表（用于成绩记录表）
 *
 * 排名规则（dataService.getRankings 使用）：
 *   单打 > 双打 > 团体；同类别内 金 > 银 > 铜。
 */
export function calcMedalStats(athleteId, events, tournaments) {
  const categories = {
    singles: { gold: 0, silver: 0, bronze: 0, total: 0 },
    doubles: { gold: 0, silver: 0, bronze: 0, total: 0 },
    team: { gold: 0, silver: 0, bronze: 0, total: 0 }
  }
  const medals = { gold: 0, silver: 0, bronze: 0 }
  const achievements = []

  const codeCategory = (code) => {
    if (config.category_codes?.singles?.includes(code)) return 'singles'
    if (config.category_codes?.doubles?.includes(code)) return 'doubles'
    if (config.category_codes?.team?.includes(code)) return 'team'
    return null
  }

  events.forEach(event => {
    const tournament = tournaments.find(t => t.id === event.tournament_id)
    if (!tournament || !isMajorTournament(tournament)) return

    event.results.forEach(result => {
      if (result.athlete_id !== athleteId || !result.medal) return

      const cat = codeCategory(event.code)
      if (!cat) return

      categories[cat][result.medal]++
      categories[cat].total++
      medals[result.medal]++

      achievements.push({
        tournament_id: event.tournament_id,
        tournament_name: tournament.name,
        event_id: event.id,
        event_name: event.name,
        event_code: event.code,
        year: tournament.year,
        medal: result.medal
      })
    })
  })

  return { medals, categories, achievements }
}
