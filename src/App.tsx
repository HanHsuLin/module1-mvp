import { useEffect, useRef, useState } from 'react'
import MessageBubble from './components/MessageBubble'
import Header from './components/Header'

import type {
  LearningProfile,
  LearningProfileSummary,
  LearningGoal,
} from './types/learning'

import { summarizeProfileField } from './ai/summarizeLearningProfile'
import { getTopicSuggestions } from './utils/getTopicSuggestions'
import { evaluateLearningAnswer } from './ai/evaluateLearningAnswer'
import { continueLearningConversation } from './ai/learningConversation'
import { continueRevisionConversation } from './ai/revisionConversation'
import {
  generateLearningGoal,
  reviseLearningGoal,
} from './ai/generateLearningGoal'

import './App.css'


type Message = {
  role: 'ai' | 'learner'
  text: string
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let characterIndex = 0

    const timer = window.setInterval(() => {
      characterIndex += 1
      setDisplayedText(text.slice(0, characterIndex))

      if (characterIndex >= text.length) {
        window.clearInterval(timer)
      }
    }, 40)

    return () => window.clearInterval(timer)
  }, [text])

  return (
    <>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="typing-cursor">|</span>
      )}
    </>
  )
}


/* ==================================================
   GENERATE INITIAL GOAL
   ================================================== */

function generateGoalStatement(
  topic: string,
  outcome: string,
  duration: string,
  dailyTime: string
): string {
  const normalizedTopic = topic.toLowerCase()

  // =========================
  // 英文／英語口說
  // =========================

  if (
    normalizedTopic.includes('英文') ||
    normalizedTopic.includes('英語') ||
    normalizedTopic.includes('english')
  ) {
    return (
      `在 ${duration} 的學習期間，你將以實際生活溝通為核心，` +
      `循序練習自我介紹、日常寒暄、問路與交通、餐廳點餐與結帳、` +
      `購物、住宿及臨時需求表達等常見情境。` +
      `每天投入 ${dailyTime} 進行情境對話、常用句型與即時回應練習，` +
      `逐步提升英文口說的流暢度與實際溝通能力，` +
      `最終能夠達成「${outcome}」的學習成果。`
    )
  }

  // =========================
  // Python
  // =========================

  if (normalizedTopic.includes('python')) {
    return (
      `在 ${duration} 的學習期間，你將從 Python 基礎語法開始，` +
      `逐步學習變數、條件判斷、迴圈、函式與資料結構，` +
      `接著進入實際問題解決與小型專案練習。` +
      `每天投入 ${dailyTime} 進行概念學習、程式實作與除錯，` +
      `逐步建立獨立撰寫程式與解決問題的能力，` +
      `最終達成「${outcome}」的學習成果。`
    )
  }

  // =========================
  // 程式設計
  // =========================

  if (
    normalizedTopic.includes('程式') ||
    normalizedTopic.includes('coding') ||
    normalizedTopic.includes('programming')
  ) {
    return (
      `在 ${duration} 的學習期間，你將從程式設計的核心概念開始，` +
      `循序學習變數、條件判斷、迴圈、函式與問題拆解，` +
      `再逐步進入實際程式撰寫與小型專案。` +
      `每天投入 ${dailyTime} 進行概念理解、實作與除錯，` +
      `逐步建立獨立解決問題的能力，` +
      `最終達成「${outcome}」的學習成果。`
    )
  }

  // =========================
  // AI 工具
  // =========================

  if (
    normalizedTopic.includes('ai') ||
    normalizedTopic.includes('人工智慧') ||
    normalizedTopic.includes('生成式')
  ) {
    return (
      `在 ${duration} 的學習期間，你將循序熟悉 AI 工具的基本操作、` +
      `提示設計、資訊判斷與實際應用，並透過不同任務練習如何運用 AI ` +
      `協助工作與問題解決。每天投入 ${dailyTime} 進行操作與實作，` +
      `逐步建立有效使用 AI 的能力，` +
      `最終達成「${outcome}」的學習成果。`
    )
  }

  // =========================
  // 一般主題
  // =========================

  return (
    `在 ${duration} 的學習期間，你將以「${topic}」為核心，` +
    `先建立必要的基礎知識，再逐步進入實際應用與情境練習。` +
    `每天投入 ${dailyTime}，透過理解、練習、應用與反思逐步累積能力，` +
    `最終達成「${outcome}」的學習成果。`
  )
}


/* ==================================================
   GENERATE GOAL RATIONALE
   ================================================== */

function generateGoalRationale(
  topic: string,
  motivation: string,
  outcome: string,
  duration: string,
  dailyTime: string
): string {
  return (
    `這個學習目標是根據你想學習「${topic}」的需求，` +
    `以及「${motivation}」的學習動機所規劃。` +
    `考量你希望在 ${duration} 內達成「${outcome}」，` +
    `並且每天可以投入 ${dailyTime}，` +
    `因此將學習內容安排成循序漸進且能實際執行的方向，` +
    `讓你能在有限的學習時間中逐步累積能力並應用在實際情境中。`
  )
}


/* ==================================================
   GENERATE REVISED GOAL
   ================================================== */

function generateRevisedGoalStatement(
  originalGoal: LearningGoal,
  revisionMessages: Message[]
): string {
  const learnerRequests = revisionMessages
    .filter((message) => message.role === 'learner')
    .map((message) => message.text.trim())
    .filter(
      (text) =>
        text &&
        text !== '沒有' &&
        text !== '沒有了' &&
        text !== '沒了' &&
        text !== '不用了' &&
        text !== '就這樣'
    )

  const revisionText = learnerRequests.join('、')

  const normalizedTopic =
    originalGoal.topic.toLowerCase()


  /* ==================================================
     英文 / 英語
     ================================================== */

  if (
    normalizedTopic.includes('英文') ||
    normalizedTopic.includes('英語') ||
    normalizedTopic.includes('english')
  ) {
    const learningSituations = [
      '自我介紹',
      '日常寒暄',
      '問路與交通',
      '餐廳點餐與結帳',
      '購物',
      '住宿',
      '臨時需求表達',
    ]

    /*
     * reducedSituations：
     * 不刪除，但降低練習比重。
     */
    const reducedSituations: string[] = []


    /* ==================================================
       REMOVE HELPER
       ================================================== */

    const removeSituation = (
      keyword: string
    ) => {
      const index =
        learningSituations.findIndex(
          (item) => item.includes(keyword)
        )

      if (index !== -1) {
        learningSituations.splice(index, 1)
      }
    }


    /* ==================================================
       1. 完全移除
       ================================================== */

    const hasRemoveIntent =
      revisionText.includes('不要') ||
      revisionText.includes('不想要') ||
      revisionText.includes('拿掉') ||
      revisionText.includes('刪除') ||
      revisionText.includes('移除') ||
      revisionText.includes('取消')


    if (hasRemoveIntent) {
      if (
        revisionText.includes('餐廳') ||
        revisionText.includes('點餐')
      ) {
        removeSituation('餐廳')
      }

      if (revisionText.includes('購物')) {
        removeSituation('購物')
      }

      if (revisionText.includes('住宿')) {
        removeSituation('住宿')
      }

      if (
        revisionText.includes('自我介紹') ||
        revisionText.includes('介紹自己')
      ) {
        removeSituation('自我介紹')
      }

      if (
        revisionText.includes('寒暄') ||
        revisionText.includes('打招呼')
      ) {
        removeSituation('日常寒暄')
      }

      if (
        revisionText.includes('臨時需求') ||
        revisionText.includes('緊急需求')
      ) {
        removeSituation('臨時需求')
      }

      if (
        revisionText.includes('問路') ||
        revisionText.includes('交通')
      ) {
        removeSituation('問路')
      }
    }


    /* ==================================================
       2. 減少 / 降低練習比重
       ================================================== */

    const hasReduceIntent =
      revisionText.includes('減少') ||
      revisionText.includes('少一點') ||
      revisionText.includes('少一些') ||
      revisionText.includes('不用那麼多') ||
      revisionText.includes('降低') ||
      revisionText.includes('降低比重') ||
      revisionText.includes('減低')


    if (hasReduceIntent) {
      if (
        revisionText.includes('餐廳') ||
        revisionText.includes('點餐')
      ) {
        reducedSituations.push(
          '餐廳點餐與結帳'
        )
      }

      if (revisionText.includes('購物')) {
        reducedSituations.push('購物')
      }

      if (revisionText.includes('住宿')) {
        reducedSituations.push('住宿')
      }

      if (
        revisionText.includes('自我介紹') ||
        revisionText.includes('介紹自己')
      ) {
        reducedSituations.push(
          '自我介紹'
        )
      }

      if (
        revisionText.includes('寒暄') ||
        revisionText.includes('打招呼')
      ) {
        reducedSituations.push(
          '日常寒暄'
        )
      }

      if (
        revisionText.includes('臨時需求') ||
        revisionText.includes('緊急需求')
      ) {
        reducedSituations.push(
          '臨時需求表達'
        )
      }

      if (
        revisionText.includes('問路') ||
        revisionText.includes('交通')
      ) {
        reducedSituations.push(
          '問路與交通'
        )
      }
    }


    /* ==================================================
       3. 增加新的學習內容
       ================================================== */

    if (
      revisionText.includes('機場') ||
      revisionText.includes('登機') ||
      revisionText.includes('入境')
    ) {
      learningSituations.push(
        '機場報到、登機與入境'
      )
    }


    if (
      (
        revisionText.includes('問路') ||
        revisionText.includes('交通')
      ) &&
      !hasRemoveIntent &&
      !learningSituations.includes('問路與交通')
    ) {
      learningSituations.push(
        '問路與交通'
      )
    }


    if (
      revisionText.includes('聊天') ||
      revisionText.includes('交流') ||
      revisionText.includes('對話')
    ) {
      learningSituations.push(
        '與外國人進行自然對話'
      )
    }


    if (
      revisionText.includes('簡報') ||
      revisionText.includes('報告')
    ) {
      learningSituations.push(
        '英文簡報與口頭表達'
      )
    }


    if (
      revisionText.includes('工作') ||
      revisionText.includes('職場')
    ) {
      learningSituations.push(
        '職場溝通'
      )
    }


    /* ==================================================
       4. 整理情境
       ================================================== */

    const uniqueSituations = [
      ...new Set(learningSituations),
    ]

    const reducedUniqueSituations = [
      ...new Set(reducedSituations),
    ]

    const normalSituations =
      uniqueSituations.filter(
        (situation) =>
          !reducedUniqueSituations.includes(
            situation
          )
      )


    /* ==================================================
       5. 重新組合學習情境描述
       ================================================== */

    const situationDescription =
      normalSituations.length > 0 &&
      reducedUniqueSituations.length > 0
        ? `以${normalSituations.join('、')}為主要練習情境，` +
          `並降低${reducedUniqueSituations.join('、')}的練習比重`
        : reducedUniqueSituations.length > 0
          ? `適度練習${reducedUniqueSituations.join('、')}，` +
            `但降低這些內容的學習比重`
          : `循序練習${uniqueSituations.join('、')}等實用情境`


    /* ==================================================
       6. 產生新的英文學習目標
       ================================================== */

    return (
      `在 ${originalGoal.duration} 的學習期間，` +
      `你將以實際生活溝通為核心，${situationDescription}。` +
      `每天投入 ${originalGoal.dailyTime} 進行情境對話、常用句型與即時回應練習，` +
      `逐步提升英文口說的流暢度與實際溝通能力，` +
      `最終能夠達成「${originalGoal.outcome}」的學習成果。`
    )
  }


  /* ==================================================
     Python
     ================================================== */

  if (
    normalizedTopic.includes('python')
  ) {
    const learningContents = [
      '基礎語法',
      '變數與資料型態',
      '條件判斷',
      '迴圈',
      '函式',
      '資料結構',
    ]


    if (
      revisionText.includes('資料分析')
    ) {
      learningContents.push(
        '資料整理與分析'
      )
    }


    if (
      revisionText.includes('pandas') ||
      revisionText.includes('Pandas')
    ) {
      learningContents.push(
        'Pandas 資料處理'
      )
    }


    if (
      revisionText.includes('視覺化') ||
      revisionText.includes('圖表')
    ) {
      learningContents.push(
        '資料視覺化'
      )
    }


    if (
      revisionText.includes('專案') ||
      revisionText.includes('作品')
    ) {
      learningContents.push(
        '小型實作專案'
      )
    }


    const uniqueContents = [
      ...new Set(learningContents),
    ]


    return (
      `在 ${originalGoal.duration} 的學習期間，` +
      `你將循序學習${uniqueContents.join('、')}，` +
      `並透過實際程式撰寫與問題解決逐步建立 Python 能力。` +
      `每天投入 ${originalGoal.dailyTime} 進行概念理解、程式實作與除錯，` +
      `最終能夠達成「${originalGoal.outcome}」的學習成果。`
    )
  }


  /* ==================================================
     一般主題
     ================================================== */

  if (revisionText) {
    return (
      `在 ${originalGoal.duration} 的學習期間，` +
      `你將以「${originalGoal.topic}」為核心，` +
      `從基礎概念逐步進入實際應用與練習，` +
      `並依照討論後的需求調整「${revisionText}」相關內容。` +
      `每天投入 ${originalGoal.dailyTime}，` +
      `透過理解、練習、應用與反思逐步累積能力，` +
      `最終能夠達成「${originalGoal.outcome}」的學習成果。`
    )
  }


  return originalGoal.goalStatement
}

function App() {
  const [learningNeed, setLearningNeed] = useState('')
  const [step, setStep] = useState<
    'input' | 'clarify' | 'goal' | 'revise' | 'plan'
  >('input')
  const [error, setError] = useState('')
  const [reason, setReason] = useState('')
  const [currentFieldAnswers, setCurrentFieldAnswers] =
  useState<string[]>([])
  
  const [questionStep, setQuestionStep] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [pendingDailyTime, setPendingDailyTime] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isGoalLoading, setIsGoalLoading] = useState(false)
  const [isRevisionGenerating, setIsRevisionGenerating] = useState(false)
  const [isRevisionAiLoading, setIsRevisionAiLoading] = useState(false)

  const conversationListRef = useRef<HTMLDivElement | null>(null)
  const startButtonRef = useRef<HTMLButtonElement | null>(null)
  const answerButtonRef = useRef<HTMLButtonElement | null>(null)
  const revisionSendButtonRef = useRef<HTMLButtonElement | null>(null)


  const [revisionInput, setRevisionInput] = useState('')

  const [revisionMessages, setRevisionMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: '這是目前為你整理的學習方案。你希望調整哪個部分？你可以告訴我想增加、減少或改變的學習內容。',
    },
  ])

  const [revisionRequests, setRevisionRequests] = useState<string[]>([])

  const [revisionReady, setRevisionReady] = useState(false)

  const suggestions = getTopicSuggestions(learningNeed)

  const [learningProfile, setLearningProfile] =
  useState<LearningProfile>({
    topic: '',
  })

  const [learningProfileSummary, setLearningProfileSummary] =
  useState<LearningProfileSummary>({
    topic: '',
  })

  const [learningGoal, setLearningGoal] =
    useState<LearningGoal | null>(null)



  const questions = [
    '你為什麼想學這個主題呢?',
    '你希望學習完成後，自己能夠做到什麼？',
    '你希望大約多久完成這個學習目標？',
    '你每天大約願意投入多少時間學習？',
  ]

  const profileFields: Exclude<
    keyof LearningProfile,
    'topic'
  >[] = [
    'motivation',
    'outcome',
    'duration',
    'dailyTime',
  ]
  
  useEffect(() => {
  const conversationList = conversationListRef.current

  if (!conversationList) {
    return
  }

  conversationList.scrollTo({
    top: conversationList.scrollHeight,
    behavior: 'smooth',
  })
}, [messages, isAiLoading])

  function applyConversationProfile(
    result: Awaited<ReturnType<typeof continueLearningConversation>>,
    fallbackProfile: LearningProfile
  ) {
    const updatedProfile: LearningProfile = { ...fallbackProfile }
    const updatedSummary: LearningProfileSummary = {
      topic: summarizeProfileField(
        'topic',
        result.profile.topic.value ?? fallbackProfile.topic
      ),
    }

    const fields: Array<Exclude<keyof LearningProfile, 'topic'>> = [
      'motivation',
      'outcome',
      'duration',
      'dailyTime',
    ]

    for (const field of fields) {
      const value = result.profile[field].value
      if (value) {
        updatedProfile[field] = value
        updatedSummary[field] = summarizeProfileField(field, value)
      }
    }

    setLearningProfile(updatedProfile)
    setLearningProfileSummary(updatedSummary)

    const firstIncompleteIndex = fields.findIndex(
      (field) => result.profile[field].status !== 'complete'
    )
    setQuestionStep(firstIncompleteIndex === -1 ? fields.length : firstIncompleteIndex)
    setIsComplete(result.isReady)
  }

async function handleRevisionMessage() {
  const input = revisionInput.trim()

  if (!input || !learningGoal || isRevisionAiLoading) {
    return
  }

  const submittedMessages: Message[] = [
    ...revisionMessages,
    { role: 'learner', text: input },
  ]
  setRevisionMessages(submittedMessages)
  setRevisionInput('')

  const normalized = input.replace(/\s/g, '')
  const finishPatterns = [
    '沒有了',
    '沒了',
    '沒有',
    '就這樣',
    '這樣就好',
    '可以了',
    '可以',
    '好了',
    '沒問題',
    '不用了',
  ]

  const wantsToFinish = finishPatterns.some(
    (pattern) => normalized === pattern
  )
  const updatedRequests = wantsToFinish
    ? revisionRequests
    : [...revisionRequests, input]
  setRevisionRequests(updatedRequests)
  setRevisionReady(false)

  setIsRevisionAiLoading(true)
  try {
    const result = await continueRevisionConversation(
      learningGoal,
      submittedMessages
    )
    setRevisionMessages([
      ...submittedMessages,
      { role: 'ai', text: result.reply },
    ])
    setRevisionReady(result.isReady && updatedRequests.length > 0)
  } catch {
    const fallbackReply = wantsToFinish && updatedRequests.length > 0
      ? '修改需求已經整理完成，你可以按下「完成討論，產生新方案」。'
      : '我已記下這項修改。還有其他想調整的內容嗎？如果沒有，可以回答「沒有了」。'
    setRevisionMessages([
      ...submittedMessages,
      { role: 'ai', text: fallbackReply },
    ])
    setRevisionReady(wantsToFinish && updatedRequests.length > 0)
  } finally {
    setIsRevisionAiLoading(false)
  }
}


  return (
    <div className="learning-page">

      <Header
  onHome={() => {
    setLearningNeed('')
    setStep('input')
    setError('')
    setReason('')
    setQuestionStep(0)
    setMessages([])
    setCurrentFieldAnswers([])
    setPendingDailyTime(null)
    setIsComplete(false)

    setLearningProfile({
      topic: '',
    })

    setLearningProfileSummary({
      topic: '',
    })

    setLearningGoal(null)
  }}
/>

      <main className="learning-card">

        {step === 'input' && (
  <>
    <h2>你今天想學什麼？</h2>

    <textarea
      placeholder="例如：我想學 Python 資料分析"
      value={learningNeed}
      onChange={(event) => {
                setLearningNeed(event.target.value)
                setError('')
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          startButtonRef.current?.click()
        }
      }}
    />

    {error && (
      <p className="error-message">
        {error}
      </p>
    )}

    {suggestions.length > 0 && (
      <div className="examples">
        <p>
          {learningNeed.trim() === ''
            ? '不知道怎麼開始？試試看：'
            : '根據你輸入的關鍵字：'}
        </p>
        <div className="chip-group">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="chip"
              onClick={() => {
                setLearningNeed(suggestion)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )}

        
            <button
              ref={startButtonRef}
              type="button"
              className="primary-button input-start-button"
              onClick={async () => {
                const cleanedNeed = learningNeed.trim()

                if (cleanedNeed === '') {
                  setError('請先輸入你想學習的內容')
                  return
                }

                setError('')
                const initialProfile: LearningProfile = {
                  topic: cleanedNeed,
                }

                setLearningProfile(initialProfile)

                setLearningProfileSummary({
                  topic: summarizeProfileField('topic', cleanedNeed),
                })

                const initialMessages: Message[] = [
                  {
                    role: 'learner',
                    text: cleanedNeed,
                  },
                ]

                setMessages(initialMessages)
                setStep('clarify')
                setIsAiLoading(true)

                try {
                  const result = await continueLearningConversation(
                    initialMessages,
                    initialProfile
                  )

                  applyConversationProfile(result, initialProfile)
                  setMessages([
                    ...initialMessages,
                    { role: 'ai', text: result.reply },
                  ])
                } catch {
                  setMessages([
                    ...initialMessages,
                    {
                      role: 'ai',
                      text: '我已經看到你提供的學習方向。你最希望先達成什麼具體成果呢？',
                    },
                  ])
                } finally {
                  setIsAiLoading(false)
                }
             }}
>
  開始設定學習目標
</button>
          </>
        )}

        {step === 'clarify' && (
  <div className="clarify-page">

    

    <div className="clarify-layout">

    <aside className="profile-panel">
      <div className="profile-header">
        <div>
          <h3>Learning Profile</h3>
          <p>AI 正在整理你的學習需求</p>
          </div>

          <span className="profile-count">
            {
              [
                learningProfileSummary.topic,
                learningProfileSummary.motivation,
                learningProfileSummary.outcome,
                learningProfileSummary.duration,
                learningProfileSummary.dailyTime,
              ].filter(Boolean).length
            } / 5
          </span>
          </div>

          <div className="profile-list">
            <div className="profile-item">
              <span className="profile-status">
                {learningProfileSummary.topic ? '✓' : '×'}
              </span>

              <div>
                <strong>學習主題</strong>
                <p>{learningProfileSummary.topic || '尚待釐清'}</p>
              </div>
            </div>

            <div className="profile-item">
              <span className="profile-status">
                {learningProfileSummary.motivation ? '✓' : '×'}
              </span>

              <div>
                <strong>學習動機</strong>
                <p>{learningProfileSummary.motivation || '尚待釐清'}</p>
              </div>
            </div>

            <div className="profile-item">
              <span className="profile-status">
                {learningProfileSummary.outcome ? '✓' : '×'}
              </span>

              <div>
                <strong>預期成果</strong>
                <p>{learningProfileSummary.outcome || '尚待釐清'}</p>
              </div>
            </div>

            <div className="profile-item">
              <span className="profile-status">
                {learningProfileSummary.duration ? '✓' : '×'}
              </span>

              <div>
                <strong>完成期限</strong>
                <p>{learningProfileSummary.duration || '尚待釐清'}</p>
              </div>
            </div>

            <div className="profile-item">
              <span className="profile-status">
                {learningProfileSummary.dailyTime ? '✓' : '×'}
              </span>

              <div>
                <strong>每日投入</strong>
                <p>{learningProfileSummary.dailyTime || '尚待釐清'}</p>
              </div>
            </div>
          </div>
          </aside>

    <section className="conversation-panel">
      <div 
      className="conversation-list"
      ref={conversationListRef}
    >
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          role={message.role}
          text={message.text}
        />
      ))}

      {isAiLoading && (
        <div className="message-row ai" aria-live="polite">
          <div className="message-bubble ai">
            <div className="message-role">AI Learning Coach</div>
            <div className="message-content thinking-message">
              AI 正在產生對話<span className="thinking-dots">...</span>
            </div>
          </div>
        </div>
      )}
</div>
      

      <div className="answer-area">
          <textarea
            placeholder={
              isComplete
                ? '還想補充或修改嗎？也可以直接產生學習目標'
                : '請輸入你的回答'
            }
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                answerButtonRef.current?.click()
              }
            }}
          />

          <button
            ref={answerButtonRef}
            type="button"
            className="primary-button"
            onClick={async () => {
              const cleanedReason = reason.trim()

              if (cleanedReason === '') {
                return
              }

              if (pendingDailyTime) {
                const normalizedAnswer = cleanedReason.replace(/\s+/g, '')
                const isRejected =
                  normalizedAnswer === '不確認' ||
                  normalizedAnswer === '不要' ||
                  normalizedAnswer === '否' ||
                  normalizedAnswer === '不是' ||
                  normalizedAnswer === '不對' ||
                  normalizedAnswer === '取消' ||
                  normalizedAnswer.includes('不要') ||
                  normalizedAnswer.includes('不確認') ||
                  normalizedAnswer.includes('改一下') ||
                  normalizedAnswer.includes('想修改')

                const isConfirmed =
                  !isRejected &&
                  (
                    normalizedAnswer === '確認' ||
                    normalizedAnswer === '是' ||
                    normalizedAnswer === '對' ||
                    normalizedAnswer === '沒錯' ||
                    normalizedAnswer === '可以' ||
                    normalizedAnswer === '確定'
                  )

                if (isConfirmed) {
                  const confirmedTime = pendingDailyTime

                  setLearningProfile((prev) => ({
                    ...prev,
                    dailyTime: confirmedTime,
                  }))

                  setLearningProfileSummary((prev) => ({
                    ...prev,
                    dailyTime: summarizeProfileField(
                      'dailyTime',
                      confirmedTime
                    ),
                  }))

                  setMessages([
                    ...messages,
                    {
                      role: 'learner',
                      text: cleanedReason,
                    },
                    {
                      role: 'ai',
                      text: `好的，已確認你的每日投入時間為「${confirmedTime}」。學習需求已蒐集完成。`,
                    },
                  ])

                  setPendingDailyTime(null)
                  setIsComplete(true)
                  setReason('')

                  return
                }

                setMessages([
                  ...messages,
                  {
                    role: 'learner',
                    text: cleanedReason,
                  },
                  {
                    role: 'ai',
                    text: '好的，那請重新告訴我你每天實際可以投入多少時間學習。',
                  },
                ])

                setPendingDailyTime(null)
                setReason('')

                return
              }

              setIsAiLoading(true)
              const submittedMessages: Message[] = [
                ...messages,
                { role: 'learner', text: cleanedReason },
              ]
              setMessages(submittedMessages)
              setReason('')

              try {
                const result = await continueLearningConversation(
                  submittedMessages,
                  learningProfile
                )

                applyConversationProfile(result, learningProfile)
                setMessages([
                  ...submittedMessages,
                  { role: 'ai', text: result.reply },
                ])
                setCurrentFieldAnswers([])
                return
              } catch {
                // API 不可用時繼續執行下方本地驗證。
              } finally {
                setIsAiLoading(false)
              }


              const currentField = profileFields[questionStep]

              if (!currentField) {
                return
              }

              /*
              * 把目前這一題先前的回答
              * 和這次的新回答合併
              */
              const updatedFieldAnswers = [
                ...currentFieldAnswers,
                cleanedReason,
              ]

              const combinedAnswer =
                updatedFieldAnswers.join('，')

              const evaluation = evaluateLearningAnswer(
                currentField,
                combinedAnswer
              )

              if (evaluation.quality === 'needs_confirmation') {
                setMessages([
                  ...messages,
                  {
                    role: 'learner',
                    text: cleanedReason,
                  },
                  {
                    role: 'ai',
                    text:
                      evaluation.feedback ??
                      '你確認要使用這個每日投入時間嗎？',
                  },
                ])

                setPendingDailyTime(cleanedReason)
                setReason('')

                return
              }

              // 無效或資訊不足：不更新 Profile、不進下一題
              if (
                evaluation.quality === 'invalid' ||
                evaluation.quality === 'insufficient'
              ) {
                setCurrentFieldAnswers(updatedFieldAnswers)

                setMessages([
                  ...messages,
                  {
                    role: 'learner',
                    text: cleanedReason,
                  },
                  {
                    role: 'ai',
                    text:
                      evaluation.feedback ??
                      '我還需要更明確的資訊，可以再說明一下嗎？',
                  },
                ])

                setReason('')
                return
              }

              // 有效回答：更新完整 Profile
              const updatedProfile: LearningProfile = {
                ...learningProfile,
                [currentField]: combinedAnswer,
              }

              setLearningProfile(updatedProfile)

              // 同時更新摘要版 Profile
              setLearningProfileSummary((prev) => ({
                ...prev,
                [currentField]: summarizeProfileField(
                  currentField,
                  combinedAnswer
                ),
              }))

              setCurrentFieldAnswers([])

              const nextStep = questionStep + 1

              if (nextStep < questions.length) {
                setMessages([
                  ...messages,
                  {
                    role: 'learner',
                    text: cleanedReason,
                  },
                  {
                    role: 'ai',
                    text: questions[nextStep],
                  },
                ])

                setQuestionStep(nextStep)
              } else {
                setMessages([
                  ...messages,
                  {
                    role: 'learner',
                    text: cleanedReason,
                  },
                  {
                    role: 'ai',
                    text: '學習需求已蒐集完成。',
                  },
                ])

                setIsComplete(true)
              }

              setReason('')
            }}
            disabled={isAiLoading}
            >
              送出回答
          </button>
      </div>

      {isComplete && (
        <button
          type="button"
          className="primary-button"
          disabled={isGoalLoading}
          onClick={async () => {
            if (
              !learningProfile.motivation ||
              !learningProfile.outcome ||
              !learningProfile.duration ||
              !learningProfile.dailyTime
            ) {
              return
            }

            setIsGoalLoading(true)

            let generatedGoal: LearningGoal

            try {
              generatedGoal = await generateLearningGoal(
                learningProfile,
                learningProfileSummary,
                messages
              )
            } catch {
              generatedGoal = {
                goalStatement: generateGoalStatement(
                  learningProfileSummary.topic,
                  learningProfileSummary.outcome ?? '',
                  learningProfileSummary.duration ?? '',
                  learningProfileSummary.dailyTime ?? ''
                ),

                topic: learningProfileSummary.topic,
                motivation: learningProfileSummary.motivation ?? '',
                outcome:
                  learningProfile.outcome ??
                  learningProfileSummary.outcome ??
                  '',
                duration: learningProfileSummary.duration ?? '',
                dailyTime: learningProfileSummary.dailyTime ?? '',

                aiRationale: generateGoalRationale(
                  learningProfileSummary.topic,
                  learningProfileSummary.motivation ?? '',
                  learningProfileSummary.outcome ?? '',
                  learningProfileSummary.duration ?? '',
                  learningProfileSummary.dailyTime ?? ''
                ),
              }
            } finally {
              setIsGoalLoading(false)
            }

            setLearningGoal(generatedGoal)
            setStep('goal')
          }}
        >
          {isGoalLoading ? '正在整理學習目標…' : '產生學習目標'}
        </button>
      )}
    </section>
    </div>
  </div>
)}

{step === 'goal' && learningGoal && (
  <div className="goal-page">

    <div className="goal-page-header">
      <h2>你的學習目標</h2>
      <p>根據剛才的討論，我整理了一個適合你的學習目標。</p>
    </div>


    {/* 上方：左邊學習目標、右邊學習條件 */}
    <div className="goal-top-layout">

      {/* 左：學習條件 */}
      <section className="goal-section-block goal-condition-card">
        <h3>學習條件</h3>

        <div className="goal-summary-grid">

          <div className="goal-summary-item">
            <span>學習主題</span>
            <strong>{learningGoal.topic}</strong>
          </div>

          <div className="goal-summary-item">
            <span>完成期限</span>
            <strong>{learningGoal.duration}</strong>
          </div>

          <div className="goal-summary-item">
            <span>學習動機</span>
            <strong>{learningGoal.motivation}</strong>
          </div>

          <div className="goal-summary-item">
            <span>每日投入</span>
            <strong>{learningGoal.dailyTime}</strong>
          </div>

          <div className="goal-summary-item goal-summary-wide">
            <span>預期成果</span>
            <strong>{learningGoal.outcome}</strong>
          </div>

        </div>
      </section>


      {/* 右：建議學習目標 */}
      <section className="goal-main-card">
        <span className="goal-label">
          建議學習目標
        </span>

        <p className="goal-statement">
          {learningGoal.goalStatement}
        </p>
  
      </section>

    </div>


    {/* 下方：AI Learning Coach */}
    <section className="goal-section-block goal-ai-card">

      <div className="goal-ai-header">

        <div className="goal-ai-icon">
          AI
        </div>

        <div>
          <strong>AI Learning Coach</strong>
          <p>為什麼這個目標適合你？</p>
        </div>

      </div>

      <div className="goal-ai-message">
        {learningGoal.aiRationale}
      </div>

    </section>


    {/* 操作按鈕 */}
    <div className="goal-actions">

      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          setRevisionMessages([
            {
              role: 'ai',
              text: '這是目前為你整理的學習方案。你希望調整哪個部分？你可以告訴我想增加、減少或改變的學習內容。',
            },
          ])

          setRevisionInput('')
          setStep('revise')

        }}
      >
        我想修改目標
      </button>

      <button
        type="button"
        className="primary-button"
        onClick={() => {
          setStep('plan')
        }}
      >
        確認這個學習目標
      </button>

    </div>

  </div>
)}

{step === 'revise' && learningGoal && (
  <div className="revise-page">

    {/* 頁面標題 */}
    <div className="revise-page-header">
      <h2>修改學習目標</h2>
      <p>
        和 AI Learning Coach 討論你希望調整的地方，
        原本的學習方案會保留，直到你確認新的方案。
      </p>
    </div>


    {/* 左右兩欄 */}
    <div className="revise-layout">

      {/* =========================
          左側：原學習方案
      ========================= */}
      <section className="revise-original-panel">

        <div className="revise-panel-title">
          <span>目前方案</span>
          <h3>原學習目標</h3>
        </div>

        <div className="revise-original-goal">
          {learningGoal.goalStatement}
        </div>

        <div className="revise-condition-grid">

          <div className="revise-condition-item">
            <span>學習主題</span>
            <strong>{learningGoal.topic}</strong>
          </div>

          <div className="revise-condition-item">
            <span>完成期限</span>
            <strong>{learningGoal.duration}</strong>
          </div>

          <div className="revise-condition-item">
            <span>每日投入</span>
            <strong>{learningGoal.dailyTime}</strong>
          </div>

          <div className="revise-condition-item">
            <span>學習動機</span>
            <strong>{learningGoal.motivation}</strong>
          </div>

          <div className="revise-condition-item revise-condition-wide">
            <span>預期成果</span>
            <strong>{learningGoal.outcome}</strong>
          </div>

        </div>

      </section>


      {/* =========================
          右側：AI 討論
      ========================= */}
      <section className="revise-chat-panel">

        {/* AI 標題 */}
        <div className="revise-chat-header">

          <div className="revise-ai-icon">
            AI
          </div>

          <div>
            <strong>AI Learning Coach</strong>
            <p>一起調整你的學習方案</p>
          </div>

        </div>


        {/* 對話內容 */}
        <div className="revise-chat-messages">

          {revisionMessages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === 'learner'
                  ? 'revision-message learner'
                  : 'revision-message ai'
              }
            >
              {message.role === 'ai' ? (
                <TypewriterText text={message.text} />
              ) : (
                message.text
              )}
            </div>
          ))}

          {isRevisionAiLoading && (
            <div className="revision-message ai thinking-message">
              AI 正在產生對話<span className="thinking-dots">...</span>
            </div>
          )}

        </div>


        {/* 輸入區 */}
        <div className="revise-chat-input">

          <textarea
            value={revisionInput}
            placeholder="告訴 AI 你希望怎麼調整..."
            rows={2}
            onChange={(event) => {
              setRevisionInput(event.target.value)
            }}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey
              ) {
                event.preventDefault()
                revisionSendButtonRef.current?.click()
              }
            }}
          />

          <button
            ref={revisionSendButtonRef}
            type="button"
            className="revision-send-button"
            onClick={() => void handleRevisionMessage()}
            disabled={!revisionInput.trim() || isRevisionAiLoading}
          >
            送出
          </button>

        </div>

      </section>

    </div>


    {/* =========================
        底部按鈕
    ========================= */}
    <div className="revise-bottom-actions">

      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          setRevisionInput('')
          setRevisionRequests([])
          setRevisionReady(false)

          setRevisionMessages([
            {
              role: 'ai',
              text:
                '這是目前為你整理的學習方案。你希望調整哪個部分？你可以告訴我想增加、減少或改變的學習內容。',
            },
          ])

          setStep('goal')
        }}
      >
        返回原方案
      </button>


      <button
  type="button"
  className="primary-button"
  disabled={!revisionReady || isRevisionGenerating}
  onClick={async () => {
    if (!revisionReady || isRevisionGenerating) {
      return
    }

    setIsRevisionGenerating(true)

    let revisedGoal: LearningGoal

    try {
      revisedGoal = await reviseLearningGoal(learningGoal, revisionRequests)
    } catch (revisionError) {
      console.error('Gemini goal revision error:', revisionError)

      revisedGoal = {
        ...learningGoal,
        goalStatement: generateRevisedGoalStatement(
          learningGoal,
          revisionMessages
        ),
        aiRationale: generateGoalRationale(
          learningGoal.topic,
          learningGoal.motivation,
          learningGoal.outcome,
          learningGoal.duration,
          learningGoal.dailyTime
        ),
      }
    } finally {
      setIsRevisionGenerating(false)
    }

    setLearningGoal(revisedGoal)

    setRevisionInput('')
    setRevisionRequests([])
    setRevisionReady(false)

    setRevisionMessages([
      {
        role: 'ai',
        text:
          '這是目前為你整理的學習方案。你希望調整哪個部分？你可以告訴我想增加、減少或改變的學習內容。',
      },
    ])

    setStep('goal')
  }}
>
  {isRevisionGenerating ? '正在統整新方案…' : '完成討論，產生新方案'}
</button>


    </div>

  </div>
)}


{step === 'plan' && (
  <>
    <h2>建立你的學習計畫</h2>

    <p>
      Module 1 已完成，接下來將根據你的學習目標建立學習計畫。
    </p>

    <p>
      測試目標：{learningGoal?.goalStatement}
    </p>
  </>
)}

  </main>
    </div>
  )
}

export default App
