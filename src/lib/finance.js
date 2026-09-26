export const FINANCE_PERIODS = [
  { key: '2023_2024', label: '2023–2024' },
  { key: '2025_2026', label: '2025–2026' },
]

export const FINANCE_TOTAL_KEY = 'jumlahKelulusan'

// Order and labels follow MSP's finance comparison form. Keys are kept
// from the earlier form where the meaning is the same, so saved data
// still lines up.
export const FINANCE_ITEMS = [
  {
    key: 'lantikanJurulatih',
    label: 'Lantikan Jurulatih',
  },
  {
    key: 'elaunAtlet',
    label: 'Elaun Latihan Atlet',
  },
  {
    key: 'peralatan',
    label: 'Peralatan',
  },
  {
    key: 'pakaianPertandingan',
    label: 'Pakaian Pertandingan',
  },
  {
    key: 'latihanPusat',
    label: 'Latihan Pusat/Pertandingan Persahabatan',
  },
  {
    key: 'sewaanPenginapan',
    label: 'Sewaan Penginapan/ Kemudahan Sukan',
  },
  {
    key: 'kejohanan',
    label: 'Penyertaan Kejohanan',
  },
  {
    key: FINANCE_TOTAL_KEY,
    label: 'Jumlah Kelulusan Perbelanjaan',
  },
]

// Every component is summed into Jumlah Kelulusan Perbelanjaan.
export const FINANCE_APPROVAL_KEYS = FINANCE_ITEMS
  .map((item) => item.key)
  .filter((key) => key !== FINANCE_TOTAL_KEY)

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

  // Keep values from items no longer on the form so saving never
  // deletes them from the database.
  Object.keys(data).forEach((key) => {
    if (!(key in empty)) {
      empty[key] = data[key]
    }
  })

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

// Perubahan (RM) and Perubahan (%) between 2023-2024 and 2025-2026.
// percent is null when 2023-2024 is 0 (no base to compare against).
export function calculateFinanceChange(previous, current) {
  const before = Number(previous) || 0
  const after = Number(current) || 0

  return {
    amount: after - before,
    percent:
      before === 0
        ? null
        : ((after - before) / before) * 100,
  }
}

export function formatPercent(value) {
  if (value === null || value === undefined) {
    return '-'
  }

  const formatted = value.toLocaleString('ms-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `${formatted}%`
}
