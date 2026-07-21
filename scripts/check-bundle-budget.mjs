import { readFile, readdir } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { extname } from 'node:path'

const DIST_DIR = new URL('../dist/', import.meta.url)
const MANIFEST_URL = new URL('../dist/.vite/manifest.json', import.meta.url)
const KB = 1024

const budgets = {
  initialJsGzip: 180,
  regularChunkRaw: 250,
  canvasChunkRaw: 350,
  totalJsGzip: 450,
  totalCssGzip: 30,
}

const manifest = JSON.parse(await readFile(MANIFEST_URL, 'utf8'))
const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry)
const canvasKey = Object.keys(manifest).find((key) => manifest[key].name === 'CanvasPage')

if (!entryKey || !canvasKey) {
  throw new Error('Bundle manifest is missing the app or Canvas entry. Run `vite build` first.')
}

function collectStaticFiles(startKey) {
  const visited = new Set()
  const files = new Set()

  function visit(key) {
    if (visited.has(key)) return
    visited.add(key)
    const item = manifest[key]
    if (!item) return
    if (item.file?.endsWith('.js')) files.add(item.file)
    for (const importedKey of item.imports ?? []) visit(importedKey)
  }

  visit(startKey)
  return files
}

async function assetSize(file) {
  const contents = await readFile(new URL(file, DIST_DIR))
  return {
    raw: contents.byteLength / KB,
    gzip: gzipSync(contents).byteLength / KB,
  }
}

const assetFiles = (await readdir(new URL('assets/', DIST_DIR))).map((file) => `assets/${file}`)
const jsFiles = assetFiles.filter((file) => extname(file) === '.js')
const cssFiles = assetFiles.filter((file) => extname(file) === '.css')
const initialFiles = collectStaticFiles(entryKey)
const canvasFiles = collectStaticFiles(canvasKey)
const sizes = new Map(await Promise.all(assetFiles.map(async (file) => [file, await assetSize(file)])))

const sum = (files, field) =>
  [...files].reduce((total, file) => total + (sizes.get(file)?.[field] ?? 0), 0)

const initialJsGzip = sum(initialFiles, 'gzip')
const totalJsGzip = sum(jsFiles, 'gzip')
const totalCssGzip = sum(cssFiles, 'gzip')

const canvasChunks = jsFiles.filter((file) => canvasFiles.has(file) && !initialFiles.has(file))
const regularChunks = jsFiles.filter((file) => !canvasFiles.has(file) && !initialFiles.has(file))
const largest = (files) =>
  files.reduce(
    (current, file) => ((sizes.get(file)?.raw ?? 0) > current.raw ? { file, ...sizes.get(file) } : current),
    { file: 'none', raw: 0, gzip: 0 },
  )

const largestCanvas = largest(canvasChunks)
const largestRegular = largest(regularChunks)
const checks = [
  ['Initial JS gzip', initialJsGzip, budgets.initialJsGzip],
  ['Largest regular chunk raw', largestRegular.raw, budgets.regularChunkRaw],
  ['Largest Canvas chunk raw', largestCanvas.raw, budgets.canvasChunkRaw],
  ['Total JS gzip', totalJsGzip, budgets.totalJsGzip],
  ['Total CSS gzip', totalCssGzip, budgets.totalCssGzip],
]

console.log('Bundle budget report')
for (const [label, actual, limit] of checks) {
  const passed = actual <= limit
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}: ${actual.toFixed(2)} KB / ${limit} KB`)
}
console.log(`Largest regular chunk: ${largestRegular.file}`)
console.log(`Largest Canvas chunk: ${largestCanvas.file}`)

if (checks.some(([, actual, limit]) => actual > limit)) {
  process.exitCode = 1
}
