// Medal counts for Section 3 (Sasaran & Pencapaian), counted per event:
// in a team event every athlete has a row, but the team wins one medal.
// Rows with the same Acara name and the same medal count once.

const MEDALS = ['EMAS', 'PERAK', 'GANGSA']

const clean = (value) =>
  String(value ?? '')
    .toUpperCase()
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim()

// Event identity: the Acara name; rows without one stand alone.
function eventKey(row, index) {
  return clean(row?.acara) || `__row_${index}`
}

function isFilled(row) {
  return Boolean(
    row && (row.acara || row.atlet || row.sasaran || row.pencapaian || row.pingat)
  )
}

function countDistinct(rows, field) {
  const seen = { EMAS: new Set(), PERAK: new Set(), GANGSA: new Set() }

  rows.forEach((row, index) => {
    const medal = clean(row[field])
    if (MEDALS.includes(medal)) seen[medal].add(eventKey(row, index))
  })

  const result = {
    emas: seen.EMAS.size,
    perak: seen.PERAK.size,
    gangsa: seen.GANGSA.size,
  }
  result.total = result.emas + result.perak + result.gangsa
  return result
}

export function countMedalsByEvent(acaraList) {
  const rows = (Array.isArray(acaraList) ? acaraList : []).filter(isFilled)

  const events = new Set(rows.map(eventKey))

  // Events with a target other than "TIADA SASARAN", and events marked Capai.
  const targeted = new Set()
  const achieved = new Set()

  rows.forEach((row, index) => {
    const key = eventKey(row, index)
    const sasaran = clean(row.sasaran)
    if (sasaran && sasaran !== 'TIADA SASARAN') targeted.add(`${key}|${sasaran}`)
    if (clean(row.status) === 'CAPAI') achieved.add(key)
  })

  return {
    events: events.size,
    sasaran: countDistinct(rows, 'sasaran'),
    pencapaian: countDistinct(rows, 'pingat'),
    targetedEvents: targeted.size,
    achievedEvents: achieved.size,
  }
}

// Section 3 may be stored as { acaraList } or, in old drafts, as the list.
export function getAcaraList(section3) {
  if (Array.isArray(section3)) return section3
  if (Array.isArray(section3?.acaraList)) return section3.acaraList
  return []
}

// Section 3 data with its stored totals recalculated per event.
export function withEventMedalTotals(section3) {
  if (!section3 || typeof section3 !== 'object') return section3

  const acaraList = getAcaraList(section3)
  const counts = countMedalsByEvent(acaraList)

  return {
    ...(Array.isArray(section3) ? {} : section3),
    acaraList,
    jumlahSasaran: counts.sasaran.total,
    jumlahPencapaian: counts.pencapaian.total,
    sasaranEmas: counts.sasaran.emas,
    sasaranPerak: counts.sasaran.perak,
    sasaranGangsa: counts.sasaran.gangsa,
    pencapaianEmas: counts.pencapaian.emas,
    pencapaianPerak: counts.pencapaian.perak,
    pencapaianGangsa: counts.pencapaian.gangsa,
  }
}
