export const FINANCE_PERIODS = [
  { key: '2023_2024', label: '2023–2024' },
  { key: '2025_2026', label: '2025–2026' },
]

export const FINANCE_TOTAL_KEY = 'jumlahKelulusan'

export const FINANCE_ITEMS = [
  {
    key: 'kosPeruntukanKeseluruhan',
    label: 'Kos / Peruntukan Keseluruhan',
  },
  {
    key: 'peralatan',
    label: 'Kelulusan Perbelanjaan Peralatan',
  },
  {
    key: 'latihanPusat',
    label: 'Kelulusan Perbelanjaan Latihan Pusat',
  },
  {
    key: 'kejohanan',
    label: 'Kelulusan Perbelanjaan Kejohanan',
  },
  {
    key: 'elaunAtlet',
    label: 'Elaun Atlet',
  },
  {
    key: 'lantikanJurulatih',
    label: 'Lantikan Jurulatih',
  },
  {
    key: 'lainLain',
    label: 'Lain-lain Kelulusan',
  },
  {
    key: FINANCE_TOTAL_KEY,
    label: 'Jumlah Kelulusan Perbelanjaan',
  },
]

// Items summed into Jumlah Kelulusan Perbelanjaan.
export const FINANCE_APPROVAL_KEYS = [
  'peralatan',
  'latihanPusat',
  'kejohanan',
  'elaunAtlet',
  'lantikanJurulatih',
  'lainLain',
]

export function createEmptyFinanceData() {
  return FINANCE_ITEMS.reduce((result, item) => {
    result[item.key] = {
      '2023_2024': 0,
      '2025_2026': 0,
      catatan: '',
    }

    return result
  }, {})
}

// Recalculate Jumlah Kelulusan for both periods, keeping its catatan.
export function withComputedTotal(data) {
  const total = { ...(data[FINANCE_TOTAL_KEY] || {}) }

  FINANCE_PERIODS.forEach(({ key: period }) => {
    total[period] = FINANCE_APPROVAL_KEYS.reduce(
      (sum, key) =>
        sum + (Number(data[key]?.[period]) || 0),
      0
    )
  })

  return {
    ...data,
    [FINANCE_TOTAL_KEY]: total,
  }
}

export function normaliseFinanceData(data) {
  const empty = createEmptyFinanceData()

  if (!data || typeof data !== 'object') {
    return empty
  }

  FINANCE_ITEMS.forEach((item) => {
    const source = data[item.key]

    if (!source || typeof source !== 'object') {
      return
    }

    empty[item.key] = {
      '2023_2024':
        Number(source['2023_2024']) || 0,

      '2025_2026':
        Number(source['2025_2026']) || 0,

      catatan:
        source.catatan || '',
    }
  })

  return withComputedTotal(empty)
}

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString(
    'ms-MY',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )
}
