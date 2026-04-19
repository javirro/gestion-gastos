'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ApproveActions } from './approve-actions'

interface ReviewExpense {
  id: string
  userName: string | null
  userArea: string
  project: string | null
  totalAmount: number
  status: string
  createdAt: string
  expenseItems: { id: string }[]
}

interface ReviewExpensesTableProps {
  expenses: ReviewExpense[]
  page: number
  totalPages: number
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED_BY_MANAGER: 'Aprobado (resp.)',
  APPROVED_BY_ADMIN: 'Aprobado',
  CORRECTION_REQUESTED: 'Corrección',
  REJECTED: 'Rechazado',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'outline',
  APPROVED_BY_MANAGER: 'secondary',
  APPROVED_BY_ADMIN: 'default',
  CORRECTION_REQUESTED: 'secondary',
  REJECTED: 'destructive',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function ReviewExpensesTable({ expenses, page, totalPages }: ReviewExpensesTableProps) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay gastos pendientes de revisión.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow
                  key={expense.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/responsables/gastos/${expense.id}`)}
                >
                  <TableCell className="font-medium">{expense.userName ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{expense.userArea}</TableCell>
                  <TableCell>{formatDate(expense.createdAt)}</TableCell>
                  <TableCell>{expense.project ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{formatCurrency(expense.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[expense.status] ?? 'outline'}>
                      {STATUS_LABEL[expense.status] ?? expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <ApproveActions
                      expenseId={expense.id}
                      status={expense.status}
                      onSuccess={() => router.refresh()}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Página {page} de {Math.max(1, totalPages)}</p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={`/responsables/gastos?page=${page - 1}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <ChevronLeft className="mr-1 size-4" /> Anterior
            </Link>
          ) : (
            <span className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}>
              <ChevronLeft className="mr-1 size-4" /> Anterior
            </span>
          )}
          {page < totalPages ? (
            <Link href={`/responsables/gastos?page=${page + 1}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Siguiente <ChevronRight className="ml-1 size-4" />
            </Link>
          ) : (
            <span className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}>
              Siguiente <ChevronRight className="ml-1 size-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
