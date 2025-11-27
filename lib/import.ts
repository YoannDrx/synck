import Papa from 'papaparse'

export type ImportFormat = 'csv' | 'json'

export type ImportResult<T> = {
  data: T[]
  errors: { row: number; field: string; message: string }[]
  warnings: { row: number; field: string; message: string }[]
}

/**
 * Parse un fichier CSV
 */
export async function parseCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as T[])
      },
      error: (error: Error) => {
        reject(error)
      },
    })
  })
}

/**
 * Parse un fichier JSON
 */
export async function parseJSON<T>(file: File): Promise<T[]> {
  const text = await file.text()
  return JSON.parse(text) as T[]
}

/**
 * Parse un fichier selon son format
 */
export async function parseFile<T>(file: File, format: ImportFormat): Promise<T[]> {
  switch (format) {
    case 'csv':
      return parseCSV<T>(file)
    case 'json':
      return parseJSON<T>(file)
    default: {
      const exhaustiveCheck: never = format
      throw new Error(`Format non supporté : ${String(exhaustiveCheck)}`)
    }
  }
}

/**
 * Valide les données importées
 */
export function validateImportData<T>(
  data: T[],
  validator: (
    item: T,
    index: number
  ) => {
    valid: boolean
    errors?: { field: string; message: string }[]
    warnings?: { field: string; message: string }[]
  }
): ImportResult<T> {
  const validData: T[] = []
  const errors: ImportResult<T>['errors'] = []
  const warnings: ImportResult<T>['warnings'] = []

  data.forEach((item, index) => {
    const result = validator(item, index)

    if (result.valid) {
      validData.push(item)
    }

    if (result.errors) {
      result.errors.forEach((err) => {
        errors.push({
          row: index + 1,
          field: err.field,
          message: err.message,
        })
      })
    }

    if (result.warnings) {
      result.warnings.forEach((warn) => {
        warnings.push({
          row: index + 1,
          field: warn.field,
          message: warn.message,
        })
      })
    }
  })

  return { data: validData, errors, warnings }
}

/**
 * Détecte le format du fichier par extension
 */
export function detectFormat(filename: string): ImportFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'csv') return 'csv'
  if (ext === 'json') return 'json'
  return null
}
