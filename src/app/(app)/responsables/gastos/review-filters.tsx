'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { VALID_AREAS } from '@/lib/auth/areas'

const STATUSES = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED_BY_ADMIN', label: 'Aprobado (admin)' },
  { value: 'APPROVED_BY_MANAGER', label: 'Aprobado' },
  { value: 'CORRECTION_REQUESTED', label: 'Corrección' },
  { value: 'REJECTED', label: 'Rechazado' },
]

const AREA_LABEL: Record<string, string> = {
  ADMINISTRACION: 'Administración',
  TECNOLOGIA: 'Tecnología',
  RECURSOS_HUMANOS: 'RRHH',
  GESTION: 'Gestión',
  BIOLOGIA: 'Biología',
  QUIMICA: 'Química',
}

interface ReviewFiltersProps {
  status: string
  period: string
  area: string
  showAreaFilter: boolean
}

export function ReviewFilters({ status, period, area, showAreaFilter }: ReviewFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/responsables/gastos?${params.toString()}`)
  }

  function clearFilters() {
    router.push('/responsables/gastos')
  }

  const hasFilters = !!status || !!period || !!area

  return (
    <div className='flex flex-wrap items-center gap-3'>
      {showAreaFilter && (
        <Select value={area || 'ALL'} onValueChange={(v) => updateFilter('area', v === 'ALL' ? '' : v)}>
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='Todas las áreas' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>Todas las áreas</SelectItem>
            {VALID_AREAS.map((a) => (
              <SelectItem key={a} value={a}>
                {AREA_LABEL[a] ?? a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={status || 'ALL'} onValueChange={(v) => updateFilter('status', v === 'ALL' ? '' : v)}>
        <SelectTrigger className='w-48'>
          <SelectValue placeholder='Todos los estados' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ALL'>Todos los estados</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type='month'
        value={period}
        onChange={(e) => updateFilter('period', e.target.value)}
        className='w-44'
      />

      {hasFilters && (
        <Button variant='ghost' size='sm' onClick={clearFilters} className='text-muted-foreground'>
          <X className='mr-1 size-3.5' />
          Limpiar
        </Button>
      )}
    </div>
  )
}
