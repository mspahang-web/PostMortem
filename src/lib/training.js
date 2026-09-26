// Rating options used by Section 5 (Penilaian Program Latihan),
// best first. Scores run from TRAINING_MAX_SCORE down to 1.
export const TRAINING_RATINGS = [
  'Sangat Baik',
  'Baik',
  'Sederhana',
  'Lemah',
]

export const TRAINING_MAX_SCORE = TRAINING_RATINGS.length

export const TRAINING_RATING_SCORE = TRAINING_RATINGS.reduce(
  (result, rating, index) => {
    result[rating] = TRAINING_MAX_SCORE - index
    return result
  },
  {}
)

// Section 5 is saved as { components: [...] }; older drafts may hold
// the list directly.
export function getTrainingComponents(section5) {
  if (Array.isArray(section5)) {
    return section5
  }

  if (Array.isArray(section5?.components)) {
    return section5.components
  }

  return []
}
