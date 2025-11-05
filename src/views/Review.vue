<template>
  <div class="review-page">
    <div class="page-header">
      <h2>📅 学习计划</h2>
    </div>

    <!-- 整体学习计划 -->
    <div class="plan-overview">
      <div class="plan-card main-plan">
        <h3>📚 整体学习计划</h3>
        <div class="plan-stats">
          <div class="plan-stat">
            <span class="plan-label">总单词数</span>
            <span class="plan-value">{{ vocabularyStore.totalWords }}</span>
          </div>
          <div class="plan-stat">
            <span class="plan-label">未学习</span>
            <span class="plan-value highlight">{{ vocabularyStore.unlearnedWordsCount }}</span>
          </div>
          <div class="plan-stat">
            <span class="plan-label">每天学习</span>
            <span class="plan-value">{{ vocabularyStore.DAILY_NEW_WORDS_LIMIT }} 个</span>
          </div>
          <div class="plan-stat">
            <span class="plan-label">预计天数</span>
            <span class="plan-value highlight">{{ vocabularyStore.totalDaysNeeded }} 天</span>
          </div>
        </div>
        <div class="plan-progress-bar">
          <div class="progress-track">
            <div 
              class="progress-fill" 
              :style="{ width: overallProgress + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            已完成 {{ learnedCount }} / {{ vocabularyStore.totalWords }} 
            ({{ overallProgress }}%)
          </div>
        </div>
      </div>
    </div>

    <!-- 今日学习目标 -->
    <div class="today-plan">
      <div class="plan-card">
        <h3>🎯 今日学习目标 - 第 {{ vocabularyStore.currentDayNumber }} 天</h3>
        <div class="today-stats">
          <div class="today-stat">
            <div class="stat-icon">📖</div>
            <div class="stat-content">
              <span class="stat-number">{{ vocabularyStore.todayProgress.planned }}</span>
              <span class="stat-label">计划学习</span>
            </div>
          </div>
          <div class="today-stat completed">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <span class="stat-number">{{ vocabularyStore.todayProgress.learned }}</span>
              <span class="stat-label">已完成</span>
            </div>
          </div>
          <div class="today-stat remaining">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <span class="stat-number">{{ vocabularyStore.todayProgress.remaining }}</span>
              <span class="stat-label">剩余</span>
            </div>
          </div>
        </div>
        <div class="plan-progress-bar">
          <div class="progress-track">
            <div 
              class="progress-fill today" 
              :style="{ width: vocabularyStore.todayProgress.percentage + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            今日完成度: {{ vocabularyStore.todayProgress.percentage }}%
          </div>
        </div>
        <router-link to="/" class="btn-start" v-if="vocabularyStore.todayProgress.remaining > 0">
          开始学习 →
        </router-link>
        <div v-else class="completed-message">
          🎉 太棒了！今天的学习目标已完成！
        </div>
      </div>
    </div>

    <!-- 学习日历 -->
    <div class="calendar-section">
      <h3 class="section-title">📅 学习日历（点击查看该天单词）</h3>
      <div class="calendar-grid">
        <router-link
          v-for="dayPlan in vocabularyStore.learningCalendar"
          :key="dayPlan.day"
          :to="`/day/${dayPlan.day}`"
          :class="['calendar-day', dayPlan.status]"
        >
          <div class="day-header">
            <span class="day-number">第{{ dayPlan.day }}天</span>
            <span class="day-date">{{ dayPlan.displayDate }}</span>
          </div>
          <div class="day-progress">
            <span class="progress-text">{{ dayPlan.completedCount }}/{{ dayPlan.totalCount }}</span>
            <div class="mini-progress">
              <div 
                class="mini-progress-fill" 
                :style="{ width: (dayPlan.completedCount / dayPlan.totalCount * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="day-status">
            <span v-if="dayPlan.status === 'completed'" class="status-badge completed">✅ 已完成</span>
            <span v-else-if="dayPlan.status === 'today'" class="status-badge today">📖 今天</span>
            <span v-else class="status-badge upcoming">⏳ 待学习</span>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 复习计划 -->
    <div class="review-section">
      <h3 class="section-title">🔄 复习计划</h3>
      <div class="review-info">
        <p class="info-text">
          根据<strong>艾宾浩斯遗忘曲线</strong>，系统会智能安排复习时间。
        </p>
        <p class="info-text">
          复习间隔: 5分钟 → 30分钟 → 12小时 → 1天 → 2天 → 4天 → 7天 → 14天 → 30天
        </p>
      </div>

      <div class="stat-cards">
        <div class="stat-card urgent">
          <div class="stat-icon-large">⏰</div>
          <span class="stat-number">{{ vocabularyStore.wordsToReview.length }}</span>
          <span class="stat-label">待复习</span>
        </div>
        <div class="stat-card upcoming">
          <div class="stat-icon-large">📅</div>
          <span class="stat-number">{{ upcomingReviews.length }}</span>
          <span class="stat-label">24小时内</span>
        </div>
      </div>

      <!-- 待复习单词列表 -->
      <div v-if="vocabularyStore.wordsToReview.length > 0" class="review-list">
        <h4 class="list-title">待复习单词</h4>
        <div class="words-grid">
          <div
            v-for="word in vocabularyStore.wordsToReview.slice(0, 12)"
            :key="word.id"
            class="review-card"
          >
            <h5>{{ word.english }}</h5>
            <p>{{ word.chinese }}</p>
            <div class="card-footer">
              <span class="badge">{{ getProficiencyText(word.proficiency) }}</span>
              <span class="time">现在复习</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVocabularyStore } from '../stores/vocabulary'

const vocabularyStore = useVocabularyStore()

/**
 * 已学习的单词数量
 */
const learnedCount = computed(() => {
  return vocabularyStore.words.filter(w => w.reviewCount > 0).length
})

/**
 * 整体学习进度百分比
 */
const overallProgress = computed(() => {
  if (vocabularyStore.totalWords === 0) return 0
  return Math.round((learnedCount.value / vocabularyStore.totalWords) * 100)
})

/**
 * 即将复习的单词数量（24小时内）
 */
const upcomingReviews = computed(() => {
  const tomorrow = Date.now() + 24 * 60 * 60 * 1000
  return vocabularyStore.words.filter(
    w => w.nextReviewAt > Date.now() && w.nextReviewAt <= tomorrow
  )
})

/**
 * 获取熟练度文本
 */
const getProficiencyText = (level: number): string => {
  const levels = ['新词', '生疏', '一般', '熟悉', '掌握', '精通']
  return levels[level] || '新词'
}
</script>

<style scoped>
.review-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h2 {
  font-size: 1.75rem;
  color: white;
  margin-bottom: 2rem;
}

/* 整体学习计划 */
.plan-overview {
  margin-bottom: 2rem;
}

.plan-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.plan-card h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.main-plan {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-plan h3 {
  color: white;
}

.plan-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.plan-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.plan-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.plan-value {
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.plan-value.highlight {
  color: #ffd700;
}

.plan-progress-bar {
  margin-top: 1.5rem;
}

.progress-track {
  height: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-fill.today {
  background: linear-gradient(90deg, #4299e1 0%, #3182ce 100%);
}

.progress-text {
  text-align: center;
  color: white;
  font-weight: 600;
}

/* 今日学习目标 */
.today-plan {
  margin-bottom: 2rem;
}

.today-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.today-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.today-stat.completed {
  border-left-color: #48bb78;
  background: linear-gradient(to right, #f0fff4, #f7fafc);
}

.today-stat.remaining {
  border-left-color: #ed8936;
  background: linear-gradient(to right, #fffaf0, #f7fafc);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  color: #718096;
  font-size: 0.875rem;
}

.btn-start {
  display: block;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.125rem;
  text-decoration: none;
  transition: all 0.3s;
  margin-top: 1.5rem;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.completed-message {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.5rem;
}

/* 学习日历 */
.calendar-section {
  margin-bottom: 2rem;
}

.calendar-section .section-title {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.calendar-day {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid #cbd5e0;
  text-decoration: none;
  display: block;
}

.calendar-day:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.calendar-day.completed {
  border-left-color: #48bb78;
  background: linear-gradient(to right, #f0fff4, white);
}

.calendar-day.today {
  border-left-color: #667eea;
  background: linear-gradient(to right, #ebf4ff, white);
}

.calendar-day.upcoming {
  border-left-color: #ed8936;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.day-number {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.125rem;
}

.day-date {
  color: #718096;
  font-size: 0.875rem;
}

.day-progress {
  margin-bottom: 1rem;
}

.progress-text {
  display: block;
  color: #4a5568;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.mini-progress {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.calendar-day.completed .mini-progress-fill {
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
}

.day-status {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.today {
  background: #bee3f8;
  color: #2c5282;
}

.status-badge.upcoming {
  background: #fed7d7;
  color: #742a2a;
}

/* 复习计划 */
.review-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.review-info {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.info-text {
  color: #4a5568;
  line-height: 1.8;
  margin-bottom: 0.5rem;
}

.info-text strong {
  color: #667eea;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: #f7fafc;
  border-radius: 12px;
  gap: 0.75rem;
}

.stat-card.urgent {
  background: linear-gradient(to bottom, #fff5f5, #f7fafc);
  border: 2px solid #fc8181;
}

.stat-card.upcoming {
  background: linear-gradient(to bottom, #ebf8ff, #f7fafc);
  border: 2px solid #63b3ed;
}

.stat-icon-large {
  font-size: 3rem;
}

.stat-card .stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-card .stat-label {
  color: #718096;
  font-size: 1rem;
}

/* 复习单词列表 */
.review-list {
  margin-top: 2rem;
}

.list-title {
  font-size: 1.125rem;
  color: #2d3748;
  margin-bottom: 1rem;
  font-weight: 600;
}

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.review-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  border-left: 4px solid #fc8181;
  transition: all 0.3s;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.review-card h5 {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.review-card p {
  color: #667eea;
  margin-bottom: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.badge {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.time {
  color: #fc8181;
  font-weight: 600;
}

@media (max-width: 768px) {
  .plan-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .today-stats {
    grid-template-columns: 1fr;
  }

  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style>
