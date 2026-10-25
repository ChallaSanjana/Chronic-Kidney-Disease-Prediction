import { createWorker } from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const numericPatterns = {
  age: ['patient age', 'age'],
  bp: ['blood pressure', 'bp'],
  sg: ['specific gravity', 'sp gravity', 'sg'],
  al: ['albumin', 'al'],
  su: ['sugar', 'su'],
  bgr: ['blood glucose', 'blood sugar', 'glucose'],
  bu: ['blood urea', 'urea'],
  sc: ['serum creatinine', 'creatinine'],
  sod: ['serum sodium', 'sodium'],
  pot: ['serum potassium', 'potassium'],
  hemo: ['hemoglobin', 'haemoglobin'],
  pcv: ['packed cell volume', 'hematocrit'],
  wc: ['white blood cell count', 'white cell count', 'white blood cells', 'wbc'],
  rc: ['red blood cell count', 'red cell count', 'red blood cells', 'rbc count'],
}

const categoricalPatterns = {
  rbc: ['red blood cell morphology', 'red blood cells'],
  pc: ['pus cell morphology', 'pus cells', 'pus cell'],
  pcc: ['pus cell clumps'],
  ba: ['bacteria'],
  htn: ['hypertension'],
  dm: ['diabetes mellitus', 'diabetes'],
  cad: ['coronary artery disease'],
  appet: ['appetite'],
  pe: ['pedal edema'],
  ane: ['anemia', 'anaemia'],
}

const numericPattern = /[-+]?(?:\d+(?:[.,]\d+)?|[.,]\d+)/
const unitsPattern = '(?:%|mg\\s*/?\\s*dL|g\\s*/?\\s*dL|mEq\\s*/?\\s*L|mmHg|cells?\\s*/?\\s*[µu]?L|10\\^?\\d+\\s*/?\\s*[µu]?L)?'

function normalizeLine(line) {
  return line
    .toLowerCase()
    .replace(/[|]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function normalizeText(text) {
  return text
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean)
}

function escapedLabel(label) {
  return label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
}

function labelExpression(labels) {
  return labels
    .slice()
    .sort((left, right) => right.length - left.length)
    .map(escapedLabel)
    .join('|')
}

function valueTextAfterLabel(line, labels) {
  const expression = new RegExp(`\\b(?:${labelExpression(labels)})\\b`, 'i')
  const match = expression.exec(line)
  if (!match) return null
  return line.slice(match.index + match[0].length).replace(/^[\s:=-]+/, '')
}

function findNumericValue(lines, labels) {
  for (let index = 0; index < lines.length; index += 1) {
    const remainder = valueTextAfterLabel(lines[index], labels)
    if (remainder === null) continue
    const match = remainder.match(numericPattern)
    if (match) {
      const rawValue = match[0].replace(',', '.')
      const followingText = remainder.slice(match.index + match[0].length)
      // Units are intentionally accepted and retained in the report text; only
      // the numeric model input is returned to the existing form.
      if (!followingText || new RegExp(`^\\s*${unitsPattern}`, 'i').test(followingText)) {
        return rawValue
      }
    }

    const nextLine = lines[index + 1]
    if (nextLine && new RegExp(`^${numericPattern.source}\\s*${unitsPattern}\\s*$`, 'i').test(nextLine)) {
      return nextLine.match(numericPattern)[0].replace(',', '.')
    }
  }
  return ''
}

function categoryForLine(line, options) {
  const normalized = line.replace(/[^a-z]/g, ' ')
  if (options.includes('normal') && /\b(normal|negative|neg|clear)\b/.test(normalized)) return 'normal'
  if (options.includes('abnormal') && /\b(abnormal|positive|pos|high|low)\b/.test(normalized)) return 'abnormal'
  if (options.includes('notpresent') && /\b(not\s*present|absent|negative|neg|none)\b/.test(normalized)) return 'notpresent'
  if (options.includes('present') && /\b(present|positive|pos)\b/.test(normalized)) return 'present'
  if (options.includes('yes') && /\b(yes|positive|pos|present)\b/.test(normalized)) return 'yes'
  if (options.includes('no') && /\b(no|negative|neg|absent|none|not\s*present)\b/.test(normalized)) return 'no'
  if (options.includes('good') && /\bgood\b/.test(normalized)) return 'good'
  if (options.includes('poor') && /\bpoor\b/.test(normalized)) return 'poor'
  return ''
}

function findCategory(lines, labels, options) {
  for (let index = 0; index < lines.length; index += 1) {
    if (valueTextAfterLabel(lines[index], labels) === null) continue
    const current = categoryForLine(lines[index], options)
    if (current) return current
    const next = lines[index + 1] ? categoryForLine(lines[index + 1], options) : ''
    if (next) return next
  }
  return ''
}

export function mapExtractedValues(text) {
  const lines = normalizeText(text)
  const values = {}
  for (const [name, labels] of Object.entries(numericPatterns)) {
    values[name] = findNumericValue(lines, labels)
  }

  const options = {
    rbc: ['normal', 'abnormal'],
    pc: ['normal', 'abnormal'],
    pcc: ['present', 'notpresent'],
    ba: ['present', 'notpresent'],
    htn: ['yes', 'no'],
    dm: ['yes', 'no'],
    cad: ['yes', 'no'],
    appet: ['good', 'poor'],
    pe: ['yes', 'no'],
    ane: ['yes', 'no'],
  }
  for (const [name, labels] of Object.entries(categoricalPatterns)) {
    values[name] = findCategory(lines, labels, options[name])
  }
  return values
}

async function imageFromPdf(page) {
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  return canvas
}

export async function extractReport(file, onProgress = () => {}) {
  const isPdf = file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf')
  if (!isPdf || (file.type && file.type !== 'application/pdf')) {
    throw new Error('Please upload a PDF lab report. Images and other file formats are not supported.')
  }

  const worker = await createWorker('eng', 1, {
    logger: ({ status, progress }) => onProgress(status, progress),
  })
  try {
    const images = []
    const documentData = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: documentData }).promise
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      images.push(await imageFromPdf(await pdf.getPage(pageNumber)))
    }

    let text = ''
    for (const image of images) {
      const result = await worker.recognize(image)
      text += `${result.data.text}\n`
    }
    return { text, values: mapExtractedValues(text) }
  } finally {
    await worker.terminate()
  }
}
