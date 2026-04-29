'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react'
import { STATUS_LABEL, STATUS_VARIANT, formatExpenseDate, formatCurrency } from '@/lib/expense-status'
import { cn } from '@/lib/utils'
import { exportExpenseToPdf } from '@/lib/export-expense-pdf'

interface ExpenseItem {
  id: string
  date: string
  category: string
  amount: number
  startingLocation: string | null
  destination: string | null
  description: string | null
}

interface Expense {
  id: string
  project: string | null
  totalAmount: number
  description: string | null
  isInternational: boolean
  status: string
  createdAt: string
  expenseItems: ExpenseItem[]
}

interface ExpensesTableProps {
  expenses: Expense[]
  page: number
  totalPages: number
}

export function ExpensesTable({ expenses, page, totalPages }: ExpensesTableProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  return (
    <div className="space-y-4">
      <div className='overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Importe total</TableHead>
              <TableHead>Nº gastos</TableHead>
              <TableHead>Internacional</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='w-10' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center text-muted-foreground'>
                  No se encontraron gastos.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow
                  key={expense.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => startTransition(() => router.push(`/gastos/${expense.id}`))}
                >
                  <TableCell>{formatExpenseDate(expense.createdAt)}</TableCell>
                  <TableCell className="font-medium">
                    {expense.project ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{formatCurrency(expense.totalAmount)}</TableCell>
                  <TableCell>{expense.expenseItems.length}</TableCell>
                  <TableCell>
                    {expense.isInternational ? 'Sí' : 'No'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[expense.status] ?? 'outline'}>
                      {STATUS_LABEL[expense.status] ?? expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}
                      onClick={(e) => { e.stopPropagation(); exportExpenseToPdf(expense) }}
                      title='Exportar PDF'
                    >
                      <FileDown className='size-4' />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Página {page} de {Math.max(1, totalPages)}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={`/gastos?page=${page - 1}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <ChevronLeft className="mr-1 size-4" />
              Anterior
            </Link>
          ) : (
            <span
              className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}
            >
              <ChevronLeft className="mr-1 size-4" />
              Anterior
            </span>
          )}
          {page < totalPages ? (
            <Link
              href={`/gastos?page=${page + 1}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Siguiente
              <ChevronRight className="ml-1 size-4" />
            </Link>
          ) : (
            <span
              className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' pointer-events-none opacity-50'}
            >
              Siguiente
              <ChevronRight className="ml-1 size-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
