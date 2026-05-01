'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExpenseHeaderCard } from '../../nuevo/expense-header-card'
import { ExpenseItemsCard } from '../../nuevo/expense-items-card'
import { type ExpenseItem, createEmptyItem } from '../../nuevo/expense-item-row'

interface InitialItem {
  date: string
  category: string
  amount: number
  isInternational: boolean
  startingLocation: string | null
  destination: string | null
  distance: number | null
  description: string | null
  ticket: string | null
}

interface EditExpenseFormProps {
  expenseId: string
  initialProject: string
  initialPeriod: string
  initialDescription: string
  initialItems: InitialItem[]
}

function toFormItem(item: InitialItem): ExpenseItem {
  return {
    key: crypto.randomUUID(),
    date: item.date.substring(0, 10),
    category: item.category,
    amount: String(item.amount),
    isInternational: item.isInternational,
    startingLocation: item.startingLocation ?? '',
    destination: item.destination ?? '',
    distance: item.distance != null ? String(item.distance) : '',
    description: item.description ?? '',
    ticketFile: null,
    existingTicketUrl: item.ticket ?? undefined,
  }
}

export function EditExpenseForm({
  expenseId,
  initialProject,
  initialPeriod,
  initialDescription,
  initialItems,
}: EditExpenseFormProps) {
  const router = useRouter()

  const [project, setProject] = useState(initialProject)
  const [period, setPeriod] = useState(initialPeriod)
  const [description, setDescription] = useState(initialDescription)
  const [items, setItems] = useState<ExpenseItem[]>(initialItems.map(toFormItem))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit =
    items.length > 0 &&
    items.every((item) => item.date && item.category && parseFloat(item.amount) > 0)

  function addItem() { setItems((prev) => [...prev, createEmptyItem()]) }
  function updateItem(index: number, updates: Partial<ExpenseItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }
  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const metadata = {
        project: project || undefined,
        period: period || undefined,
        description: description || undefined,
        items: items.map((item) => ({
          date: item.date,
          category: item.category,
          amount: parseFloat(item.amount),
          isInternational: item.isInternational,
          startingLocation: item.startingLocation || undefined,
          destination: item.destination || undefined,
          distance: item.distance ? parseFloat(item.distance) : undefined,
          description: item.description || undefined,
          existingTicketUrl: item.ticketFile ? undefined : item.existingTicketUrl,
        })),
      }

      const formData = new FormData()
      formData.append('metadata', JSON.stringify(metadata))
      items.forEach((item, index) => {
        if (item.ticketFile) formData.append(`ticket_${index}`, item.ticketFile)
      })

      const res = await fetch(`/api/traveling-expenses/${expenseId}`, { method: 'PUT', body: formData })
      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.message ?? 'Error al actualizar el gasto.')
        return
      }

      router.push(`/gastos/${expenseId}`)
      router.refresh()
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ExpenseHeaderCard
        project={project}
        onProjectChange={setProject}
        period={period}
        onPeriodChange={setPeriod}
        description={description}
        onDescriptionChange={setDescription}
      />
      <ExpenseItemsCard
        items={items}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !canSubmit}>
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
