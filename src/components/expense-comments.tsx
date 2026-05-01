'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare } from 'lucide-react'

interface Comment {
  id: string
  userId: string
  userName: string | null
  message: string
  createdAt: string
}

interface ExpenseCommentsProps {
  expenseId: string
  comments: Comment[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ExpenseComments({ expenseId, comments: initial }: ExpenseCommentsProps) {
  const [comments, setComments] = useState(initial)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/traveling-expenses/${expenseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.message ?? 'Error al añadir el comentario.')
        return
      }

      setComments((prev) => [...prev, json.data])
      setMessage('')
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          Comentarios
          {comments.length > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
              {comments.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay comentarios todavía.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{c.userName ?? 'Usuario'}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm">{c.message}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 pt-1">
          <Textarea
            placeholder="Escribe un comentario..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={1000}
            disabled={loading}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{message.length}/1000</span>
            <Button type="submit" size="sm" disabled={loading || !message.trim()}>
              Comentar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
