'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExpenseHeaderCard } from './expense-header-card'
import { ExpenseItemsCard } from './expense-items-card'
import { type ExpenseItem, createEmptyItem } from './expense-item-row'

export function CreateExpenseForm() {
  const router = useRouter()

  const [project, setProject] = useState('')
  const [description, setDescription] = useState('')
  const [isInternational, setIsInternational] = useState(false)
  const [items, setItems] = useState<ExpenseItem[]>([createEmptyItem()])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit =
    items.length > 0 &&
    items.every((item) => item.date && item.category && parseFloat(item.amount) > 0)

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem()])
  }

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
        description: description || undefined,
        isInternational,
        items: items.map((item) => ({
          date: item.date,
          category: item.category,
          amount: parseFloat(item.amount),
          startingLocation: item.startingLocation || undefined,
          destination: item.destination || undefined,
          description: item.description || undefined,
        })),
      }

      const formData = new FormData()
      formData.append('metadata', JSON.stringify(metadata))
      items.forEach((item, index) => {
        if (item.ticketFile) formData.append(`ticket_${index}`, item.ticketFile)
      })

      const res = await fetch('/api/traveling-expenses', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.message ?? 'Error al crear el gasto.')
        return
      }

      router.push('/gastos')
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
        description={description}
        onDescriptionChange={setDescription}
        isInternational={isInternational}
        onIsInternationalChange={setIsInternational}
      />
      <ExpenseItemsCard
        items={items}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/gastos')} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !canSubmit}>
          {loading ? 'Enviando...' : 'Enviar gasto'}
        </Button>
      </div>
    </form>
  )
}
