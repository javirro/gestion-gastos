import { Skeleton } from '@/components/ui/skeleton'

function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-40" />
        </td>
      ))}
    </tr>
  )
}

export default function UsuariosLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b">
                {['Email', 'Rol', 'Creado', 'Último acceso', ''].map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
