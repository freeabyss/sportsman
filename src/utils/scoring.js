import config from '../data/config.json'

// 单打项目代码（用于排序辅助指标）
const SINGLES_CODES = new Set(['MEN_SINGLES', 'WOMEN_SINGLES'])

/**
 * 判断赛事是否属于三大赛（V1.0 仅统计此三类）
 */
export function isMajorTournament(tournament) {
  return config.major_tournaments.includes(tournament?.type)
}

/**
 * 获取项目（个人竞技）权重
 */
export function getProjectWeight(code) {
  return config.project_weights[code] ?? 1.0
}

/**
 * 获取奖牌权重
 */
export function getMedalWeight(medal) {
  return config.medal_weights[medal] ?? 0
}

/**
 * 单项成绩积分
 * V1.0：积分 = 赛事权重(100) × 项目权重 × 奖牌权重
 * 仅金、银、铜牌计分，非奖牌成绩不计入。
 */
export function calcEventScore(eventCode, medal) {
  if (!medal) return 0
  const tournamentWeight = config.tournament_weight
  const projectWeight = getProjectWeight(eventCode)
  const medalWeight = getMedalWeight(medal)
  return Math.round(tournamentWeight * projectWeight * medalWeight * 100) / 100
}

/**
 * 计算一位运动员的总积分（V1.0）
 * 仅统计奥运会、世锦赛、世界杯的奖牌成绩。
 */
export function calcAthleteGloryScore(athleteId, events, tournaments) {
  let medalScore = 0
  const medalDetail = { gold: 0, silver: 0, bronze: 0 }
  const tieBreakers = { singles_gold: 0, singles_medal: 0, all_gold: 0, all_medal: 0 }
  const eventContributions = []

  events.forEach(event => {
    const tournament = tournaments.find(t => t.id === event.tournament_id)
    if (!tournament || !isMajorTournament(tournament)) return

    event.results.forEach(result => {
      if (result.athlete_id !== athleteId) return
      if (!result.medal) return

      const score = calcEventScore(event.code, result.medal)
      medalScore += score

      medalDetail[result.medal]++
      tieBreakers.all_medal++
      if (result.medal === 'gold') tieBreakers.all_gold++
      if (SINGLES_CODES.has(event.code)) {
        tieBreakers.singles_medal++
        if (result.medal === 'gold') tieBreakers.singles_gold++
      }

      eventContributions.push({
        tournament_id: event.tournament_id,
        tournament_name: tournament.name,
        tournament_type: tournament.type,
        event_id: event.id,
        event_name: event.name,
        event_code: event.code,
        level: tournament.level,
        year: tournament.year,
        rank: result.rank,
        medal: result.medal,
        medal_score: score,
        ranking_score: 0
      })
    })
  })

  return {
    medal_score: Math.round(medalScore * 100) / 100,
    ranking_score: 0,
    total_score: Math.round(medalScore * 100) / 100,
    medals: medalDetail,
    tie_breakers: tieBreakers,
    event_contributions: eventContributions
  }
}

/**
 * 计算赛事类型（三大赛）贡献
 */
export function calcTournamentTypeContributions(eventContributions) {
  const contributions = {}

  eventContributions.forEach(ec => {
    const type = ec.tournament_type
    if (!contributions[type]) {
      contributions[type] = { score: 0, events: [] }
    }
    contributions[type].score += (ec.medal_score || 0)
    contributions[type].events.push(ec)
  })

  return contributions
}

/**
 * 计算项目贡献
 */
export function calcEventTypeContributions(eventContributions) {
  const contributions = {}

  eventContributions.forEach(ec => {
    const code = ec.event_code
    if (!contributions[code]) {
      contributions[code] = { score: 0, count: 0 }
    }
    contributions[code].score += (ec.medal_score || 0)
    contributions[code].count++
  })

  return contributions
}
