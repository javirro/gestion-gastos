import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type StepState = 'completed' | 'active' | 'pending' | 'error'

interface TimelineStep {
  label: string
  sublabel: string
  state: StepState
}

function getSteps(status: string, approvedByAdmin: boolean): TimelineStep[] {
  const adminDone = approvedByAdmin || status === 'APPROVED_BY_MANAGER'
  const adminError =
    (!approvedByAdmin && status === 'CORRECTION_REQUESTED') ||
    (!approvedByAdmin && status === 'REJECTED')

  const managerDone = status === 'APPROVED_BY_MANAGER'
  const managerError =
    (approvedByAdmin && status === 'CORRECTION_REQUESTED') ||
    (approvedByAdmin && status === 'REJECTED')
  const managerActive = status === 'APPROVED_BY_ADMIN'

  const adminState: StepState = adminError ? 'error' : adminDone ? 'completed' : 'active'
  const managerState: StepState = managerError
    ? 'error'
    : managerDone
    ? 'completed'
    : managerActive
    ? 'active'
    : 'pending'

  return [
    {
      label: 'Presentado',
      sublabel: 'El empleado envió el gasto',
      state: 'completed',
    },
    {
      label: 'Revisión Administración',
      sublabel: adminError
        ? status === 'CORRECTION_REQUESTED'
          ? 'Corrección solicitada'
          : 'Rechazado'
        : adminDone
        ? 'Aprobado'
        : 'Pendiente de revisión',
      state: adminState,
    },
    {
      label: 'Aprobación Responsable',
      sublabel: managerError
        ? status === 'CORRECTION_REQUESTED'
          ? 'Corrección solicitada'
          : 'Rechazado'
        : managerDone
        ? 'Aprobado'
        : managerActive
        ? 'Pendiente de aprobación'
        : 'Pendiente',
      state: managerState,
    },
  ]
}

const DOT_CLASS: Record<StepState, string> = {
  completed: 'bg-primary',
  active: 'border-2 border-primary bg-background',
  pending: 'border-2 border-muted-foreground/30 bg-muted',
  error: 'border-2 border-destructive bg-background',
}

const LABEL_CLASS: Record<StepState, string> = {
  completed: 'text-foreground',
  active: 'text-foreground font-medium',
  pending: 'text-muted-foreground',
  error: 'text-foreground',
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'completed') return <Check className='size-3.5 text-primary-foreground' />
  if (state === 'active') return <Clock className='size-3 text-primary' />
  if (state === 'error') return <X className='size-3.5 text-destructive' />
  return null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface StatusTimelineProps {
  status: string
  approvedByAdmin: boolean
  createdAt: string
}

export function StatusTimeline({ status, approvedByAdmin, createdAt }: StatusTimelineProps) {
  const steps = getSteps(status, approvedByAdmin)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Estado del proceso</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className='space-y-0'>
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1
            return (
              <li key={step.label} className='flex gap-3'>
                <div className='flex flex-col items-center'>
                  <div
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full',
                      DOT_CLASS[step.state]
                    )}
                  >
                    <StepIcon state={step.state} />
                  </div>
                  {!isLast && (
                    <div className='my-1 w-px flex-1 bg-border' style={{ minHeight: '20px' }} />
                  )}
                </div>
                <div className={cn('pb-4', isLast && 'pb-0')}>
                  <p className={cn('text-sm', LABEL_CLASS[step.state])}>{step.label}</p>
                  <p className='text-xs text-muted-foreground'>
                    {i === 0 ? formatDate(createdAt) : step.sublabel}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
