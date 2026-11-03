/**
 * Minimal in-memory stand-in for the Apps Script services used by google-apps-script.js,
 * so the real script can run under Node. Only the methods the script calls are implemented.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createContext, runInContext } from 'node:vm'

type Cell = string | number

export class FakeSheet {
  rows: Cell[][] = []
  maxRows = 1000
  frozenRows = 0
  readonly name: string

  constructor(name: string) {
    this.name = name
  }

  getName() {
    return this.name
  }

  getLastRow() {
    return this.rows.length
  }

  getMaxRows() {
    return this.maxRows
  }

  insertRowsAfter(_after: number, count: number) {
    this.maxRows += count
  }

  setFrozenRows(count: number) {
    this.frozenRows = count
  }

  getRange(row: number, column: number, numRows = 1, numColumns = 1) {
    if (row + numRows - 1 > this.maxRows) {
      throw new Error('The coordinates of the range are outside the dimensions of the sheet.')
    }
    const rows = this.rows
    const read = () =>
      Array.from({ length: numRows }, (_, r) =>
        Array.from({ length: numColumns }, (_, c) => rows[row - 1 + r]?.[column - 1 + c] ?? ''),
      )
    const range = {
      getValues: read,
      getDisplayValues: () => read().map((cells) => cells.map((cell) => String(cell))),
      setValues(values: Cell[][]) {
        if (values.length !== numRows || values.some((cells) => cells.length !== numColumns)) {
          throw new Error('The number of rows or columns in the data does not match the range.')
        }
        values.forEach((cells, r) => {
          const target = (rows[row - 1 + r] ??= [])
          cells.forEach((cell, c) => {
            target[column - 1 + c] = cell
          })
        })
        return range
      },
      setNumberFormat: () => range,
      setFontWeight: () => range,
    }
    return range
  }
}

export class FakeSpreadsheet {
  sheets = new Map<string, FakeSheet>()

  getSheetByName(name: string) {
    return this.sheets.get(name) ?? null
  }

  insertSheet(name: string) {
    const sheet = new FakeSheet(name)
    this.sheets.set(name, sheet)
    return sheet
  }
}

export interface AppsScriptRuntime {
  spreadsheet: FakeSpreadsheet
  lock: { acquired: number; released: number; available: boolean }
  doPost: (event: unknown) => { getContent: () => string }
  doGet: () => { getContent: () => string }
  validateSubmission: (payload: unknown) => string[]
  buildDatasetExport: (spreadsheet: FakeSpreadsheet) => {
    csv: string
    filename: string
    rowCount: number
    submissionCount: number
    excludedSubmissions: number
  }
  post: (body: unknown) => Record<string, unknown>
}

export function loadAppsScript(): AppsScriptRuntime {
  const spreadsheet = new FakeSpreadsheet()
  const lock = { acquired: 0, released: 0, available: true }
  const context = createContext({
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet, flush: () => undefined },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => {
          if (!lock.available) return false
          lock.acquired += 1
          return true
        },
        releaseLock: () => {
          lock.released += 1
        },
      }),
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (content: string) => ({ getContent: () => content, setMimeType() { return this } }),
    },
    Logger: { log: () => undefined },
  })
  const source = readFileSync(join(process.cwd(), 'google-apps-script.js'), 'utf8')
  runInContext(source, context, { filename: 'google-apps-script.js' })

  const runtime = context as unknown as AppsScriptRuntime
  return {
    spreadsheet,
    lock,
    doPost: runtime.doPost,
    doGet: runtime.doGet,
    validateSubmission: runtime.validateSubmission,
    buildDatasetExport: runtime.buildDatasetExport,
    post(body: unknown) {
      const contents = typeof body === 'string' ? body : JSON.stringify(body)
      return JSON.parse(runtime.doPost({ postData: { contents } }).getContent())
    },
  }
}
