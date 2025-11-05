/**
 * 语音工具函数
 */

/**
 * 使用 Web Speech API 朗读单词
 * @param text 要朗读的文本
 * @param lang 语言代码，默认为英语
 */
export const speakWord = (text: string, lang: string = 'en-US'): void => {
  // 检查浏览器是否支持 Web Speech API
  if (!('speechSynthesis' in window)) {
    console.error('浏览器不支持语音合成功能')
    alert('您的浏览器不支持语音播放功能')
    return
  }

  // 取消当前正在播放的语音
  window.speechSynthesis.cancel()

  // 创建语音合成实例
  const utterance = new SpeechSynthesisUtterance(text)
  
  // 设置语言
  utterance.lang = lang
  
  // 设置语速（0.1 - 10，默认 1）
  utterance.rate = 0.8
  
  // 设置音调（0 - 2，默认 1）
  utterance.pitch = 1
  
  // 设置音量（0 - 1，默认 1）
  utterance.volume = 1

  // 播放语音
  window.speechSynthesis.speak(utterance)
}

/**
 * 停止当前语音播放
 */
export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

