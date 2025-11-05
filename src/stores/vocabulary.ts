import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Word, StudyRecord, DailyStats } from '../types'
import { REVIEW_INTERVALS } from '../types'

/**
 * 单词库 Store
 */
export const useVocabularyStore = defineStore('vocabulary', () => {
  // 状态
  const words = ref<Word[]>([])
  const studyRecords = ref<StudyRecord[]>([])
  const dailyStats = ref<DailyStats[]>([])

  /**
   * 生成唯一ID
   */
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * 计算下次复习时间
   * @param proficiency 熟练度等级 (0-5)
   * @returns 下次复习的时间戳
   */
  const calculateNextReview = (proficiency: number): number => {
    const interval = REVIEW_INTERVALS[Math.min(proficiency, REVIEW_INTERVALS.length - 1)]
    return Date.now() + interval * 60 * 60 * 1000
  }

  /**
   * 添加新单词
   */
  const addWord = (english: string, chinese: string, phonetic?: string, partOfSpeech?: string): Word => {
    const word: Word = {
      id: generateId(),
      english: english.trim(),
      phonetic: phonetic?.trim(),
      partOfSpeech: partOfSpeech?.trim(),
      chinese: chinese.trim(),
      createdAt: Date.now(),
      proficiency: 0,
      nextReviewAt: calculateNextReview(0),
      reviewCount: 0
    }
    words.value.push(word)
    updateDailyStats('newWords')
    return word
  }

  /**
   * 批量导入单词
   */
  const batchAddWords = (wordList: Array<{ english: string; phonetic?: string; partOfSpeech?: string; chinese: string }>): number => {
    let count = 0
    wordList.forEach(item => {
      // 检查是否已存在
      const exists = words.value.some(w => w.english.toLowerCase() === item.english.toLowerCase())
      if (!exists) {
        addWord(item.english, item.chinese, item.phonetic, item.partOfSpeech)
        count++
      }
    })
    return count
  }

  /**
   * 删除单词
   */
  const deleteWord = (id: string) => {
    const index = words.value.findIndex(w => w.id === id)
    if (index > -1) {
      words.value.splice(index, 1)
      // 同时删除相关的学习记录
      studyRecords.value = studyRecords.value.filter(r => r.wordId !== id)
    }
  }

  /**
   * 更新单词
   */
  const updateWord = (id: string, updates: Partial<Word>) => {
    const word = words.value.find(w => w.id === id)
    if (word) {
      Object.assign(word, updates)
    }
  }

  /**
   * 记录学习
   */
  const recordStudy = (wordId: string, remembered: boolean, duration: number) => {
    const word = words.value.find(w => w.id === wordId)
    if (!word) return

    // 创建学习记录
    const record: StudyRecord = {
      id: generateId(),
      wordId,
      studyAt: Date.now(),
      remembered,
      duration
    }
    studyRecords.value.push(record)

    // 更新单词状态
    word.reviewCount++
    word.lastReviewAt = Date.now()
    
    if (remembered) {
      // 记住了,提升熟练度
      word.proficiency = Math.min(word.proficiency + 1, REVIEW_INTERVALS.length - 1)
    } else {
      // 忘记了,降低熟练度
      word.proficiency = Math.max(word.proficiency - 1, 0)
    }
    
    // 计算下次复习时间
    word.nextReviewAt = calculateNextReview(word.proficiency)

    // 更新每日统计
    updateDailyStats('reviewedWords')
  }

  /**
   * 更新每日统计
   */
  const updateDailyStats = (type: 'newWords' | 'reviewedWords') => {
    const today = new Date().toISOString().split('T')[0]
    let stats = dailyStats.value.find(s => s.date === today)
    
    if (!stats) {
      stats = {
        newWords: 0,
        reviewedWords: 0,
        studyTime: 0,
        date: today
      }
      dailyStats.value.push(stats)
    }

    if (type === 'newWords') {
      stats.newWords++
    } else {
      stats.reviewedWords++
    }
  }

  // 计算属性
  
  /**
   * 需要复习的单词
   */
  const wordsToReview = computed(() => {
    const now = Date.now()
    return words.value.filter(w => w.nextReviewAt <= now)
  })

  /**
   * 今日新增单词
   */
  const todayNewWords = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    return words.value.filter(w => w.createdAt >= today)
  })

  /**
   * 今日统计
   */
  const todayStats = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return dailyStats.value.find(s => s.date === today) || {
      newWords: 0,
      reviewedWords: 0,
      studyTime: 0,
      date: today
    }
  })

  /**
   * 总单词数
   */
  const totalWords = computed(() => words.value.length)

  /**
   * 已掌握单词数 (熟练度 >= 5)
   */
  const masteredWords = computed(() => {
    return words.value.filter(w => w.proficiency >= 5).length
  })

  /**
   * 每日新单词学习限制
   */
  const DAILY_NEW_WORDS_LIMIT = 25

  /**
   * 获取今日可学习的新单词（限制每天25个）
   */
  const getTodayNewWordsToLearn = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    const todayLearned = studyRecords.value.filter(r => r.studyAt >= today).map(r => r.wordId)
    const unlearnedWords = words.value.filter(w => w.reviewCount === 0 && !todayLearned.includes(w.id))
    return unlearnedWords.slice(0, DAILY_NEW_WORDS_LIMIT) // 每天最多25个新单词
  })

  /**
   * 未学习的单词总数
   */
  const unlearnedWordsCount = computed(() => {
    return words.value.filter(w => w.reviewCount === 0).length
  })

  /**
   * 学习计划：总共需要多少天
   */
  const totalDaysNeeded = computed(() => {
    return Math.ceil(unlearnedWordsCount.value / DAILY_NEW_WORDS_LIMIT)
  })

  /**
   * 学习计划：当前是第几天
   */
  const currentDayNumber = computed(() => {
    const learnedCount = words.value.filter(w => w.reviewCount > 0).length
    return Math.floor(learnedCount / DAILY_NEW_WORDS_LIMIT) + 1
  })

  /**
   * 今日已学习的新单词数量
   */
  const todayLearnedNewWordsCount = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    const todayRecords = studyRecords.value.filter(r => r.studyAt >= today)
    const todayNewWords = todayRecords.filter(record => {
      const word = words.value.find(w => w.id === record.wordId)
      return word && word.reviewCount === 1 // 复习次数为1表示是今天第一次学
    })
    return todayNewWords.length
  })

  /**
   * 今日学习进度（新单词）
   */
  const todayProgress = computed(() => {
    const planned = Math.min(unlearnedWordsCount.value, DAILY_NEW_WORDS_LIMIT)
    const learned = todayLearnedNewWordsCount.value
    return {
      planned, // 今日计划学习数量
      learned, // 已完成数量
      remaining: planned - learned, // 剩余数量
      percentage: planned > 0 ? Math.round((learned / planned) * 100) : 100 // 完成百分比
    }
  })

  /**
   * 生成学习日历
   * 返回每天的学习计划，包括日期、单词列表、学习状态
   */
  const learningCalendar = computed(() => {
    const calendar: Array<{
      day: number // 第几天
      date: string // 日期（YYYY-MM-DD）
      displayDate: string // 显示的日期
      words: Word[] // 该天要学习的单词
      status: 'completed' | 'today' | 'upcoming' // 学习状态
      completedCount: number // 已完成数量
      totalCount: number // 总数量
    }> = []

    // 获取所有未学习的单词，按创建时间排序
    const unlearnedWords = words.value
      .filter(w => w.reviewCount === 0)
      .sort((a, b) => a.createdAt - b.createdAt)

    // 获取所有已学习的单词，按第一次学习时间排序
    const learnedWords = words.value
      .filter(w => w.reviewCount > 0)
      .sort((a, b) => (a.lastReviewAt || 0) - (b.lastReviewAt || 0))

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    // 计算总天数
    const totalDays = Math.ceil((unlearnedWords.length + learnedWords.length) / DAILY_NEW_WORDS_LIMIT)

    // 生成每一天的数据
    for (let day = 1; day <= totalDays; day++) {
      const startIndex = (day - 1) * DAILY_NEW_WORDS_LIMIT
      const endIndex = Math.min(day * DAILY_NEW_WORDS_LIMIT, unlearnedWords.length + learnedWords.length)

      // 计算日期
      const dayDate = new Date(today)
      dayDate.setDate(dayDate.getDate() + (day - currentDayNumber.value))
      const dateStr = dayDate.toISOString().split('T')[0]
      
      // 格式化显示日期
      let displayDate = ''
      if (dayDate.getTime() === todayTimestamp) {
        displayDate = '今天'
      } else if (dayDate.getTime() === todayTimestamp + 24 * 60 * 60 * 1000) {
        displayDate = '明天'
      } else if (dayDate.getTime() === todayTimestamp - 24 * 60 * 60 * 1000) {
        displayDate = '昨天'
      } else {
        displayDate = `${dayDate.getMonth() + 1}月${dayDate.getDate()}日`
      }

      // 获取该天的单词
      let dayWords: Word[] = []
      const learnedCount = learnedWords.length
      
      if (startIndex < learnedCount) {
        // 这天的单词在已学习列表中
        dayWords = learnedWords.slice(startIndex, Math.min(endIndex, learnedCount))
      }
      
      if (endIndex > learnedCount) {
        // 这天的单词部分或全部在未学习列表中
        const unlearnedStart = Math.max(0, startIndex - learnedCount)
        const unlearnedEnd = endIndex - learnedCount
        dayWords = [...dayWords, ...unlearnedWords.slice(unlearnedStart, unlearnedEnd)]
      }

      // 判断状态
      let status: 'completed' | 'today' | 'upcoming' = 'upcoming'
      let completedCount = 0

      if (day < currentDayNumber.value) {
        status = 'completed'
        completedCount = dayWords.length
      } else if (day === currentDayNumber.value) {
        status = 'today'
        completedCount = dayWords.filter(w => w.reviewCount > 0).length
      }

      calendar.push({
        day,
        date: dateStr,
        displayDate,
        words: dayWords,
        status,
        completedCount,
        totalCount: dayWords.length
      })
    }

    return calendar
  })

  return {
    // 状态
    words,
    studyRecords,
    dailyStats,
    
    // 常量
    DAILY_NEW_WORDS_LIMIT,
    
    // 计算属性
    wordsToReview,
    todayNewWords,
    todayStats,
    totalWords,
    masteredWords,
    getTodayNewWordsToLearn,
    unlearnedWordsCount,
    totalDaysNeeded,
    currentDayNumber,
    todayLearnedNewWordsCount,
    todayProgress,
    learningCalendar,
    
    // 方法
    addWord,
    batchAddWords,
    deleteWord,
    updateWord,
    recordStudy
  }
}, {
  persist: true // 启用持久化
})

