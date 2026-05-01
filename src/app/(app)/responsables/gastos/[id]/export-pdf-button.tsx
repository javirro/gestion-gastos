'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { exportExpenseToPdf, type ExpenseForPdf } from '@/lib/export-expense-pdf'

interface ExportPdfButtonProps {
  expense: ExpenseForPdf
}

export function ExportPdfButton({ expense }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      await exportExpenseToPdf(expense)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant='outline' size='sm' onClick={handleExport} disabled={loading}>
      <FileDown className='mr-2 size-4' />
      {loading ? 'Generando...' : 'Exportar PDF'}
    </Button>
  )
}
