'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ApproveActions } from './approve-actions'
import { STATUS_LABEL, STATUS_VARIANT, formatExpenseDate, formatCurrency } from '@/lib/expense-status'

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
  role: string
  status?: string
  period?: string
  area?: string
}

export function ReviewExpensesTable({ expenses, page, totalPages, role, status, period, area }: ReviewExpensesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    startTransition(() => router.refresh())
  }

  function buildUrl(p: number) {
    const params = new URLSearchParams()
    params.set('page', String(p))
    if (status) params.set('status', status)
    if (period) params.set('period', period)
    if (area) params.set('area', area)
    return `/responsables/gastos?${params.toString()}`
  }

  return (
    <div className={`space-y-4 transition-opacity duration-200${isPending ? ' pointer-events-none opacity-60' : ''}`}>
      <div className='overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead className='hidden sm:table-cell'>Área</TableHead>
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
                  <TableCell className='hidden sm:table-cell text-sm text-muted-foreground'>{expense.userArea}</TableCell>
                  <TableCell>{formatExpenseDate(expense.createdAt)}</TableCell>
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
                      role={role}
                      onSuccess={handleRefresh}
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
            <Link href={buildUrl(page - 1)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <ChevronLeft className="mr-1 size-4" /> Anterior
            </Link>
          ) : (
            <span className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}>
              <ChevronLeft className="mr-1 size-4" /> Anterior
            </span>
          )}
          {page < totalPages ? (
            <Link href={buildUrl(page + 1)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
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
