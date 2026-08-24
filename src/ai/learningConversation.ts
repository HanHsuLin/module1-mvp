import type {
  LearningConversationResult,
  LearningProfile,
} from '../types/learning'

type ConversationMessage = {
  role: 'ai' | 'learner'
  text: string
}

const topicSuggestionCache = new Map<string, string[]>()

export async function continueLearningConversation(
  messages: ConversationMessage[],
  profile: LearningProfile
): Promise<LearningConversationResult> {
  const response = await fetch('/api/learning-conversation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, profile }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error('Gemini 對話服務目前無法使用')
  }

  return response.json() as Promise<LearningConversationResult>
}

export async function generateTopicSuggestions(
  input: string,
  signal?: AbortSignal
): Promise<string[]> {
  const cacheKey = input.trim().toLowerCase()
  const cachedSuggestions = topicSuggestionCache.get(cacheKey)
  if (cachedSuggestions) {
    return cachedSuggestions
  }

  const response = await fetch('/api/topic-suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
    signal,
  })

  if (!response.ok) {
    throw new Error('Gemini 主題建議目前無法使用')
  }

  const data = (await response.json()) as { suggestions: string[] }
  topicSuggestionCache.set(cacheKey, data.suggestions)
  return data.suggestions
}
