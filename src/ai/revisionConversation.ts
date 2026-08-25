import type { LearningGoal } from '../types/learning'

type RevisionMessage = {
  role: 'ai' | 'learner'
  text: string
}

export async function continueRevisionConversation(
  originalGoal: LearningGoal,
  messages: RevisionMessage[]
): Promise<{ reply: string; isReady: boolean }> {
  const response = await fetch('/api/revision-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalGoal, messages }),
    signal: AbortSignal.timeout(40_000),
  })

  if (!response.ok) {
    throw new Error('修改目標對話失敗')
  }

  return response.json()
}
