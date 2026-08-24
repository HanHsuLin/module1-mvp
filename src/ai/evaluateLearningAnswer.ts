import type { LearningProfile } from '../types/learning'

export type AnswerQuality =
  | 'valid'
  | 'insufficient'
  | 'invalid'

export type EvaluationResult = {
  quality:
    | 'valid'
    | 'insufficient'
    | 'invalid'
    | 'needs_confirmation'

  feedback?: string
}

type ProfileField = Exclude<
  keyof LearningProfile,
  'topic'
>

export function evaluateLearningAnswer(
  field: ProfileField,
  answer: string
): EvaluationResult {
  const cleanedAnswer = answer.trim()

  /*
   * 第一層：
   * 明顯無效、亂填或無法判斷的回答
   */
  if (isInvalidAnswer(cleanedAnswer)) {
    return {
      quality: 'invalid',
      feedback: getInvalidFeedback(field),
    }
  }

  /*
   * 第二層：
   * 判斷回答是否真的符合目前詢問的欄位
   */
  switch (field) {
    case 'motivation':
      return evaluateMotivation(cleanedAnswer)

    case 'outcome':
      return evaluateOutcome(cleanedAnswer)

    case 'duration':
      return evaluateDuration(cleanedAnswer)

    case 'dailyTime':
      return evaluateDailyTime(cleanedAnswer)

    default:
      return {
        quality: 'invalid',
        feedback: '我還需要更明確的資訊，可以再說明一下嗎？',
      }
  }
}


/* ==================================================
   INVALID ANSWER
   ================================================== */

function isInvalidAnswer(answer: string): boolean {
  const normalized = answer
    .replace(/\s/g, '')
    .toLowerCase()

  if (normalized.length < 2) {
    return true
  }

  const invalidAnswers = [
    '不知道',
    '不知道欸',
    '不知道耶',
    '不知道啊',
    '不確定',
    '隨便',
    '都可以',
    '都好',
    '沒有',
    '沒想法',
    '不清楚',
    '哈哈',
    '哈哈哈',
    '呵呵',
    'test',
    '測試',
    '隨便填',
  ]

  if (invalidAnswers.includes(normalized)) {
    return true
  }

  /*
   * 純數字。
   *
   * 注意：
   * duration / dailyTime 的「6」「30」
   * 現階段也不直接接受，
   * 因為不知道是 6 天、6 月，
   * 或 30 分鐘、30 小時。
   */
  if (/^\d+$/.test(normalized)) {
    return true
  }

  /*
   * 單一字元大量重複
   * 例如：哈哈哈哈、aaaaaa
   */
  if (/^(.)\1{3,}$/.test(normalized)) {
    return true
  }

  /*
   * 只有符號
   */
  if (/^[^\p{L}\p{N}]+$/u.test(normalized)) {
    return true
  }

  return false
}


/* ==================================================
   MOTIVATION
   為什麼想學？
   ================================================== */

function evaluateMotivation(
  answer: string
): EvaluationResult {

  // 回答主要是在講時間，不是學習動機
  if (
    containsDuration(answer) ||
    containsDailyTime(answer)
  ) {
    return {
      quality: 'insufficient',
      feedback:
        '你提到了學習時間，不過我現在想先了解你為什麼想學這個主題。可以說說你希望在哪種情境使用它嗎？',
    }
  }

  const normalized = answer.replace(/\s+/g, '')

  /*
   * 第一層：判斷是否只有非常簡短、模糊的動機。
   *
   * 例如：
   * 出國想用
   * 工作要用
   * 考試要用
   * 有興趣
   *
   * 這些不是錯誤答案，
   * 但資訊不足，因此需要追問。
   */

  const vagueMotivationPatterns = [
    '出國想用',
    '出國要用',
    '工作要用',
    '工作想用',
    '考試要用',
    '考試想用',
    '學校要用',
    '課業需要',
    '有興趣',
    '想學',
    '想用',
    '需要用',
  ]

  if (
    vagueMotivationPatterns.some(
      (pattern) => normalized === pattern
    )
  ) {
    return {
      quality: 'insufficient',
      feedback:
        '我了解這是你想學習的情境。可以再具體一點嗎？例如你希望在這個情境中解決什麼問題，或為什麼這件事對你重要？',
    }
  }

  /*
   * 第二層：
   * 判斷回答是否已經包含較具體的「需求／目的／情境」。
   */

  const motivationPatterns = [
    '因為',
    '為了',
    '希望',
    '需要',
    '準備',
    '有興趣',
    '喜歡',
    '工作',
    '職場',
    '交換',
    '留學',
    '國外',
    '旅行',
    '考試',
    '證照',
    '研究',
    '課業',
    '升學',
    '未來',
    '溝通',
    '交流',
    '生活',
    '旅遊',
    '當地人',
    '外國人',
  ]

  const contextPatterns = [
    '出國',
    '國外',
    '旅行',
    '旅遊',
    '留學',
    '交換',
    '工作',
    '職場',
    '課業',
    '考試',
    '證照',
    ]

    const needPatterns = [
    '溝通',
    '交流',
    '聊天',
    '使用',
    '應用',
    '需要',
    '解決',
    '表達',
    '工作',
    '學習',
    ]

    const hasContext = contextPatterns.some(
    (keyword) => answer.includes(keyword)
    )

    const hasNeed = needPatterns.some(
    (keyword) => answer.includes(keyword)
    )

    if (hasContext && hasNeed) {
    return {
        quality: 'valid',
    }
    }

  return {
    quality: 'insufficient',
    feedback:
      '我大致了解你的方向了，但還想再確認一下。你希望學會這個主題，主要是為了解決什麼實際需求，或在哪種情境中使用呢？',
  }
}

function getMotivationFollowUp(
  answer: string
): string {
  // 已經同時提到「出國」與「溝通」
  if (
    (
      answer.includes('出國') ||
      answer.includes('旅行') ||
      answer.includes('旅遊')
    ) &&
    (
      answer.includes('溝通') ||
      answer.includes('聊天') ||
      answer.includes('交流')
    )
  ) {
    return '了解，你希望在出國時能更順利地和別人溝通。這對你來說主要是為了旅遊時更方便，還是希望能更自在地和外國人交流呢？'
  }

  // 只提到出國／旅行
  if (
    answer.includes('出國') ||
    answer.includes('旅行') ||
    answer.includes('旅遊')
  ) {
    return '了解，你希望在出國或旅行時能使用所學的內容。你最希望用在哪些情境呢？例如問路、點餐、購物，或和別人聊天？'
  }

  // 工作
  if (
    answer.includes('工作') ||
    answer.includes('職場')
  ) {
    return '了解，這和你的工作需求有關。你最希望這項能力能幫助你完成什麼工作情境呢？例如開會、簡報、閱讀資料，或和國外同事溝通？'
  }

  // 考試
  if (
    answer.includes('考試') ||
    answer.includes('證照')
  ) {
    return '了解，你有考試或證照方面的需求。你目前主要想準備哪一項考試，或希望達到什麼程度呢？'
  }

  // 興趣
  if (
    answer.includes('興趣') ||
    answer.includes('喜歡')
  ) {
    return '了解，你主要是因為興趣而想學。是什麼情境或經驗讓你開始對這個主題感興趣呢？'
  }

  // 溝通
  if (
    answer.includes('溝通') ||
    answer.includes('聊天') ||
    answer.includes('交流')
  ) {
    return '了解，你希望能更順利地和別人溝通。你主要希望在哪一種情境下使用這項能力呢？'
  }

  return '我大概了解你的方向了，但還需要再具體一點。你可以告訴我，你希望學會之後能解決什麼實際需求嗎？'
}
/* ==================================================
   OUTCOME
   學完之後希望能做到什麼？
   ================================================== */

function evaluateOutcome(
  answer: string
): EvaluationResult {
  /*
   * 只有時間資訊，
   * 不是學習成果。
   */
  if (
    containsDuration(answer) ||
    containsDailyTime(answer)
  ) {
    return {
      quality: 'insufficient',
      feedback:
        '你提到了時間安排，不過我現在想了解的是學習完成後，你希望自己「能做到什麼」。可以描述一個具體能力或實際情境嗎？',
    }
  }

  const outcomePatterns = [
    '能夠',
    '可以',
    '做到',
    '完成',
    '學會',
    '使用',
    '運用',
    '應用',
    '分析',
    '製作',
    '開發',
    '寫出',
    '寫',
    '閱讀',
    '理解',
    '溝通',
    '對話',
    '表達',
    '簡報',
    '解決',
    '獨立',
    '操作',
  ]

  const hasOutcomeSignal =
    outcomePatterns.some((keyword) =>
      answer.includes(keyword)
    )

  if (hasOutcomeSignal) {
    return {
      quality: 'valid',
    }
  }

  /*
   * 避免這種回答：
   * 「因為明年我要出國交換」
   *
   * 這比較像 motivation，而不是 outcome。
   */
  const motivationOnlyPatterns = [
    '因為',
    '有興趣',
    '喜歡',
    '交換',
    '留學',
    '考試',
    '工作需要',
  ]

  if (
    motivationOnlyPatterns.some((keyword) =>
      answer.includes(keyword)
    )
  ) {
    return {
      quality: 'insufficient',
      feedback:
        '我了解你學習的原因了。不過這一題想再確認「學完之後你希望自己能做到什麼」，例如能進行日常對話、完成資料分析，或獨立做出一個作品。',
    }
  }

  return {
    quality: 'insufficient',
    feedback:
      '這個方向還可以再具體一些。完成學習後，你希望自己實際能做出什麼、完成什麼，或在哪種情境中使用這項能力呢？',
  }
}


/* ==================================================
   DURATION
   希望多久完成？
   ================================================== */

function evaluateDuration(
  answer: string
): EvaluationResult {
  if (containsDuration(answer)) {
    return {
      quality: 'valid',
    }
  }

  /*
   * 如果回答的是「每天30分鐘」，
   * 表示使用者回答到 dailyTime。
   */
  if (containsDailyTime(answer)) {
    return {
      quality: 'insufficient',
      feedback:
        '你提供的是每天可投入的時間。我現在想先確認整體的完成期限，例如 4 週、3 個月或半年。你希望大約多久達成這個學習目標呢？',
    }
  }

  return {
    quality: 'insufficient',
    feedback:
      '我還需要一個比較明確的完成期限，例如 4 週、3 個月、半年或 1 年。你希望大約多久完成呢？',
  }
}


/* ==================================================
   DAILY TIME
   每天願意投入多久？
   ================================================== */

function evaluateDailyTime(
  answer: string
): EvaluationResult {
  const dailyMinutes = extractDailyMinutes(answer)

  if (dailyMinutes !== null) {
    if (dailyMinutes <= 0) {
      return {
        quality: 'invalid',
        feedback:
          '每日投入時間需要大於 0。你可以告訴我一個實際可安排的時間，例如每天 30 分鐘或每天 1 小時。',
      }
      
    }
    function formatDailyTime(minutes: number): string {
        if (minutes % 60 === 0) {
            return `${minutes / 60} 小時`
        }

        return `${minutes} 分鐘`
}

    // 24 小時以上
    if (dailyMinutes >= 1440) {
      return {
        quality: 'invalid',
        feedback:
          '一天最多只有 24 小時，這個投入時間無法作為學習計畫的設定。請重新輸入每天實際可以投入的學習時間。',
      }
    }

    // 18～24 小時
    if (dailyMinutes >= 1080) {
      return {
        quality: 'invalid',
        feedback:
          '這個每日投入時間幾乎占據整天，無法形成可持續的學習安排。請重新輸入每天實際可以投入的學習時間。',
      }
    }

    // 超過 8 小時、未滿 18 小時
    if (dailyMinutes > 480) {
      return {
        quality: 'needs_confirmation',
        feedback: `你確認每天要投入 ${formatDailyTime(dailyMinutes)} 學習嗎？`,
      }
    }

    return {
      quality: 'valid',
    }
  }

  if (containsDuration(answer)) {
    return {
      quality: 'insufficient',
      feedback:
        '你提供的是整體學習期限。這一題想了解的是每天大約可以安排多少時間，例如每天 30 分鐘或每天 1 小時。',
    }
  }

  return {
    quality: 'insufficient',
    feedback:
      '為了讓後面的學習計畫可執行，我需要知道你每天大約能投入多少時間，例如每天 30 分鐘或每天 1 小時。',
  }
}

  /*
   * 回答的是整體完成期限
   */
  

function extractDailyMinutes(
  answer: string
): number | null {
  /*
   * 例如：
   * 30分鐘
   * 每天30分鐘
   */
  const minuteMatch = answer.match(
    /(\d+)\s*(分鐘|分)/
  )

  if (minuteMatch) {
    return Number(minuteMatch[1])
  }

  /*
   * 例如：
   * 1小時
   * 每天2小時
   * 24小時
   */
  const hourMatch = answer.match(
    /(\d+)\s*(小時|鐘頭)/
  )

  if (hourMatch) {
    return Number(hourMatch[1]) * 60
  }

  /*
   * 常見中文表達
   */
  if (
    answer.includes('半小時') ||
    answer.includes('半個小時')
  ) {
    return 30
  }

  if (
    answer.includes('一小時') ||
    answer.includes('一個小時')
  ) {
    return 60
  }

  if (
    answer.includes('兩小時') ||
    answer.includes('兩個小時')
  ) {
    return 120
  }

  return null
}

/* ==================================================
   TIME DETECTION
   ================================================== */

function containsDuration(answer: string): boolean {
  /*
   * 數字形式：
   * 3天、4週、6個月、1年
   */
  const numericDuration =
    /\d+\s*(個)?\s*(天|日|週|周|星期|月|年)/.test(
      answer
    )

  /*
   * 中文數字形式：
   * 三個月、六個月、一年
   */
  const chineseDuration =
    /(一|二|兩|三|四|五|六|七|八|九|十|半)\s*(個)?\s*(天|日|週|周|星期|月|年)/.test(
      answer
    )

  /*
   * 常見自然語言：
   * 半年、一個月、半年左右
   */
  const naturalDuration =
    /(半年|一年|一個月|兩個月|幾個月|幾週|幾個星期)/.test(
      answer
    )

  return (
    numericDuration ||
    chineseDuration ||
    naturalDuration
  )
}


function containsDailyTime(answer: string): boolean {
  /*
   * 數字：
   * 30分鐘、1小時
   */
  const numericTime =
    /\d+\s*(分鐘|分|小時|鐘頭)/.test(
      answer
    )

  /*
   * 中文：
   * 三十分鐘、一小時、半小時
   */
  const chineseTime =
    /(十|二十|三十|四十|五十|六十|一|二|兩|三|四|五|半)\s*(分鐘|分|小時|鐘頭)/.test(
      answer
    )

  /*
   * 常見自然語言
   */
  const naturalTime =
    /(半小時|一小時|兩小時|一個小時|兩個小時)/.test(
      answer
    )

  return (
    numericTime ||
    chineseTime ||
    naturalTime
  )
}


/* ==================================================
   INVALID FEEDBACK
   ================================================== */

function getInvalidFeedback(
  field: ProfileField
): string {
  switch (field) {
    case 'motivation':
      return '我目前還無法從這個回答了解你的學習動機。可以告訴我，你為什麼想學這個主題嗎？例如興趣、課業、工作或其他實際需求。'

    case 'outcome':
      return '我目前還無法判斷你希望達成的學習成果。完成學習後，你希望自己能做到什麼呢？'

    case 'duration':
      return '我目前還無法判斷你的完成期限。可以提供一個大概的時間嗎？例如 4 週、3 個月或半年。'

    case 'dailyTime':
      return '我目前還無法判斷你每天可以投入的時間。可以告訴我大約幾分鐘或幾小時嗎？'

    default:
      return '我還需要更明確的資訊，可以再說明一下嗎？'
  }
}