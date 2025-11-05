<template>
  <div class="import-page">
    <div class="page-header">
      <h2>📥 批量导入单词</h2>
    </div>

    <div class="import-container">
      <div class="instructions">
        <h3>📋 导入说明</h3>
        <p>请按照以下格式粘贴单词数据，每行一个单词：</p>
        <code>单词 [音标] 词性. 中文释义</code>
        <p class="example">示例：</p>
        <pre>natural [ˈnætʃrəl] adj. 自然的，天然的
scenery [ˈsiːnəri] n. 景色，风景</pre>
        <p class="note">💡 提示：音标和词性为可选项，但建议填写以获得更好的学习体验</p>
      </div>

      <div class="import-form">
        <textarea
          v-model="importText"
          placeholder="在此粘贴单词列表..."
          rows="15"
        ></textarea>
        
        <div class="import-actions">
          <button @click="handleClear" class="btn-clear">清空</button>
          <button @click="handlePreview" class="btn-preview">预览 ({{ parsedWords.length }})</button>
          <button @click="handleImport" class="btn-import" :disabled="parsedWords.length === 0">
            导入单词
          </button>
        </div>
      </div>

      <!-- 预览弹窗 -->
      <div v-if="showPreview" class="modal-overlay" @click="showPreview = false">
        <div class="modal-content preview-modal" @click.stop>
          <h3>预览导入内容 (共 {{ parsedWords.length }} 个单词)</h3>
          <div class="preview-list">
            <div v-for="(word, index) in parsedWords" :key="index" class="preview-item">
              <div class="preview-english">
                {{ word.english }}
                <span v-if="word.phonetic" class="preview-phonetic">{{ word.phonetic }}</span>
                <span v-if="word.partOfSpeech" class="preview-pos">{{ word.partOfSpeech }}</span>
              </div>
              <div class="preview-chinese">{{ word.chinese }}</div>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showPreview = false" class="btn-close">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVocabularyStore } from '../stores/vocabulary'
import { useRouter } from 'vue-router'

const vocabularyStore = useVocabularyStore()
const router = useRouter()

const importText = ref('')
const showPreview = ref(false)

/**
 * 解析导入的文本
 */
const parsedWords = computed(() => {
  if (!importText.value.trim()) return []

  const lines = importText.value.split('\n')
  const words: Array<{ english: string; phonetic?: string; partOfSpeech?: string; chinese: string }> = []

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return

    // 正则表达式匹配格式：单词 [音标] 词性. 中文释义
    // 或者：单词 [音标] 中文释义
    // 或者：单词 词性. 中文释义
    // 或者：单词 中文释义
    const regex = /^(\S+)\s*(?:\[([^\]]+)\])?\s*(?:([a-z]+\.?))?\s+(.+)$/i
    const match = trimmed.match(regex)

    if (match) {
      const [, english, phonetic, partOfSpeech, chinese] = match
      words.push({
        english: english.trim(),
        phonetic: phonetic?.trim(),
        partOfSpeech: partOfSpeech?.trim(),
        chinese: chinese.trim()
      })
    }
  })

  return words
})

/**
 * 清空输入
 */
const handleClear = () => {
  if (importText.value && !confirm('确定要清空输入内容吗？')) {
    return
  }
  importText.value = ''
}

/**
 * 预览
 */
const handlePreview = () => {
  if (parsedWords.value.length === 0) {
    alert('请先输入要导入的单词')
    return
  }
  showPreview.value = true
}

/**
 * 执行导入
 */
const handleImport = () => {
  if (parsedWords.value.length === 0) {
    alert('请先输入要导入的单词')
    return
  }

  const count = vocabularyStore.batchAddWords(parsedWords.value)
  
  if (count > 0) {
    alert(`成功导入 ${count} 个单词！`)
    importText.value = ''
    router.push('/words')
  } else {
    alert('没有新单词被导入（可能都已存在）')
  }
}
</script>

<style scoped>
.import-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 1.75rem;
  color: white;
}

.import-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.instructions {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
}

.instructions h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.instructions p {
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.instructions code {
  display: block;
  background: #f7fafc;
  padding: 0.75rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  color: #667eea;
  margin: 1rem 0;
}

.instructions .example {
  font-weight: 600;
  margin-top: 1.5rem;
}

.instructions pre {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #2d3748;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.instructions .note {
  background: #fef5e7;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #f39c12;
  font-size: 0.875rem;
  margin-top: 1.5rem;
}

.import-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.import-form textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  resize: vertical;
  margin-bottom: 1rem;
}

.import-form textarea:focus {
  outline: none;
  border-color: #667eea;
}

.import-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.import-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-clear {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-clear:hover {
  background: #cbd5e0;
}

.btn-preview {
  background: #4299e1;
  color: white;
}

.btn-preview:hover {
  background: #3182ce;
}

.btn-import {
  background: #667eea;
  color: white;
}

.btn-import:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-import:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 预览弹窗 */
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
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.preview-modal {
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.preview-modal h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.preview-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.preview-item {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-english {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.preview-phonetic {
  color: #718096;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.5rem;
}

.preview-pos {
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.preview-chinese {
  color: #4a5568;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #5a67d8;
}

@media (max-width: 768px) {
  .import-container {
    grid-template-columns: 1fr;
  }
}
</style>

