import { useMemo, useState } from 'react'
import PageHero from '../components/PageHero'
import { adminManage } from '../lib/adminApi'

function AdminUsers({
  users,
  sports,
  loading,
  onAddUser,
  onBack,
  onOpenReport,
  onChanged,
}) {
  const [search, setSearch] = useState('')

  // User being edited, with the form values.
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const isAdmin = (user) => user.role === 'admin'

  const openEdit = (user) => {
    setEditing({
      user,
      name: user.name || '',
      sport: user.sport || '',
      password: '',
    })
  }

  const updateEditing = (field, value) => {
    setEditing((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async () => {
    const { user, name, sport, password } = editing

    if (!name.trim()) {
      alert('Sila masukkan Nama Pengguna.')
      return
    }

    if (!isAdmin(user) && !sport) {
      alert('Sila pilih Sukan.')
      return
    }

    if (password && password.length < 6) {
      alert('Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.')
      return
    }

    if (!isAdmin(user) && sport !== user.sport) {
      const confirmed = window.confirm(
        `Tukar sukan ${user.login_id} kepada ${sports.find((item) => item.sport_code === sport)?.sport_name || sport}?\n\n` +
        'Laporan post-mortem dan cadangan peralatan pengguna ini akan turut dipindahkan ke sukan baharu.'
      )
      if (!confirmed) return
    }

    setSaving(true)

    try {
      await adminManage('user.update', {
        userId: user.id,
        name: name.trim(),
        sport,
        password: password || undefined,
      })

      setEditing(null)
      await onChanged?.()

      alert(
        password
          ? 'Pengguna berjaya dikemas kini dan kata laluan telah ditukar.'
          : 'Pengguna berjaya dikemas kini.'
      )
    } catch (error) {
      alert(`Pengguna tidak dapat dikemas kini.\n\n${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Padam pengguna ${user.login_id} (${user.name || '-'})?\n\n` +
      'Akaun log masuk akan dipadam dan pengguna ini tidak lagi boleh log masuk. ' +
      'Laporan post-mortem dan cadangan peralatan sukan ini TIDAK dipadam.\n\n' +
      'Tindakan ini tidak boleh dibatalkan.'
    )

    if (!confirmed) return

    setDeletingId(user.id)

    try {
      await adminManage('user.delete', { userId: user.id })
      await onChanged?.()
      alert('Pengguna berjaya dipadam.')
    } catch (error) {
      alert(`Pengguna tidak dapat dipadam.\n\n${error.message}`)
    } finally {
      setDeletingId(null)
    }
  }

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
                      <div className="admin-row-actions">
                        {user.postMortemReportId && (
                          <button
                            type="button"
                            className="ewcc-secondary-button report-action-button"
                            onClick={() => onOpenReport(user.postMortemReportId)}
                          >
                            Lihat Laporan
                          </button>
                        )}

                        <button
                          type="button"
                          className="ewcc-secondary-button report-action-button"
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </button>

                        {!isAdmin(user) && (
                          <button
                            type="button"
                            className="ewcc-danger-button report-action-button"
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user.id}
                          >
                            {deletingId === user.id ? 'Memadam...' : 'Padam'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>

      {editing && (
        <div className="ewcc-modal-overlay">
          <div className="ewcc-modal" role="dialog" aria-modal="true">

            <div className="ewcc-modal-header">
              <div>
                <h2>Edit Pengguna</h2>
                <p>Kemas kini maklumat {editing.user.login_id}.</p>
              </div>

              <button
                type="button"
                className="ewcc-modal-close"
                onClick={() => !saving && setEditing(null)}
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <div className="ewcc-modal-body">

              <div className="ewcc-form-group">
                <label htmlFor="edit-user-name">Nama Pengguna</label>
                <input
                  id="edit-user-name"
                  type="text"
                  value={editing.name}
                  onChange={(e) => updateEditing('name', e.target.value)}
                />
              </div>

              <div className="ewcc-form-group">
                <label htmlFor="edit-user-login">ID Pengguna</label>
                <input
                  id="edit-user-login"
                  type="text"
                  value={editing.user.login_id || ''}
                  disabled
                />
                <small>
                  ID Pengguna digunakan untuk log masuk dan tidak boleh ditukar.
                  Padam dan daftar semula jika perlu ID baharu.
                </small>
              </div>

              {!isAdmin(editing.user) && (
                <div className="ewcc-form-group">
                  <label htmlFor="edit-user-sport">Sukan</label>
                  <select
                    id="edit-user-sport"
                    value={editing.sport}
                    onChange={(e) => updateEditing('sport', e.target.value)}
                  >
                    <option value="">-- Pilih Sukan --</option>
                    {sports.map((sport) => (
                      <option key={sport.sport_code} value={sport.sport_code}>
                        {sport.sport_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="ewcc-form-group">
                <label htmlFor="edit-user-password">Kata Laluan Baharu</label>
                <input
                  id="edit-user-password"
                  type="password"
                  value={editing.password}
                  onChange={(e) => updateEditing('password', e.target.value)}
                  placeholder="Biarkan kosong jika tidak ditukar"
                  autoComplete="new-password"
                />
                <small>
                  Isi hanya untuk set semula kata laluan (sekurang-kurangnya 6 aksara).
                </small>
              </div>

            </div>

            <div className="ewcc-modal-footer">
              <button
                type="button"
                className="ewcc-secondary-button"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                Batal
              </button>

              <button
                type="button"
                className="ewcc-primary-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default AdminUsers
