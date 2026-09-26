// Minimal .xlsx reader with no dependencies. An .xlsx file is a zip of XML
// parts; we unzip with the platform DecompressionStream ('deflate-raw') and
// read cell values with regular expressions. Enough for form-style sheets:
// text, numbers, booleans, shared/inline strings and merged ranges.

const decoder = new TextDecoder('utf-8')

function decodeXml(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

async function inflateRaw(bytes) {
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

// Returns { [path]: Uint8Array } for the entries whose path passes `wanted`.
async function unzip(buffer, wanted) {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  // End of central directory record (search backwards for its signature).
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('Fail ini bukan fail Excel (.xlsx) yang sah.')

  const count = view.getUint16(eocd + 10, true)
  let offset = view.getUint32(eocd + 16, true)
  const files = {}

  for (let n = 0; n < count; n++) {
    if (view.getUint32(offset, true) !== 0x02014b50) break

    const method = view.getUint16(offset + 10, true)
    const compressedSize = view.getUint32(offset + 20, true)
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const localOffset = view.getUint32(offset + 42, true)
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength))

    offset += 46 + nameLength + extraLength + commentLength

    if (!wanted(name)) continue

    const localNameLength = view.getUint16(localOffset + 26, true)
    const localExtraLength = view.getUint16(localOffset + 28, true)
    const start = localOffset + 30 + localNameLength + localExtraLength
    const data = bytes.subarray(start, start + compressedSize)

    if (method === 0) files[name] = data
    else if (method === 8) files[name] = await inflateRaw(data)
    else throw new Error(`Format mampatan tidak disokong (${method}).`)
  }

  return files
}

export function columnIndex(letters) {
  return [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0)
}

export function columnLetters(index) {
  let letters = ''
  while (index > 0) {
    const rem = (index - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    index = Math.floor((index - 1) / 26)
  }
  return letters
}

// Reads a workbook into [{ name, cells: Map('B6' -> value), merges: ['A10:A13'] }].
export async function readXlsx(buffer) {
  const files = await unzip(buffer, (name) =>
    /^xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|worksheets\/[^/]+\.xml)$/.test(name)
  )

  const text = (path) => (files[path] ? decoder.decode(files[path]) : '')

  const workbookXml = text('xl/workbook.xml')
  if (!workbookXml) throw new Error('Fail ini bukan fail Excel (.xlsx) yang sah.')

  const shared = [...text('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
    (m) => decodeXml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''))
  )

  const rels = text('xl/_rels/workbook.xml.rels')
  const targets = {}
  for (const m of rels.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const id = (m[1].match(/\bId="([^"]+)"/) || [])[1]
    const target = (m[1].match(/\bTarget="([^"]+)"/) || [])[1]
    if (id && target) targets[id] = target
  }

  const sheets = []

  for (const m of workbookXml.matchAll(/<sheet\b([^>]*)\/?>/g)) {
    const name = decodeXml((m[1].match(/\bname="([^"]*)"/) || [])[1] || '')
    const rid = (m[1].match(/\br:id="([^"]+)"/) || [])[1]
    const target = targets[rid]
    if (!target) continue

    const path = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`
    const xml = text(path)
    const cells = new Map()

    for (const c of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1]
      const inner = c[2] || ''
      const ref = (attrs.match(/\br="([A-Z]+\d+)"/) || [])[1]
      if (!ref) continue

      const type = (attrs.match(/\bt="([^"]+)"/) || [])[1]
      const raw = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1]
      let value = ''

      if (type === 's') value = shared[Number(raw)] ?? ''
      else if (type === 'inlineStr') value = decodeXml([...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''))
      else if (type === 'b') value = raw === '1'
      else if (raw !== undefined) {
        const decoded = decodeXml(raw)
        value = type === 'str' || type === 'e' || decoded === '' || isNaN(Number(decoded)) ? decoded : Number(decoded)
      }

      if (value !== '' && value !== undefined) cells.set(ref, value)
    }

    const merges = [...xml.matchAll(/<mergeCell\b[^>]*\bref="([^"]+)"/g)].map((mm) => mm[1])

    sheets.push({ name, cells, merges })
  }

  return sheets
}
