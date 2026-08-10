<template>
  <div class="event-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 空状态 -->
    <div v-else-if="!event" class="empty">
      <p style="margin-bottom: 16px;">赛事项目不存在</p>
      <router-link to="/tournaments" class="btn btn-outline">返回赛事列表</router-link>
    </div>

    <!-- 主体内容 -->
    <template v-else>
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <router-link to="/tournaments">赛事</router-link>
        <span class="separator">/</span>
        <router-link v-if="tournament" :to="`/tournament/${tournament.id}`">{{ tournament.name }}</router-link>
        <span v-else>赛事</span>
        <span class="separator">/</span>
        <span>{{ event.name }}</span>
      </div>

      <!-- 项目信息 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header"><span>项目信息</span></div>
        <div class="card-body">
          <div class="grid-3 event-info-grid">
            <div class="info-item">
              <span class="info-label">项目名称</span>
              <span class="info-value">{{ event.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属赛事</span>
              <span class="info-value">{{ tournament ? tournament.name : '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">赛事等级</span>
              <span class="info-value">
                <span v-if="tournament" class="level-badge" :class="`level-${tournament.level.replace('+', 'plus')}`">
                  {{ getLevelLabel(tournament.level) }}
                </span>
                <span v-else>-</span>
              </span>
            </div>
            <div class="info-item" v-if="competitionType">
              <span class="info-label">大赛类型</span>
              <span class="info-value">
                <span class="comp-type-link">
                  {{ competitionType.short_name }}
                  <span class="comp-type-rank">#{{ competitionType.rank }}</span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 领奖台 -->
      <div
        class="card"
        style="margin-bottom: 20px;"
        v-if="podium.gold || podium.silver || podium.bronze.length"
      >
        <div class="card-header"><span>领奖台</span></div>
        <div class="card-body">
          <div class="podium">
            <!-- 亚军 -->
            <div class="podium-position podium-silver" v-if="podium.silver">
              <div class="podium-medal">&#129352;</div>
              <div class="podium-rank">2</div>
              <router-link
                v-if="isChineseAthlete(podium.silver.athlete_id)"
                :to="`/athlete/${podium.silver.athlete_id}`"
                class="podium-name"
              >{{ getAthleteName(podium.silver.athlete_id) }}</router-link>
              <span v-else class="podium-name foreign-athlete">{{ getAthleteName(podium.silver.athlete_id) }}</span>
            </div>
            <!-- 冠军 -->
            <div class="podium-position podium-gold" v-if="podium.gold">
              <div class="podium-medal">&#129351;</div>
              <div class="podium-rank">1</div>
              <router-link
                v-if="isChineseAthlete(podium.gold.athlete_id)"
                :to="`/athlete/${podium.gold.athlete_id}`"
                class="podium-name"
              >{{ getAthleteName(podium.gold.athlete_id) }}</router-link>
              <span v-else class="podium-name foreign-athlete">{{ getAthleteName(podium.gold.athlete_id) }}</span>
            </div>
            <!-- 季军 -->
            <div class="podium-position podium-bronze" v-if="podium.bronze.length">
              <div class="podium-medal">&#129353;</div>
              <div class="podium-rank">3</div>
              <div
                v-for="(b, idx) in podium.bronze"
                :key="idx"
                class="podium-bronze-item"
              >
                <router-link
                  v-if="isChineseAthlete(b.athlete_id)"
                  :to="`/athlete/${b.athlete_id}`"
                  class="podium-name"
                >{{ getAthleteName(b.athlete_id) }}</router-link>
                <span v-else class="podium-name foreign-athlete">{{ getAthleteName(b.athlete_id) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最终排名 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <span>最终排名</span>
          <span class="table-count">共 {{ sortedResults.length }} 人</span>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 60px;">名次</th>
                <th>运动员</th>
                <th>奖牌</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sortedResults.length === 0">
                <td colspan="3" style="text-align: center; color: #999; padding: 40px;">暂无排名数据</td>
              </tr>
              <tr v-for="(result, idx) in sortedResults" :key="idx">
                <td>
                  <span class="rank-cell" :class="`rank-${result.rank}`">{{ result.rank }}</span>
                </td>
                <td>
                  <router-link
                    v-if="isChineseAthlete(result.athlete_id)"
                    :to="`/athlete/${result.athlete_id}`"
                    class="athlete-link"
                  >{{ getAthleteName(result.athlete_id) }}</router-link>
                  <span v-else class="foreign-athlete">{{ getAthleteName(result.athlete_id) }}</span>
                </td>
                <td>
                  <span v-if="result.medal" class="medal-badge-cell" :class="`medal-badge-${result.medal}`">
                    {{ medalEmoji[result.medal] }}
                  </span>
                  <span v-else class="no-data">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 比赛记录 -->
      <div class="card">
        <div class="card-header">
          <span>比赛记录</span>
          <span class="table-count">共 {{ eventMatches.length }} 场</span>
        </div>
        <div class="card-body">
          <!-- 轮次筛选 -->
          <div class="filter-bar" v-if="availableRounds.length > 0">
            <span class="filter-label">轮次：</span>
            <button
              class="filter-chip"
              :class="{ active: roundFilter === 'all' }"
              @click="roundFilter = 'all'"
            >全部</button>
            <button
              v-for="round in availableRounds"
              :key="round"
              class="filter-chip"
              :class="{ active: roundFilter === round }"
              @click="roundFilter = round"
            >{{ getRoundLabel(round) }}</button>
          </div>
          <!-- 比赛表格 -->
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>轮次</th>
                  <th>选手 A</th>
                  <th></th>
                  <th>选手 B</th>
                  <th>比分</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredMatches.length === 0">
                  <td colspan="6" style="text-align: center; color: #999; padding: 40px;">暂无比赛记录</td>
                </tr>
                <tr
                  v-for="match in filteredMatches"
                  :key="match.id"
                  class="clickable"
                  @click="goToMatch(match.id)"
                >
                  <td>{{ formatDate(match.date) }}</td>
                  <td>{{ getRoundLabel(match.round) }}</td>
                  <td>
                    <span
                      class="match-player"
                      :class="{ 'match-winner': match.winner_id === match.player_a.athlete_id }"
                    >{{ getAthleteName(match.player_a.athlete_id) }}</span>
                    <span class="country-badge">{{ match.player_a.country }}</span>
                  </td>
                  <td class="vs-cell">VS</td>
                  <td>
                    <span
                      class="match-player"
                      :class="{ 'match-winner': match.winner_id === match.player_b.athlete_id }"
                    >{{ getAthleteName(match.player_b.athlete_id) }}</span>
                    <span class="country-badge">{{ match.player_b.country }}</span>
                  </td>
                  <td class="match-score-cell">
                    <span :class="{ 'score-winner': match.winner_id === match.player_a.athlete_id }">{{ match.score_a }}</span>
                    <span class="score-dash">-</span>
                    <span :class="{ 'score-winner': match.winner_id === match.player_b.athlete_id }">{{ match.score_b }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getEvent, getTournament, getEventMatches, getAthlete,
  getEventLabel, getLevelLabel, getRoundLabel
} from '../utils/dataService.js'

const route = useRoute()
const router = useRouter()
const loading = ref(true)

const event = ref(null)
const tournament = ref(null)
const competitionType = computed(() => event.value?.competition_type || null)
const eventMatches = ref([])
const roundFilter = ref('all')

const medalEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉' }
const roundOrder = ['FINAL', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128']

const sortedResults = computed(() => {
  if (!event.value?.results) return []
  return [...event.value.results].sort((a, b) => (a.rank || 999) - (b.rank || 999))
})

const podium = computed(() => {
  const results = sortedResults.value
  return {
    gold: results.find(r => r.medal === 'gold'),
    silver: results.find(r => r.medal === 'silver'),
    bronze: results.filter(r => r.medal === 'bronze')
  }
})

const availableRounds = computed(() => {
  const rounds = [...new Set(eventMatches.value.map(m => m.round))]
  return rounds.sort((a, b) => {
    const ia = roundOrder.indexOf(a)
    const ib = roundOrder.indexOf(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
})

const filteredMatches = computed(() => {
  if (roundFilter.value === 'all') return eventMatches.value
  return eventMatches.value.filter(m => m.round === roundFilter.value)
})

function getAthleteName(athleteId) {
  const a = getAthlete(athleteId)
  if (a) return a.name
  return athleteId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function isChineseAthlete(athleteId) {
  return !!getAthlete(athleteId)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`
}

function goToMatch(id) {
  router.push(`/match/${id}`)
}

onMounted(() => {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }

  event.value = getEvent(id)
  if (!event.value) {
    loading.value = false
    return
  }

  tournament.value = getTournament(event.value.tournament_id)
  eventMatches.value = getEventMatches(id)
  loading.value = false
})
</script>

<style scoped>
.event-page {
  max-width: 100%;
}

/* ======== 项目信息 ======== */
.event-info-grid {
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

/* ======== 等级标签 ======== */
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
.level-B { background: #f6ffed; color: #389e0d; border: 1px solid #95de64; }
.level-C { background: #fff2f0; color: #d4142a; border: 1px solid #ffccc7; }

.comp-type-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #d4142a;
  font-weight: 600;
}

.comp-type-rank {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #fff1f0;
  color: #d4142a;
  font-weight: 700;
}

/* ======== 领奖台 ======== */
.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
}

.podium-position {
  flex: 1;
  max-width: 200px;
  text-align: center;
  border-radius: 12px 12px 0 0;
  padding: 20px 16px;
  position: relative;
}

.podium-gold {
  background: linear-gradient(180deg, #fffbe6 0%, #fff7d6 100%);
  border: 2px solid #ffd700;
  border-bottom: none;
  padding-top: 36px;
}

.podium-silver {
  background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
  border: 2px solid #c0c0c0;
  border-bottom: none;
  padding-top: 28px;
}

.podium-bronze {
  background: linear-gradient(180deg, #fdf2ec 0%, #f5e0d5 100%);
  border: 2px solid #cd7f32;
  border-bottom: none;
  padding-top: 24px;
}

.podium-medal {
  font-size: 32px;
  margin-bottom: 8px;
}

.podium-rank {
  font-size: 28px;
  font-weight: 800;
  color: #333;
  line-height: 1;
  margin-bottom: 8px;
}

.podium-gold .podium-rank {
  color: #b8860b;
}

.podium-silver .podium-rank {
  color: #999;
}

.podium-bronze .podium-rank {
  color: #cd7f32;
}

.podium-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-top: 4px;
}

.podium-name:hover {
  color: #d4142a;
  text-decoration: none;
}

.podium-bronze-item {
  margin-top: 4px;
}

.foreign-athlete {
  color: #999;
  font-weight: 500;
}

/* ======== 排名表 ======== */
.rank-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  background: #f5f5f5;
  color: #666;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  color: #fff;
}

.rank-2 {
  background: linear-gradient(135deg, #e8e8e8, #c0c0c0);
  color: #fff;
}

.rank-3 {
  background: linear-gradient(135deg, #e8a87c, #cd7f32);
  color: #fff;
}

.rank-4, .rank-5, .rank-6, .rank-7, .rank-8 {
  background: #e6f4ff;
  color: #0958d9;
}

.athlete-link {
  color: #333;
  font-weight: 500;
}

.athlete-link:hover {
  color: #d4142a;
  text-decoration: none;
}

.no-data {
  color: #ccc;
}

/* ======== 奖牌徽章 ======== */
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

/* ======== 比赛记录 ======== */
.table-count {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.filter-label {
  font-size: 13px;
  color: #666;
  margin-right: 4px;
}

.match-player {
  font-weight: 500;
  color: #333;
}

.match-winner {
  font-weight: 700;
  color: #d4142a;
}

.country-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #f0f0f0;
  color: #999;
  font-size: 11px;
  font-weight: 500;
}

.vs-cell {
  text-align: center;
  color: #ccc;
  font-size: 13px;
  font-weight: 600;
}

.match-score-cell {
  white-space: nowrap;
  font-weight: 600;
  font-size: 15px;
}

.score-winner {
  color: #d4142a;
}

.score-dash {
  color: #ccc;
  margin: 0 4px;
  font-weight: 300;
}

/* ======== 响应式 ======== */
@media (max-width: 768px) {
  .podium {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .podium-position {
    max-width: 100%;
    width: 100%;
    border-radius: 12px;
    padding-top: 16px;
  }

  .podium-gold {
    padding-top: 20px;
  }

  .event-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
