<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2>📊 学习统计</h2>
    </div>

    <!-- 总体统计 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ vocabularyStore.totalWords }}</div>
          <div class="stat-label">总单词数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ vocabularyStore.masteredWords }}</div>
          <div class="stat-label">已掌握</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalReviews }}</div>
          <div class="stat-label">总复习次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-value">{{ masteryRate }}%</div>
          <div class="stat-label">掌握率</div>
        </div>
      </div>
    </div>

    <!-- 最近7天学习情况 -->
    <div class="section">
      <h3 class="section-title">📈 最近7天学习情况</h3>
      <div class="daily-stats">
        <div
          v-for="day in recentDays"
          :key="day.date"
          class="day-card"
        >
          <div class="day-header">{{ formatDayHeader(day.date) }}</div>
          <div class="day-stats">
            <div class="day-stat">
              <span class="day-stat-label">新学</span>
              <span class="day-stat-value new">{{ day.newWords }}</span>
            </div>
            <div class="day-stat">
              <span class="day-stat-label">复习</span>
              <span class="day-stat-value review">{{ day.reviewedWords }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 单词掌握度分布 -->
    <div class="section">
      <h3 class="section-title">🎓 单词掌握度分布</h3>
      <div class="proficiency-chart">
        <div
          v-for="(count, index) in proficiencyDistribution"
          :key="index"
          class="proficiency-bar"
        >
          <div class="bar-label">{{ getProficiencyText(index) }}</div>
          <div class="bar-container">
            <div
              class="bar-fill"
              :style="{ width: getBarWidth(count) }"
            ></div>
            <span class="bar-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习成就 -->
    <div class="section">
      <h3 class="section-title">🏆 学习成就</h3>
      <div class="achievements">
        <div class="achievement" :class="{ unlocked: vocabularyStore.totalWords >= 10 }">
          <div class="achievement-icon">🌱</div>
          <div class="achievement-name">初学者</div>
          <div class="achievement-desc">学习10个单词</div>
        </div>

        <div class="achievement" :class="{ unlocked: vocabularyStore.totalWords >= 50 }">
          <div class="achievement-icon">🌿</div>
          <div class="achievement-name">勤奋学习</div>
          <div class="achievement-desc">学习50个单词</div>
        </div>

        <div class="achievement" :class="{ unlocked: vocabularyStore.totalWords >= 100 }">
          <div class="achievement-icon">🌳</div>
          <div class="achievement-name">词汇达人</div>
          <div class="achievement-desc">学习100个单词</div>
        </div>

        <div class="achievement" :class="{ unlocked: vocabularyStore.masteredWords >= 20 }">
          <div class="achievement-icon">⭐</div>
          <div class="achievement-name">精通大师</div>
          <div class="achievement-desc">掌握20个单词</div>
        </div>

        <div class="achievement" :class="{ unlocked: totalReviews >= 100 }">
          <div class="achievement-icon">💪</div>
          <div class="achievement-name">坚持不懈</div>
          <div class="achievement-desc">复习100次</div>
        </div>

        <div class="achievement" :class="{ unlocked: consecutiveDays >= 7 }">
          <div class="achievement-icon">🔥</div>
          <div class="achievement-name">连续打卡</div>
          <div class="achievement-desc">连续学习7天</div>
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
 * 总复习次数
 */
const totalReviews = computed(() => {
  return vocabularyStore.studyRecords.length
})

/**
 * 掌握率
 */
const masteryRate = computed(() => {
  if (vocabularyStore.totalWords === 0) return 0
  return Math.round((vocabularyStore.masteredWords / vocabularyStore.totalWords) * 100)
})

/**
 * 最近7天数据
 */
const recentDays = computed(() => {
  const days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const stats = vocabularyStore.dailyStats.find(s => s.date === dateStr)
    days.push({
      date: dateStr,
      newWords: stats?.newWords || 0,
      reviewedWords: stats?.reviewedWords || 0
    })
  }
  
  return days
})

/**
 * 格式化日期标题
 */
const formatDayHeader = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  
  if (dateStr === today.toISOString().split('T')[0]) {
    return '今天'
  }
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === yesterday.toISOString().split('T')[0]) {
    return '昨天'
  }
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

/**
 * 单词掌握度分布
 */
const proficiencyDistribution = computed(() => {
  const distribution = [0, 0, 0, 0, 0, 0]
  vocabularyStore.words.forEach(word => {
    distribution[word.proficiency]++
  })
  return distribution
})

/**
 * 获取熟练度文本
 */
const getProficiencyText = (level: number): string => {
  const levels = ['新词', '生疏', '一般', '熟悉', '掌握', '精通']
  return levels[level] || '新词'
}

/**
 * 获取柱状图宽度
 */
const getBarWidth = (count: number): string => {
  if (vocabularyStore.totalWords === 0) return '0%'
  return `${(count / vocabularyStore.totalWords) * 100}%`
}

/**
 * 连续学习天数
 */
const consecutiveDays = computed(() => {
  if (vocabularyStore.dailyStats.length === 0) return 0
  
  const sortedStats = [...vocabularyStore.dailyStats].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let consecutive = 0
  const today = new Date()
  
  for (let i = 0; i < sortedStats.length; i++) {
    const statDate = new Date(sortedStats[i].date)
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    
    if (statDate.toDateString() === expectedDate.toDateString()) {
      if (sortedStats[i].newWords > 0 || sortedStats[i].reviewedWords > 0) {
        consecutive++
      } else {
        break
      }
    } else {
      break
    }
  }
  
  return consecutive
})
</script>

<style scoped>
.statistics-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header h2 {
  font-size: 1.75rem;
  color: white;
  margin-bottom: 1.5rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  color: white;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.daily-stats {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
}

.day-card {
  text-align: center;
}

.day-header {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.day-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.day-stat-label {
  font-size: 0.75rem;
  color: #a0aec0;
}

.day-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.day-stat-value.new {
  color: #667eea;
}

.day-stat-value.review {
  color: #48bb78;
}

.proficiency-chart {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.proficiency-bar {
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: center;
  gap: 1rem;
}

.bar-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.875rem;
}

.bar-container {
  position: relative;
  height: 32px;
  background: #edf2f7;
  border-radius: 8px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
}

.bar-count {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.achievements {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.achievement {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: 0.4;
  transition: all 0.3s;
}

.achievement.unlocked {
  opacity: 1;
  border: 2px solid #667eea;
}

.achievement.unlocked:hover {
  transform: scale(1.05);
}

.achievement-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.achievement-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.achievement-desc {
  font-size: 0.75rem;
  color: #718096;
}

@media (max-width: 768px) {
  .daily-stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

