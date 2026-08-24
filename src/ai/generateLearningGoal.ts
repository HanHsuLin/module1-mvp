import type {
  LearningProfileSummary,
  LearningGoal,
} from '../types/learning'

export async function generateLearningGoal(
  profile: LearningProfileSummary
): Promise<LearningGoal> {
  const response = await fetch('/api/generate-learning-goal', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      topic: profile.topic,
      motivation: profile.motivation ?? '',
      outcome: profile.outcome ?? '',
      duration: profile.duration ?? '',
      dailyTime: profile.dailyTime ?? '',
    }),
  })

  if (!response.ok) {
    throw new Error('產生學習目標失敗')
  }

  const data = await response.json()

  return {
    topic: profile.topic,
    motivation: profile.motivation ?? '',
    outcome: profile.outcome ?? '',
    duration: profile.duration ?? '',
    dailyTime: profile.dailyTime ?? '',

    goalStatement: data.goalStatement,
    aiRationale: data.aiRationale,
  }
}