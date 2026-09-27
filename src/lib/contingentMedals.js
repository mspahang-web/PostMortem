// Pencapaian Pingat Kontinjen: the medal table of every contingent in
// the sport, for this edition and the previous one. Stored on the
// sport's report in postmortem_reports.contingent_medals.

export const MEDAL_GAMES = ['SUKMA', 'PARA SUKMA']

export const MEDAL_EDITIONS = [
  { key: '2026', label: '2026' },
  { key: '2024', label: '2024' },
]

export const HOME_CONTINGENT = 'PAHANG'

export const CONTINGENTS = [
  'PAHANG',
  'JOHOR',
  'KEDAH',
  'KELANTAN',
  'MELAKA',
  'NEGERI SEMBILAN',
  'PERAK',
  'PERLIS',
  'PULAU PINANG',
  'SABAH',
  'SARAWAK',
  'SELANGOR',
  'TERENGGANU',
  'WILAYAH PERSEKUTUAN',
  'BRUNEI',
]

export const MEDAL_KINDS = [
  { key: 'emas', label: 'Emas' },
  { key: 'perak', label: 'Perak' },
  { key: 'gangsa', label: 'Gangsa' },
]

const emptyRow = () => ({ emas: 0, perak: 0, gangsa: 0, rekod: '' })

export function createEmptyContingentMedals() {
  const data = { kejohanan: MEDAL_GAMES[0] }

  MEDAL_EDITIONS.forEach(({ key }) => {
    data[key] = Object.fromEntries(
      CONTINGENTS.map((name) => [name, emptyRow()])
    )
  })

  return data
}

export function normaliseContingentMedals(data) {
  const result = createEmptyContingentMedals()

  if (!data || typeof data !== 'object') {
    return result
  }

  if (MEDAL_GAMES.includes(data.kejohanan)) {
    result.kejohanan = data.kejohanan
  }

  MEDAL_EDITIONS.forEach(({ key }) => {
    CONTINGENTS.forEach((name) => {
      const source = data[key]?.[name]

      if (!source || typeof source !== 'object') return

      result[key][name] = {
        emas: Math.max(0, Math.trunc(Number(source.emas) || 0)),
        perak: Math.max(0, Math.trunc(Number(source.perak) || 0)),
        gangsa: Math.max(0, Math.trunc(Number(source.gangsa) || 0)),
        rekod: source.rekod || '',
      }
    })
  })

  return result
}

export function hasContingentMedalData(data) {
  return MEDAL_EDITIONS.some(({ key }) =>
    CONTINGENTS.some((name) => {
      const row = data?.[key]?.[name]

      return (
        Number(row?.emas) ||
        Number(row?.perak) ||
        Number(row?.gangsa) ||
        row?.rekod
      )
    })
  )
}

// Medal-table order: gold, then silver, then bronze. Contingents with
// the same three counts share a position (1, 2, 2, 4 ...).
export function rankContingents(edition) {
  const rows = CONTINGENTS.map((name, order) => {
    const row = edition?.[name] || emptyRow()
    const emas = Number(row.emas) || 0
    const perak = Number(row.perak) || 0
    const gangsa = Number(row.gangsa) || 0

    return {
      name,
      order,
      emas,
      perak,
      gangsa,
      jumlah: emas + perak + gangsa,
      rekod: row.rekod || '',
    }
  })

  rows.sort(
    (a, b) =>
      b.emas - a.emas ||
      b.perak - a.perak ||
      b.gangsa - a.gangsa ||
      a.order - b.order
  )

  rows.forEach((row, index) => {
    const previous = rows[index - 1]
    const tied =
      previous &&
      previous.emas === row.emas &&
      previous.perak === row.perak &&
      previous.gangsa === row.gangsa

    row.rank = tied ? previous.rank : index + 1
  })

  return rows
}

export function getContingentRank(edition, name = HOME_CONTINGENT) {
  return rankContingents(edition).find((row) => row.name === name)
}

export function sumMedals(edition) {
  return CONTINGENTS.reduce(
    (total, name) => {
      const row = edition?.[name]

      total.emas += Number(row?.emas) || 0
      total.perak += Number(row?.perak) || 0
      total.gangsa += Number(row?.gangsa) || 0

      return total
    },
    { emas: 0, perak: 0, gangsa: 0 }
  )
}
