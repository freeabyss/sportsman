import config from '../data/config.json'

/**
 * 计算运动员的胜率统计
 */
export function calcWinRates(athleteId, matches, tournaments) {
  let totalWins = 0
  let totalMatches = 0
  let chinaInternalWins = 0
  let chinaInternalMatches = 0
  let eliteWins = 0
  let eliteMatches = 0
  const rivals = {}

  matches.forEach(match => {
    const isPlayerA = match.player_a.athlete_id === athleteId
    const isPlayerB = match.player_b.athlete_id === athleteId
    if (!isPlayerA && !isPlayerB) return

    const opponentId = isPlayerA ? match.player_b.athlete_id : match.player_a.athlete_id
    const opponentCountry = isPlayerA ? match.player_b.country : match.player_a.country
    const isWinner = match.winner_id === athleteId

    // 统计胜负
    totalMatches++
    if (isWinner) totalWins++

    // 对手统计
    if (!rivals[opponentId]) {
      rivals[opponentId] = { wins: 0, losses: 0, total: 0 }
    }
    rivals[opponentId].total++
    if (isWinner) {
      rivals[opponentId].wins++
    } else {
      rivals[opponentId].losses++
    }

    // 中国队内部统计
    if (opponentCountry === 'CHN') {
      chinaInternalMatches++
      if (isWinner) chinaInternalWins++
    }

    // 顶级赛事统计 (S级和A+级)
    const eventTournament = findTournamentByEvent(match.event_id, tournaments)
    // 简化：通过event_id查找赛事
    if (match.event_id.includes('olympics') || 
        match.event_id.includes('world-championships') ||
        match.event_id.includes('world-cup') ||
        match.event_id.includes('wtt-grand-smash') ||
        match.event_id.includes('wtt-finals') ||
        match.event_id.includes('national-games')) {
      eliteMatches++
      if (isWinner) eliteWins++
    }
  })

  const careerWinRate = totalMatches > 0 ? totalWins / totalMatches : 0
  const chinaWinRate = chinaInternalMatches > 0 ? chinaInternalWins / chinaInternalMatches : 0
  const eliteWinRate = eliteMatches > 0 ? eliteWins / eliteMatches : 0

  return {
    total_wins: totalWins,
    total_matches: totalMatches,
    career_win_rate: Math.round(careerWinRate * 10000) / 100,
    china_internal_wins: chinaInternalWins,
    china_internal_matches: chinaInternalMatches,
    china_internal_win_rate: Math.round(chinaWinRate * 10000) / 100,
    elite_wins: eliteWins,
    elite_matches: eliteMatches,
    elite_win_rate: Math.round(eliteWinRate * 10000) / 100,
    rivals
  }
}

/**
 * 计算统治力指数
 * 统治力 = 生涯胜率×40 + 中国内部胜率×40 + 顶级赛事胜率×20
 */
export function calcDominanceIndex(winRates) {
  const { dominance_weights } = config
  const score = 
    winRates.career_win_rate * dominance_weights.career_win_rate +
    winRates.china_internal_win_rate * dominance_weights.china_internal_win_rate +
    winRates.elite_win_rate * dominance_weights.elite_win_rate
  return Math.round(score * 100) / 100
}

/**
 * 辅助：通过event_id查找赛事
 */
function findTournamentByEvent(eventId, tournaments) {
  // 简化逻辑：event_id格式是 {tournament_id}-{suffix}
  const parts = eventId.split('-')
  // 尝试匹配tournament_id
  for (const t of tournaments) {
    if (eventId.startsWith(t.id)) return t
  }
  return null
}

/**
 * 整理对手关系（TOP10 by 交手次数）
 */
export function getTopRivals(rivals, limit = 10) {
  return Object.entries(rivals)
    .map(([id, stats]) => ({
      athlete_id: id,
      ...stats,
      win_rate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 10000) / 100 : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

/**
 * 计算排名（按荣耀积分排序）
 */
export function rankAthletes(athleteStats) {
  return [...athleteStats]
    .sort((a, b) => {
      if (b.glory_score !== a.glory_score) return b.glory_score - a.glory_score
      if (b.medals.gold !== a.medals.gold) return b.medals.gold - a.medals.gold
      if (b.medals.silver !== a.medals.silver) return b.medals.silver - a.medals.silver
      if (b.medals.bronze !== a.medals.bronze) return b.medals.bronze - a.medals.bronze
      return 0
    })
    .map((item, index) => ({ ...item, rank: index + 1 }))
}
