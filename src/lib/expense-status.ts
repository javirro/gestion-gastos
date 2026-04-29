export const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED_BY_MANAGER: 'Aprobado (resp.)',
  APPROVED_BY_ADMIN: 'Aprobado',
  CORRECTION_REQUESTED: 'Corrección',
  REJECTED: 'Rechazado',
}

export const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'outline',
  APPROVED_BY_MANAGER: 'secondary',
  APPROVED_BY_ADMIN: 'default',
  CORRECTION_REQUESTED: 'destructive',
  REJECTED: 'destructive',
}

export function formatExpenseDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}
