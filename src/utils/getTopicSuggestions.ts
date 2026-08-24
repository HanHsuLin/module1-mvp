export function getTopicSuggestions(input: string): string[] {
  const keyword = input.trim().toLowerCase()

  // 尚未輸入時保留首頁範例；輸入後才改成關鍵字推薦。
  if (keyword === '') {
    return [
      '我想學 Python 資料分析',
      '我想提升英文口說能力',
      '我想提升學術英文寫作',
      '我想學簡報設計',
      '我想學統計分析',
    ]
  }

  const isLongDescription =
    input.trim().length > 16 ||
    /[，。！？,.!?\n]/.test(input) ||
    input.trim().split(/\s+/).length > 4

  if (isLongDescription) {
    return []
  }

  // Python／資料分析要優先辨識，避免把整句套進通用句型。
  if (keyword.includes('python') || keyword.includes('資料分析')) {
    return [
      '我想從 Python 基礎開始學資料分析',
      '我想用 Python 整理與清理資料',
      '我想用 Python 製作資料圖表',
      '我想用 Python 分析實際資料集',
      '我想完成一個 Python 資料分析作品',
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
    if (keyword.includes('口說') || keyword.includes('對話')) {
      return [
        '我想從基礎開始練習英文口說',
        '我想練習日常生活英文對話',
        '我想提升職場英文溝通能力',
        '我想練習旅遊時會用到的英文口說',
        '我想更自然流暢地用英文表達想法',
      ]
    }

    if (keyword.includes('寫作') || keyword.includes('寫')) {
      return [
        '我想從基礎開始練習英文寫作',
        '我想提升英文句子與段落組織能力',
        '我想練習英文電子郵件寫作',
        '我想提升學術英文寫作能力',
        '我想讓英文文章表達得更自然清楚',
      ]
    }

    if (keyword.includes('toeic')) {
      return [
        '我想了解 TOEIC 題型與準備方式',
        '我想加強 TOEIC 聽力',
        '我想加強 TOEIC 閱讀',
        '我想建立 TOEIC 單字與文法基礎',
        '我想規劃 TOEIC 模擬題練習',
      ]
    }

    return [
      '我想提升英文口說能力',
      '我想提升英文寫作能力',
      '我想加強英文聽力理解',
      '我想提升英文閱讀能力',
      '我想找到適合自己的英文學習方向',
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

  if (
    keyword.includes('美妝') ||
    keyword.includes('化妝') ||
    keyword.includes('彩妝')
  ) {
    return [
      '我想從基礎開始學日常美妝',
      '我想學會自然的上班妝容',
      '我想練習適合自己的底妝技巧',
      '我想學習快速補妝的方法',
      '我想完成一套適合自己的日常妝容',
    ]
  }

  if (
    keyword.includes('簡報') ||
    keyword.includes('投影片') ||
    keyword.includes('powerpoint') ||
    keyword.includes('ppt')
  ) {
    return [
      '我想從基礎開始學簡報設計',
      '我想學會整理簡報內容與架構',
      '我想提升投影片的視覺設計',
      '我想練習清楚有自信的簡報表達',
      '我想完成一份能實際使用的簡報作品',
    ]
  }

  if (keyword.includes('統計')) {
    return [
      '我想從基礎開始學統計',
      '我想理解常用的統計概念',
      '我想學會選擇適合的統計方法',
      '我想練習解讀統計分析結果',
      '我想用實際資料完成統計分析',
    ]
  }

  if (
    keyword.includes('設計') ||
    keyword.includes('ui') ||
    keyword.includes('ux')
  ) {
    return [
      '我想從基礎開始學視覺設計',
      '我想學習平面設計與版面配置',
      '我想了解 UI／UX 設計',
      '我想提升配色與字體運用能力',
      '我想完成一個能展示的設計作品',
    ]
  }

  if (
    keyword.includes('電競') ||
    keyword.includes('esports') ||
    keyword.includes('e-sports')
  ) {
    return [
      '我想了解電競產業與職業方向',
      '我想提升特定電競遊戲的操作能力',
      '我想學習電競戰術與賽事分析',
      '我想練習電競團隊溝通與合作',
      '我想規劃一套有系統的電競訓練方式',
    ]
  }

  // 本機無法確認語意時不硬湊推薦；按下開始後交給 Gemini 判斷與澄清。
  return []
}
