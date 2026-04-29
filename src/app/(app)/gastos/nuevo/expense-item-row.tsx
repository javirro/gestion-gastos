'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Upload } from 'lucide-react'

export interface ExpenseItem {
  key: string
  date: string
  category: string
  amount: string
  startingLocation: string
  destination: string
  description: string
  ticketFile: File | null
  existingTicketUrl?: string
}

export function createEmptyItem(): ExpenseItem {
  return {
    key: crypto.randomUUID(),
    date: '',
    category: '',
    amount: '',
    startingLocation: '',
    destination: '',
    description: '',
    ticketFile: null
  }
}

const CATEGORIES = [
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'DIETAS', label: 'Dietas' },
  { value: 'COMISIONES', label: 'Comisiones' },
  { value: 'COMBUSTIBLE', label: 'Combustible' }
]

export interface ExpenseItemRowProps {
  item: ExpenseItem
  index: number
  onUpdate: (updates: Partial<ExpenseItem>) => void
  onRemove: () => void
  canRemove: boolean
}

export function ExpenseItemRow({ item, index, onUpdate, onRemove, canRemove }: ExpenseItemRowProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Gasto #{index + 1}</p>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
            <Trash2 className="mr-1 size-4" />
            Eliminar
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>
            Fecha <span className="text-destructive">*</span>
          </Label>
          <Input type="date" value={item.date} onChange={(e) => onUpdate({ date: e.target.value })} required />
        </div>

        <div className="space-y-1.5">
          <Label>
            Categoría <span className="text-destructive">*</span>
          </Label>
          <Select value={item.category || undefined} onValueChange={(value) => onUpdate({ category: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>
            Importe (€) <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={item.amount}
            onChange={(e) => onUpdate({ amount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Origen</Label>
          <Input
            placeholder="Lugar de salida"
            value={item.startingLocation}
            onChange={(e) => onUpdate({ startingLocation: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Destino</Label>
          <Input placeholder="Lugar de destino" value={item.destination} onChange={(e) => onUpdate({ destination: e.target.value })} />
        </div>

        <div className="space-y-1.5">
          <Label>Descripción</Label>
          <Input placeholder="Descripción del gasto" value={item.description} onChange={(e) => onUpdate({ description: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Ticket / Justificante</Label>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <Upload className="size-4" />
            {item.ticketFile
              ? item.ticketFile.name
              : item.existingTicketUrl
                ? 'Reemplazar ticket'
                : 'Subir imagen'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpdate({ ticketFile: e.target.files?.[0] ?? null })}
            />
          </label>
          {item.ticketFile && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onUpdate({ ticketFile: null })}>
              Quitar
            </Button>
          )}
          {!item.ticketFile && item.existingTicketUrl && (
            <a
              href={item.existingTicketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground underline underline-offset-2"
            >
              Ver ticket actual
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
