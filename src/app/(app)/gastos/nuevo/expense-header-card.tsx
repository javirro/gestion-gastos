'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ExpenseHeaderCardProps {
  project: string
  onProjectChange: (value: string) => void
  period: string
  onPeriodChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
}

export function ExpenseHeaderCard({
  project,
  onProjectChange,
  period,
  onPeriodChange,
  description,
  onDescriptionChange,
}: ExpenseHeaderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información general</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="project">Proyecto</Label>
          <Input
            id="project"
            placeholder="Nombre del proyecto (opcional)"
            value={project}
            onChange={(e) => onProjectChange(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="period">Periodo</Label>
          <Input
            id="period"
            type="month"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descripción general del gasto (opcional)"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}
