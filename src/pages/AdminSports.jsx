import { useMemo, useState } from 'react'
import PageHero from '../components/PageHero'
import { adminManage } from '../lib/adminApi'

const EMPTY_FORM = {
  sportCode: '',
  sportName: '',
  status: 'active',
}

function normaliseStatus(status) {
  return /^(inactive|tidak)/i.test(String(status || ''))
    ? 'inactive'
    : 'active'
}

function AdminSports({
  sports,
  users = [],
  postMortemReports,
  onBack,
  onOpenReport,
  onChanged,
}) {

  const [sportSearch, setSportSearch] = useState('')

  // null | { mode: 'create' } | { mode: 'edit', sport }
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)


  // =====================================================
  // GABUNG DATA SUKAN + STATUS POST-MORTEM
  // =====================================================

  const sportsWithPostMortem = useMemo(() => {

    return sports.map((sport) => {

      const report = postMortemReports?.find(
        (item) =>
          item.sport === sport.sport_code
      )

      return {
        ...sport,
        userCount: users.filter(
          (user) => user.sport === sport.sport_code
        ).length,
        postMortemStatus:
          report?.status || 'not_started',
        reportId:
          report?.id || null,
      }

    })

  }, [sports, users, postMortemReports])


  // =====================================================
  // CARIAN SUKAN
  // =====================================================

  const filteredSports = useMemo(() => {

    const search =
      sportSearch
        .trim()
        .toLowerCase()

    if (!search) {
      return sportsWithPostMortem
    }

    return sportsWithPostMortem.filter(
      (sport) =>
        sport.sport_name
          ?.toLowerCase()
          .includes(search) ||
        sport.sport_code
          ?.toLowerCase()
          .includes(search)
    )

  }, [
    sportsWithPostMortem,
    sportSearch,
  ])

  const activeCount = sports.filter(
    (sport) => normaliseStatus(sport.status) === 'active'
  ).length


  // =====================================================
  // TAMBAH / EDIT / PADAM
  // =====================================================

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal({ mode: 'create' })
  }

  const openEdit = (sport) => {
    setForm({
      sportCode: sport.sport_code || '',
      sportName: sport.sport_name || '',
      status: normaliseStatus(sport.status),
    })
    setModal({ mode: 'edit', sport })
  }

  const closeModal = () => {
    if (saving) return
    setModal(null)
  }

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSave = async () => {

    if (modal?.mode === 'create' && !form.sportCode.trim()) {
      alert('Sila masukkan Kod Sukan.')
      return
    }

    if (!form.sportName.trim()) {
      alert('Sila masukkan Nama Sukan.')
      return
    }

    setSaving(true)

    try {
      if (modal.mode === 'create') {
        await adminManage('sport.create', {
          sportCode: form.sportCode.trim().toUpperCase(),
          sportName: form.sportName.trim(),
          status: form.status,
        })
      } else {
        await adminManage('sport.update', {
          sportId: modal.sport.id,
          sportName: form.sportName.trim(),
          status: form.status,
        })
      }

      setModal(null)
      await onChanged?.()

      alert(
        modal.mode === 'create'
          ? 'Sukan berjaya ditambah.'
          : 'Sukan berjaya dikemas kini.'
      )
    } catch (error) {
      alert(`Sukan tidak dapat disimpan.\n\n${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (sport) => {

    if (sport.userCount > 0 || sport.reportId) {
      alert(
        `Sukan "${sport.sport_name}" tidak boleh dipadam kerana masih digunakan ` +
        `(${sport.userCount} pengguna${sport.reportId ? ', ada laporan post-mortem' : ''}).\n\n` +
        'Tukar status kepada Tidak Aktif jika sukan ini tidak lagi digunakan.'
      )
      return
    }

    const confirmed = window.confirm(
      `Padam sukan "${sport.sport_name}" (${sport.sport_code})?\n\n` +
      'Tindakan ini tidak boleh dibatalkan.'
    )

    if (!confirmed) return

    setDeletingId(sport.id)

    try {
      await adminManage('sport.delete', { sportId: sport.id })
      await onChanged?.()
      alert('Sukan berjaya dipadam.')
    } catch (error) {
      alert(`Sukan tidak dapat dipadam.\n\n${error.message}`)
    } finally {
      setDeletingId(null)
    }
  }


  // =====================================================
  // PAPARAN
  // =====================================================

  return (
    <>
      <PageHero
        eyebrow="EWCC POST-MORTEM • PENGURUSAN SISTEM"
        title="Senarai Sukan"
        description="Senarai sukan Kontinjen Pahang yang didaftarkan dalam sistem EWCC."
        actions={
          <>
            <button
              type="button"
              className="ewcc-secondary-button"
              onClick={onBack}
            >
              ← Kembali
            </button>

            <button
              type="button"
              className="ewcc-primary-button"
              onClick={openCreate}
            >
              + Tambah Sukan
            </button>
          </>
        }
      />

    <section className="ewcc-section admin-sports-page">

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="ewcc-kpi-grid">

        {/* JUMLAH SUKAN */}

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
              Sukan berdaftar
            </small>

          </div>

        </div>


        {/* STATUS */}

        <div className="ewcc-kpi-card">

          <div className="kpi-icon kpi-green">
            ✓
          </div>

          <div>

            <span>
              Sukan Aktif
            </span>

            <strong>
              {activeCount}
            </strong>

            <small>
              {sports.length - activeCount} tidak aktif
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="user-search-box">

        <input
          type="text"
          placeholder="Cari nama atau kod sukan..."
          value={sportSearch}
          onChange={(e) =>
            setSportSearch(e.target.value)
          }
        />

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="user-table-card">

        {filteredSports.length === 0 ? (

          <div className="user-empty">
            Tiada sukan yang sepadan dengan carian.
          </div>

        ) : (

          <div className="user-table-wrapper">

            <table className="user-table admin-sports-table">

              {/* TABLE HEADER */}

              <thead>

                <tr>

                  <th>
                    BIL.
                  </th>

                  <th>
                    KOD SUKAN
                  </th>

                  <th>
                    NAMA SUKAN
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    POST-MORTEM
                  </th>

                  <th>
                    TINDAKAN
                  </th>

                </tr>

              </thead>


              {/* TABLE BODY */}

              <tbody>

                {filteredSports.map(
                  (sport, index) => (

                    <tr key={sport.id}>

                      {/* BIL */}

                      <td>
                        {index + 1}
                      </td>


                      {/* KOD */}

                      <td>
                        <strong>
                          {sport.sport_code}
                        </strong>
                      </td>


                      {/* NAMA */}

                      <td>
                        {sport.sport_name}
                      </td>


                      {/* STATUS SUKAN */}

                      <td>

                        {normaliseStatus(sport.status) === 'active' ? (
                          <span className="user-status Aktif">
                            AKTIF
                          </span>
                        ) : (
                          <span className="status-badge not-started">
                            TIDAK AKTIF
                          </span>
                        )}

                      </td>


                      {/* STATUS POST-MORTEM */}

                      <td>

                        {sport.postMortemStatus === 'reviewed' && (
                          <span className="status-badge reviewed">
                            REVIEWED
                          </span>
                        )}

                        {sport.postMortemStatus === 'submitted' && (
                          <span className="status-badge submitted">
                            SUBMITTED
                          </span>
                        )}

                        {sport.postMortemStatus === 'draft' && (
                          <span className="status-badge draft">
                            DRAFT
                          </span>
                        )}

                        {sport.postMortemStatus === 'not_started' && (
                          <span className="status-badge not-started">
                            BELUM DIISI
                          </span>
                        )}

                      </td>

                      <td>
                        <div className="admin-row-actions">
                          {sport.reportId && (
                            <button
                              type="button"
                              className="ewcc-secondary-button report-action-button"
                              onClick={() => onOpenReport?.(sport.reportId)}
                            >
                              Lihat Laporan
                            </button>
                          )}

                          <button
                            type="button"
                            className="ewcc-secondary-button report-action-button"
                            onClick={() => openEdit(sport)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="ewcc-danger-button report-action-button"
                            onClick={() => handleDelete(sport)}
                            disabled={deletingId === sport.id}
                          >
                            {deletingId === sport.id ? 'Memadam...' : 'Padam'}
                          </button>
                        </div>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </section>

      {/* =================================================
          MODAL TAMBAH / EDIT
      ================================================= */}

      {modal && (
        <div className="ewcc-modal-overlay">
          <div className="ewcc-modal" role="dialog" aria-modal="true">

            <div className="ewcc-modal-header">
              <div>
                <h2>
                  {modal.mode === 'create' ? 'Tambah Sukan' : 'Edit Sukan'}
                </h2>
                <p>
                  {modal.mode === 'create'
                    ? 'Daftar sukan baharu ke dalam sistem EWCC.'
                    : `Kemas kini maklumat ${modal.sport.sport_name}.`}
                </p>
              </div>

              <button
                type="button"
                className="ewcc-modal-close"
                onClick={closeModal}
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <div className="ewcc-modal-body">

              <div className="ewcc-form-group">
                <label htmlFor="sport-code">
                  Kod Sukan
                </label>
                <input
                  id="sport-code"
                  type="text"
                  value={form.sportCode}
                  onChange={(e) =>
                    updateForm('sportCode', e.target.value.toUpperCase())
                  }
                  placeholder="Contoh: ESK"
                  maxLength={20}
                  disabled={modal.mode === 'edit'}
                />
                <small>
                  {modal.mode === 'create'
                    ? 'Kod ringkas yang unik. Tidak boleh ditukar selepas disimpan.'
                    : 'Kod tidak boleh ditukar kerana digunakan oleh pengguna dan laporan.'}
                </small>
              </div>

              <div className="ewcc-form-group">
                <label htmlFor="sport-name">
                  Nama Sukan
                </label>
                <input
                  id="sport-name"
                  type="text"
                  value={form.sportName}
                  onChange={(e) =>
                    updateForm('sportName', e.target.value)
                  }
                  placeholder="Contoh: Esports"
                />
              </div>

              <div className="ewcc-form-group">
                <label htmlFor="sport-status">
                  Status
                </label>
                <select
                  id="sport-status"
                  value={form.status}
                  onChange={(e) =>
                    updateForm('status', e.target.value)
                  }
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
                <small>
                  Sukan Tidak Aktif tidak dipaparkan semasa mendaftar pengguna baharu.
                </small>
              </div>

            </div>

            <div className="ewcc-modal-footer">
              <button
                type="button"
                className="ewcc-secondary-button"
                onClick={closeModal}
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
                {saving ? 'Menyimpan...' : 'Simpan Sukan'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default AdminSports
