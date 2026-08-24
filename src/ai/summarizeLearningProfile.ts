import type { LearningProfileSummary } from '../types/learning'

type ProfileField = keyof LearningProfileSummary

export function summarizeProfileField(
  field: ProfileField,
  answer: string
): string {
  const cleanedAnswer = answer.trim()

  if (!cleanedAnswer) {
    return ''
  }

  switch (field) {
    case 'topic':
      return summarizeTopic(cleanedAnswer)

    case 'motivation':
      return summarizeMotivation(cleanedAnswer)

    case 'outcome':
      return summarizeOutcome(cleanedAnswer)

    case 'duration':
      return summarizeDuration(cleanedAnswer)

    case 'dailyTime':
      return summarizeDailyTime(cleanedAnswer)

    default:
      return cleanedAnswer
  }
}

function summarizeTopic(answer: string): string {
  if (answer.includes('英文口說')) {
    return '英文口說'
  }

  if (answer.includes('英文寫作')) {
    return '英文寫作'
  }

  if (answer.includes('學術英文')) {
    return '學術英文'
  }

  if (answer.includes('Python')) {
    return 'Python'
  }

  if (answer.includes('統計')) {
    return '統計分析'
  }

  if (answer.includes('簡報')) {
    return '簡報設計'
  }

  return shortenText(answer, 16)
}

function summarizeMotivation(answer: string): string {
  if (
    answer.includes('交換') ||
    answer.includes('留學') ||
    answer.includes('國外')
  ) {
    return '海外學習／交流'
  }

  if (
    answer.includes('工作') ||
    answer.includes('職場') ||
    answer.includes('職涯')
  ) {
    return '工作／職涯需求'
  }

  if (
    answer.includes('考試') ||
    answer.includes('證照') ||
    answer.toLowerCase().includes('toeic')
  ) {
    return '考試／證照需求'
  }

  if (
    answer.includes('研討會') ||
    answer.includes('研究') ||
    answer.includes('學術')
  ) {
    return '學術交流需求'
  }

  if (
    answer.includes('興趣') ||
    answer.includes('喜歡')
  ) {
    return '個人興趣'
  }

  return shortenText(answer, 18)
}

function summarizeOutcome(answer: string): string {
  // 預期成果會直接影響後續學習目標，
  // 保留完整內容，由介面自然換行。
  return answer
}

function summarizeDuration(answer: string): string {
  const monthMatch = answer.match(/(\d+|一|二|三|四|五|六|七|八|九|十)\s*個?月/)
  if (monthMatch) {
    return normalizeNumber(monthMatch[1]) + ' 個月'
  }

  const weekMatch = answer.match(/(\d+|一|二|三|四|五|六|七|八|九|十)\s*週/)
  if (weekMatch) {
    return normalizeNumber(weekMatch[1]) + ' 週'
  }

  const yearMatch = answer.match(/(\d+|一|二|三)\s*年/)
  if (yearMatch) {
    return normalizeNumber(yearMatch[1]) + ' 年'
  }

  return shortenText(answer, 12)
}

function summarizeDailyTime(answer: string): string {
  const minuteMatch = answer.match(
    /每天.*?(\d+|十|二十|三十|四十|五十|六十)\s*分/
  )

  if (minuteMatch) {
    return `每天 ${normalizeNumber(minuteMatch[1])} 分鐘`
  }

  const hourMatch = answer.match(
    /每天.*?(\d+|一|二|三)\s*小時/
  )

  if (hourMatch) {
    return `每天 ${normalizeNumber(hourMatch[1])} 小時`
  }

  if (
    answer.includes('平日') &&
    answer.includes('30')
  ) {
    return '平日 30 分鐘'
  }

  return shortenText(answer, 14)
}

function normalizeNumber(value: string): string {
  const numberMap: Record<string, string> = {
    一: '1',
    二: '2',
    三: '3',
    四: '4',
    五: '5',
    六: '6',
    七: '7',
    八: '8',
    九: '9',
    十: '10',
    二十: '20',
    三十: '30',
    四十: '40',
    五十: '50',
    六十: '60',
  }

  return numberMap[value] ?? value
}

function shortenText(
  text: string,
  maxLength: number
): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength)}…`
}
