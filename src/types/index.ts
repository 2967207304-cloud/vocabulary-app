/**
 * 单词接口定义
 */
export interface Word {
  /** 单词ID */
  id: string
  /** 英文单词 */
  english: string
  /** 音标 */
  phonetic?: string
  /** 词性 */
  partOfSpeech?: string
  /** 中文释义 */
  chinese: string
  /** 添加时间 */
  createdAt: number
  /** 熟练度(0-5) */
  proficiency: number
  /** 下次复习时间 */
  nextReviewAt: number
  /** 复习次数 */
  reviewCount: number
  /** 上次复习时间 */
  lastReviewAt?: number
}

/**
 * 学习记录接口定义
 */
export interface StudyRecord {
  /** 记录ID */
  id: string
  /** 单词ID */
  wordId: string
  /** 学习时间 */
  studyAt: number
  /** 是否记住 */
  remembered: boolean
  /** 耗时(秒) */
  duration: number
}

/**
 * 复习间隔配置 (基于艾宾浩斯遗忘曲线)
 * 单位: 小时
 */
export const REVIEW_INTERVALS = [
  0.1,    // 5分钟后
  0.5,    // 30分钟后
  12,     // 12小时后
  24,     // 1天后
  48,     // 2天后
  96,     // 4天后
  168,    // 7天后
  336,    // 14天后
  720,    // 30天后
]

/**
 * 今日学习统计
 */
export interface DailyStats {
  /** 新学单词数 */
  newWords: number
  /** 复习单词数 */
  reviewedWords: number
  /** 学习时长(分钟) */
  studyTime: number
  /** 日期 */
  date: string
}

