import config from '../data/config.json'

/**
 * 获取赛事等级分数
 */
export function getTournamentScore(level) {
  return config.tournament_levels[level]?.score || 0
}

/**
 * 获取奖牌权重
 */
export function getMedalWeight(medal) {
  return config.medal_weights[medal] || 0
}

/**
 * 获取项目权重
 */
export function getEventWeight(code) {
  return config.event_weights[code] || 1.0
}

/**
 * 获取排名系数
 */
export function getRankingCoefficient(rank) {
  if (rank === 1) return config.ranking_coefficients['1']
  if (rank === 2) return config.ranking_coefficients['2']
  if (rank === 3) return config.ranking_coefficients['3']
  if (rank >= 4 && rank <= 8) return config.ranking_coefficients['4-8']
  if (rank >= 9 && rank <= 16) return config.ranking_coefficients['9-16']
  if (rank >= 17 && rank <= 32) return config.ranking_coefficients['17-32']
  return 0
}

/**
 * 计算单个Event的奖牌积分
 * 荣耀积分 = 赛事等级 × 奖牌权重 × 项目权重
 */
export function calcMedalScore(tournamentLevel, medal, eventCode) {
  const levelScore = getTournamentScore(tournamentLevel)
  const medalWeight = getMedalWeight(medal)
  const eventWeight = getEventWeight(eventCode)
  return Math.round(levelScore * medalWeight * eventWeight * 100) / 100
}

/**
 * 计算名次积分（非奖牌）
 * 成绩积分 = 赛事等级 × 项目权重 × 排名系数
 */
export function calcRankingScore(tournamentLevel, rank, eventCode) {
  const levelScore = getTournamentScore(tournamentLevel)
  const eventWeight = getEventWeight(eventCode)
  const rankingCoeff = getRankingCoefficient(rank)
  return Math.round(levelScore * eventWeight * rankingCoeff * 100) / 100
}

/**
 * 计算一位运动员的总荣耀积分
 * athletes, tournaments, events 为完整数据
 */
export function calcAthleteGloryScore(athleteId, events, tournaments) {
  let medalScore = 0
  let rankingScore = 0
  const medalDetail = { gold: 0, silver: 0, bronze: 0 }
  const eventContributions = []

  events.forEach(event => {
    const tournament = tournaments.find(t => t.id === event.tournament_id)
    if (!tournament) return

    event.results.forEach(result => {
      if (result.athlete_id !== athleteId) return

      const contribution = {
        tournament_id: event.tournament_id,
        tournament_name: tournament.name,
        event_id: event.id,
        event_name: event.name,
        event_code: event.code,
        level: tournament.level,
        year: tournament.year,
        rank: result.rank,
        medal: result.medal
      }

      if (result.medal) {
        const ms = calcMedalScore(tournament.level, result.medal, event.code)
        contribution.medal_score = ms
        medalScore += ms
        medalDetail[result.medal]++
      }

      if (result.rank) {
        const rs = calcRankingScore(tournament.level, result.rank, event.code)
        contribution.ranking_score = rs
        rankingScore += rs
      }

      eventContributions.push(contribution)
    })
  })

  return {
    medal_score: Math.round(medalScore * 100) / 100,
    ranking_score: Math.round(rankingScore * 100) / 100,
    total_score: Math.round((medalScore + rankingScore) * 100) / 100,
    medals: medalDetail,
    event_contributions: eventContributions
  }
}

/**
 * 计算赛事类型贡献
 */
export function calcTournamentTypeContributions(eventContributions) {
  const contributions = {}

  eventContributions.forEach(ec => {
    const type = ec.level
    if (!contributions[type]) {
      contributions[type] = { score: 0, events: [] }
    }
    contributions[type].score += (ec.medal_score || 0) + (ec.ranking_score || 0)
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
    contributions[code].score += (ec.medal_score || 0) + (ec.ranking_score || 0)
    contributions[code].count++
  })

  return contributions
}
