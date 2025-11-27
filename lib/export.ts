import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'txt'

type ExportData = Record<string, unknown>

/**
 * Convertit des données en CSV et retourne un Blob
 */
export function exportToCSV(data: ExportData[]): Blob {
  const csv = Papa.unparse(data, {
    header: true,
    delimiter: ',',
    newline: '\n',
  })

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Convertit des données en Excel et retourne un Blob
 */
export function exportToExcel(data: ExportData[], sheetName = 'Data'): Blob {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Générer le buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  }) as ArrayBuffer

  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/**
 * Convertit des données en JSON et retourne un Blob
 */
export function exportToJSON(data: ExportData[]): Blob {
  const json = JSON.stringify(data, null, 2)

  return new Blob([json], { type: 'application/json;charset=utf-8;' })
}

/**
 * Convertit des données en TXT et retourne un Blob
 */
export function exportToTXT(data: ExportData[]): Blob {
  // Format simple : chaque objet sur plusieurs lignes
  const lines = data.map((item) => {
    const entries = Object.entries(item)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join('\n')
    return `${entries}\n---\n`
  })

  const txt = lines.join('\n')

  return new Blob([txt], { type: 'text/plain;charset=utf-8;' })
}

/**
 * Déclenche le téléchargement d'un fichier Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporte des données dans le format spécifié et déclenche le téléchargement
 */
export function exportData(data: ExportData[], format: ExportFormat, baseFilename: string): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `${baseFilename}_${timestamp}`

  let blob: Blob

  switch (format) {
    case 'csv': {
      blob = exportToCSV(data)
      downloadBlob(blob, `${filename}.csv`)
      break
    }
    case 'xlsx': {
      blob = exportToExcel(data)
      downloadBlob(blob, `${filename}.xlsx`)
      break
    }
    case 'json': {
      blob = exportToJSON(data)
      downloadBlob(blob, `${filename}.json`)
      break
    }
    case 'txt': {
      blob = exportToTXT(data)
      downloadBlob(blob, `${filename}.txt`)
      break
    }
    default: {
      const exhaustiveCheck: never = format
      throw new Error(`Format d'export non supporté : ${String(exhaustiveCheck)}`)
    }
  }
}

/**
 * Flatten un objet nested pour l'export (transforme les relations en strings)
 */
export function flattenForExport(data: ExportData[]): ExportData[] {
  return data.map((item) => {
    const flattened: Record<string, unknown> = {}

    Object.entries(item).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        flattened[key] = ''
      } else if (Array.isArray(value)) {
        // Arrays : join par virgule ou count
        flattened[key] = value.length > 0 ? value.length : 0
        flattened[`${key}_details`] = value
          .map((v: unknown) =>
            typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)
          )
          .join('; ')
      } else if (typeof value === 'object' && value !== null) {
        // Objects nested : stringify ou extraire champs principaux
        const obj = value as Record<string, unknown>
        if ('id' in obj) flattened[`${key}_id`] = obj.id
        if ('name' in obj) flattened[`${key}_name`] = obj.name
        if ('nameFr' in obj) flattened[`${key}_name`] = obj.nameFr
        if ('title' in obj) flattened[`${key}_title`] = obj.title
        if ('titleFr' in obj) flattened[`${key}_title`] = obj.titleFr
      } else if (value instanceof Date) {
        flattened[key] = value.toISOString()
      } else {
        flattened[key] = value
      }
    })

    return flattened
  })
}
