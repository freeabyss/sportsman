<template>
  <div class="tournament-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 空状态 -->
    <div v-else-if="!tournament" class="empty">
      <p style="margin-bottom: 16px;">赛事不存在</p>
      <router-link to="/tournaments" class="btn btn-outline">返回赛事列表</router-link>
    </div>

    <!-- 主体内容 -->
    <template v-else>
      <!-- 面包屑 -->
      <div class="breadcrumb">
        <router-link to="/">首页</router-link>
        <span class="separator">/</span>
        <router-link to="/tournaments">赛事</router-link>
        <span class="separator">/</span>
        <span>{{ tournament.name }}</span>
      </div>

      <!-- 奖牌统计卡片 -->
      <div class="grid-4" style="margin-bottom: 20px;">
        <div class="stat-card">
          <div class="stat-value">{{ events.length }}</div>
          <div class="stat-label">比赛项目</div>
        </div>
        <div class="stat-card">
          <div class="stat-value medal-stats">
            <span class="medal-icon medal-gold">&#129351;</span>{{ chineseMedalCount.gold }}
          </div>
          <div class="stat-label">中国队金牌</div>
        </div>
        <div class="stat-card">
          <div class="stat-value medal-stats">
            <span class="medal-icon medal-silver">&#129352;</span>{{ chineseMedalCount.silver }}
          </div>
          <div class="stat-label">中国队银牌</div>
        </div>
        <div class="stat-card">
          <div class="stat-value medal-stats">
            <span class="medal-icon medal-bronze">&#129353;</span>{{ chineseMedalCount.bronze }}
          </div>
          <div class="stat-label">中国队铜牌</div>
        </div>
      </div>

      <!-- 赛事信息 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <span>赛事信息</span>
        </div>
        <div class="card-body">
          <div class="grid-2 tournament-info-grid">
            <div class="info-item">
              <span class="info-label">赛事名称</span>
              <span class="info-value">{{ tournament.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">年份</span>
              <span class="info-value">{{ tournament.year }}年</span>
            </div>
            <div class="info-item">
              <span class="info-label">举办日期</span>
              <span class="info-value">{{ formatDate(tournament.start_date) }} – {{ formatDate(tournament.end_date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">举办地点</span>
              <span class="info-value">{{ tournament.location }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">赛事等级</span>
              <span class="info-value">
                <span class="level-badge" :class="`level-${tournament.level.replace('+', 'plus')}`">
                  {{ getLevelLabel(tournament.level) }}
                </span>
              </span>
            </div>
            <div class="info-item" v-if="tournament.edition">
              <span class="info-label">届次</span>
              <span class="info-value">{{ tournament.edition }}</span>
            </div>
            <div class="info-item" v-if="tournament.participant_count">
              <span class="info-label">参赛人数</span>
              <span class="info-value">{{ tournament.participant_count }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">赛事类型</span>
              <span class="info-value">{{ getTypeLabel(tournament.type) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 赛事类型（大赛类型参考） -->
      <div class="card" style="margin-bottom: 20px;" v-if="competitionType">
        <div class="card-header">
          <span>赛事类型</span>
          <span class="rank-badge">大赛排名 #{{ competitionType.rank }}</span>
        </div>
        <div class="card-body">
          <div class="comp-type-head">
            <span class="comp-type-name">{{ competitionType.name }}</span>
            <span class="comp-type-short">{{ competitionType.short_name }}</span>
          </div>
          <p class="comp-type-desc">{{ competitionType.description }}</p>
          <div class="comp-type-meta">
            <div class="meta-item">
              <span class="info-label">举办周期</span>
              <span class="info-value">{{ competitionType.cycle }}</span>
            </div>
            <div class="meta-item">
              <span class="info-label">设项</span>
              <span class="info-value">{{ competitionType.projects.join('、') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目奖牌 -->
      <div class="card">
        <div class="card-header">
          <span>项目奖牌</span>
          <span class="table-count">共 {{ events.length }} 项</span>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>项目</th>
                <th>冠军</th>
                <th>亚军</th>
                <th>季军</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="events.length === 0">
                <td colspan="4" style="text-align: center; color: #999; padding: 40px;">暂无项目数据</td>
              </tr>
              <tr v-for="event in events" :key="event.id">
                <td>
                  <span class="event-name">{{ event.name }}</span>
                  <span class="event-code">{{ getEventLabel(event.code) }}</span>
                </td>
                <!-- 冠军 -->
                <td>
                  <template v-if="getGoldMedalist(event)">
                    <div class="medal-row">
                      <router-link
                        v-if="isChineseAthlete(getGoldMedalist(event).athlete_id)"
                        :to="`/athlete/${getGoldMedalist(event).athlete_id}`"
                        class="athlete-link"
                      >{{ getAthleteName(getGoldMedalist(event).athlete_id) }}</router-link>
                      <span v-else class="foreign-athlete">{{ getAthleteName(getGoldMedalist(event).athlete_id) }}</span>
                      <span class="medal-icon medal-gold medal-icon-sm">&#129351;</span>
                    </div>
                  </template>
                  <span v-else class="no-data">-</span>
                </td>
                <!-- 亚军 -->
                <td>
                  <template v-if="getSilverMedalist(event)">
                    <div class="medal-row">
                      <router-link
                        v-if="isChineseAthlete(getSilverMedalist(event).athlete_id)"
                        :to="`/athlete/${getSilverMedalist(event).athlete_id}`"
                        class="athlete-link"
                      >{{ getAthleteName(getSilverMedalist(event).athlete_id) }}</router-link>
                      <span v-else class="foreign-athlete">{{ getAthleteName(getSilverMedalist(event).athlete_id) }}</span>
                      <span class="medal-icon medal-silver medal-icon-sm">&#129352;</span>
                    </div>
                  </template>
                  <span v-else class="no-data">-</span>
                </td>
                <!-- 季军 -->
                <td>
                  <template v-if="getBronzeMedalists(event).length > 0">
                    <div class="bronze-list">
                      <div
                        v-for="(b, idx) in getBronzeMedalists(event)"
                        :key="idx"
                        class="bronze-item"
                      >
                        <router-link
                          v-if="isChineseAthlete(b.athlete_id)"
                          :to="`/athlete/${b.athlete_id}`"
                          class="athlete-link"
                        >{{ getAthleteName(b.athlete_id) }}</router-link>
                        <span v-else class="foreign-athlete">{{ getAthleteName(b.athlete_id) }}</span>
                        <span class="medal-icon medal-bronze medal-icon-sm">&#129353;</span>
                      </div>
                    </div>
                  </template>
                  <span v-else class="no-data">-</span>
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
  getTournament, getTournamentEvents, getAthlete,
  getEventLabel, getLevelLabel, getCompetitionType
} from '../utils/dataService.js'

const route = useRoute()
const loading = ref(true)
const tournament = ref(null)
const events = ref([])

const competitionType = computed(() => tournament.value?.competition_type || null)

const typeLabels = {
  olympics: '奥运会',
  world_championships: '世界锦标赛',
  world_cup: '世界杯',
  wtt_grand_smash: 'WTT大满贯',
  wtt_finals: 'WTT总决赛',
  national_games: '全国运动会',
  asian_games: '亚运会',
  asian_championships: '亚洲锦标赛',
  national_championships: '全国锦标赛',
  wtt_champions: 'WTT冠军赛',
  csl: '乒超联赛',
  world_team_championships: '世乒赛团体'
}

const chineseMedalCount = computed(() => {
  const count = { gold: 0, silver: 0, bronze: 0 }
  events.value.forEach(event => {
    ;(event.results || []).forEach(r => {
      if (!r.medal) return
      if (isChineseAthlete(r.athlete_id)) {
        count[r.medal]++
      }
    })
  })
  return count
})

function getTypeLabel(type) {
  if (competitionType.value?.type === type && competitionType.value?.short_name) {
    return competitionType.value.short_name
  }
  return typeLabels[type] || type
}

function getGoldMedalist(event) {
  return (event.results || []).find(r => r.medal === 'gold')
}

function getSilverMedalist(event) {
  return (event.results || []).find(r => r.medal === 'silver')
}

function getBronzeMedalists(event) {
  return (event.results || []).filter(r => r.medal === 'bronze')
}

function getAthleteName(athleteId) {
  const a = getAthlete(athleteId)
  return a ? a.name : athleteId
}

function isChineseAthlete(athleteId) {
  return !!getAthlete(athleteId)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
}

onMounted(() => {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }

  tournament.value = getTournament(id)
  if (!tournament.value) {
    loading.value = false
    return
  }

  events.value = getTournamentEvents(id)
  loading.value = false
})
</script>

<style scoped>
.tournament-page {
  max-width: 100%;
}

/* 赛事信息 */
.tournament-info-grid {
  row-gap: 16px;
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

.level-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.level-S {
  background: #fffbe6;
  color: #b8860b;
  border: 1px solid #ffd700;
}

.level-Aplus {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.level-A {
  background: #e6f4ff;
  color: #0958d9;
  border: 1px solid #91caff;
}

/* 奖牌统计 */
.medal-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 24px;
}

.medal-stats .medal-icon {
  width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 14px;
}

/* 项目奖牌表 */
.table-count {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.event-name {
  font-weight: 600;
  color: #222;
}

.event-code {
  font-size: 11px;
  color: #999;
  margin-left: 8px;
}

.medal-row {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.bronze-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bronze-item {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.medal-icon-sm {
  width: 18px !important;
  height: 18px !important;
  line-height: 18px !important;
  font-size: 10px !important;
  margin-left: 4px;
}

.athlete-link {
  color: #333;
  font-weight: 500;
}

.athlete-link:hover {
  color: #d4142a;
  text-decoration: none;
}

.foreign-athlete {
  color: #999;
  font-weight: 500;
}

.rank-badge {
  font-size: 12px;
  color: #d4142a;
  font-weight: 600;
}

/* 赛事类型参考 */
.comp-type-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.comp-type-name {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}

.comp-type-short {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  background: #fff1f0;
  color: #d4142a;
  font-size: 12px;
  font-weight: 700;
}

.comp-type-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.comp-type-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.no-data {
  color: #ccc;
}
</style>
