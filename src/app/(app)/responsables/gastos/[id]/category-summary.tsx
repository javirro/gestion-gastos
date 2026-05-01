import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/expense-status'

const CATEGORY_LABEL: Record<string, string> = {
  TRANSPORTE: 'Transporte',
  DIETAS: 'Dietas',
  COMISIONES: 'Comisiones',
  COMBUSTIBLE: 'Combustible',
}

// Distinct color per category for the progress bars
const CATEGORY_COLOR: Record<string, string> = {
  TRANSPORTE: 'bg-blue-500',
  DIETAS: 'bg-amber-500',
  COMISIONES: 'bg-violet-500',
  COMBUSTIBLE: 'bg-emerald-500',
}

interface Item {
  category: string
  amount: number
}

interface CategorySummaryProps {
  items: Item[]
  totalAmount: number
}

export function CategorySummary({ items, totalAmount }: CategorySummaryProps) {
  const byCategory = items.reduce<Record<string, { count: number; total: number }>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = { count: 0, total: 0 }
      acc[item.category].count++
      acc[item.category].total += item.amount
      return acc
    },
    {}
  )

  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b.total - a.total)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Resumen por categoría</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {entries.map(([category, { count, total }]) => {
          const pct = totalAmount > 0 ? (total / totalAmount) * 100 : 0
          const color = CATEGORY_COLOR[category] ?? 'bg-primary'
          return (
            <div key={category}>
              <div className='mb-1.5 flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  {CATEGORY_LABEL[category] ?? category}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {count} ticket{count !== 1 ? 's' : ''} &middot; {formatCurrency(total)}
                </span>
              </div>
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className={`h-full rounded-full transition-all ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
        <div className='flex items-center justify-between border-t pt-3 text-sm font-semibold'>
          <span>Total</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
