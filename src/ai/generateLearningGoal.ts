import type {
  LearningProfile,
  LearningProfileSummary,
  LearningGoal,
} from '../types/learning'

type ConversationMessage = {
  role: 'ai' | 'learner'
  text: string
}

export async function generateLearningGoal(
  profile: LearningProfile,
  summary: LearningProfileSummary,
  messages: ConversationMessage[]
): Promise<LearningGoal> {
  const response = await fetch('/api/generate-learning-goal', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      profile,
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error('產生學習目標失敗')
  }

  const data = await response.json()

  return {
    topic: summary.topic,
    motivation: summary.motivation ?? '',
    outcome: profile.outcome ?? summary.outcome ?? '',
    duration: summary.duration ?? '',
    dailyTime: summary.dailyTime ?? '',

    goalStatement: data.goalStatement,
    aiRationale: data.aiRationale,
  }
}

export async function reviseLearningGoal(
  originalGoal: LearningGoal,
  revisionRequests: string[]
): Promise<LearningGoal> {
  const response = await fetch('/api/revise-learning-goal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalGoal, revisionRequests }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error('修改學習目標失敗')
  }

  const data = (await response.json()) as {
    topic: string
    motivation: string
    outcome: string
    duration: string
    dailyTime: string
    goalStatement: string
    aiRationale: string
  }

  return {
    topic: data.topic,
    motivation: data.motivation,
    outcome: data.outcome,
    duration: data.duration,
    dailyTime: data.dailyTime,
    goalStatement: data.goalStatement,
    aiRationale: data.aiRationale,
  }
}
