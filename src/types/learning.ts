export interface LearningProfile {
  topic: string
  motivation?: string
  outcome?: string
  duration?: string
  dailyTime?: string
}

export interface LearningProfileSummary {
  topic: string
  motivation?: string
  outcome?: string
  duration?: string
  dailyTime?: string
}

export interface LearningGoal {
  goalStatement: string
  topic: string
  motivation: string
  outcome: string
  duration: string
  dailyTime: string
  aiRationale: string
}

export type ProfileFieldStatus = 'missing' | 'partial' | 'complete'

export interface ProfileFieldAssessment {
  value: string | null
  status: ProfileFieldStatus
  evidence: string | null
}

export interface LearningConversationResult {
  reply: string
  profile: {
    topic: ProfileFieldAssessment
    motivation: ProfileFieldAssessment
    outcome: ProfileFieldAssessment
    duration: ProfileFieldAssessment
    dailyTime: ProfileFieldAssessment
  }
  isReady: boolean
  questionFocus:
    | 'topic'
    | 'motivation'
    | 'outcome'
    | 'duration'
    | 'dailyTime'
    | 'confirmation'
}
