<template>
  <div class="score-page">
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
        <router-link :to="`/athlete/${athlete.id}`">{{ athlete.name }}</router-link>
        <span class="separator">/</span>
        <span>积分分析</span>
      </div>

      <!-- 总积分展示 -->
      <div class="card score-hero-card" style="margin-bottom: 20px;">
        <div class="card-body score-hero-body">
          <div class="score-hero-left">
            <div class="score-hero-label">总积分</div>
            <div class="score-hero-value">{{ totalScore }}</div>
            <div class="score-hero-sub">{{ athlete.name }}</div>
          </div>
          <div class="score-hero-right">
            <div class="breakdown-equation">
              <div class="breakdown-term breakdown-term-total">
                <div class="term-label">总积分（奖牌）</div>
                <div class="term-value">{{ totalScore }}</div>
              </div>
            </div>
            <p class="breakdown-note">V1.0：仅统计奥运会 / 世锦赛 / 世界杯的奖牌成绩，金、银、铜均计分，同届不同项目可累加。</p>
          </div>
        </div>
      </div>

      <!-- 三大赛贡献 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <span>三大赛贡献</span>
          <span class="table-count">按赛事分组</span>
        </div>
        <div class="card-body">
          <div v-if="tournamentLevels.length === 0" class="empty-inline">
            暂无赛事贡献数据
          </div>
          <div
            v-for="type in tournamentLevels"
            :key="type"
            class="contribution-group"
          >
            <div class="contribution-summary">
              <span class="level-badge type-badge">
                {{ getCompetitionTypeLabel(type) }}
              </span>
              <div class="contribution-bar-wrap">
                <div class="contribution-bar">
                  <div
                    class="contribution-fill fill-major"
                    :style="{ width: getTournamentPct(type) + '%' }"
                  ></div>
                </div>
              </div>
              <span class="contribution-score">{{ getTournamentScore(type).toFixed(2) }}</span>
              <span class="contribution-pct">{{ getTournamentPct(type) }}%</span>
            </div>
            <div style="overflow-x: auto;">
              <table class="data-table contribution-table">
                <thead>
                  <tr>
                    <th>年份</th>
                    <th>赛事</th>
                    <th>项目</th>
                    <th>成绩</th>
                    <th style="text-align: right;">得分</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(evt, idx) in getTournamentEvents(type)" :key="idx">
                    <td>{{ evt.year }}</td>
                    <td>{{ evt.tournament_name }}</td>
                    <td>{{ evt.event_name }}</td>
                    <td>
                      <span v-if="evt.medal" class="medal-badge-cell" :class="`medal-badge-${evt.medal}`">
                        {{ medalEmoji[evt.medal] }}
                      </span>
                      <span v-else>第{{ evt.rank }}名</span>
                    </td>
                    <td style="text-align: right; font-weight: 600;">
                      {{ (evt.medal_score || 0).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目类型贡献 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <span>项目类型贡献</span>
          <span class="table-count">按项目分组</span>
        </div>
        <div class="card-body">
          <div v-if="eventCodes.length === 0" class="empty-inline">
            暂无项目贡献数据
          </div>
          <div class="event-contributions">
            <div
              v-for="code in eventCodes"
              :key="code"
              class="event-contribution"
            >
              <div class="event-contribution-header">
                <span class="event-label">{{ getEventLabel(code) }}</span>
                <span class="event-count">{{ getEventData(code).count }} 次</span>
              </div>
              <div class="event-bar">
                <div class="event-fill" :style="{ width: getEventPct(code) + '%' }"></div>
              </div>
              <div class="event-contribution-footer">
                <span class="event-score">{{ getEventData(code).score.toFixed(2) }}</span>
                <span class="event-pct">{{ getEventPct(code) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 返回链接 -->
      <div style="text-align: center;">
        <router-link :to="`/athlete/${athlete.id}`" class="btn btn-outline">
          返回运动员详情
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getAthlete, getAthleteStats, getAthleteContributions,
  getCompetitionTypeLabel, getEventLabel
} from '../utils/dataService.js'

const route = useRoute()
const loading = ref(true)

const athlete = ref(null)
const stats = ref(null)
const contributionsData = ref(null)

const medalEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉' }
const typeOrder = ['olympics', 'world_championships', 'world_cup']

const athleteId = computed(() => route.params.id)
const totalScore = computed(() => stats.value?.glory_score || 0)

const tournamentLevels = computed(() => {
  if (!contributionsData.value?.by_tournament) return []
  return typeOrder.filter(type =>
    contributionsData.value.by_tournament[type] &&
    contributionsData.value.by_tournament[type].score > 0
  )
})

const eventCodes = computed(() => {
  if (!contributionsData.value?.by_event) return []
  const byEvent = contributionsData.value.by_event
  return Object.keys(byEvent)
    .filter(code => byEvent[code].score > 0)
    .sort((a, b) => byEvent[b].score - byEvent[a].score)
})

function getTournamentScore(type) {
  return contributionsData.value?.by_tournament?.[type]?.score || 0
}

function getTournamentPct(type) {
  if (!totalScore.value) return 0
  return Math.round((getTournamentScore(type) / totalScore.value) * 100)
}

function getTournamentEvents(type) {
  const events = contributionsData.value?.by_tournament?.[type]?.events || []
  return [...events].sort((a, b) => b.year - a.year)
}

function getEventData(code) {
  return contributionsData.value?.by_event?.[code] || { score: 0, count: 0 }
}

function getEventPct(code) {
  if (!totalScore.value) return 0
  return Math.round((getEventData(code).score / totalScore.value) * 100)
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
  contributionsData.value = getAthleteContributions(id)
  loading.value = false
})
</script>

<style scoped>
.score-page {
  max-width: 100%;
}

/* ======== 总积分展示 ======== */
.score-hero-card .card-body {
  padding: 32px 24px;
}

.score-hero-body {
  display: flex;
  align-items: center;
  gap: 40px;
}

.score-hero-left {
  flex-shrink: 0;
  text-align: center;
  min-width: 180px;
}

.score-hero-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.score-hero-value {
  font-size: 56px;
  font-weight: 800;
  color: #d4142a;
  line-height: 1;
}

.score-hero-sub {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

.score-hero-right {
  flex: 1;
  min-width: 0;
}

/* ======== 积分公式 ======== */
.breakdown-equation {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.breakdown-term {
  text-align: center;
}

.term-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.term-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.breakdown-term-total .term-value {
  color: #d4142a;
}

.breakdown-op {
  font-size: 20px;
  color: #ccc;
  font-weight: 300;
}

/* ======== 堆叠条形图 ======== */
.breakdown-bar {
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  margin-bottom: 12px;
  background: #f0f0f0;
}

.breakdown-segment {
  height: 100%;
  transition: width 0.3s;
}

.medal-segment {
  background: linear-gradient(90deg, #ffd700, #ffb347);
}

.ranking-segment {
  background: linear-gradient(90deg, #91caff, #0958d9);
}

.breakdown-legend {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.medal-dot {
  background: linear-gradient(135deg, #ffd700, #ffb347);
}

.ranking-dot {
  background: linear-gradient(135deg, #91caff, #0958d9);
}

/* ======== 赛事等级贡献 ======== */
.contribution-group {
  margin-bottom: 24px;
}

.contribution-group:last-child {
  margin-bottom: 0;
}

.contribution-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.contribution-bar-wrap {
  flex: 1;
}

.contribution-bar {
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.contribution-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s;
}

.fill-S { background: linear-gradient(90deg, #ffd700, #b8860b); }
.fill-Aplus { background: linear-gradient(90deg, #d3adf7, #722ed1); }
.fill-A { background: linear-gradient(90deg, #91caff, #0958d9); }
.fill-B { background: linear-gradient(90deg, #95de64, #389e0d); }
.fill-C { background: linear-gradient(90deg, #ffccc7, #d4142a); }

.contribution-score {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  min-width: 60px;
  text-align: right;
}

.contribution-pct {
  font-size: 13px;
  color: #999;
  min-width: 40px;
  text-align: right;
}

.contribution-table th {
  font-size: 12px;
  padding: 8px 12px;
}

.contribution-table td {
  font-size: 13px;
  padding: 8px 12px;
}

/* ======== 项目类型贡献 ======== */
.event-contributions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.event-contribution {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.event-contribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.event-count {
  font-size: 12px;
  color: #999;
}

.event-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.event-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4142a, #ff6b6b);
  border-radius: 4px;
  transition: width 0.3s;
}

.event-contribution-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-score {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.event-pct {
  font-size: 13px;
  color: #999;
}

/* ======== 通用样式 ======== */
.level-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.level-S { background: #fffbe6; color: #b8860b; border: 1px solid #ffd700; }
.level-Aplus { background: #f9f0ff; color: #722ed1; border: 1px solid #d3adf7; }
.level-A { background: #e6f4ff; color: #0958d9; border: 1px solid #91caff; }
.level-B { background: #f6ffed; color: #389e0d; border: 1px solid #95de64; }
.level-C { background: #fff2f0; color: #d4142a; border: 1px solid #ffccc7; }

.type-badge { background: #fffbe6; color: #b8860b; border: 1px solid #ffd700; }
.fill-major { background: linear-gradient(90deg, #ffd700, #b8860b); }

.breakdown-note {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
  line-height: 1.6;
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

.table-count {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.empty-inline {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}

/* ======== 响应式 ======== */
@media (max-width: 768px) {
  .score-hero-body {
    flex-direction: column;
    gap: 24px;
  }

  .breakdown-equation {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .breakdown-legend {
    flex-direction: column;
    gap: 8px;
  }

  .event-contributions {
    grid-template-columns: 1fr;
  }

  .contribution-summary {
    flex-wrap: wrap;
    gap: 8px;
  }

  .score-hero-value {
    font-size: 42px;
  }
}
</style>
