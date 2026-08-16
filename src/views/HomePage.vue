<template>
  <div class="home-page">
    <!-- 页面标题 -->
    <h1 class="page-title">中国乒乓球队排行榜</h1>
    <p class="page-subtitle">1988年至今 · 按奥运会、世锦赛、世界杯三大赛奖牌数排名</p>

    <!-- 排名规则说明 -->
    <div class="card rule-card" style="margin-bottom: 24px;">
      <div class="card-header">
        <span>排名规则（V1.0）</span>
        <span class="formula-version">仅统计三大赛</span>
      </div>
      <div class="card-body">
        <p class="rule-text">
          排名仅依据运动员在<strong>奥运会、世界乒乓球锦标赛、乒乓球世界杯</strong>中获得的奖牌，
          按以下优先级从高到低排序：
        </p>
        <ol class="rule-list">
          <li><strong>单打</strong>奖牌（金 &gt; 银 &gt; 铜）</li>
          <li><strong>双打 / 混双</strong>奖牌（金 &gt; 银 &gt; 铜）</li>
          <li><strong>团体</strong>奖牌（金 &gt; 银 &gt; 铜）</li>
        </ol>
        <p class="formula-matrix-note">同一层级内先比金牌数，再比银牌、铜牌；同届不同项目奖牌全部计入，不区分赛事品牌。</p>
      </div>
    </div>

    <!-- TOP 3 运动员卡片 -->
    <div class="grid-3" style="margin-bottom: 24px;">
      <div
        v-for="item in top3"
        :key="item.athlete.id"
        class="card top3-card"
        :class="`top3-rank-${item.rank}`"
        @click="goToAthlete(item.athlete.id)"
      >
        <div class="top3-rank-badge" :class="`rank-${item.rank}`">
          <span class="rank-number">{{ item.rank }}</span>
        </div>
        <div class="top3-card-body">
          <div class="top3-name-row">
            <h3 class="top3-name">{{ item.athlete.name }}</h3>
            <span
              class="status-tag"
              :class="`status-${item.athlete.career_status}`"
              :style="{ color: getStatusInfo(item.athlete.career_status).color, background: getStatusInfo(item.athlete.career_status).bg }"
            >
              {{ getStatusInfo(item.athlete.career_status).label }}
            </span>
          </div>
          <div class="top3-score">{{ item.medals.gold + item.medals.silver + item.medals.bronze }}</div>
          <div class="top3-score-label">三大赛奖牌</div>
          <div class="top3-medals">
            <span class="medal-badge medal-gold-badge">🥇 {{ item.medals.gold }}</span>
            <span class="medal-badge medal-silver-badge">🥈 {{ item.medals.silver }}</span>
            <span class="medal-badge medal-bronze-badge">🥉 {{ item.medals.bronze }}</span>
          </div>
          <div class="top3-stats">
            <div class="top3-stat-item">
              <span class="top3-stat-value">{{ item.categories.singles.gold }}</span>
              <span class="top3-stat-label">单打金</span>
            </div>
            <div class="top3-stat-item">
              <span class="top3-stat-value">{{ item.categories.doubles.gold }}</span>
              <span class="top3-stat-label">双打金</span>
            </div>
            <div class="top3-stat-item">
              <span class="top3-stat-value">{{ item.categories.team.gold }}</span>
              <span class="top3-stat-label">团体金</span>
            </div>
          </div>
          <div class="top3-tags">
            <span
              v-for="tag in (item.athlete.tags || []).slice(0, 3)"
              :key="tag"
              class="tag tag-red"
            >{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <span class="filter-label">状态：</span>
      <button
        class="filter-chip"
        :class="{ active: currentFilter === 'all' }"
        @click="setFilter('all')"
      >综合</button>
      <button
        class="filter-chip"
        :class="{ active: currentFilter === 'active' }"
        @click="setFilter('active')"
      >现役球员</button>
      <span class="filter-divider"></span>
      <span class="filter-label">性别：</span>
      <button
        class="filter-chip"
        :class="{ active: currentGender === 'all' }"
        @click="setGender('all')"
      >全部</button>
      <button
        class="filter-chip"
        :class="{ active: currentGender === 'male' }"
        @click="setGender('male')"
      >男</button>
      <button
        class="filter-chip"
        :class="{ active: currentGender === 'female' }"
        @click="setGender('female')"
      >女</button>
    </div>

    <!-- 完整排名表 -->
    <div class="card">
      <div class="card-header">
        <span>完整排名</span>
        <span class="table-count">共 {{ rankings.length }} 人</span>
      </div>
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
              <tr>
                <th style="width: 60px;">排名</th>
                <th>运动员</th>
                <th style="width: 90px;">状态</th>
                <th style="width: 90px;">单打<br /><span class="th-sub">金/总</span></th>
                <th style="width: 90px;">双打<br /><span class="th-sub">金/总</span></th>
                <th style="width: 90px;">团体<br /><span class="th-sub">金/总</span></th>
                <th style="width: 80px;">金牌合计</th>
                <th style="width: 110px;">职业时间</th>
              </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in rankings"
              :key="item.athlete.id"
              class="clickable"
              @click="goToAthlete(item.athlete.id)"
            >
              <td>
                <span class="rank-cell" :class="`rank-cell-${item.rank <= 3 ? item.rank : 'normal'}`">
                  {{ item.rank }}
                </span>
              </td>
              <td>
                <div class="athlete-cell">
                  <span class="athlete-name">{{ item.athlete.name }}</span>
                  <span
                    v-if="item.athlete.tags && item.athlete.tags.length"
                    class="athlete-tag-mini"
                  >{{ item.athlete.tags[0] }}</span>
                </div>
              </td>
              <td>
                <span
                  class="status-tag"
                  :class="`status-${item.athlete.career_status}`"
                  :style="{ color: getStatusInfo(item.athlete.career_status).color, background: getStatusInfo(item.athlete.career_status).bg }"
                >
                  {{ getStatusInfo(item.athlete.career_status).label }}
                </span>
              </td>
              <td>
                <span class="cat-cell"><b>{{ item.categories.singles.gold }}</b> / {{ item.categories.singles.total }}</span>
              </td>
              <td>
                <span class="cat-cell"><b>{{ item.categories.doubles.gold }}</b> / {{ item.categories.doubles.total }}</span>
              </td>
              <td>
                <span class="cat-cell"><b>{{ item.categories.team.gold }}</b> / {{ item.categories.team.total }}</span>
              </td>
              <td><span class="medal-count medal-gold-text">{{ item.medals.gold }}</span></td>
              <td>
                <span class="career-time">
                  {{ item.athlete.career_start }}–{{ item.athlete.career_end || '至今' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getRankings, getStatusInfo } from '../utils/dataService.js'

const router = useRouter()
const currentFilter = ref('all')
const currentGender = ref('all')

const rankings = computed(() => getRankings(currentFilter.value, currentGender.value))

const top3 = computed(() => rankings.value.slice(0, 3))

function setFilter(filter) {
  currentFilter.value = filter
}

function setGender(gender) {
  currentGender.value = gender
}

function goToAthlete(id) {
  router.push(`/athlete/${id}`)
}
</script>

<style scoped>
.home-page {
  max-width: 100%;
}

/* 排名规则卡片 */
.rule-card .card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-text {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.7;
}

.rule-text strong {
  color: #d4142a;
}

.rule-list {
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.rule-list strong {
  color: #222;
}

.th-sub {
  font-size: 11px;
  font-weight: 400;
  color: #aaa;
}

.cat-cell {
  font-size: 14px;
  color: #555;
  white-space: nowrap;
}

.cat-cell b {
  color: #b8860b;
  font-size: 15px;
}

/* 公式卡片 */
.formula-card .card-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.formula-version {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.formula-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formula-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 15px;
}

.formula-label {
  font-weight: 700;
  color: #d4142a;
  font-size: 15px;
}

.formula-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  background: #fff2f0;
  color: #d4142a;
  border: 1px solid #ffccc7;
  font-size: 13px;
  font-weight: 600;
}

.formula-tag-sub {
  background: #f0f5ff;
  color: #2f54eb;
  border-color: #adc6ff;
}

.formula-eq {
  color: #999;
  font-weight: 700;
}

.formula-op {
  color: #999;
}

.formula-coeff {
  color: #666;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.formula-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 16px;
}

.formula-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.formula-weights {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.weight-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weight-title {
  font-size: 12px;
  font-weight: 600;
  color: #999;
}

.weight-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.weight-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  background: white;
  border: 1px solid #e8e8e8;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.weight-s { border-color: #ffd700; color: #b8860b; background: #fffbe6; }
.weight-aplus { border-color: #b37feb; color: #722ed1; background: #f9f0ff; }
.weight-a { border-color: #69b1ff; color: #0958d9; background: #e6f4ff; }
.weight-b { border-color: #5cdbd3; color: #08979c; background: #e6fffb; }
.weight-c { border-color: #d9d9d9; color: #999; }

.medal-gold-chip { border-color: #ffd700; color: #b8860b; background: #fffbe6; }
.medal-silver-chip { border-color: #c0c0c0; color: #888; background: #fafafa; }
.medal-bronze-chip { border-color: #cd7f32; color: #a0522d; background: #fdf2ec; }

/* 积分矩阵表 */
.formula-matrix {
  margin-top: 4px;
}

.score-matrix {
  width: 100%;
  max-width: 420px;
  border-collapse: collapse;
  font-size: 13px;
}

.score-matrix th,
.score-matrix td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.score-matrix th {
  background: #fafafa;
  font-weight: 600;
  color: #666;
}

.score-matrix td:first-child {
  text-align: left;
  font-weight: 600;
  color: #333;
}

.score-matrix .matrix-gold {
  color: #b8860b;
  font-weight: 700;
}

.formula-matrix-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}

/* TOP 3 卡片 */
.top3-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: visible;
}

.top3-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.top3-rank-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.top3-rank-badge .rank-number {
  font-size: 20px;
  font-weight: 800;
  color: white;
}

.top3-rank-badge.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffb347);
}

.top3-rank-badge.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
}

.top3-rank-badge.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #b87333);
}

.top3-card-body {
  padding: 28px 20px 20px;
  text-align: center;
}

.top3-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.top3-name {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.top3-score {
  font-size: 36px;
  font-weight: 800;
  color: #d4142a;
  line-height: 1.1;
}

.top3-score-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 14px;
}

.top3-medals {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.medal-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.medal-gold-badge {
  background: linear-gradient(135deg, #fffbe6, #fff7d6);
  border: 1px solid #ffd700;
  color: #b8860b;
}

.medal-silver-badge {
  background: linear-gradient(135deg, #fafafa, #f0f0f0);
  border: 1px solid #c0c0c0;
  color: #888;
}

.medal-bronze-badge {
  background: linear-gradient(135deg, #fdf2ec, #f5e0d5);
  border: 1px solid #cd7f32;
  color: #a0522d;
}

.top3-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.top3-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top3-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.top3-stat-label {
  font-size: 11px;
  color: #999;
}

.top3-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

/* 筛选栏 */
.filter-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.filter-divider {
  width: 1px;
  height: 18px;
  background: #e8e8e8;
  margin: 0 4px;
}

/* 表格 */
.table-count {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.rank-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  color: #666;
  background: #f5f5f5;
}

.rank-cell-1 {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  color: white;
}

.rank-cell-2 {
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  color: white;
}

.rank-cell-3 {
  background: linear-gradient(135deg, #cd7f32, #b87333);
  color: white;
}

.athlete-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.athlete-name {
  font-weight: 600;
  color: #222;
}

.athlete-tag-mini {
  font-size: 11px;
  color: #d4142a;
  background: #fff2f0;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.score-cell {
  font-weight: 700;
  color: #d4142a;
  font-size: 15px;
}

.medal-count {
  font-weight: 700;
  font-size: 14px;
}

.medal-gold-text { color: #b8860b; }
.medal-silver-text { color: #888; }
.medal-bronze-text { color: #a0522d; }

.dominance-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dominance-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  min-width: 40px;
}

.dominance-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4142a, #ff6b6b);
  border-radius: 3px;
  transition: width 0.3s;
}

.dominance-value {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  min-width: 28px;
  text-align: right;
}

.career-time {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
}

/* 响应式 */
@media (max-width: 768px) {
  .formula-weights {
    flex-direction: column;
    gap: 16px;
  }

  .top3-card-body {
    padding: 24px 16px 16px;
  }

  .top3-score {
    font-size: 28px;
  }
}
</style>
