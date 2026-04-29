import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, ImageOff } from 'lucide-react'

interface ExpenseItem {
  id: string
  date: string
  category: string
  amount: number
  startingLocation: string | null
  destination: string | null
  description: string | null
  ticket: string | null
}

interface ExpenseItemsDetailProps {
  items: ExpenseItem[]
}

const CATEGORY_LABEL: Record<string, string> = {
  TRANSPORTE: 'Transporte',
  DIETAS: 'Dietas',
  COMISIONES: 'Comisiones',
  COMBUSTIBLE: 'Combustible',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function ExpenseItemsDetail({ items }: ExpenseItemsDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos individuales</CardTitle>
      </CardHeader>
      <CardContent className='overflow-x-auto p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Ticket</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-nowrap">{formatDate(item.date)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{CATEGORY_LABEL[item.category] ?? item.category}</Badge>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.startingLocation ?? '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.destination ?? '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.description ?? '—'}
                </TableCell>
                <TableCell>
                  {item.ticket ? (
                    <a
                      href={item.ticket}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Ver <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <ImageOff className="size-3" /> Sin ticket
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
