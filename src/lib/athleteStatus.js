// Section 10 (Status Atlet Selepas SUKMA): the form stores the letter,
// screens show the letter with its meaning.
export const ATHLETE_STATUS_OPTIONS = [
  { value: 'A', label: 'A - Potensi Kebangsaan' },
  { value: 'B', label: 'B - Potensi SUKMA' },
  { value: 'C', label: 'C - Pembangunan' },
  { value: 'D', label: 'D - Perlu Intervensi' },
  { value: 'E', label: 'E - Tidak Dicadangkan' },
]

// 'B' -> 'B - Potensi SUKMA'; anything unknown is returned as is.
export function getAthleteStatusLabel(value) {
  const code = String(value ?? '').trim().toUpperCase()
  return ATHLETE_STATUS_OPTIONS.find((option) => option.value === code)?.label || value || ''
}
