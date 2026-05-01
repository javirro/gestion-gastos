import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { formatExpenseDate, formatCurrency, STATUS_LABEL } from './expense-status'

const CATEGORY_LABEL: Record<string, string> = {
  TRANSPORTE: 'Transporte',
  DIETAS: 'Dietas',
  COMISIONES: 'Comisiones',
  COMBUSTIBLE: 'Combustible',
}

export interface ExpenseItemForPdf {
  date: string
  category: string
  amount: number
  startingLocation: string | null
  destination: string | null
  description: string | null
}

export interface ExpenseForPdf {
  id: string
  project: string | null
  totalAmount: number
  description: string | null
  status: string
  createdAt: string
  expenseItems: ExpenseItemForPdf[]
}

export function exportExpenseToPdf(expense: ExpenseForPdf) {
  const doc = new jsPDF()
  const margin = 14

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen de Gastos de Viaje', margin, 22)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, 29)
  doc.text(`Ref: ${expense.id}`, margin, 34)

  // Divider
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, 38, 196, 38)

  // General info section
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Información general', margin, 46)

  autoTable(doc, {
    startY: 50,
    head: [],
    body: [
      ['Fecha', formatExpenseDate(expense.createdAt)],
      ['Proyecto', expense.project ?? '—'],
      ['Estado', STATUS_LABEL[expense.status] ?? expense.status],
      ['Descripción', expense.description ?? '—'],
    ],
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, textColor: [60, 60, 60] },
      1: { textColor: [30, 30, 30] },
    },
    styles: { fontSize: 10, cellPadding: 2 },
    margin: { left: margin, right: margin },
  })

  // @ts-expect-error lastAutoTable is added by the plugin at runtime
  const afterInfo: number = doc.lastAutoTable.finalY + 8

  // Total amount highlight
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(`Importe total: ${formatCurrency(expense.totalAmount)}`, margin, afterInfo)

  // Items table section
  const afterTotal = afterInfo + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Desglose de gastos', margin, afterTotal)

  autoTable(doc, {
    startY: afterTotal + 4,
    head: [['Fecha', 'Categoría', 'Origen', 'Destino', 'Descripción', 'Importe']],
    body: expense.expenseItems.map((item) => [
      formatExpenseDate(item.date),
      CATEGORY_LABEL[item.category] ?? item.category,
      item.startingLocation ?? '—',
      item.destination ?? '—',
      item.description ?? '—',
      formatCurrency(item.amount),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: { 5: { halign: 'right', fontStyle: 'bold' } },
    foot: [['', '', '', '', 'Total', formatCurrency(expense.totalAmount)]],
    footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [30, 30, 30] },
    margin: { left: margin, right: margin },
  })

  const filename = `gasto-${expense.createdAt.slice(0, 10)}-${expense.id.slice(0, 8)}.pdf`
  doc.save(filename)
}
