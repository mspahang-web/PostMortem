// Shell for every sport-user page: the same sidebar and page header
// as the admin dashboard, with the user's own menu.
import '../styles/AdminDashboard.css'
import { getSportName } from '../lib/sports'

const USER_MENU = [
  { key: 'dashboard', icon: '▦', label: 'Dashboard' },
  { key: 'postmortem', icon: '▤', label: 'Post-Mortem' },
  { key: 'equipment', icon: '⚙', label: 'Peralatan 2028' },
  { key: 'finance', icon: 'RM', label: 'Kewangan' },
]

export default function UserLayout({
  userProfile,
  activeView,
  onNavigate,
  onLogout,
  className = '',
  children,
}) {
  return (
    <main className={`ewcc-admin ewcc-user-dashboard ${className}`}>

      {/* SIDEBAR */}

      <aside className="ewcc-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img
              src="/images/logomsp.png"
              alt="Majlis Sukan Pahang"
            />
          </div>

          <h1>EWCC</h1>

          <p>Majlis Sukan Pahang</p>

          <span className="sidebar-role">
            Pengguna Sukan
          </span>
        </div>

        <nav className="sidebar-menu">
          {USER_MENU.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-menu-item ${
                activeView === item.key
                  ? 'active'
                  : ''
              }`}
              aria-current={
                activeView === item.key
                  ? 'page'
                  : undefined
              }
              onClick={() => onNavigate(item.key)}
            >
              <span className="sidebar-menu-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <strong>
              {userProfile?.name || 'Pengguna'}
            </strong>

            <span>
              Pengguna Sukan
            </span>

            <small>
              {getSportName(userProfile?.sport) || userProfile?.login_id || ''}
            </small>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={onLogout}
          >
            <span>↪</span>
            Log Keluar
          </button>
        </div>

      </aside>

      {/* CONTENT */}

      <section className="ewcc-admin-content">
        <div className="ewcc-admin-body">
          {children}

          <footer className="ewcc-content-footer">
            <span>EWCC Post-Mortem</span>
            <span>Versi 1.0</span>
            <span>Majlis Sukan Pahang</span>
          </footer>
        </div>
      </section>

    </main>
  )
}
