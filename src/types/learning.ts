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