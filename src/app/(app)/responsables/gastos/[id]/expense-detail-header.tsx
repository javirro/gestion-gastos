import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ExpenseDetailHeaderProps {
  userName: string | null
  userArea: string
  project: string | null
  period: string | null
  description: string | null
  totalAmount: number
  status: string
  correctionReason: string | null
  approvedByAdmin: boolean
  createdAt: string
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED_BY_ADMIN: 'Aprobado (admin)',
  APPROVED_BY_MANAGER: 'Aprobado (responsable)',
  CORRECTION_REQUESTED: 'Corrección solicitada',
  REJECTED: 'Rechazado',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'outline',
  APPROVED_BY_ADMIN: 'secondary',
  APPROVED_BY_MANAGER: 'default',
  CORRECTION_REQUESTED: 'destructive',
  REJECTED: 'destructive',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function ExpenseDetailHeader({
  userName,
  userArea,
  project,
  period,
  description,
  totalAmount,
  status,
  correctionReason,
  approvedByAdmin,
  createdAt,
}: ExpenseDetailHeaderProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          {userName !== null && (
            <>
              <CardTitle className="text-lg">{userName ?? 'Usuario desconocido'}</CardTitle>
              {userArea && <p className="mt-0.5 text-sm text-muted-foreground">{userArea}</p>}
            </>
          )}
        </div>
        <Badge variant={STATUS_VARIANT[status] ?? 'outline'}>
          {STATUS_LABEL[status] ?? status}
        </Badge>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fecha de presentación</dt>
            <dd className="mt-0.5 text-sm">{formatDate(createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Importe total</dt>
            <dd className="mt-0.5 text-sm font-semibold">{formatCurrency(totalAmount)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Proyecto</dt>
            <dd className="mt-0.5 text-sm">{project ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Periodo</dt>
            <dd className="mt-0.5 text-sm">
              {period
                ? new Date(Number(period.split('-')[0]), Number(period.split('-')[1]) - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                : '—'}
            </dd>
          </div>
          {description && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Descripción</dt>
              <dd className="mt-0.5 text-sm">{description}</dd>
            </div>
          )}
          {correctionReason && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Motivo de corrección</dt>
              <dd className="mt-0.5 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
                {correctionReason}
              </dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
