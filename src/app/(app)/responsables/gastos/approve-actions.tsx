'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, MessageSquare, X } from 'lucide-react'

type Action = 'APPROVE' | 'REQUEST_CORRECTION' | 'REJECT'

const FINAL_STATUSES = ['APPROVED_BY_ADMIN', 'REJECTED']

const ACTION_TITLES: Record<Action, string> = {
  APPROVE: '¿Aprobar este gasto?',
  REQUEST_CORRECTION: 'Solicitar corrección',
  REJECT: '¿Rechazar este gasto?',
}

const ACTION_DESCRIPTIONS: Record<Action, string> = {
  APPROVE: 'Esta acción aprobará el gasto de desplazamiento.',
  REQUEST_CORRECTION: 'Indica el motivo de la corrección solicitada al empleado.',
  REJECT: 'Esta acción rechazará el gasto. Esta decisión es definitiva.',
}

interface ApproveActionsProps {
  expenseId: string
  status: string
  onSuccess?: () => void
}

export function ApproveActions({ expenseId, status, onSuccess }: ApproveActionsProps) {
  const router = useRouter()
  const [action, setAction] = useState<Action | null>(null)
  const [correctionReason, setCorrectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (FINAL_STATUSES.includes(status)) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  async function handleConfirm() {
    if (!action) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/traveling-expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, correctionReason: correctionReason || undefined }),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.message ?? 'Error al actualizar el gasto.')
        return
      }

      setAction(null)
      setCorrectionReason('')
      ;(onSuccess ?? (() => router.refresh()))()
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" onClick={() => setAction('APPROVE')} className="h-7 text-xs">
          <Check className="mr-1 size-3" /> Aprobar
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAction('REQUEST_CORRECTION')} className="h-7 text-xs">
          <MessageSquare className="mr-1 size-3" /> Corrección
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAction('REJECT')} className="h-7 text-xs text-destructive hover:text-destructive">
          <X className="mr-1 size-3" /> Rechazar
        </Button>
      </div>

      <Dialog open={!!action} onOpenChange={(open) => { if (!open) { setAction(null); setError(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action ? ACTION_TITLES[action] : ''}</DialogTitle>
            <DialogDescription>{action ? ACTION_DESCRIPTIONS[action] : ''}</DialogDescription>
          </DialogHeader>

          {action === 'REQUEST_CORRECTION' && (
            <div className="space-y-1.5">
              <Label>Motivo <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Describe qué debe corregirse..."
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || (action === 'REQUEST_CORRECTION' && !correctionReason)}
              variant={action === 'REJECT' ? 'destructive' : 'default'}
            >
              {loading ? 'Procesando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
