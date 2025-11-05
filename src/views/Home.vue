<template>
  <div class="home">
    <div class="welcome-card">
      <h2 v-if="!route.query.day">📖 今日学习 - 第 {{ vocabularyStore.currentDayNumber }} 天</h2>
      <h2 v-else>📖 学习第 {{ route.query.day }} 天的单词</h2>
      
      <!-- 今日目标进度 -->
      <div class="daily-goal">
        <div class="goal-header">
          <span class="goal-title">🎯 今日目标</span>
          <span class="goal-progress">{{ vocabularyStore.todayProgress.learned }}/{{ vocabularyStore.todayProgress.planned }}</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: vocabularyStore.todayProgress.percentage + '%' }"
          ></div>
        </div>
        <div class="goal-detail">
          <span>计划学习: {{ vocabularyStore.todayProgress.planned }} 个新单词</span>
          <span>剩余: {{ vocabularyStore.todayProgress.remaining }} 个</span>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ vocabularyStore.todayProgress.learned }}</span>
          <span class="stat-label">今日新学</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ vocabularyStore.todayStats.reviewedWords }}</span>
          <span class="stat-label">已复习</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ vocabularyStore.wordsToReview.length }}</span>
          <span class="stat-label">待复习</span>
        </div>
      </div>

      <!-- 学习计划提示 -->
      <div class="plan-hint" v-if="vocabularyStore.unlearnedWordsCount > 0">
        <span class="hint-icon">💡</span>
        <span class="hint-text">
          还有 {{ vocabularyStore.unlearnedWordsCount }} 个单词未学习，
          按计划需要 {{ vocabularyStore.totalDaysNeeded }} 天完成
        </span>
      </div>
    </div>

    <!-- 背诵卡片区域 -->
    <div v-if="currentWord" class="study-card">
      <div class="card-header">
        <span class="progress">{{ currentIndex + 1 }} / {{ studyList.length }}</span>
      </div>
      
      <div class="card-content" @click="toggleShow">
        <div class="word-display">
          <div class="word-header">
            <h1 class="english">{{ currentWord.english }}</h1>
            <button @click.stop="playPronunciation" class="btn-speaker" title="发音">
              🔊
            </button>
          </div>
          <transition name="fade">
            <div v-if="showAnswer" class="answer-section">
              <p v-if="currentWord.phonetic" class="phonetic">{{ currentWord.phonetic }}</p>
              <p v-if="currentWord.partOfSpeech" class="part-of-speech">{{ currentWord.partOfSpeech }}</p>
              <p class="chinese">{{ currentWord.chinese }}</p>
            </div>
          </transition>
          <p v-if="!showAnswer" class="hint">点击卡片显示答案</p>
        </div>
      </div>

      <div v-if="showAnswer" class="card-actions">
        <button @click="handleForgot" class="btn btn-forgot">😞 忘记了</button>
        <button @click="handleRemembered" class="btn btn-remembered">😊 记住了</button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎉</div>
      <h3>太棒了!</h3>
      <p v-if="vocabularyStore.totalWords === 0">
        还没有添加单词,去<router-link to="/words">单词库</router-link>添加一些吧!
      </p>
      <p v-else>
        今天的学习任务已完成!<br>
        明天再来吧~
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVocabularyStore } from '../stores/vocabulary'
import { speakWord } from '../utils/speech'
import type { Word } from '../types'

const route = useRoute()
const vocabularyStore = useVocabularyStore()

const currentIndex = ref(0)
const showAnswer = ref(false)
const startTime = ref(Date.now())

/**
 * 学习列表 = 待复习单词 + 今日新单词（限25个）
 * 如果URL中指定了天数，则只学习那一天的单词
 */
const studyList = computed<Word[]>(() => {
  // 检查是否指定了学习特定天的单词
  const dayParam = route.query.day
  if (dayParam) {
    const dayNumber = parseInt(dayParam as string)
    const dayData = vocabularyStore.learningCalendar.find(d => d.day === dayNumber)
    if (dayData) {
      // 只返回这一天的单词
      return dayData.words
    }
  }
  
  // 默认：待复习 + 今日新单词
  const reviewWords = vocabularyStore.wordsToReview
  const newWords = vocabularyStore.getTodayNewWordsToLearn
  return [...reviewWords, ...newWords]
})

const currentWord = computed(() => {
  return studyList.value[currentIndex.value] || null
})

/**
 * 播放发音
 */
const playPronunciation = () => {
  if (currentWord.value) {
    speakWord(currentWord.value.english)
  }
}

/**
 * 切换显示答案
 */
const toggleShow = () => {
  if (!showAnswer.value) {
    showAnswer.value = true
  }
}

/**
 * 记住了
 */
const handleRemembered = () => {
  if (!currentWord.value) return
  
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  vocabularyStore.recordStudy(currentWord.value.id, true, duration)
  nextWord()
}

/**
 * 忘记了
 */
const handleForgot = () => {
  if (!currentWord.value) return
  
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  vocabularyStore.recordStudy(currentWord.value.id, false, duration)
  nextWord()
}

/**
 * 下一个单词
 */
const nextWord = () => {
  showAnswer.value = false
  startTime.value = Date.now()
  
  if (currentIndex.value < studyList.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

onMounted(() => {
  startTime.value = Date.now()
})
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.welcome-card h2 {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

/* 今日目标进度 */
.daily-goal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.goal-title {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
}

.goal-progress {
  color: #ffd700;
  font-size: 1.5rem;
  font-weight: 700;
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-bar .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.goal-detail {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

/* 学习计划提示 */
.plan-hint {
  background: #fef5e7;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  border-left: 4px solid #f39c12;
}

.hint-icon {
  font-size: 1.5rem;
}

.hint-text {
  color: #856404;
  font-size: 0.875rem;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.study-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.card-header {
  text-align: right;
  margin-bottom: 1rem;
}

.progress {
  color: #718096;
  font-weight: 500;
}

.card-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.word-display {
  text-align: center;
  width: 100%;
}

.word-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.english {
  font-size: 3rem;
  color: #2d3748;
  margin: 0;
  font-weight: 700;
}

.btn-speaker {
  font-size: 1.5rem;
  background: #f7fafc;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
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

.answer-section {
  margin-top: 1rem;
}

.phonetic {
  font-size: 1.125rem;
  color: #718096;
  margin: 0.5rem 0;
  font-family: 'Courier New', monospace;
}

.part-of-speech {
  font-size: 1rem;
  color: #4299e1;
  margin: 0.5rem 0;
  font-weight: 600;
}

.chinese {
  font-size: 1.5rem;
  color: #667eea;
  margin-top: 1rem;
}

.hint {
  color: #a0aec0;
  font-size: 1rem;
  margin-top: 2rem;
}

.card-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-forgot {
  background: #fc8181;
  color: white;
}

.btn-forgot:hover {
  background: #f56565;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(252, 129, 129, 0.4);
}

.btn-remembered {
  background: #68d391;
  color: white;
}

.btn-remembered:hover {
  background: #48bb78;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(104, 211, 145, 0.4);
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #718096;
  line-height: 1.8;
}

.empty-state a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

