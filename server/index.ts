import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.post('/api/generate-learning-goal', async (req, res) => {
  try {
    const {
      topic,
      motivation,
      outcome,
      duration,
      dailyTime,
    } = req.body

    const response = await openai.responses.create({
      model: 'gpt-5.6-luna',

      input: `
你是一位 AI Learning Coach。

請根據學習者的資料，設計一個具體、可執行的自主學習方案。

學習主題：${topic}
學習動機：${motivation}
預期成果：${outcome}
完成期限：${duration}
每日投入時間：${dailyTime}

重要要求：

1. 不要只是重新排列或改寫上述五項資料。
2. goalStatement 必須提出「實際要學什麼」。
3. 根據學習主題自行推論適合的學習內容與學習順序。
4. 學習內容必須符合完成期限與每日投入時間。
5. aiRationale 要說明為什麼這樣安排適合這位學習者。
6. 使用繁體中文。
7. 回傳 JSON，不要加入 markdown。

例如，如果學習者要學英文口說並準備出國，
不要只寫「每天學英文口說」。

應具體規劃：
自我介紹、日常寒暄、問路與交通、餐廳點餐與結帳、
購物、住宿、緊急需求及日常對話等情境。

請回傳：

{
  "goalStatement": "具體學習方案",
  "aiRationale": "為什麼這個方案適合學習者"
}
`,
    })

    const text = response.output_text

    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const result = JSON.parse(cleanedText)

    res.json(result)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: '產生學習目標失敗',
    })
  }
})

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`)
})