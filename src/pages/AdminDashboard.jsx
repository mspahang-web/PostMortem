import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { loadSportNames } from '../lib/sports'
import AdminPostMortem from './AdminPostMortem'
import AdminSports from './AdminSports'
import AdminUsers from './AdminUsers'
import AdminDashboardOverview from './AdminDashboardOverview'
import AdminFinance from './AdminFinance'
import AdminEquipment from './AdminEquipment'
import '../styles/AdminDashboard.css'

function AdminDashboard({
  userProfile,
  onLogout,
}) {
  // ==========================================
  // ADMIN VIEW
  // ==========================================

  const [adminView, setAdminView] = useState('dashboard')


  const [selectedPostMortemReportId, setSelectedPostMortemReportId] =
  useState(null)
  

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  const [users, setUsers] = useState([])
  const [sports, setSports] = useState([])

  const [postMortemReports, setPostMortemReports] = useState([])

  const [showUserModal, setShowUserModal] = useState(false)

  const [newUserName, setNewUserName] = useState('')
  const [newUserLoginId, setNewUserLoginId] = useState('')
  const [newUserSport, setNewUserSport] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')

  const [loadingUsers, setLoadingUsers] = useState(false)

  // ==========================================
  // LOAD USERS
  // ==========================================

  const loadUsers = async () => {
    setLoadingUsers(true)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, name, login_id, sport, role, created_at'
        )
        .order('name', {
          ascending: true,
        })

      if (error) {
        console.error(
          'Load users error:',
          error
        )

        alert(
          'Senarai pengguna tidak dapat dimuatkan.'
        )

        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error(error)

      alert(
        'Berlaku masalah semasa memuatkan pengguna.'
      )
    } finally {
      setLoadingUsers(false)
    }
  }

  // ==========================================
  // LOAD SPORTS
  // ==========================================

  const loadSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select(
          'id, sport_code, sport_name, status'
        )
        .order('sport_name', {
          ascending: true,
        })

      console.log('=== SPORTS DATA ===')
      console.log('Data:', data)
      console.log('Error:', error)

      if (error) {
        console.error(
          'Gagal mengambil data sukan:',
          error
        )

        setSports([])
        return
      }

      setSports(data || [])
    } catch (error) {
      console.error(
        'Load sports error:',
        error
      )

      setSports([])
    }
  }

  // ==========================================
// LOAD POST-MORTEM REPORTS
// ==========================================

const loadPostMortemReports = async () => {

  try {
    const { data, error } = await supabase
      .from('postmortem_reports')
      .select('id, user_id, login_id, sport, status, created_at, updated_at, submitted_at')
      .order('updated_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Load post-mortem reports error:',
        error
      )

      setPostMortemReports([])

      return
    }

    console.log('=== POST-MORTEM REPORTS ===')
    console.log('Data:', data)

    console.log('POST MORTEM REPORTS:', data)

    setPostMortemReports(data || [])

  } catch (error) {
    console.error(
      'Unexpected post-mortem error:',
      error
    )

    setPostMortemReports([])
  }
}

  // ==========================================
  // RESET USER FORM
  // ==========================================

  const resetUserForm = () => {
    setNewUserName('')
    setNewUserLoginId('')
    setNewUserSport('')
    setNewUserPassword('')
  }

  // ==========================================
  // CREATE USER
  // ==========================================

  const handleCreateUser = async () => {
    if (!newUserName.trim()) {
      alert('Sila masukkan Nama Pengguna.')
      return
    }

    if (!newUserLoginId.trim()) {
      alert('Sila masukkan ID Pengguna.')
      return
    }

    if (!newUserSport) {
      alert('Sila pilih Sukan.')
      return
    }

    if (!newUserPassword) {
      alert('Sila masukkan Password.')
      return
    }

    if (newUserPassword.length < 6) {
      alert(
        'Password mestilah sekurang-kurangnya 6 aksara.'
      )
      return
    }

    // Semak ID pengguna sedia ada
const normalizedLoginId =
  newUserLoginId
    .trim()
    .toUpperCase()

const existingUser =
  users.find(
    (user) =>
      user.login_id?.toUpperCase() ===
      normalizedLoginId
  )

if (existingUser) {
  alert(
    `ID Pengguna "${normalizedLoginId}" telah digunakan.\n\nSila gunakan ID Pengguna yang lain.`
  )
  return
}

    try {
      setLoadingUsers(true)

      // Dapatkan session admin
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert(
          'Sesi login telah tamat. Sila login semula.'
        )
        return
      }

      // Panggil Edge Function
      const { data, error } =
        await supabase.functions.invoke(
          'create-user',
          {
            body: {
              name: newUserName.trim(),

              loginId: normalizedLoginId,

              sport: newUserSport,

              password: newUserPassword,
            },
          }
        )

      if (error) {
        console.error(
          'Create user error:',
          error
        )

        alert(
          `Gagal mencipta pengguna.\n\n${
            error.message ||
            'Ralat tidak diketahui.'
          }`
        )

        return
      }

      if (!data?.success) {
        console.error(
          'Edge Function response:',
          data
        )

        alert(
          `Gagal mencipta pengguna.\n\n${
            data?.error ||
            'Ralat tidak diketahui.'
          }`
        )

        return
      }

      alert(
        'Pengguna berjaya dicipta.'
      )

      setShowUserModal(false)

      resetUserForm()

      await loadUsers()
    } catch (error) {
      console.error(
        'Unexpected error:',
        error
      )

      alert(
        'Berlaku ralat semasa mencipta pengguna.'
      )
    } finally {
      setLoadingUsers(false)
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    Promise.resolve().then(() => {
      loadUsers()
      loadSports()
      loadPostMortemReports()
    })
  }, [])

  // ==========================================
  // POST-MORTEM SUMMARY
  // ==========================================

const draftPostMortem =
  postMortemReports.filter(
    (report) => report.status === 'draft'
  ).length

const submittedPostMortem =
  postMortemReports.filter(
    (report) => report.status === 'submitted'
  ).length

const reviewedPostMortem =
  postMortemReports.filter(
    (report) => report.status === 'reviewed'
  ).length

const usersWithPostMortem =
  users.map((user) => {
    const report =
      postMortemReports.find(
        (item) =>
          item.user_id === user.id
      )

    return {
      ...user,
      postMortemStatus:
        report?.status || 'not_started',
      postMortemReportId:
        report?.id || null,
    }
  })

  // ==========================================
  // SPORT POST-MORTEM STATUS
  // ==========================================

const sportPostMortemStatus = sports.map((sport) => {
  const report = postMortemReports.find(
    (item) =>
      item.sport === sport.sport_code
  )

  return {
    ...sport,
    reportStatus: report?.status || 'not_started',
    reportId: report?.id || null,
    loginId: report?.login_id || null,
  }
})

const sportsWithReports =
  sportPostMortemStatus.filter(
    (sport) =>
      sport.reportStatus !== 'not_started'
  ).length

  // ==========================================
  // ADMIN LOGOUT
  // ==========================================

  const handleAdminLogout = async () => {
    await supabase.auth.signOut()

    if (onLogout) {
      onLogout()
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="ewcc-admin">

      {/* ======================================
          SIDEBAR
          ====================================== */}

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
        Pentadbir
      </span>

        </div>

        {/* MENU */}

        <nav className="sidebar-menu">

          <button
            className={`sidebar-menu-item ${
              adminView === 'dashboard'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setAdminView('dashboard')
            }
          >
            <span className="sidebar-menu-icon">
              ▦
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            className={`sidebar-menu-item ${
              adminView === 'users'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setAdminView('users')
            }
          >
            <span className="sidebar-menu-icon">
              ♙
            </span>

            <span>
              Pengguna
            </span>
          </button>

            <button
              className={`sidebar-menu-item ${
                adminView === 'sports'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setAdminView('sports')
              }
            >
            <span className="sidebar-menu-icon">
              ◈
            </span>

            <span>
              Sukan
            </span>
          </button>

          <button
            className={`sidebar-menu-item ${
              adminView === 'reports'
                ? 'active'
                : ''
            }`}
            
            onClick={() => {
              setAdminView('reports')
              setSelectedPostMortemReportId(null)
            }}
          >

          <span className="sidebar-menu-icon">
            ▤
          </span>

            <span>
              Laporan
            </span>
          </button>
        
        <button
          className={`sidebar-menu-item ${
            adminView === 'equipment'
              ? 'active'
              : ''
          }`}
          onClick={() => {
            setAdminView('equipment')
          }}
        >
          <span className="sidebar-menu-icon">
            ⚙
          </span>

          <span>
            Peralatan 2028
          </span>
        </button>

        <button
          className={`sidebar-menu-item ${
            adminView === 'finance'
              ? 'active'
              : ''
          }`}
          onClick={() => {
            setAdminView('finance')
          }}
        >
          <span className="sidebar-menu-icon">
            RM
          </span>

          <span>
            Kewangan
          </span>
        </button>

        </nav>

        {/* FOOTER */}

        <div className="sidebar-footer">

          <div className="sidebar-footer-info">

            <strong>
              {userProfile?.name ||
                'Administrator EWCC'}
            </strong>

            <span>
              Administrator
            </span>

            <small>
              SUKMA XXII & PARA SUKMA
            </small>

          </div>

          <button
            className="sidebar-logout"
            onClick={handleAdminLogout}
          >
            <span>↪</span>

            Log Keluar
          </button>

        </div>

      </aside>

      {/* ======================================
          MAIN CONTENT
          ====================================== */}

      <section className="ewcc-admin-content">

        {/* ======================================
            BODY
            ====================================== */}

        <div className="ewcc-admin-body">

          {/* ====================================
              USER MANAGEMENT
              ==================================== */}

          {adminView === 'dashboard' ? (

          <AdminDashboardOverview
            sports={sports}
            postMortemReports={postMortemReports}
            onOpenEquipment={() => {
              setAdminView('equipment')
            }}
            onOpenReports={() => {
              setAdminView('reports')
              setSelectedPostMortemReportId(null)
            }}
            onOpenReport={(reportId) => {
              setAdminView('reports')
              setSelectedPostMortemReportId(reportId)
            }}
          />

          ) : adminView === 'users' ? (

          <AdminUsers
            users={usersWithPostMortem}
            sports={sports}
            loading={loadingUsers}
            onAddUser={() => setShowUserModal(true)}
            onChanged={async () => {
              await Promise.all([
                loadUsers(),
                loadPostMortemReports(),
              ])
            }}
            onOpenReport={(reportId) => {
              setAdminView('reports')
              setSelectedPostMortemReportId(reportId)
            }}
            onBack={() => setAdminView('dashboard')}
          />

          ) : adminView === 'sports' ? (

          <AdminSports
            sports={sports}
            users={users}
            onChanged={async () => {
              await Promise.all([
                loadSports(),
                loadSportNames(),
              ])
            }}
            postMortemReports={postMortemReports}
            onOpenReport={(reportId) => {
              setAdminView('reports')
              setSelectedPostMortemReportId(reportId)
            }}
            onBack={() => setAdminView('dashboard')}
          />

          ) : adminView === 'finance' ? (
            <AdminFinance
              onBack={() => setAdminView('dashboard')}
            />
          ) : adminView === 'equipment' ? (
            <AdminEquipment
              onBack={() => setAdminView('dashboard')}
            />
          ) : adminView === 'reports' ? (
            <AdminPostMortem
              embedded
              users={users}
              sports={sports}
              onImported={loadPostMortemReports}
              initialReportId={selectedPostMortemReportId}
              onBack={async () => {
                setSelectedPostMortemReportId(null)
                setAdminView('dashboard')
                await loadPostMortemReports()
              }}
            />
          ) : (

            /* ==================================
               ADMIN DASHBOARD
               ================================== */

            <>

              {/* KPI */}

              <section className="ewcc-kpi-grid">

                <div className="ewcc-kpi-card">

                  <div className="kpi-icon kpi-blue">
                    🏅
                  </div>

                  <div>

                    <span>
                      Jumlah Sukan
                    </span>

                    <strong>
                      {sports.length}
                    </strong>

                    <small>
                      Sukan Kontinjen Pahang
                    </small>

                  </div>

                </div>

                <div className="ewcc-kpi-card">

                  <div className="kpi-icon kpi-green">
                    👥
                  </div>

                  <div>

                    <span>
                      Jumlah Pengguna
                    </span>

                    <strong>
                      {users.length}
                    </strong>

                    <small>
                      Pengguna berdaftar
                    </small>

                  </div>

                </div>

                <div className="ewcc-kpi-card">

                  <div className="kpi-icon kpi-orange">
                    📝
                  </div>

                  <div>

                    <span>
                      Borang Lengkap
                    </span>

                    <strong>
                      {submittedPostMortem + reviewedPostMortem}
                    </strong>

                    <small>
                      Laporan siap dihantar
                    </small>

                  </div>

                </div>

                <div className="ewcc-kpi-card">

                  <div className="kpi-icon kpi-red">
                    ⏳
                  </div>

                  <div>

                    <span>
                      Belum Lengkap
                    </span>

                    <strong>
                      {draftPostMortem}
                    </strong>

                    <small>
                      Menunggu tindakan
                    </small>

                  </div>

                </div>

              </section>

              {/* MODULES */}

              <section className="ewcc-section">

                <div className="ewcc-section-title">

                  <div>

                    <span>
                      MODUL UTAMA
                    </span>

                    <h2>
                      Pengurusan Sistem
                    </h2>

                  </div>

                </div>

                <div className="ewcc-module-grid">

                  {/* PENGGUNA */}

                  <button
                    className="ewcc-module-card"
                    onClick={() =>
                      setAdminView('users')
                    }
                  >

                    <div className="module-icon module-blue">
                      👥
                    </div>

                    <div className="module-content">

                      <h3>
                        Pengurusan Pengguna
                      </h3>

                      <p>
                        Cipta dan urus akaun pengguna
                        mengikut sukan masing-masing.
                      </p>

                    </div>

                    <span className="module-arrow">
                      →
                    </span>

                  </button>

                  {/* SUKAN */}

                  <button
                    className="ewcc-module-card"
                    onClick={() => {
                      alert(
                        'Modul Senarai Sukan akan dibina selepas ini.'
                      )
                    }}
                  >

                    <div className="module-icon module-purple">
                      🏅
                    </div>

                    <div className="module-content">

                      <h3>
                        Senarai Sukan
                      </h3>

                      <p>
                        Lihat dan urus senarai sukan
                        Kontinjen Pahang.
                      </p>

                    </div>

                    <span className="module-arrow">
                      →
                    </span>

                  </button>

                  {/* LAPORAN */}

                    <button
                    className="ewcc-module-card"
                    onClick={() => {
                      setAdminView('reports')
                      setSelectedPostMortemReportId(null)
                    }}
                    >

                    <div className="module-icon module-orange">
                      📊
                    </div>

                    <div className="module-content">

                      <h3>
                        Laporan Post-Mortem
                      </h3>

                      <p>
                        Semak status dan laporan
                        post-mortem setiap sukan.
                      </p>

                    </div>

                    <span className="module-arrow">
                      →
                    </span>

                  </button>

                </div>

              </section>

              {/* STATUS */}

              <section className="ewcc-section">

                <div className="ewcc-section-title">

                  <div>

                    <span>
                      PEMANTAUAN
                    </span>

                    <h2>
                      Status Pengisian Post-Mortem
                    </h2>

                  </div>

                <span className="status-count">
                  {sportsWithReports} / {sports.length} Sukan
                </span>

                </div>

                <div className="ewcc-status-card">

  {sports.length === 0 ? (

    <div className="ewcc-empty-status">

      <div className="empty-status-icon">
        📋
      </div>

      <div>

        <h3>
          Memuatkan data sukan...
        </h3>

        <p>
          Sila tunggu sebentar.
        </p>

      </div>

    </div>

  ) : (

    <div className="sport-status-list">

      {sportPostMortemStatus.map((sport) => (

    <div
      key={sport.sport_code}
      className="sport-status-row"
      onClick={() => {
        if (sport.reportId) {
          setAdminView('reports')
          setSelectedPostMortemReportId(sport.reportId)
        }
      }}
      style={{
        cursor: sport.reportId
          ? 'pointer'
          : 'default',
      }}
    >

          <div className="sport-status-info">

            <strong>
              {sport.sport_name}
            </strong>

          </div>

          <div className="sport-status-value">

            {sport.reportStatus === 'reviewed' && (

              <span className="status-badge reviewed">
                REVIEWED
              </span>

            )}

            {sport.reportStatus === 'submitted' && (

              <span className="status-badge submitted">
                SUBMITTED
              </span>

            )}

            {sport.reportStatus === 'draft' && (

              <span className="status-badge draft">
                DRAFT
              </span>

            )}

            {sport.reportStatus === 'not_started' && (

              <span className="status-badge not-started">
                BELUM DIISI
              </span>

            )}

          </div>

          {sport.reportId && (
          <span className="sport-status-action">
            Lihat →
          </span>
        )}

        </div>

      ))}

    </div>

  )}

</div>

              </section>

              {/* FOOTER */}

              <footer className="ewcc-content-footer">

                <span>
                  EWCC Post-Mortem
                </span>

                <span>
                  Versi 1.0
                </span>

                <span>
                  Majlis Sukan Pahang
                </span>

              </footer>

            </>

          )}

          {/* ====================================
              USER MODAL
              ==================================== */}

          {showUserModal && (

            <div className="ewcc-modal-overlay">

              <div className="ewcc-modal">

                <div className="ewcc-modal-header">

                  <div>

                    <h2>
                      Tambah Pengguna
                    </h2>

                    <p>
                      Daftar pengguna baharu
                      ke dalam sistem EWCC.
                    </p>

                  </div>

                  <button
                    className="ewcc-modal-close"
                    onClick={() => {
                      setShowUserModal(false)
                      resetUserForm()
                    }}
                  >
                    ×
                  </button>

                </div>

                <div className="ewcc-modal-body">

                  <div className="ewcc-form-group">

                    <label>
                      Nama Pengguna
                    </label>

                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) =>
                        setNewUserName(
                          e.target.value
                        )
                      }
                      placeholder="Contoh: Ahmad bin Ali"
                    />

                  </div>

                  <div className="ewcc-form-group">

                    <label>
                      ID Pengguna
                    </label>

                    <input
                      type="text"
                      value={newUserLoginId}
                      onChange={(e) =>
                        setNewUserLoginId(
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Contoh: OLAHRAGA"
                    />

                    <small>
                      ID ini akan digunakan untuk log
                      masuk ke sistem.
                    </small>

                  </div>

                  <div className="ewcc-form-group">

                    <label>
                      Sukan
                    </label>

                    <select
                      value={newUserSport}
                      onChange={(e) =>
                        setNewUserSport(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        -- Pilih Sukan --
                      </option>

                      {sports
                        .filter((sport) => !/^(inactive|tidak)/i.test(String(sport.status || '')))
                        .map((sport) => (

                        <option
                          key={sport.sport_code}
                          value={sport.sport_code}
                        >
                          {sport.sport_name}
                        </option>

                      ))}

                    </select>

                  </div>

                  <div className="ewcc-form-group">

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) =>
                        setNewUserPassword(
                          e.target.value
                        )
                      }
                      placeholder="Masukkan password"
                    />

                    <small>
                      Gunakan sekurang-kurangnya
                      6 aksara.
                    </small>

                  </div>

                </div>

                <div className="ewcc-modal-footer">

                  <button
                    className="ewcc-secondary-button"
                    onClick={() => {
                      setShowUserModal(false)
                      resetUserForm()
                    }}
                  >
                    Batal
                  </button>

                  <button
                    className="ewcc-primary-button"
                    onClick={handleCreateUser}
                    disabled={loadingUsers}
                  >
                    {loadingUsers
                      ? 'Menyimpan...'
                      : 'Simpan Pengguna'}
                  </button>

                </div>

              </div>

            </div>

          )}

        </div>

      </section>

    </main>
  )
}

export default AdminDashboard
