// Orange page header shared by admin and sport-user pages
// (same look as the admin dashboard hero).
import '../styles/AdminDashboardOverview.css'

const DEFAULT_META = [
  'SUKMA XXII SELANGOR 2026 & PARA SUKMA SELANGOR 2026',
  'MAJLIS SUKAN PAHANG',
]

export default function PageHero({
  eyebrow,
  title,
  description,
  meta = DEFAULT_META,
  actions,
}) {
  return (
    <section className="ewcc-dashboard-hero">
      <div className="ewcc-dashboard-hero-content">
        <span className="ewcc-dashboard-eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        {description && (
          <p>
            {description}
          </p>
        )}

        {meta.length > 0 && (
          <div className="ewcc-dashboard-hero-meta">
            {meta.map((item) => (
              <span key={item}>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {actions && (
        <div className="ewcc-dashboard-hero-actions">
          {actions}
        </div>
      )}
    </section>
  )
}
