<template>
  <div class="words-page">
    <div class="page-header">
      <h2>📚 单词库</h2>
      <button @click="showAddModal = true" class="btn-primary">➕ 添加单词</button>
    </div>

    <div class="stats-bar">
      <span>总计: {{ vocabularyStore.totalWords }} 个</span>
      <span>已掌握: {{ vocabularyStore.masteredWords }} 个</span>
    </div>

    <!-- 单词列表 -->
    <div class="words-list">
      <div v-for="word in sortedWords" :key="word.id" class="word-item">
        <div class="word-info">
          <div class="word-header-row">
            <h3 class="word-english">{{ word.english }}</h3>
            <button @click="playWord(word.english)" class="btn-speaker-small" title="发音">
              🔊
            </button>
          </div>
          <div class="word-details">
            <span v-if="word.phonetic" class="word-phonetic">{{ word.phonetic }}</span>
            <span v-if="word.partOfSpeech" class="word-pos">{{ word.partOfSpeech }}</span>
          </div>
          <p class="word-chinese">{{ word.chinese }}</p>
          <div class="word-meta">
            <span class="proficiency">熟练度: {{ getProficiencyText(word.proficiency) }}</span>
            <span class="review-count">复习: {{ word.reviewCount }}次</span>
            <span class="next-review">下次: {{ formatNextReview(word.nextReviewAt) }}</span>
          </div>
        </div>
        <div class="word-actions">
          <button @click="deleteWordConfirm(word.id)" class="btn-delete">删除</button>
        </div>
      </div>

      <div v-if="vocabularyStore.totalWords === 0" class="empty-list">
        <p>还没有添加单词,点击上方按钮开始添加吧!</p>
      </div>
    </div>

    <!-- 添加单词弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <h3>添加新单词</h3>
        <form @submit.prevent="handleAddWord">
          <div class="form-group">
            <label>英文单词 <span class="required">*</span></label>
            <input
              v-model="newWord.english"
              type="text"
              placeholder="例: natural"
              required
              autofocus
            />
          </div>
          <div class="form-group">
            <label>音标</label>
            <input
              v-model="newWord.phonetic"
              type="text"
              placeholder="例: [ˈnætʃrəl]"
            />
          </div>
          <div class="form-group">
            <label>词性</label>
            <input
              v-model="newWord.partOfSpeech"
              type="text"
              placeholder="例: adj."
            />
          </div>
          <div class="form-group">
            <label>中文释义 <span class="required">*</span></label>
            <input
              v-model="newWord.chinese"
              type="text"
              placeholder="例: 自然的，天然的"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddModal = false" class="btn-cancel">
              取消
            </button>
            <button type="submit" class="btn-submit">添加</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVocabularyStore } from '../stores/vocabulary'
import { speakWord } from '../utils/speech'

const vocabularyStore = useVocabularyStore()

const showAddModal = ref(false)
const newWord = ref({
  english: '',
  phonetic: '',
  partOfSpeech: '',
  chinese: ''
})

/**
 * 按创建时间倒序排列
 */
const sortedWords = computed(() => {
  return [...vocabularyStore.words].sort((a, b) => b.createdAt - a.createdAt)
})

/**
 * 获取熟练度文本
 */
const getProficiencyText = (level: number): string => {
  const levels = ['新词', '生疏', '一般', '熟悉', '掌握', '精通']
  return levels[level] || '新词'
}

/**
 * 格式化下次复习时间
 */
const formatNextReview = (timestamp: number): string => {
  const now = Date.now()
  const diff = timestamp - now
  
  if (diff <= 0) return '现在'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天后`
  if (hours > 0) return `${hours}小时后`
  
  const minutes = Math.floor(diff / (1000 * 60))
  return `${minutes}分钟后`
}

/**
 * 播放单词发音
 */
const playWord = (word: string) => {
  speakWord(word)
}

/**
 * 添加单词
 */
const handleAddWord = () => {
  if (!newWord.value.english.trim() || !newWord.value.chinese.trim()) {
    return
  }
  
  vocabularyStore.addWord(
    newWord.value.english, 
    newWord.value.chinese,
    newWord.value.phonetic,
    newWord.value.partOfSpeech
  )
  
  // 重置表单
  newWord.value = {
    english: '',
    phonetic: '',
    partOfSpeech: '',
    chinese: ''
  }
  
  showAddModal.value = false
}

/**
 * 删除单词确认
 */
const deleteWordConfirm = (id: string) => {
  if (confirm('确定要删除这个单词吗?')) {
    vocabularyStore.deleteWord(id)
  }
}
</script>

<style scoped>
.words-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.75rem;
  color: white;
}

.btn-primary {
  background: white;
  color: #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.stats-bar {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stats-bar span {
  color: #4a5568;
  font-weight: 500;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.word-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.word-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.word-info {
  flex: 1;
}

.word-header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.word-english {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.btn-speaker-small {
  background: #f7fafc;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-speaker-small:hover {
  background: #667eea;
  transform: scale(1.1);
}

.word-details {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.word-phonetic {
  color: #718096;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

.word-pos {
  color: #4299e1;
  font-size: 0.875rem;
  font-weight: 600;
}

.word-chinese {
  color: #667eea;
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
}

.word-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #718096;
}

.word-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-delete {
  padding: 0.5rem 1rem;
  background: #fc8181;
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #f56565;
}

.empty-list {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  color: #718096;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.form-group label .required {
  color: #fc8181;
  margin-left: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-cancel {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover {
  background: #cbd5e0;
}

.btn-submit {
  background: #667eea;
  color: white;
}

.btn-submit:hover {
  background: #5a67d8;
}
</style>

