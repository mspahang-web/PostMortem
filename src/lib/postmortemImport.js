// Turns the MSP Google Sheet template ("LAWN BOWLS - POSTMORTEM.xlsx" and
// the same template for every sport) into post-mortem section data and
// equipment rows. Sections and fields are found by their headings and
// labels, not fixed cells, so tables of any length still line up.
import { columnIndex, columnLetters, readXlsx } from './xlsxReader'
import { TRAINING_COMPONENTS, TRAINING_RATINGS } from './training'
import { withEventMedalTotals } from './medals'

const SECTION_TITLES = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7,
  H: 8, I: 9, J: 10, K: 11, L: 12, M: 13,
}

export const IMPORT_SECTION_LABELS = {
  1: 'A. Maklumat Sukan',
  2: 'B. Ringkasan Program Persiapan',
  3: 'C. Sasaran dan Pencapaian',
  4: 'D. Analisis Teknikal dan Taktikal',
  5: 'E. Penilaian Program Latihan',
  6: 'F. Faktor Kejayaan / Kegagalan',
  7: 'G. Isu Teknikal Pertandingan',
  8: 'H. Bantahan / Protes Rasmi',
  9: 'I. Penilaian Barisan Kejurulatihan',
  10: 'J. Status Atlet Selepas SUKMA',
  11: 'K. Cadangan Program SUKMA 2028',
  12: 'L. Rumusan Pasukan',
  13: 'M. Pengesahan',
}

const PREP_COMPONENTS = [
  { key: 'latihanPusat', match: /latihan\s*pusat/ },
  { key: 'kejohanan', match: /kejohanan/ },
  { key: 'ujianPenilaiPrestasi', match: /ujian|penilai/ },
  { key: 'programSainsSukan', match: /sains/ },
  { key: 'programPemulihanRehabilitasi', match: /pemulihan|rehabilitasi/ },
]

const ISSUE_CATEGORIES = [
  'Teknikal Pertandingan', 'Juri/Wasit', 'Penganjur', 'Venue/Fasiliti',
  'Peralatan', 'Keputusan Pertandingan', 'Bantahan/Protes', 'Penjadualan',
]

const SASARAN = ['EMAS', 'PERAK', 'GANGSA', 'TIADA SASARAN']
const PENCAPAIAN = ['AKHIR', 'SEPARUH AKHIR', 'SUKU AKHIR', 'PUSINGAN 16', 'PERINGKAT KUMPULAN']
const PINGAT = ['EMAS', 'PERAK', 'GANGSA', 'KEEMPAT', 'KELIMA', 'TIADA']
const TICKS = /^(✓|✔|√|☑|✅|x|X|\/|\/\/|v|V|ya|YA|1|true)$/

// ---------- helpers ----------

const norm = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[:?]+$/, '')
    .trim()

function text(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'number') return String(Number.isInteger(value) ? value : Number(value.toFixed(2)))
  if (typeof value === 'boolean') return value ? 'Ya' : ''
  return String(value).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim()
}

const stripNumbering = (value) => text(value).replace(/^\s*\d+\s*[.)]\s*/, '')

function pickOption(value, options) {
  const wanted = norm(value)
  if (!wanted) return ''
  return options.find((option) => norm(option) === wanted) || null
}

function makeGrid(sheet) {
  let maxRow = 0
  let maxCol = 0
  for (const ref of sheet.cells.keys()) {
    const [, letters, row] = ref.match(/^([A-Z]+)(\d+)$/)
    maxRow = Math.max(maxRow, Number(row))
    maxCol = Math.max(maxCol, columnIndex(letters))
  }
  const get = (col, row) => text(sheet.cells.get(`${columnLetters(col)}${row}`))
  const raw = (col, row) => sheet.cells.get(`${columnLetters(col)}${row}`)
  // First non-empty cell to the right of `col` on `row`.
  const valueRight = (col, row) => {
    for (let c = col + 1; c <= maxCol; c++) {
      const v = get(c, row)
      if (v) return v
    }
    return ''
  }
  return { get, raw, valueRight, maxRow, maxCol }
}

// Column index whose header (on headerRow) matches `pattern`.
function headerColumns(grid, headerRow, spec) {
  const found = {}
  for (let c = 1; c <= grid.maxCol; c++) {
    const header = norm(grid.get(c, headerRow))
    if (!header) continue
    for (const [key, pattern] of Object.entries(spec)) {
      if (found[key] === undefined && pattern.test(header)) {
        found[key] = c
        break
      }
    }
  }
  return found
}

function findRow(grid, from, to, pattern, col = 1) {
  for (let r = from; r <= to; r++) {
    if (pattern.test(norm(grid.get(col, r)))) return r
  }
  return -1
}

// Label in column A, value in the first non-empty cell to its right.
function labelValues(grid, range, spec) {
  const result = {}
  for (let r = range.from; r <= range.to; r++) {
    const label = norm(grid.get(1, r))
    if (!label) continue
    for (const [key, pattern] of Object.entries(spec)) {
      if (result[key] === undefined && pattern.test(label)) {
        result[key] = grid.valueRight(1, r)
        break
      }
    }
  }
  return result
}

function toIsoDate(value) {
  if (typeof value === 'number' && value > 20000 && value < 80000) {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000)
    return date.toISOString().slice(0, 10)
  }
  const m = text(value).match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  const iso = text(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return iso ? iso[0] : ''
}

// ---------- sections ----------

function parseSection1(grid, range, warn) {
  const spec = {
    namaSukan: /^nama sukan$/,
    pengurusPasukan: /^pengurus pasukan$/,
    ketuaJurulatih: /^ketua jurulatih$/,
    jurulatih: /^jurulatih$/,
    atletLelaki: /^bilangan atlet lelaki$/,
    atletWanita: /^bilangan atlet wanita$/,
    tempohPersediaan: /^tempoh persediaan$/,
    tempatPertandingan: /^tempat pertandingan$/,
  }
  const values = {}
  for (let r = range.from; r <= range.to; r++) {
    for (let c = 1; c <= grid.maxCol; c++) {
      const label = norm(grid.get(c, r))
      for (const [key, pattern] of Object.entries(spec)) {
        if (values[key] === undefined && pattern.test(label)) values[key] = grid.get(c + 1, r)
      }
    }
  }
  for (const key of Object.keys(spec)) if (values[key] === undefined) warn(`Medan "${key}" tidak dijumpai.`)

  const jurulatih = (values.jurulatih || '')
    .split(/\n|;|,/)
    .map((name) => name.trim())
    .filter(Boolean)

  return {
    sportName: values.namaSukan || '',
    data: {
      pengurusPasukan: values.pengurusPasukan || '',
      ketuaJurulatih: values.ketuaJurulatih || '',
      jurulatih: jurulatih.length ? jurulatih : [''],
      atletLelaki: values.atletLelaki || '',
      atletWanita: values.atletWanita || '',
      tempohPersediaan: values.tempohPersediaan || '',
      tempatPertandingan: values.tempatPertandingan || '',
    },
    count: Object.values(values).filter(Boolean).length,
  }
}

function parseSection2(grid, range, warn) {
  const header = findRow(grid, range.from, range.to, /^komponen$/)
  const data = Object.fromEntries(PREP_COMPONENTS.map(({ key }) => [key, []]))
  if (header < 0) {
    warn('Jadual komponen tidak dijumpai.')
    return { data, count: 0 }
  }
  const cols = headerColumns(grid, header, {
    bilanganAtlet: /bilangan/,
    lokasi: /lokasi|tempat/,
    tempoh: /tempoh/,
    pencapaian: /pencapaian|rekod/,
    catatan: /catatan|maklumat/,
  })

  let current = null
  let count = 0
  for (let r = header + 1; r <= range.to; r++) {
    const label = norm(grid.get(1, r))
    if (label) {
      const component = PREP_COMPONENTS.find(({ match }) => match.test(label))
      if (component) current = component.key
      else warn(`Komponen "${grid.get(1, r)}" tidak dikenali (baris ${r}).`)
    }
    const row = {
      bilanganAtlet: cols.bilanganAtlet ? grid.get(cols.bilanganAtlet, r) : '',
      lokasi: cols.lokasi ? grid.get(cols.lokasi, r) : '',
      tempoh: cols.tempoh ? grid.get(cols.tempoh, r) : '',
      pencapaian: cols.pencapaian ? grid.get(cols.pencapaian, r) : '',
      catatan: cols.catatan ? grid.get(cols.catatan, r) : '',
    }
    if (!Object.values(row).some(Boolean)) continue
    if (!current) {
      warn(`Baris ${r} tiada komponen; tidak diimport.`)
      continue
    }
    data[current].push(row)
    count++
  }
  for (const { key } of PREP_COMPONENTS) {
    if (data[key].length === 0) data[key] = [{ bilanganAtlet: '', lokasi: '', tempoh: '', pencapaian: '', catatan: '' }]
  }
  return { data, count }
}

function parseSection3(grid, range, warn) {
  const header = findRow(grid, range.from, range.to, /^bil\.?$/)
  if (header < 0) {
    warn('Jadual acara tidak dijumpai.')
    return { data: null, count: 0 }
  }
  const cols = headerColumns(grid, header, {
    acara: /^acara/,
    atlet: /atlet|pasukan/,
    sasaran: /sasaran/,
    pencapaian: /pencapaian/,
    pingat: /pingat|ranking/,
    status: /status/,
    keputusan: /keputusan|masa/,
  })

  const acaraList = []
  for (let r = header + 1; r <= range.to; r++) {
    if (/^jumlah/.test(norm(grid.get(1, r)))) break
    const get = (key) => (cols[key] ? grid.get(cols[key], r) : '')
    if (!get('acara') && !get('atlet')) continue

    const item = {
      acara: get('acara'),
      atlet: get('atlet'),
      sasaran: pickOption(get('sasaran'), SASARAN),
      pencapaian: pickOption(get('pencapaian'), PENCAPAIAN),
      pingat: pickOption(get('pingat'), PINGAT),
      status: pickOption(get('status'), ['Capai', 'Tidak Capai']),
      keputusan: get('keputusan'),
    }
    for (const key of ['sasaran', 'pencapaian', 'pingat', 'status']) {
      if (item[key] === null) {
        warn(`Baris ${r}: nilai ${key} "${get(key)}" tiada dalam pilihan borang; dibiarkan kosong.`)
        item[key] = ''
      }
    }
    acaraList.push(item)
  }

  // Totals are counted per event (see lib/medals.js).
  return {
    data: withEventMedalTotals({ acaraList }),
    count: acaraList.length,
  }
}

function parseSection4(grid, range, warn) {
  const values = labelValues(grid, range, {
    kekuatanUtama: /^kekuatan/,
    kelemahanUtama: /^kelemahan/,
    kesilapanTeknikal: /^kesilapan teknikal/,
    kesilapanTaktikal: /^kesilapan taktikal/,
    strategiPertandingan: /^strategi/,
    perbandinganLawan: /^perbandingan/,
  })
  const keys = ['kekuatanUtama', 'kelemahanUtama', 'kesilapanTeknikal', 'kesilapanTaktikal', 'strategiPertandingan', 'perbandinganLawan']
  for (const key of keys) if (values[key] === undefined) warn(`Soalan "${key}" tidak dijumpai.`)
  return {
    data: Object.fromEntries(keys.map((key) => [key, values[key] || ''])),
    count: keys.filter((key) => values[key]).length,
  }
}

function parseSection5(grid, range, warn) {
  const header = findRow(grid, range.from, range.to, /^komponen$/)
  const components = TRAINING_COMPONENTS.map((item) => ({ ...item, rating: '', catatan: '' }))
  if (header < 0) {
    warn('Jadual penilaian tidak dijumpai.')
    return { data: { components }, count: 0 }
  }
  const ratingCols = TRAINING_RATINGS.map((rating) => ({
    rating,
    col: headerColumns(grid, header, { x: new RegExp(`^${norm(rating)}$`) }).x,
  }))
  const catatanCol = headerColumns(grid, header, { x: /catatan/ }).x

  let count = 0
  for (let r = header + 1; r <= range.to; r++) {
    const label = norm(grid.get(1, r))
    if (!label) continue
    const component = components.find((item) => norm(item.title) === label)
    if (!component) {
      warn(`Komponen latihan "${grid.get(1, r)}" tidak dikenali (baris ${r}).`)
      continue
    }
    const ticked = ratingCols.filter(({ col }) => col && TICKS.test(grid.get(col, r)))
    if (ticked.length > 1) warn(`${component.title}: lebih daripada satu penilaian ditanda; yang pertama digunakan.`)
    component.rating = ticked[0]?.rating || ''
    component.catatan = catatanCol ? grid.get(catatanCol, r) : ''
    if (component.rating) count++
  }
  return { data: { components }, count }
}

// Numbered lines under a label row, until the next label/blank gap.
function numberedAfter(grid, labelRow, to) {
  const items = []
  for (let r = labelRow + 1; r <= to; r++) {
    const value = grid.get(1, r)
    if (!value) {
      if (items.length) break
      continue
    }
    if (!/^\s*\d+\s*[.)]/.test(value)) break
    items.push(stripNumbering(value))
  }
  return items
}

const padTo = (items, n) => [...items, ...Array(Math.max(0, n - items.length)).fill('')]

function parseSection6(grid, range, warn) {
  const kejayaanRow = findRow(grid, range.from, range.to, /kejayaan/)
  const kegagalanRow = findRow(grid, range.from, range.to, /kegagalan/)
  if (kejayaanRow < 0) warn('Senarai faktor kejayaan tidak dijumpai.')
  if (kegagalanRow < 0) warn('Senarai faktor kegagalan tidak dijumpai.')
  const kejayaan = kejayaanRow < 0 ? [] : numberedAfter(grid, kejayaanRow, range.to)
  const kegagalan = kegagalanRow < 0 ? [] : numberedAfter(grid, kegagalanRow, range.to)
  return {
    data: { faktorKejayaan: padTo(kejayaan, 3), faktorKegagalan: padTo(kegagalan, 3) },
    count: kejayaan.length + kegagalan.length,
  }
}

function parseSection7(grid, range, warn) {
  const header = findRow(grid, range.from, range.to, /^bil\.?$/)
  if (header < 0) {
    warn('Jadual isu tidak dijumpai.')
    return { data: [], count: 0 }
  }
  const cols = headerColumns(grid, header, {
    kategori: /kategori/,
    tarikhAcara: /tarikh|acara/,
    isuPermasalahan: /isu|permasalahan/,
    tindakanBantahan: /tindakan/,
    keputusanRasmi: /keputusan/,
    kesanAtletPasukan: /kesan/,
    cadangan: /cadangan/,
  })
  const issues = []
  for (let r = header + 1; r <= range.to; r++) {
    const item = Object.fromEntries(Object.entries(cols).map(([key, col]) => [key, grid.get(col, r)]))
    if (!Object.values(item).some(Boolean)) continue
    const category = pickOption(item.kategori, ISSUE_CATEGORIES)
    if (item.kategori && !category) warn(`Isu baris ${r}: kategori "${item.kategori}" tiada dalam pilihan borang; dibiarkan kosong.`)
    issues.push({
      kategori: category || '',
      tarikhAcara: item.tarikhAcara || '',
      isuPermasalahan: item.isuPermasalahan || '',
      tindakanBantahan: item.tindakanBantahan || '',
      keputusanRasmi: item.keputusanRasmi || '',
      kesanAtletPasukan: item.kesanAtletPasukan || '',
      cadangan: item.cadangan || '',
    })
  }
  return { data: issues, count: issues.length }
}

function parseSection8(grid, range) {
  const values = labelValues(grid, range, {
    acaraTarikh: /^acara/,
    asasBantahan: /^asas/,
    pihakMenerima: /^pihak/,
    tindakanPasukan: /^tindakan/,
    keputusanRasmi: /^keputusan/,
    kesanAtletPasukan: /^kesan/,
    dokumenBukti: /^dokumen/,
  })
  const protest = {
    acaraTarikh: values.acaraTarikh || '',
    asasBantahan: values.asasBantahan || '',
    pihakMenerima: values.pihakMenerima || '',
    tindakanPasukan: values.tindakanPasukan || '',
    keputusanRasmi: values.keputusanRasmi || '',
    kesanAtletPasukan: values.kesanAtletPasukan || '',
    dokumenBukti: values.dokumenBukti || '',
  }
  const filled = Object.values(protest).some(Boolean)
  return { data: filled ? [protest] : [], count: filled ? 1 : 0 }
}

function parseSection9(grid, range, warn) {
  const values = labelValues(grid, range, {
    keberkesananBarisanKejurulatihan: /^keberkesanan/,
    bilanganJurulatihMencukupi: /bilangan jurulatih/,
    kepakaranJurulatihBersesuaian: /kepakaran/,
    cadanganBerkaitanJurulatih: /^cadangan/,
  })
  const keys = ['keberkesananBarisanKejurulatihan', 'bilanganJurulatihMencukupi', 'kepakaranJurulatihBersesuaian', 'cadanganBerkaitanJurulatih']
  for (const key of keys) if (values[key] === undefined) warn(`Soalan "${key}" tidak dijumpai.`)
  return {
    data: Object.fromEntries(keys.map((key) => [key, values[key] || ''])),
    count: keys.filter((key) => values[key]).length,
  }
}

function parseSection10(grid, range, warn) {
  const header = findRow(grid, range.from, range.to, /^nama atlet$/)
  if (header < 0) {
    warn('Jadual status atlet tidak dijumpai.')
    return { data: [], count: 0 }
  }
  const cols = headerColumns(grid, header, { status: /status/, cadangan: /cadangan/, catatan: /catatan/ })
  const athletes = []
  for (let r = header + 1; r <= range.to; r++) {
    const name = grid.get(1, r)
    if (!name) continue
    const statusText = cols.status ? grid.get(cols.status, r) : ''
    const status = (statusText.match(/^\s*([A-E])\b/i) || [])[1]?.toUpperCase() || ''
    if (statusText && !status) warn(`${name}: status "${statusText}" tidak dikenali; dibiarkan kosong.`)
    athletes.push({
      namaAtlet: name,
      status,
      cadangan: cols.cadangan ? grid.get(cols.cadangan, r) : '',
      catatan: cols.catatan ? grid.get(cols.catatan, r) : '',
    })
  }
  return { data: athletes, count: athletes.length }
}

function parseSection11(grid, range, warn) {
  const spec = {
    atletDikekalkan: /^atlet dikekalkan/,
    atletDinaikkanProgramPrestasiTinggi: /^atlet dinaikkan/,
    atletBaharuDiberiPeluang: /^atlet baharu/,
    atletPerluIntervensi: /intervensi/,
    keperluanJurulatih: /^keperluan jurulatih/,
    keperluanKemLatihan: /^keperluan kem/,
    keperluanPertandingan: /^keperluan pertandingan/,
    keperluanPeralatan: /^keperluan peralatan/,
    keperluanSainsSukan: /^keperluan sains/,
    keperluanPerubatanRehabilitasi: /^keperluan perubatan/,
  }
  const values = labelValues(grid, range, spec)
  for (const key of Object.keys(spec)) if (values[key] === undefined) warn(`Medan "${key}" tidak dijumpai.`)
  return {
    data: Object.fromEntries(Object.keys(spec).map((key) => [key, values[key] || ''])),
    count: Object.keys(spec).filter((key) => values[key]).length,
  }
}

function parseSection12(grid, range, warn) {
  const perbaikiRow = findRow(grid, range.from, range.to, /diperbaiki/)
  const sokonganRow = findRow(grid, range.from, range.to, /sokongan/)
  const cadanganRow = findRow(grid, range.from, range.to, /^cadangan utama/)

  const perkara = perbaikiRow < 0 ? [] : numberedAfter(grid, perbaikiRow, range.to)
  if (perbaikiRow < 0) warn('Soalan "perkara perlu diperbaiki" tidak dijumpai.')

  let sokongan = ''
  if (sokonganRow < 0) warn('Soalan "bentuk sokongan" tidak dijumpai.')
  else {
    const lines = []
    for (let r = sokonganRow + 1; r <= range.to && r !== cadanganRow; r++) {
      const value = grid.get(1, r)
      if (value) lines.push(value)
      else if (lines.length) break
    }
    sokongan = grid.valueRight(1, sokonganRow) || lines.join('\n')
  }

  let cadangan = ''
  if (cadanganRow < 0) warn('Soalan "cadangan utama SUKMA 2028" tidak dijumpai.')
  else cadangan = grid.valueRight(1, cadanganRow)

  return {
    data: {
      perkaraPerluDiperbaiki: padTo(perkara, 3),
      bentukSokonganMajlisSukanPahang: sokongan,
      cadanganUtamaSukma2028: cadangan,
    },
    count: perkara.length + (sokongan ? 1 : 0) + (cadangan ? 1 : 0),
  }
}

function parseSection13(grid, range, warn) {
  let tarikhRaw = ''
  const values = {}
  for (let r = range.from; r <= range.to; r++) {
    const label = norm(grid.get(1, r))
    if (/^nama pengurus/.test(label)) values.namaPengurusJurulatih = grid.valueRight(1, r)
    else if (/^disahkan/.test(label)) values.disahkanOlehPenyelaras = grid.valueRight(1, r)
    else if (/^tarikh/.test(label)) {
      for (let c = 2; c <= grid.maxCol; c++) {
        if (grid.raw(c, r) !== undefined) {
          tarikhRaw = grid.raw(c, r)
          break
        }
      }
    }
  }
  const tarikh = toIsoDate(tarikhRaw)
  if (tarikhRaw && !tarikh) warn(`Tarikh "${text(tarikhRaw)}" tidak dapat dibaca; dibiarkan kosong.`)
  return {
    data: {
      pengesahan: false,
      namaPengurusJurulatih: values.namaPengurusJurulatih || '',
      tarikh,
      disahkanOlehPenyelaras: values.disahkanOlehPenyelaras || '',
    },
    count: [values.namaPengurusJurulatih, tarikh, values.disahkanOlehPenyelaras].filter(Boolean).length,
  }
}

const PARSERS = {
  1: parseSection1, 2: parseSection2, 3: parseSection3, 4: parseSection4,
  5: parseSection5, 6: parseSection6, 7: parseSection7, 8: parseSection8,
  9: parseSection9, 10: parseSection10, 11: parseSection11, 12: parseSection12,
  13: parseSection13,
}

// ---------- equipment sheet ----------

function parseEquipment(sheet, warnings) {
  const grid = makeGrid(sheet)
  let header = -1
  let peralatanCol = -1
  for (let r = 1; r <= grid.maxRow && header < 0; r++) {
    for (let c = 1; c <= grid.maxCol; c++) {
      if (norm(grid.get(c, r)) === 'peralatan') {
        header = r
        peralatanCol = c
        break
      }
    }
  }
  if (header < 0) {
    warnings.push('Cadangan Peralatan: jadual tidak dijumpai.')
    return []
  }
  const cols = headerColumns(grid, header, {
    kuantiti: /kuantiti/,
    spesifikasi: /spesifikasi|jenama/,
    kegunaan: /kegunaan/,
    keutamaan: /keutamaan/,
    kos: /kos|harga|anggaran/,
    justifikasi: /justifikasi|keperluan/,
  })
  const costIsUnit = cols.kos ? /seunit|unit/.test(norm(grid.get(cols.kos, header))) : false

  const items = []
  for (let r = header + 1; r <= grid.maxRow; r++) {
    if ([...Array(grid.maxCol).keys()].some((i) => /jumlah/.test(norm(grid.get(i + 1, r))))) break
    const nama = grid.get(peralatanCol, r)
    if (!nama) continue

    const kuantiti = Number(cols.kuantiti ? grid.raw(cols.kuantiti, r) : 0) || 0
    const kos = Number(cols.kos ? grid.raw(cols.kos, r) : 0) || 0
    // The sheet holds the total cost; keep 4 decimals so qty × unit
    // still adds up to it (e.g. 950 / 12).
    const hargaSeunit = costIsUnit ? kos : kuantiti > 0 ? Math.round((kos / kuantiti) * 10000) / 10000 : kos

    const keutamaanText = cols.keutamaan ? grid.get(cols.keutamaan, r) : ''
    const keutamaan = pickOption(keutamaanText, ['Tinggi', 'Sederhana', 'Rendah'])
    if (keutamaanText && !keutamaan) warnings.push(`Peralatan "${nama}": keutamaan "${keutamaanText}" tidak dikenali; ditetapkan Sederhana.`)
    if (!kos) warnings.push(`Peralatan "${nama}": tiada anggaran kos.`)
    if (!kuantiti) warnings.push(`Peralatan "${nama}": tiada kuantiti.`)

    items.push({
      peralatan: nama,
      kuantiti: kuantiti || 1,
      spesifikasi_jenama: cols.spesifikasi ? grid.get(cols.spesifikasi, r) : '',
      kegunaan: cols.kegunaan ? grid.get(cols.kegunaan, r) : '',
      keutamaan: keutamaan || 'Sederhana',
      anggaran_harga_seunit: hargaSeunit,
      justifikasi_keperluan: cols.justifikasi ? grid.get(cols.justifikasi, r) : '',
    })
  }
  return items
}

// ---------- entry point ----------

export async function parsePostMortemWorkbook(buffer) {
  const sheets = await readXlsx(buffer)

  const formSheet = sheets.find((sheet) =>
    [...sheet.cells.values()].some((value) => /^A\.\s*MAKLUMAT SUKAN/i.test(String(value).trim()))
  )
  if (!formSheet) {
    throw new Error('Helaian "Borang Laporan" tidak dijumpai. Pastikan fail menggunakan templat borang post-mortem MSP.')
  }

  const grid = makeGrid(formSheet)

  // Row where each section title (A. ... M.) starts, in column A.
  const starts = []
  for (let r = 1; r <= grid.maxRow; r++) {
    const m = grid.get(1, r).match(/^([A-M])\.\s+\S/)
    if (m && SECTION_TITLES[m[1]] && !starts.some((s) => s.letter === m[1])) {
      starts.push({ letter: m[1], row: r })
    }
  }

  const sections = {}
  const summary = []
  let sportName = ''

  for (let number = 1; number <= 13; number++) {
    const letter = Object.keys(SECTION_TITLES).find((key) => SECTION_TITLES[key] === number)
    const start = starts.find((s) => s.letter === letter)
    const warnings = []
    const warn = (message) => warnings.push(message)

    if (!start) {
      summary.push({ number, label: IMPORT_SECTION_LABELS[number], count: 0, warnings: ['Bahagian ini tidak dijumpai dalam fail.'], found: false })
      continue
    }

    const next = starts.filter((s) => s.row > start.row).sort((a, b) => a.row - b.row)[0]
    const range = { from: start.row + 1, to: next ? next.row - 1 : grid.maxRow }
    const result = PARSERS[number](grid, range, warn)

    if (number === 1) sportName = result.sportName
    if (result.data !== null) sections[number] = result.data
    summary.push({ number, label: IMPORT_SECTION_LABELS[number], count: result.count, warnings, found: true })
  }

  const equipmentWarnings = []
  const equipmentSheet = sheets.find((sheet) => /peralatan/i.test(sheet.name))
  const equipment = equipmentSheet ? parseEquipment(equipmentSheet, equipmentWarnings) : []
  if (!equipmentSheet) equipmentWarnings.push('Helaian "Cadangan Peralatan" tidak dijumpai.')

  return {
    sportName,
    sections,
    summary,
    equipment,
    equipmentWarnings,
    sheetNames: sheets.map((sheet) => sheet.name),
  }
}
