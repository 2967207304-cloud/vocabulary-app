<template>
  <div class="day-words-page">
    <div class="page-header">
      <button @click="goBack" class="btn-back">← 返回</button>
      <h2>第{{ dayNumber }}天 - {{ displayDate }}</h2>
    </div>

    <!-- 统计信息 -->
    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-icon">📚</span>
        <div class="stat-content">
          <span class="stat-number">{{ totalCount }}</span>
          <span class="stat-label">总单词数</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">✅</span>
        <div class="stat-content">
          <span class="stat-number">{{ completedCount }}</span>
          <span class="stat-label">已学习</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">⏳</span>
        <div class="stat-content">
          <span class="stat-number">{{ totalCount - completedCount }}</span>
          <span class="stat-label">未学习</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📊</span>
        <div class="stat-content">
          <span class="stat-number">{{ progressPercentage }}%</span>
          <span class="stat-label">完成度</span>
        </div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- 单词列表 -->
    <div class="words-list">
      <div
        v-for="(word, index) in dayWords"
        :key="word.id"
        :class="['word-card', { learned: word.reviewCount > 0 }]"
      >
        <div class="word-number">{{ index + 1 }}</div>
        <div class="word-content">
          <div class="word-header-row">
            <h3>{{ word.english }}</h3>
            <button @click="playWord(word.english)" class="btn-speaker">🔊</button>
          </div>
          <div class="word-details">
            <p v-if="word.phonetic" class="word-phonetic">{{ word.phonetic }}</p>
            <p v-if="word.partOfSpeech" class="word-pos">{{ word.partOfSpeech }}</p>
          </div>
          <p class="word-chinese">{{ word.chinese }}</p>
          <div v-if="word.reviewCount > 0" class="word-meta">
            <span class="proficiency-badge">{{ getProficiencyText(word.proficiency) }}</span>
            <span class="review-count">复习 {{ word.reviewCount }} 次</span>
          </div>
        </div>
        <div class="word-status">
          <span v-if="word.reviewCount > 0" class="status-icon learned">✅</span>
          <span v-else class="status-icon unlearned">⏳</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="dayWords.length === 0" class="empty-state">
        <p>该天暂无单词</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons" v-if="dayWords.length > 0">
      <router-link 
        v-if="isToday" 
        :to="`/?day=${dayNumber}`" 
        class="btn-action btn-primary"
      >
        开始学习这些单词 →
      </router-link>
      <button 
        v-else-if="!isCompleted" 
        class="btn-action btn-disabled" 
        disabled
      >
        ⏳ 等待到这一天
      </button>
      <router-link 
        v-else 
        :to="`/?day=${dayNumber}`" 
        class="btn-action btn-review"
      >
        复习这些单词 →
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVocabularyStore } from '../stores/vocabulary'
import { speakWord } from '../utils/speech'

const route = useRoute()
const router = useRouter()
const vocabularyStore = useVocabularyStore()

/**
 * 从路由参数获取天数
 */
const dayNumber = computed(() => {
  return parseInt(route.params.day as string) || 1
})

/**
 * 获取该天的数据
 */
const dayData = computed(() => {
  return vocabularyStore.learningCalendar.find(d => d.day === dayNumber.value)
})

const dayWords = computed(() => dayData.value?.words || [])
const totalCount = computed(() => dayData.value?.totalCount || 0)
const completedCount = computed(() => dayData.value?.completedCount || 0)
const displayDate = computed(() => dayData.value?.displayDate || '')
const isToday = computed(() => dayData.value?.status === 'today')
const isCompleted = computed(() => dayData.value?.status === 'completed')

/**
 * 完成度百分比
 */
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

/**
 * 播放单词发音
 */
const playWord = (word: string) => {
  speakWord(word)
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 获取熟练度文本
 */
const getProficiencyText = (level: number): string => {
  const levels = ['新词', '生疏', '一般', '熟悉', '掌握', '精通']
  return levels[level] || '新词'
}

/**
 * 页面加载时检查天数是否有效
 */
onMounted(() => {
  if (!dayData.value) {
    router.push('/review')
  }
})
</script>

<style scoped>
.day-words-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.btn-back {
  background: white;
  color: #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-back:hover {
  background: #667eea;
  color: white;
  transform: translateX(-4px);
}

.page-header h2 {
  font-size: 1.75rem;
  color: white;
  margin: 0;
}

/* 统计卡片 */
.stats-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 2.5rem;
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

/* 进度条 */
.progress-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.progress-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
}

/* 单词列表 */
.words-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.word-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
}

.word-card.learned {
  background: linear-gradient(to right, #f0fff4, white);
  border-color: #48bb78;
}

.word-card:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.word-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
}

.word-content {
  flex: 1;
}

.word-header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.word-header-row h3 {
  font-size: 1.75rem;
  color: #2d3748;
  margin: 0;
}

.btn-speaker {
  background: #f7fafc;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-speaker:hover {
  background: #667eea;
  transform: scale(1.1);
}

.word-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.word-phonetic {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.word-pos {
  color: #4299e1;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 600;
}

.word-chinese {
  color: #667eea;
  font-size: 1.25rem;
  margin: 0.5rem 0;
}

.word-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
}

.proficiency-badge {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.review-count {
  color: #718096;
  font-size: 0.875rem;
}

.word-status {
  flex-shrink: 0;
}

.status-icon {
  font-size: 2rem;
}

.status-icon.learned {
  color: #48bb78;
}

.status-icon.unlearned {
  color: #cbd5e0;
}

/* 空状态 */
.empty-state {
  background: white;
  padding: 4rem 2rem;
  border-radius: 16px;
  text-align: center;
  color: #718096;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-action {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.btn-review {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.btn-review:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(72, 187, 120, 0.4);
}

.btn-disabled {
  background: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .stats-card {
    grid-template-columns: repeat(2, 1fr);
  }

  .word-card {
    padding: 1.5rem;
  }

  .word-header-row h3 {
    font-size: 1.5rem;
  }
}
</style>

