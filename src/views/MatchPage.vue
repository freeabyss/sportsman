<template>
  <div class="match-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 空状态 -->
    <div v-else-if="!match" class="empty">
      <p style="margin-bottom: 16px;">比赛不存在</p>
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
        <router-link v-if="event" :to="`/event/${event.id}`">{{ event.name }}</router-link>
        <span v-else>项目</span>
        <span class="separator">/</span>
        <span>{{ getRoundLabel(match.round) }}</span>
      </div>

      <!-- 比赛对阵 -->
      <div class="card match-headline-card" style="margin-bottom: 20px;">
        <div class="card-body match-headline-body">
          <!-- 选手 A -->
          <div
            class="match-player-side"
            :class="{ 'player-winner': match.winner_id === match.player_a.athlete_id }"
          >
            <div class="player-country">{{ match.player_a.country }}</div>
            <div class="player-name">{{ getAthleteName(match.player_a.athlete_id) }}</div>
            <div v-if="match.winner_id === match.player_a.athlete_id" class="winner-badge">获胜</div>
          </div>
          <!-- 中间比分 -->
          <div class="match-vs-center">
            <div class="match-round-label">{{ getRoundLabel(match.round) }}</div>
            <div class="match-score-big">
              <span :class="{ 'score-winner': match.winner_id === match.player_a.athlete_id }">{{ match.score_a }}</span>
              <span class="score-separator">:</span>
              <span :class="{ 'score-winner': match.winner_id === match.player_b.athlete_id }">{{ match.score_b }}</span>
            </div>
            <div class="match-vs-label">VS</div>
          </div>
          <!-- 选手 B -->
          <div
            class="match-player-side"
            :class="{ 'player-winner': match.winner_id === match.player_b.athlete_id }"
          >
            <div class="player-country">{{ match.player_b.country }}</div>
            <div class="player-name">{{ getAthleteName(match.player_b.athlete_id) }}</div>
            <div v-if="match.winner_id === match.player_b.athlete_id" class="winner-badge">获胜</div>
          </div>
        </div>
      </div>

      <!-- 比赛信息 -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header"><span>比赛信息</span></div>
        <div class="card-body">
          <div class="grid-2 match-info-grid">
            <div class="info-item">
              <span class="info-label">赛事</span>
              <span class="info-value">
                <router-link v-if="tournament" :to="`/tournament/${tournament.id}`" class="info-link">
                  {{ tournament.name }}
                </router-link>
                <span v-else>-</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">项目</span>
              <span class="info-value">
                <router-link v-if="event" :to="`/event/${event.id}`" class="info-link">
                  {{ event.name }}
                </router-link>
                <span v-else>-</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">轮次</span>
              <span class="info-value">{{ getRoundLabel(match.round) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">日期</span>
              <span class="info-value">{{ formatDate(match.date) }}</span>
            </div>
            <div class="info-item" v-if="tournament">
              <span class="info-label">赛事等级</span>
              <span class="info-value">
                <span class="level-badge" :class="`level-${tournament.level.replace('+', 'plus')}`">
                  {{ getLevelLabel(tournament.level) }}
                </span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">获胜方</span>
              <span class="info-value winner-text">{{ getAthleteName(match.winner_id) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 每局比分 -->
      <div class="card" style="margin-bottom: 20px;" v-if="setScores.length > 0">
        <div class="card-header">
          <span>每局比分</span>
          <span class="table-count">共 {{ setScores.length }} 局</span>
        </div>
        <div class="card-body">
          <div class="set-scores">
            <div
              v-for="(set, idx) in setScores"
              :key="idx"
              class="set-score-card"
            >
              <div class="set-number">第{{ idx + 1 }}局</div>
              <div class="set-score-nums">
                <span :class="{ 'set-winner': isPlayerASetWinner(set) }">{{ getSetParts(set)[0] }}</span>
                <span class="set-dash">:</span>
                <span :class="{ 'set-winner': isPlayerBSetWinner(set) }">{{ getSetParts(set)[1] }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 返回链接 -->
      <div class="match-links">
        <router-link v-if="event" :to="`/event/${event.id}`" class="btn btn-outline">
          查看赛事项目
        </router-link>
        <router-link v-if="tournament" :to="`/tournament/${tournament.id}`" class="btn btn-outline">
          查看赛事
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getMatches, getEvent, getTournament, getAthlete,
  getRoundLabel, getLevelLabel
} from '../utils/dataService.js'

const route = useRoute()
const loading = ref(true)

const match = ref(null)
const event = ref(null)
const tournament = ref(null)

const setScores = computed(() => {
  if (!match.value?.set_scores) return []
  return match.value.set_scores.split(',').map(s => s.trim())
})

function getAthleteName(athleteId) {
  const a = getAthlete(athleteId)
  if (a) return a.name
  return athleteId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function getSetParts(setScore) {
  return setScore.split('-').map(s => s.trim())
}

function isPlayerASetWinner(setScore) {
  const parts = getSetParts(setScore)
  return parseInt(parts[0]) > parseInt(parts[1])
}

function isPlayerBSetWinner(setScore) {
  const parts = getSetParts(setScore)
  return parseInt(parts[1]) > parseInt(parts[0])
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`
}

onMounted(() => {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }

  match.value = getMatches().find(m => m.id === id)
  if (!match.value) {
    loading.value = false
    return
  }

  event.value = getEvent(match.value.event_id)
  if (event.value) {
    tournament.value = getTournament(event.value.tournament_id)
  }
  loading.value = false
})
</script>

<style scoped>
.match-page {
  max-width: 100%;
}

/* ======== 对阵展示 ======== */
.match-headline-card .card-body {
  padding: 40px 24px;
}

.match-headline-body {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  gap: 24px;
}

.match-player-side {
  flex: 1;
  text-align: center;
  padding: 24px 16px;
  border-radius: 12px;
  background: #fafafa;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.match-player-side.player-winner {
  background: linear-gradient(135deg, #fff7f7, #fff2f0);
  border-color: #d4142a;
}

.player-country {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.player-name {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.player-winner .player-name {
  color: #d4142a;
}

.winner-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  background: #d4142a;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.match-vs-center {
  flex: 0 0 auto;
  text-align: center;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.match-round-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.match-score-big {
  font-size: 48px;
  font-weight: 800;
  color: #333;
  line-height: 1;
  margin-bottom: 12px;
}

.match-score-big .score-winner {
  color: #d4142a;
}

.score-separator {
  color: #ccc;
  margin: 0 6px;
  font-weight: 300;
}

.match-vs-label {
  font-size: 14px;
  color: #ccc;
  font-weight: 600;
  letter-spacing: 2px;
}

/* ======== 比赛信息 ======== */
.match-info-grid {
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

.info-link {
  color: #d4142a;
  font-weight: 500;
}

.info-link:hover {
  text-decoration: underline;
}

.winner-text {
  color: #d4142a;
  font-weight: 700;
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

/* ======== 每局比分 ======== */
.table-count {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.set-scores {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.set-score-card {
  flex: 1;
  min-width: 100px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #f0f0f0;
}

.set-number {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.set-score-nums {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.set-winner {
  color: #d4142a;
}

.set-dash {
  color: #ccc;
  margin: 0 4px;
  font-weight: 300;
}

/* ======== 返回链接 ======== */
.match-links {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* ======== 响应式 ======== */
@media (max-width: 768px) {
  .match-headline-body {
    flex-direction: column;
    gap: 16px;
  }

  .match-vs-center {
    order: -1;
    padding: 8px 0;
  }

  .match-score-big {
    font-size: 36px;
  }

  .player-name {
    font-size: 18px;
  }

  .match-info-grid {
    grid-template-columns: 1fr;
  }

  .set-score-card {
    min-width: 80px;
    padding: 12px;
  }

  .set-score-nums {
    font-size: 20px;
  }

  .match-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>
