import { useEffect, useState } from 'react'

type MessageBubbleProps = {
  role: 'ai' | 'learner'
  text: string
}

function MessageBubble({ role, text }: MessageBubbleProps) {
  const [displayedText, setDisplayedText] = useState(
    role === 'learner' ? text : ''
  )

  useEffect(() => {
    if (role === 'learner') {
      setDisplayedText(text)
      return
    }

    setDisplayedText('')

    let index = 0

    const timer = window.setInterval(() => {
      index += 1
      setDisplayedText(text.slice(0, index))

      if (index >= text.length) {
        window.clearInterval(timer)
      }
    }, 40)

    return () => {
      window.clearInterval(timer)
    }
  }, [role, text])

  return (
    <div className={`message-row ${role}`}>
      <div className={`message-bubble ${role}`}>
        <div className="message-role">
          {role === 'ai' ? 'AI Learning Coach' : 'You'}
        </div>

        <div className="message-content">
          {role === 'ai' ? displayedText : text}

          {role === 'ai' && displayedText.length < text.length && (
            <span className="typing-cursor">|</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble