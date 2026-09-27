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

// Status colours (validated with the dataviz palette script on white):
// A green, B blue, C magenta, D yellow, E red. Each bar also shows its
// letter and meaning, so colour is never the only cue.
export const ATHLETE_STATUS_COLORS = {
  A: '#22c55e',
  B: '#1d4ed8',
  C: '#e879f9',
  D: '#ca8a04',
  E: '#991b1b',
}
