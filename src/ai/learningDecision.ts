import type { LearningProfile } from '../types/learning'

export function getNextQuestion(
  profile: LearningProfile
): string | null {

  if (!profile.motivation) {
    return '你為什麼想學這個主題呢？'
  }

  if (!profile.outcome) {
    return '你希望學習完成後，自己能夠做到什麼？'
  }

  if (!profile.duration) {
    return '你希望大約多久完成這個學習目標？'
  }

  if (!profile.dailyTime) {
    return '你每天大約願意投入多少時間學習？'
  }

  return null
}