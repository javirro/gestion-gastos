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
  isInternational?: boolean
  startingLocation: string | null
  destination: string | null
  distance?: number | null
  description: string | null
  ticket?: string | null
}

export interface ExpenseForPdf {
  id: string
  userName?: string | null
  userArea?: string
  project: string | null
  period?: string | null
  totalAmount: number
  description: string | null
  status: string
  createdAt: string
  expenseItems: ExpenseItemForPdf[]
}

async function imageToBase64(
  url: string
): Promise<{ data: string; format: string; width: number; height: number } | null> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    const format = blob.type.includes('png') ? 'PNG' : 'JPEG'
    const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = dataUrl
    })
    return { data: dataUrl, format, width, height }
  } catch {
    return null
  }
}

export async function exportExpenseToPdf(expense: ExpenseForPdf) {
  const doc = new jsPDF()
  const margin = 14
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2

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

  const infoRows: [string, string][] = [['Fecha', formatExpenseDate(expense.createdAt)]]
  if (expense.userName) infoRows.push(['Empleado', expense.userName])
  if (expense.userArea) infoRows.push(['Área', expense.userArea])
  infoRows.push(['Proyecto', expense.project ?? '—'])
  if (expense.period) {
    const [year, month] = expense.period.split('-')
    const periodLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    })
    infoRows.push(['Periodo', periodLabel])
  }
  infoRows.push(['Estado', STATUS_LABEL[expense.status] ?? expense.status])
  infoRows.push(['Descripción', expense.description ?? '—'])

  autoTable(doc, {
    startY: 50,
    head: [],
    body: infoRows,
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
    head: [['Fecha', 'Categoría', 'Intl.', 'Origen', 'Destino', 'Descripción', 'Importe']],
    body: expense.expenseItems.map((item) => [
      formatExpenseDate(item.date),
      CATEGORY_LABEL[item.category] ?? item.category,
      item.isInternational ? 'Sí' : 'No',
      item.startingLocation ?? '—',
      item.destination ?? '—',
      item.description ?? '—',
      formatCurrency(item.amount),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: { 6: { halign: 'right', fontStyle: 'bold' } },
    foot: [['', '', '', '', '', 'Total', formatCurrency(expense.totalAmount)]],
    footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [30, 30, 30] },
    margin: { left: margin, right: margin },
  })

  // Ticket images — one page per ticket
  const itemsWithTickets = expense.expenseItems.filter((item) => item.ticket)
  for (let i = 0; i < itemsWithTickets.length; i++) {
    const item = itemsWithTickets[i]
    doc.addPage()

    const label = `Ticket ${i + 1} — ${CATEGORY_LABEL[item.category] ?? item.category} — ${formatExpenseDate(item.date)} — ${formatCurrency(item.amount)}`
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(label, margin, 20)

    const details = [
      item.isInternational ? 'Internacional: Sí' : 'Internacional: No',
      item.startingLocation ? `Origen: ${item.startingLocation}` : null,
      item.destination ? `Destino: ${item.destination}` : null,
      item.description ? `Descripción: ${item.description}` : null,
    ]
      .filter(Boolean)
      .join('   |   ')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    if (details) doc.text(details, margin, 27)

    const imgY = details ? 34 : 28

    const imageData = await imageToBase64(item.ticket!)
    if (imageData) {
      const maxH = 220
      let w = pageWidth
      let h = (imageData.height / imageData.width) * w
      if (h > maxH) {
        h = maxH
        w = (imageData.width / imageData.height) * h
      }
      const x = margin + (pageWidth - w) / 2
      doc.addImage(imageData.data, imageData.format, x, imgY, w, h)
    } else {
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text('No se pudo cargar la imagen del ticket.', margin, imgY + 10)
    }
  }

  const filename = `gasto-${expense.createdAt.slice(0, 10)}-${expense.id.slice(0, 8)}.pdf`
  doc.save(filename)
}
