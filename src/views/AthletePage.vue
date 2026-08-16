<template>
  <div class="athlete-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 空状态 -->
    <div v-else-if="!athlete" class="empty">
      <p style="margin-bottom: 16px;">运动员不存在</p>
      <router-link to="/" class="btn btn-outline">返回首页</router-link>
    </div>

    <!-- 主体内容 -->
    <template v-else>
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <router-link to="/">排行榜</router-link>
        <span class="separator">/</span>
        <span>{{ athlete.name }}</span>
      </div>

      <!-- 1. 头部信息 -->
      <div class="card athlete-header-card" style="margin-bottom: 20px;">
        <div class="card-body athlete-header-body">
          <div class="athlete-avatar">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="40" fill="#f0f0f0" />
              <text x="40" y="40" text-anchor="middle" dominant-baseline="central"
                    font-size="32" fill="#999" font-weight="700">{{ athlete.name[0] }}</text>
            </svg>
          </div>
          <div class="athlete-header-info">
            <div class="athlete-name-row">
              <h1 class="athlete-name">{{ athlete.name }}</h1>
              <span
                class="status-tag"
                :class="`status-${athlete.career_status}`"
              >{{ statusInfo.label }}</span>
            </div>
            <div class="athlete-english">{{ athlete.english_name }}</div>
            <div class="athlete-meta">
              <span class="athlete-gender">{{ athlete.gender === 'male' ? '男' : '女' }}</span>
              <span class="meta-separator">|</span>
              <span class="athlete-period">{{ athlete.career_start }} – {{ athlete.career_end || '至今' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 基本信息 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header"><span>基本信息</span></div>
        <div class="card-body">
          <div class="grid-2 info-grid">
            <div class="info-item">
              <span class="info-label">所属队伍</span>
              <span class="info-value">{{ athlete.team }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">打法风格</span>
              <span class="info-value">{{ athlete.play_style }}</span>
            </div>
          </div>
          <div v-if="athlete.tags && athlete.tags.length" class="info-tags">
            <span
              v-for="tag in athlete.tags"
              :key="tag"
              class="tag tag-red"
            >{{ tag }}</span>
          </div>
          <div v-if="athlete.bio_highlights && athlete.bio_highlights.length" class="info-highlights">
            <span class="info-label">生涯亮点</span>
            <ul class="highlights-list">
              <li v-for="(h, i) in athlete.bio_highlights" :key="i">{{ h }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 3. 荣誉概览 -->
      <div class="grid-4" style="margin-bottom: 20px;">
        <div class="stat-card">
          <div class="stat-value medal-gold-text">{{ stats.categories.singles.gold }}</div>
          <div class="stat-label">单打金牌</div>
        </div>
        <div class="stat-card">
          <div class="stat-value medal-gold-text">{{ stats.categories.doubles.gold }}</div>
          <div class="stat-label">双打金牌</div>
        </div>
        <div class="stat-card">
          <div class="stat-value medal-gold-text">{{ stats.categories.team.gold }}</div>
          <div class="stat-label">团体金牌</div>
        </div>
        <div class="stat-card">
          <div class="stat-value medal-stats">
            <span class="medal-icon medal-gold">🥇</span>{{ allMedals.gold }}
            <span class="medal-icon medal-silver" style="margin-left: 8px;">🥈</span>{{ allMedals.silver }}
            <span class="medal-icon medal-bronze" style="margin-left: 8px;">🥉</span>{{ allMedals.bronze }}
          </div>
          <div class="stat-label">所有奖牌</div>
        </div>
      </div>

      <!-- 4. 奖牌矩阵 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header"><span>奖牌矩阵</span></div>
        <div style="overflow-x: auto;">
          <table class="data-table medal-matrix-table">
            <thead>
              <tr>
                <th style="width: 80px;">赛事</th>
                <th v-for="code in eventColumns" :key="code" style="text-align: center;">
                  {{ getEventLabel(code) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="level in matrixLevels" :key="level">
                <td>
                  <span class="level-badge type-badge">
                    {{ getCompetitionTypeLabel(level) }}
                  </span>
                </td>
                <td
                  v-for="code in eventColumns"
                  :key="code"
                  class="matrix-cell"
                  :class="{ clickable: getCellMedalCount(level, code) > 0 }"
                  @click="toggleCell(level, code)"
                >
                  <template v-if="getCellMedalCount(level, code) > 0">
                    <div class="cell-medals">
                      <span v-if="getCellMedals(level, code).gold > 0" class="cell-medal">
                        🥇{{ getCellMedals(level, code).gold }}
                      </span>
                      <span v-if="getCellMedals(level, code).silver > 0" class="cell-medal">
                        🥈{{ getCellMedals(level, code).silver }}
                      </span>
                      <span v-if="getCellMedals(level, code).bronze > 0" class="cell-medal">
                        🥉{{ getCellMedals(level, code).bronze }}
                      </span>
                    </div>
                  </template>
                  <span v-else class="cell-empty">-</span>
                </td>
              </tr>
              <!-- 展开的奖牌详情 -->
              <tr v-if="expandedCell" class="matrix-detail-row">
                <td :colspan="eventColumns.length + 1">
                  <div class="matrix-detail">
                    <div class="matrix-detail-header">
                      <span>{{ getCompetitionTypeLabel(expandedCell.level) }} · {{ getEventLabel(expandedCell.code) }}</span>
                      <button class="btn btn-sm btn-outline" @click="expandedCell = null">关闭</button>
                    </div>
                    <table class="data-table detail-table">
                      <thead>
                        <tr>
                          <th>年份</th>
                          <th>赛事</th>
                          <th>项目</th>
                          <th>奖牌</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(entry, idx) in getCellMedalDetails(expandedCell.level, expandedCell.code)"
                          :key="idx"
                        >
                          <td>{{ entry.year }}</td>
                          <td>{{ entry.tournament_name }}</td>
                          <td>{{ entry.event_name }}</td>
                          <td>
                            <span class="medal-badge-cell" :class="`medal-badge-${entry.medal}`">
                              {{ medalEmoji[entry.medal] }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. 职业赛事记录 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header"><span>比赛记录</span></div>
        <div class="card-body">
          <!-- 事件类型筛选 -->
          <div class="filter-bar">
            <span class="filter-label">项目：</span>
            <button
              class="filter-chip"
              :class="{ active: eventTypeFilter === 'all' }"
              @click="eventTypeFilter = 'all'"
            >全部</button>
            <button
              v-for="code in eventColumns"
              :key="code"
              class="filter-chip"
              :class="{ active: eventTypeFilter === code }"
              @click="eventTypeFilter = code"
            >{{ getEventLabel(code) }}</button>
          </div>
          <!-- 年份范围筛选 -->
          <div class="filter-bar">
            <span class="filter-label">年份：</span>
            <button
              class="filter-chip"
              :class="{ active: yearFilter === 'all' }"
              @click="yearFilter = 'all'"
            >全部</button>
            <button
              v-for="y in availableYears"
              :key="y"
              class="filter-chip"
              :class="{ active: yearFilter === y }"
              @click="yearFilter = y"
            >{{ y }}</button>
          </div>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>年份</th>
                  <th>赛事</th>
                  <th>项目</th>
                  <th>成绩</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredContributions.length === 0">
                  <td colspan="4" style="text-align: center; color: #999; padding: 40px;">暂无记录</td>
                </tr>
                <tr v-for="(c, idx) in filteredContributions" :key="idx">
                  <td>{{ c.year }}</td>
                  <td>{{ c.tournament_name }}</td>
                  <td>{{ c.event_name }}</td>
                  <td>
                    <span class="medal-badge-cell" :class="`medal-badge-${c.medal}`">
                      {{ medalEmoji[c.medal] }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 6. 职业生涯时间线 -->
      <div class="card" style="margin-bottom: 20px;" v-if="athlete.career_milestones && athlete.career_milestones.length">
        <div class="card-header"><span>职业生涯里程碑</span></div>
        <div class="card-body">
          <div class="timeline">
            <div
              v-for="(m, idx) in athlete.career_milestones"
              :key="idx"
              class="timeline-item"
            >
              <div class="timeline-year">{{ m.year }}</div>
              <div class="timeline-event">{{ m.event }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. 比赛历史 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <span>比赛历史</span>
          <span class="table-count">共 {{ matches.length }} 场</span>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>赛事 · 项目</th>
                <th>轮次</th>
                <th>对手</th>
                <th>比分</th>
                <th>结果</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="matches.length === 0">
                <td colspan="6" style="text-align: center; color: #999; padding: 40px;">暂无比赛记录</td>
              </tr>
              <tr v-for="match in sortedMatches" :key="match.id">
                <td>{{ formatDate(match.date) }}</td>
                <td>
                  <router-link
                    v-if="match._event"
                    :to="`/event/${match._event.id}`"
                    class="match-event-link"
                  >
                    {{ match._tournament?.name }} · {{ match._event?.name }}
                  </router-link>
                  <span v-else>{{ match.event_id }}</span>
                </td>
                <td>{{ getRoundLabel(match.round) }}</td>
                <td>{{ getOpponentName(match) }}</td>
                <td>
                  <span :class="{ 'score-bold': match.winner_id === athlete.id }">
                    {{ getMatchScore(match) }}
                  </span>
                </td>
                <td>
                  <span class="result-badge" :class="match.winner_id === athlete.id ? 'result-win' : 'result-lose'">
                    {{ match.winner_id === athlete.id ? '胜' : '负' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8. 主要对手 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <span>主要对手</span>
          <span class="table-count">TOP {{ rivals.length }}</span>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>对手</th>
                <th style="text-align: center;">交手次数</th>
                <th style="text-align: center;">胜</th>
                <th style="text-align: center;">负</th>
                <th style="text-align: right;">胜率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="rivals.length === 0">
                <td colspan="5" style="text-align: center; color: #999; padding: 40px;">暂无交手记录</td>
              </tr>
              <tr v-for="r in rivals" :key="r.athlete_id">
                <td>
                  <router-link :to="`/athlete/${r.athlete_id}`" class="rival-link">
                    {{ getAthleteName(r.athlete_id) }}
                  </router-link>
                </td>
                <td style="text-align: center;">{{ r.total }}</td>
                <td style="text-align: center; color: #52c41a; font-weight: 600;">{{ r.wins }}</td>
                <td style="text-align: center; color: #ff4d4f; font-weight: 600;">{{ r.losses }}</td>
                <td style="text-align: right;">
                  <div class="winrate-container">
                    <div class="winrate-bar">
                      <div
                        class="winrate-fill"
                        :style="{ width: r.win_rate + '%' }"
                      ></div>
                    </div>
                    <span class="winrate-value">{{ r.win_rate }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getAthlete, getAthleteStats, getAthleteMedalMatrix,
  getAthleteAllAchievements, getAthleteMatches, getStatusInfo,
  getEventLabel, getCompetitionTypeLabel, getRoundLabel, getAthletes, getTournaments, getEvents,
  getCompetitionTypes
} from '../utils/dataService.js'
import { calcWinRates, getTopRivals } from '../utils/stats.js'

const route = useRoute()
const loading = ref(true)

const athlete = ref(null)
const stats = ref(null)
const medalMatrix = ref({})
const contributions = ref([])
const allMatches = ref([])
const rivals = ref([])
const expandedCell = ref(null)
const eventTypeFilter = ref('all')
const yearFilter = ref('all')

const medalEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉' }
const medalLabel = { gold: '金牌', silver: '银牌', bronze: '铜牌' }
const matrixLevels = computed(() =>
  getCompetitionTypes().slice().sort((a, b) => a.rank - b.rank).map(t => t.type)
)

// 所有赛事的奖牌汇总（金/银/铜，覆盖全部比赛类型）
const allMedals = computed(() => {
  const m = { gold: 0, silver: 0, bronze: 0 }
  contributions.value.forEach(c => {
    if (m[c.medal] !== undefined) m[c.medal]++
  })
  return m
})

const athleteId = computed(() => route.params.id)
const statusInfo = computed(() => {
  if (!athlete.value) return { label: '', color: '#999', bg: '#f5f5f5' }
  return getStatusInfo(athlete.value.career_status)
})

const athleteMap = computed(() => {
  const map = {}
  getAthletes().forEach(a => { map[a.id] = a.name })
  return map
})

const eventColumns = computed(() => {
  if (!athlete.value) return []
  return athlete.value.gender === 'male'
    ? ['MEN_SINGLES', 'MEN_DOUBLES', 'MIXED_DOUBLES', 'MEN_TEAM']
    : ['WOMEN_SINGLES', 'WOMEN_DOUBLES', 'MIXED_DOUBLES', 'WOMEN_TEAM']
})

const matches = computed(() => {
  return allMatches.value.map(match => {
    const event = getEvents().find(e => e.id === match.event_id)
    const tournament = event
      ? getTournaments().find(t => t.id === event.tournament_id)
      : null
    return { ...match, _event: event, _tournament: tournament }
  })
})

const sortedMatches = computed(() => {
  return [...matches.value].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return 0
  })
})

const availableYears = computed(() => {
  if (!contributions.value.length) return []
  const years = [...new Set(contributions.value.map(c => c.year))]
  return years.sort((a, b) => b - a)
})

const filteredContributions = computed(() => {
  let result = contributions.value
  if (eventTypeFilter.value !== 'all') {
    result = result.filter(c => c.event_code === eventTypeFilter.value)
  }
  if (yearFilter.value !== 'all') {
    result = result.filter(c => c.year === yearFilter.value)
  }
  return result.sort((a, b) => b.year - a.year)
})

const allEvents = computed(() => getEvents())

function getCellMedalCount(level, code) {
  const entries = medalMatrix.value[level]?.[code] || []
  return entries.length
}

function getCellMedals(level, code) {
  const entries = medalMatrix.value[level]?.[code] || []
  const counts = { gold: 0, silver: 0, bronze: 0 }
  entries.forEach(e => {
    if (e.medal) counts[e.medal]++
  })
  return counts
}

function getCellMedalDetails(level, code) {
  return (medalMatrix.value[level]?.[code] || []).sort((a, b) => b.year - a.year)
}

function toggleCell(level, code) {
  if (getCellMedalCount(level, code) === 0) return
  if (expandedCell.value?.level === level && expandedCell.value?.code === code) {
    expandedCell.value = null
  } else {
    expandedCell.value = { level, code }
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`
}

function getOpponentName(match) {
  const oppId = match.player_a.athlete_id === athleteId.value
    ? match.player_b.athlete_id
    : match.player_a.athlete_id
  return athleteMap.value[oppId] || oppId
}

function getMatchScore(match) {
  const isPlayerA = match.player_a.athlete_id === athleteId.value
  const scoreA = match.score_a
  const scoreB = match.score_b
  return isPlayerA ? `${scoreA}-${scoreB}` : `${scoreB}-${scoreA}`
}

function getAthleteName(id) {
  return athleteMap.value[id] || id
}

onMounted(() => {
  const id = athleteId.value
  if (!id) {
    loading.value = false
    return
  }

  athlete.value = getAthlete(id)
  if (!athlete.value) {
    loading.value = false
    return
  }

  stats.value = getAthleteStats(id)
  medalMatrix.value = getAthleteMedalMatrix(id)
  contributions.value = getAthleteAllAchievements(id)
  allMatches.value = getAthleteMatches(id)

  // 计算对手数据
  const tournaments = getTournaments()
  const winRates = calcWinRates(id, allMatches.value, tournaments)
  rivals.value = getTopRivals(winRates.rivals, 20)

  loading.value = false
})
</script>

<style scoped>
.athlete-page {
  max-width: 100%;
}

/* ======== 头部 ======== */
.athlete-header-card .card-body {
  padding: 28px 24px;
}

.athlete-header-body {
  display: flex;
  align-items: center;
  gap: 24px;
}

.athlete-avatar {
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.athlete-header-info {
  flex: 1;
  min-width: 0;
}

.athlete-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.athlete-name {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.athlete-english {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.athlete-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.athlete-gender {
  font-weight: 500;
}

.meta-separator {
  color: #ddd;
}

.athlete-period {
  color: #999;
}

/* ======== 基本信息 ======== */
.info-grid {
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #999;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.info-highlights {
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.highlights-list {
  margin: 8px 0 0 16px;
  padding: 0;
}

.highlights-list li {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

/* ======== 荣誉概览 ======== */
.medal-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 18px;
}

.medal-stats .medal-icon {
  font-size: 18px;
  width: 22px;
  height: 22px;
  line-height: 22px;
}

/* ======== 奖牌矩阵 ======== */
.medal-matrix-table th,
.medal-matrix-table td {
  min-width: 90px;
}

.medal-matrix-table tbody td:first-child {
  min-width: auto;
}

.level-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.level-S { background: #fffbe6; color: #b8860b; border: 1px solid #ffd700; }
.level-Aplus { background: #f9f0ff; color: #722ed1; border: 1px solid #d3adf7; }
.level-A { background: #e6f4ff; color: #0958d9; border: 1px solid #91caff; }
.type-badge { background: #fffbe6; color: #b8860b; border: 1px solid #ffd700; }

.matrix-cell {
  text-align: center;
  vertical-align: middle;
  transition: background 0.15s;
}

.matrix-cell.clickable {
  cursor: pointer;
}

.matrix-cell.clickable:hover {
  background: #fff7f7;
}

.cell-medals {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}

.cell-medal {
  white-space: nowrap;
}

.cell-empty {
  color: #ccc;
  font-size: 13px;
}

/* 展开的详情行 */
.matrix-detail-row td {
  padding: 0 16px 16px;
  background: #fafafa;
  border-bottom: 2px solid #f0f0f0;
}

.matrix-detail {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.matrix-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
}

.detail-table th {
  font-size: 12px;
  padding: 8px 12px;
}

.detail-table td {
  font-size: 13px;
  padding: 8px 12px;
}

.medal-badge-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
}

.medal-badge-gold { background: linear-gradient(135deg, #fffbe6, #fff7d6); border: 1px solid #ffd700; }
.medal-badge-silver { background: linear-gradient(135deg, #fafafa, #f0f0f0); border: 1px solid #c0c0c0; }
.medal-badge-bronze { background: linear-gradient(135deg, #fdf2ec, #f5e0d5); border: 1px solid #cd7f32; }

/* ======== 比赛历史 ======== */
.match-event-link {
  color: #333;
  font-weight: 500;
}

.match-event-link:hover {
  color: #d4142a;
}

.score-bold {
  font-weight: 700;
  color: #333;
}

/* ======== 对手 ======== */
.rival-link {
  color: #333;
  font-weight: 500;
}

.rival-link:hover {
  color: #d4142a;
}

.winrate-container {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.winrate-bar {
  width: 60px;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.winrate-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  border-radius: 3px;
}

.winrate-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  min-width: 42px;
  text-align: right;
}

/* ======== 响应式 ======== */
@media (max-width: 768px) {
  .athlete-header-body {
    flex-direction: column;
    text-align: center;
  }

  .athlete-name-row {
    justify-content: center;
    flex-wrap: wrap;
  }

  .athlete-meta {
    justify-content: center;
  }

  .medal-stats {
    font-size: 15px;
  }

  .winrate-container {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
