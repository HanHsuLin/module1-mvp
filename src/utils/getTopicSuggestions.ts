export function getTopicSuggestions(input: string): string[] {
  const keyword = input.trim().toLowerCase()

  // 尚未輸入內容時，提供跨領域的預設範例
  if (keyword === '') {
    return [
      '我想學 Python 資料分析',
      '我想提升英文口說能力',
      '我想提升學術英文寫作',
      '我想學簡報設計',
      '我想學統計分析',
    ]
  }

  // 程式設計
  if (
    keyword.includes('程式') ||
    keyword.includes('programming') ||
    keyword.includes('coding')
  ) {
    return [
      '我想學 Python 程式設計',
      '我想學 JavaScript',
      '我想學 Java 程式設計',
      '我想學 C++ 程式設計',
      '我想學網頁程式設計',
    ]
  }

  // 英文
  if (
    keyword.includes('英文') ||
    keyword.includes('english')||
    keyword.includes('toeic')
  ) {
    return [
      '我想提升英文口說能力',
      '我想提升英文寫作能力',
      '我想學習學術英文',
      '我想練習英文簡報',
      '我想準備 TOEIC',
    ]
  }

  // AI
  if (
    keyword.includes('ai') ||
    keyword.includes('人工智慧')
  ) {
    return [
      '我想了解生成式 AI',
      '我想學習如何使用 AI 工具',
      '我想學習 AI 提示詞設計',
      '我想了解機器學習基礎',
      '我想學習 AI 程式應用',
    ]
  }

  return []
}