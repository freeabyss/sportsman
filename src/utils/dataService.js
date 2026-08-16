import athletesData from '../data/athletes.json'
import tournamentsData from '../data/tournaments.json'
import eventsData from '../data/events.json'
import matchesData from '../data/matches.json'
import competitionTypesData from '../data/competition-types.json'
import { calcMedalStats, isMajorTournament } from './scoring'

/**
 * 数据服务层 - 加载和处理所有数据
 */
let _athletes = null
let _tournaments = null
let _events = null
let _matches = null
let _competitionTypes = null
let _rankings = null
let _athleteStats = null

/**
 * 获取所有运动员
 */
export function getAthletes() {
  if (!_athletes) _athletes = [...athletesData]
  return _athletes
}

/**
 * 获取单个运动员
 */
export function getAthlete(id) {
  return getAthletes().find(a => a.id === id)
}

/**
 * 获取所有赛事类型（大赛类型参考表）
 */
export function getCompetitionTypes() {
  if (!_competitionTypes) _competitionTypes = [...competitionTypesData]
  return _competitionTypes
}

/**
 * 根据 type 获取单个赛事类型
 */
export function getCompetitionType(type) {
  return getCompetitionTypes().find(c => c.type === type) || null
}

/**
 * 获取所有赛事（附加 competition_type 关联信息）
 */
export function getTournaments() {
  if (!_tournaments) {
    _tournaments = tournamentsData.map(t => ({
      ...t,
      competition_type: getCompetitionType(t.type)
    }))
  }
  return _tournaments
}

/**
 * 获取单个赛事（附加 competition_type 关联信息）
 */
export function getTournament(id) {
  return getTournaments().find(t => t.id === id)
}

/**
 * 获取单个赛事项目（附加 competition_type 关联信息）
 */
export function getEvent(id) {
  const event = getEvents().find(e => e.id === id)
  if (!event) return null
  return { ...event, competition_type: getTournament(event.tournament_id)?.competition_type || null }
}

/**
 * 获取所有赛事项目
 */
export function getEvents() {
  if (!_events) _events = [...eventsData]
  return _events
}

/**
 * 获取赛事的所有项目
 */
export function getTournamentEvents(tournamentId) {
  return getEvents().filter(e => e.tournament_id === tournamentId)
}

/**
 * 获取所有比赛
 */
export function getMatches() {
  if (!_matches) _matches = [...matchesData]
  return _matches
}

/**
 * 获取项目的比赛
 */
export function getEventMatches(eventId) {
  return getMatches().filter(m => m.event_id === eventId)
}

/**
 * 获取运动员参与的比赛
 */
export function getAthleteMatches(athleteId) {
  return getMatches().filter(m => 
    m.player_a.athlete_id === athleteId || m.player_b.athlete_id === athleteId
  )
}

/**
 * 获取所有运动员的统计信息
 */
export function getAllAthleteStats() {
  if (_athleteStats) return _athleteStats

  const athletes = getAthletes()
  const events = getEvents()
  const tournaments = getTournaments()

  _athleteStats = athletes.map(athlete => {
    const medalStats = calcMedalStats(athlete.id, events, tournaments)

    return {
      athlete,
      medals: medalStats.medals,
      categories: medalStats.categories,
      achievements: medalStats.achievements
    }
  })

  return _athleteStats
}

/**
 * 获取排名列表
 */
export function getRankings(filter = 'all', gender = 'all') {
  const allStats = getAllAthleteStats()

  let filtered = allStats
  if (filter === 'active') {
    filtered = allStats.filter(s => s.athlete.career_status === 'active')
  }
  if (gender !== 'all') {
    filtered = filtered.filter(s => s.athlete.gender === gender)
  }

  // 排名规则：单打 > 双打 > 团体；同类别内 金 > 银 > 铜
  const MEDAL_ORDER = ['gold', 'silver', 'bronze']
  const CATEGORY_ORDER = ['singles', 'doubles', 'team']
  filtered = [...filtered].sort((a, b) => {
    for (const cat of CATEGORY_ORDER) {
      for (const m of MEDAL_ORDER) {
        const diff = b.categories[cat][m] - a.categories[cat][m]
        if (diff !== 0) return diff
      }
    }
    return 0
  })

  return filtered.map((item, index) => ({
    ...item,
    rank: index + 1
  }))
}

/**
 * 获取运动员统计
 */
export function getAthleteStats(athleteId) {
  const allStats = getAllAthleteStats()
  return allStats.find(s => s.athlete.id === athleteId)
}

/**
 * 获取运动员的奖牌成绩列表（用于成绩记录表）
 */
export function getAthleteAchievements(athleteId) {
  const allStats = getAllAthleteStats()
  const stats = allStats.find(s => s.athlete.id === athleteId)
  return stats?.achievements || []
}

/**
 * 获取运动员的奖牌矩阵
 */
export function getAthleteMedalMatrix(athleteId) {
  const events = getEvents()
  const tournaments = getTournaments()
  
  const matrix = {}

  events.forEach(event => {
    event.results.forEach(result => {
      if (result.athlete_id !== athleteId || !result.medal) return

      const tournament = tournaments.find(t => t.id === event.tournament_id)
      if (!tournament || !isMajorTournament(tournament)) return

      const key = tournament.type
      if (!matrix[key]) {
        matrix[key] = {
          MEN_SINGLES: [],
          WOMEN_SINGLES: [],
          MEN_DOUBLES: [],
          WOMEN_DOUBLES: [],
          MIXED_DOUBLES: [],
          MEN_TEAM: [],
          WOMEN_TEAM: [],
          MIXED_TEAM: []
        }
      }

      if (matrix[key][event.code]) {
        matrix[key][event.code].push({
          tournament_name: tournament.name,
          event_name: event.name,
          year: tournament.year,
          medal: result.medal,
          tournament_id: tournament.id,
          event_id: event.id
        })
      }
    })
  })

  return matrix
}

/**
 * 获取赛事类型的标签
 */
export function getLevelLabel(level) {
  const labels = {
    'S': 'S级',
    'A+': 'A+级',
    'A': 'A级',
    'B': 'B级',
    'C': 'C级'
  }
  return labels[level] || level
}

/**
 * 获取项目名称
 */
export function getEventLabel(code) {
  const labels = {
    'MEN_SINGLES': '男单',
    'WOMEN_SINGLES': '女单',
    'MEN_DOUBLES': '男双',
    'WOMEN_DOUBLES': '女双',
    'MIXED_DOUBLES': '混双',
    'MEN_TEAM': '男团',
    'WOMEN_TEAM': '女团',
    'MIXED_TEAM': '混团'
  }
  return labels[code] || code
}

/**
 * 获取赛事类型简称（奥运会 / 世锦赛 / 世界杯 ...）
 */
export function getCompetitionTypeLabel(type) {
  return getCompetitionType(type)?.short_name || type
}

/**
 * 获取状态标签和图标
 */
export function getStatusInfo(status) {
  const map = {
    'active': { label: '现役', color: '#52c41a', bg: '#f6ffed' },
    'retired': { label: '退役', color: '#999', bg: '#f5f5f5' },
    'inactive': { label: '暂停参赛', color: '#faad14', bg: '#fffbe6' }
  }
  return map[status] || { label: status, color: '#999', bg: '#f5f5f5' }
}

/**
 * 获取轮次标签
 */
export function getRoundLabel(round) {
  const labels = {
    'R128': '128强', 'R64': '64强', 'R32': '32强', 'R16': '16强',
    'QF': '1/4决赛', 'SF': '半决赛', 'FINAL': '决赛'
  }
  return labels[round] || round
}
