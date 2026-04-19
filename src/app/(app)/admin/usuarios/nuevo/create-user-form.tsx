'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { APP_ROLES } from '@/lib/auth/roles'

const AREAS = [
  { value: 'ADMINISTRACION', label: 'Administración' },
  { value: 'TECNOLOGIA', label: 'Tecnología' },
  { value: 'RECURSOS_HUMANOS', label: 'Recursos Humanos' },
  { value: 'GESTION', label: 'Gestión' },
  { value: 'BIOLOGIA', label: 'Biología' },
  { value: 'QUIMICA', label: 'Química' }
]

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRACION: 'Administración',
  EMPLEADO: 'Empleado',
  RESPONSABLES: 'Responsables',
  IP: 'IP',
  DIRECTIVOS: 'Directivos'
}

export function CreateUserForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [area, setArea] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined, role, area })
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.message ?? 'Error al crear el usuario.')
        return
      }

      router.push('/admin/usuarios')
      router.refresh()
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del nuevo usuario</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              Contraseña <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" type="text" placeholder="Nombre completo (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>
              Rol <span className="text-destructive">*</span>
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {APP_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Área <span className="text-destructive">*</span>
            </Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un área" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/usuarios')} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !email || !password || !role || !area}>
            {loading ? 'Creando...' : 'Crear usuario'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
