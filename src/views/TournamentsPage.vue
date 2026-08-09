<template>
  <div class="tournaments-page">
    <h1 class="page-title">赛事</h1>
    <p class="page-subtitle">中国乒乓球队参与的所有重大赛事记录</p>

    <!-- 等级筛选 -->
    <div class="filter-bar">
      <span class="filter-label">等级：</span>
      <button
        v-for="lv in levelOptions"
        :key="lv.value"
        class="filter-chip"
        :class="{ active: levelFilter === lv.value }"
        @click="levelFilter = lv.value"
      >{{ lv.label }}</button>
    </div>

    <!-- 类型筛选 -->
    <div class="filter-bar">
      <span class="filter-label">类型：</span>
      <button
        v-for="tp in typeOptions"
        :key="tp.value"
        class="filter-chip"
        :class="{ active: typeFilter === tp.value }"
        @click="typeFilter = tp.value"
      >{{ tp.label }}</button>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredTournaments.length === 0" class="empty">
      <p style="margin-bottom: 16px;">暂无符合条件的赛事记录</p>
      <button class="btn btn-outline" @click="resetFilters">清除筛选</button>
    </div>

    <!-- 赛事卡片网格 -->
    <div v-else class="grid-3">
      <div
        v-for="t in filteredTournaments"
        :key="t.id"
        class="card tournament-card"
        @click="goToTournament(t.id)"
      >
        <div class="card-body">
          <div class="tournament-card-header">
            <h3 class="tournament-name">{{ t.name }}</h3>
            <span class="level-badge" :class="`level-${t.level.replace('+', 'plus')}`">
              {{ getLevelLabel(t.level) }}
            </span>
          </div>
          <div class="tournament-year">{{ t.year }}年</div>
          <div class="tournament-meta">
            <div class="tournament-date">
              <span>{{ formatDate(t.start_date) }}</span>
              <span class="date-sep">–</span>
              <span>{{ formatDate(t.end_date) }}</span>
            </div>
            <div class="tournament-location">{{ t.location }}</div>
          </div>
          <div class="tournament-footer">
            <span class="tournament-type-tag">{{ getTypeLabel(t.type) }}</span>
            <span v-if="t.edition" class="tournament-edition">{{ t.edition }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getTournaments, getLevelLabel } from '../utils/dataService.js'

const router = useRouter()

const levelFilter = ref('all')
const typeFilter = ref('all')

const levelOptions = [
  { value: 'all', label: '全部' },
  { value: 'S', label: 'S级' },
  { value: 'A+', label: 'A+级' },
  { value: 'A', label: 'A级' }
]

const typeOptions = [
  { value: 'all', label: '全部' },
  { value: 'olympics', label: '奥运会' },
  { value: 'world_championships', label: '世锦赛' },
  { value: 'world_cup', label: '世界杯' },
  { value: 'wtt', label: 'WTT' },
  { value: 'asian', label: '亚洲赛事' },
  { value: 'national', label: '国内赛事' }
]

const typeLabels = {
  olympics: '奥运会',
  world_championships: '世锦赛',
  world_cup: '世界杯',
  wtt_grand_smash: 'WTT大满贯',
  wtt_finals: 'WTT总决赛',
  national_games: '全运会',
  asian_games: '亚运会',
  asian_championships: '亚锦赛',
  national_championships: '全国锦标赛'
}

function getTypeCategory(type) {
  if (type === 'olympics') return 'olympics'
  if (type === 'world_championships') return 'world_championships'
  if (type === 'world_cup') return 'world_cup'
  if (type.startsWith('wtt')) return 'wtt'
  if (type.startsWith('asian')) return 'asian'
  if (type.startsWith('national')) return 'national'
  return type
}

function getTypeLabel(type) {
  return typeLabels[type] || type
}

const tournaments = computed(() => getTournaments())

const filteredTournaments = computed(() => {
  let result = tournaments.value

  if (levelFilter.value !== 'all') {
    result = result.filter(t => t.level === levelFilter.value)
  }

  if (typeFilter.value !== 'all') {
    result = result.filter(t => getTypeCategory(t.type) === typeFilter.value)
  }

  return [...result].sort((a, b) => b.year - a.year)
})

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
}

function resetFilters() {
  levelFilter.value = 'all'
  typeFilter.value = 'all'
}

function goToTournament(id) {
  router.push(`/tournament/${id}`)
}
</script>

<style scoped>
.tournaments-page {
  max-width: 100%;
}

.tournament-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tournament-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tournament-card .card-body {
  padding: 20px;
}

.tournament-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.tournament-name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0;
  line-height: 1.4;
}

.tournament-year {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.tournament-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.tournament-date {
  font-size: 13px;
  color: #666;
}

.date-sep {
  color: #ccc;
  margin: 0 4px;
}

.tournament-location {
  font-size: 13px;
  color: #999;
}

.tournament-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.tournament-type-tag {
  display: inline-block;
  font-size: 12px;
  color: #d4142a;
  background: #fff2f0;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #ffccc7;
}

.tournament-edition {
  font-size: 12px;
  color: #999;
}

.level-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .tournament-name {
    font-size: 15px;
  }
}
</style>
