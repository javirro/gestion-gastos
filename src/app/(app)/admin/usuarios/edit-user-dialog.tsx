'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { APP_ROLES } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'

const AREAS = [
  { value: 'ADMINISTRACION', label: 'Administración' },
  { value: 'TECNOLOGIA', label: 'Tecnología' },
  { value: 'RECURSOS_HUMANOS', label: 'Recursos Humanos' },
  { value: 'GESTION', label: 'Gestión' },
  { value: 'BIOLOGIA', label: 'Biología' },
  { value: 'QUIMICA', label: 'Química' },
]

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRACION: 'Administración',
  EMPLEADO: 'Empleado',
  RESPONSABLES: 'Responsables',
  IP: 'IP',
  DIRECTIVOS: 'Directivos',
}

interface User {
  id: string
  email: string
  name: string | null
  role: string | null
  area: string | null
}

interface EditUserDialogProps {
  user: User
  onSuccess?: () => void
}

export function EditUserDialog({ user, onSuccess }: EditUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(user.name ?? '')
  const [role, setRole] = useState(user.role ?? '')
  const [area, setArea] = useState(user.area ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, role, area }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.message ?? 'Error al actualizar el usuario.')
        return
      }

      setOpen(false)
      onSuccess?.()
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}>
        <Pencil className='size-3.5' />
        <span className='sr-only'>Editar usuario</span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar usuario</SheetTitle>
          <p className='text-sm text-muted-foreground'>{user.email}</p>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='mt-6 space-y-4 px-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-name'>Nombre</Label>
            <Input id='edit-name' value={name} onChange={(e) => setName(e.target.value)} placeholder='Nombre completo' />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-role'>Rol</Label>
            <Select value={role} onValueChange={(v) => { if (v !== null) setRole(v) }} required>
              <SelectTrigger id='edit-role'>
                <SelectValue placeholder='Selecciona un rol' />
              </SelectTrigger>
              <SelectContent>
                {APP_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r] ?? r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-area'>Área</Label>
            <Select value={area} onValueChange={(v) => { if (v !== null) setArea(v) }} required>
              <SelectTrigger id='edit-area'>
                <SelectValue placeholder='Selecciona un área' />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          <div className='flex gap-2 pt-2'>
            <Button type='submit' disabled={loading || !role || !area} className='flex-1'>
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
