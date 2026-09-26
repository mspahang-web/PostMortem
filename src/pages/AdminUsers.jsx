import { useMemo, useState } from 'react'
import PageHero from '../components/PageHero'

function AdminUsers({
  users,
  sports,
  loading,
  onAddUser,
  onBack,
  onOpenReport,
}) {
  const [search, setSearch] = useState('')

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return users

    return users.filter((user) =>
      [
        user.name,
        user.login_id,
        user.sport,
        user.role,
        sports.find((sport) => sport.sport_code === user.sport)?.sport_name,
      ]
        .some((value) => String(value || '').toLowerCase().includes(keyword))
    )
  }, [users, sports, search])

  return (
    <>
      <PageHero
        eyebrow="EWCC POST-MORTEM • PENGURUSAN SISTEM"
        title="Pengurusan Pengguna"
        description="Senarai akaun pengguna dan status laporan mereka."
        actions={
          <>
            <button type="button" className="ewcc-secondary-button" onClick={onBack}>
              ← Kembali
            </button>
            <button type="button" className="ewcc-primary-button" onClick={onAddUser}>
              + Tambah Pengguna
            </button>
          </>
        }
      />

    <section className="ewcc-section admin-users-page">

      <section className="ewcc-kpi-grid">
        <div className="ewcc-kpi-card">
          <div className="kpi-icon kpi-blue">👥</div>
          <div><span>Jumlah Pengguna</span><strong>{users.length}</strong><small>Akaun berdaftar</small></div>
        </div>
        <div className="ewcc-kpi-card">
          <div className="kpi-icon kpi-green">📋</div>
          <div><span>Laporan Tersedia</span><strong>{users.filter((user) => user.postMortemReportId).length}</strong><small>Boleh dibuka untuk semakan</small></div>
        </div>
      </section>

      <div className="user-search-box">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama, ID, sukan atau peranan..."
          aria-label="Cari pengguna"
        />
      </div>

      <div className="user-table-card">
        {loading ? (
          <div className="user-empty">Memuatkan senarai pengguna...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="user-empty">Tiada pengguna yang sepadan dengan carian.</div>
        ) : (
          <div className="user-table-wrapper">
            <table className="user-table admin-users-table">
              <thead>
                <tr>
                  <th>ID PENGGUNA</th>
                  <th>NAMA</th>
                  <th>SUKAN</th>
                  <th>PERANAN</th>
                  <th>STATUS LAPORAN</th>
                  <th>TINDAKAN</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.login_id || '-'}</td>
                    <td>{user.name || '-'}</td>
                    <td>{sports.find((sport) => sport.sport_code === user.sport)?.sport_name || user.sport || '-'}</td>
                    <td>{user.role || 'user'}</td>
                    <td>
                      <span className={`status-badge ${user.postMortemStatus === 'not_started' ? 'not-started' : user.postMortemStatus}`}>
                        {user.postMortemStatus === 'reviewed'
                          ? 'SELESAI'
                          : user.postMortemStatus === 'submitted'
                            ? 'DALAM SEMAKAN'
                            : user.postMortemStatus === 'draft'
                              ? 'DRAF'
                              : 'BELUM DIISI'}
                      </span>
                    </td>
                    <td>
                      {user.postMortemReportId ? (
                        <button
                          type="button"
                          className="ewcc-secondary-button report-action-button"
                          onClick={() => onOpenReport(user.postMortemReportId)}
                        >
                          Lihat Laporan
                        </button>
                      ) : <span className="admin-no-report">Belum ada laporan</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
    </>
  )
}

export default AdminUsers
