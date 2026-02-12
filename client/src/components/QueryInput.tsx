import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useNLQuery } from '@/hooks/useNLQuery'
import { useQueryStore } from '@/stores/queryStore'

export function QueryInput() {
  const [question, setQuestion] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const query = useNLQuery()
  const isQuerying = useQueryStore((s) => s.isQuerying)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [question])

  const handleSubmit = () => {
    const trimmed = question.trim()
    if (!trimmed || isQuerying) return
    query.mutate(trimmed)
    setQuestion('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your data..."
        className="min-h-[44px] max-h-[120px] resize-none"
        rows={1}
        disabled={isQuerying}
      />
      <Button
        onClick={handleSubmit}
        disabled={!question.trim() || isQuerying}
        size="icon"
        className="h-11 w-11 shrink-0"
        aria-label="Submit query"
      >
        {isQuerying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
