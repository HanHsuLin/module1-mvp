import { useEffect, useState } from 'react'

type MessageBubbleProps = {
  role: 'ai' | 'learner'
  text: string
}

function MessageBubble({ role, text }: MessageBubbleProps) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    if (role === 'learner') {
      return
    }

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
