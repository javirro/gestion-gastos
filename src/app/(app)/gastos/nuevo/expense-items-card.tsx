'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { ExpenseItemRow, type ExpenseItem } from './expense-item-row'

interface ExpenseItemsCardProps {
  items: ExpenseItem[]
  onAddItem: () => void
  onUpdateItem: (index: number, updates: Partial<ExpenseItem>) => void
  onRemoveItem: (index: number) => void
}

export function ExpenseItemsCard({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ExpenseItemsCardProps) {
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gastos individuales</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
          <Plus className="mr-1.5 size-4" />
          Añadir gasto
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {items.map((item, index) => (
          <div key={item.key}>
            {index > 0 && <Separator className="mb-6" />}
            <ExpenseItemRow
              item={item}
              index={index}
              onUpdate={(updates) => onUpdateItem(index, updates)}
              onRemove={() => onRemoveItem(index)}
              canRemove={items.length > 1}
            />
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'gasto' : 'gastos'}
        </p>
        <p className="text-lg font-semibold">
          Total:{' '}
          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalAmount)}
        </p>
      </CardFooter>
    </Card>
  )
}
