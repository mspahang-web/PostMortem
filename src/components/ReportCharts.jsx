// Charts for the report view: Section 5 (Penilaian Program Latihan) and
// Section 10 (Status Atlet). Both scales are ordinal, so each uses one blue
// ramp, darker = better (validated with the dataviz palette script,
// --ordinal, on the white report surface). Text stays in ink colours; the
// tables below the charts keep every detail from the form.
import { ATHLETE_STATUS_OPTIONS } from '../lib/athleteStatus'
import {
  TRAINING_MAX_SCORE,
  TRAINING_RATINGS,
  TRAINING_RATING_SCORE,
} from '../lib/training'

// Lemah -> Sangat Baik (light -> dark).
const RATING_COLORS = {
  Lemah: '#86b6ef',
  Sederhana: '#3987e5',
  Baik: '#1c5cab',
  'Sangat Baik': '#0d366b',
}

// E -> A (light -> dark).
const STATUS_COLORS = {
  E: '#86b6ef',
  D: '#5598e7',
  C: '#2a78d6',
  B: '#1c5cab',
  A: '#0d366b',
}

// Light fills need dark text inside the bar; dark fills need white.
const insideText = (color) =>
  ['#86b6ef', '#5598e7'].includes(color) ? '#0b0b0b' : '#ffffff'

const percent = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0

/* =========================================================
   SECTION 5
   ========================================================= */

export function TrainingRatingChart({ components }) {
  const rated = components.filter((item) => TRAINING_RATING_SCORE[item?.rating])

  const average =
    rated.length > 0
      ? rated.reduce((sum, item) => sum + TRAINING_RATING_SCORE[item.rating], 0) / rated.length
      : null

  // Best first in the legend and the stacked bar.
  const distribution = TRAINING_RATINGS.map((rating) => ({
    rating,
    count: rated.filter((item) => item.rating === rating).length,
  }))

  return (
    <div className="report-chart">
      <div className="report-chart-head">
        <div className="report-chart-hero">
          <span>PURATA PENILAIAN</span>
          <strong>
            {average === null ? '—' : average.toFixed(1)}
            <em> / {TRAINING_MAX_SCORE}</em>
          </strong>
          <small>
            {rated.length} daripada {components.length} komponen dinilai
          </small>
        </div>

        <div className="report-chart-distribution">
          <span className="report-chart-label">TABURAN PENILAIAN</span>

          <div
            className="report-stack"
            role="img"
            aria-label={distribution
              .map((item) => `${item.rating}: ${item.count}`)
              .join(', ')}
          >
            {distribution
              .filter((item) => item.count > 0)
              .map((item) => {
                const share = percent(item.count, rated.length)
                return (
                  <span
                    key={item.rating}
                    className="report-stack-part"
                    style={{
                      flexGrow: item.count,
                      background: RATING_COLORS[item.rating],
                      color: insideText(RATING_COLORS[item.rating]),
                    }}
                    data-tip={`${item.rating}: ${item.count} komponen (${share}%)`}
                  >
                    {share >= 12 ? item.count : ''}
                  </span>
                )
              })}
          </div>

          <ul className="report-legend">
            {distribution.map((item) => (
              <li key={item.rating}>
                <i style={{ background: RATING_COLORS[item.rating] }} />
                {item.rating}
                <b>{item.count}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="report-bars" role="list">
        {components.map((item, index) => {
          const score = TRAINING_RATING_SCORE[item?.rating] || 0
          const color = RATING_COLORS[item?.rating]

          return (
            <div
              key={item?.id || index}
              className="report-bar-row"
              role="listitem"
              data-tip={`${item?.title || 'Komponen'}: ${item?.rating || 'Belum dinilai'}${score ? ` (${score}/${TRAINING_MAX_SCORE})` : ''}`}
            >
              <span className="report-bar-label">{item?.title || 'Komponen'}</span>

              <span className="report-bar-track">
                {score > 0 ? (
                  <span
                    className="report-bar-fill"
                    style={{
                      width: `${(score / TRAINING_MAX_SCORE) * 100}%`,
                      background: color,
                    }}
                  />
                ) : (
                  <span className="report-bar-empty" />
                )}
              </span>

              <span className={`report-bar-value ${score ? '' : 'muted'}`}>
                {item?.rating || 'Belum dinilai'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="report-axis" aria-hidden="true">
        <span />
        <span className="report-axis-scale">
          {TRAINING_RATINGS.slice().reverse().map((rating) => (
            <i key={rating}>{rating}</i>
          ))}
        </span>
        <span />
      </div>
    </div>
  )
}

/* =========================================================
   SECTION 10
   ========================================================= */

export function AthleteStatusChart({ athletes }) {
  const total = athletes.length

  const rows = ATHLETE_STATUS_OPTIONS.map((option) => ({
    ...option,
    meaning: option.label.replace(/^[A-E]\s*-\s*/, ''),
    count: athletes.filter(
      (athlete) => String(athlete?.status || '').trim().toUpperCase() === option.value
    ).length,
  }))

  const unset = total - rows.reduce((sum, row) => sum + row.count, 0)
  const max = Math.max(1, ...rows.map((row) => row.count), unset)

  return (
    <div className="report-chart">
      <div className="report-chart-head">
        <div className="report-chart-hero">
          <span>JUMLAH ATLET</span>
          <strong>{total}</strong>
          <small>
            {rows[0].count + rows[1].count} berpotensi (A &amp; B) ·{' '}
            {rows[4].count} tidak dicadangkan
          </small>
        </div>
      </div>

      <div className="report-bars" role="list">
        {rows.map((row) => (
          <div
            key={row.value}
            className="report-bar-row status"
            role="listitem"
            data-tip={`${row.label}: ${row.count} atlet (${percent(row.count, total)}%)`}
          >
            <span className="report-bar-label">
              <b className="report-status-letter" style={{ background: STATUS_COLORS[row.value], color: insideText(STATUS_COLORS[row.value]) }}>
                {row.value}
              </b>
              {row.meaning}
            </span>

            <span className="report-bar-track">
              {row.count > 0 && (
                <span
                  className="report-bar-fill"
                  style={{
                    width: `${(row.count / max) * 100}%`,
                    background: STATUS_COLORS[row.value],
                  }}
                />
              )}
            </span>

            <span className="report-bar-value">
              {row.count}
              <em>{percent(row.count, total)}%</em>
            </span>
          </div>
        ))}

        {unset > 0 && (
          <div
            className="report-bar-row status"
            role="listitem"
            data-tip={`Belum ditetapkan: ${unset} atlet`}
          >
            <span className="report-bar-label">
              <b className="report-status-letter unset">?</b>
              Belum ditetapkan
            </span>
            <span className="report-bar-track">
              <span
                className="report-bar-fill unset"
                style={{ width: `${(unset / max) * 100}%` }}
              />
            </span>
            <span className="report-bar-value">
              {unset}
              <em>{percent(unset, total)}%</em>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
