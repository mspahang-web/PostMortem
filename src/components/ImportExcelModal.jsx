import { useMemo, useState } from 'react'
import { adminManage } from '../lib/adminApi'
import { parsePostMortemWorkbook } from '../lib/postmortemImport'
import { getSportName } from '../lib/sports'

const STATUS_LABELS = {
  draft: 'DRAF',
  submitted: 'SUBMITTED',
  reviewed: 'REVIEWED',
}

function matchSportCode(sportName, sports) {
  const wanted = String(sportName || '').trim().toLowerCase()
  if (!wanted) return ''
  const sport = sports.find(
    (item) =>
      String(item.sport_name || '').trim().toLowerCase() === wanted ||
      String(item.sport_code || '').trim().toLowerCase() === wanted
  )
  return sport?.sport_code || ''
}

// Admin-only: import a sport's filled Google Sheet (.xlsx) into its
// post-mortem draft and equipment list.
export default function ImportExcelModal({
  users = [],
  sports = [],
  reports = [],
  onClose,
  onImported,
}) {
  const [fileName, setFileName] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [result, setResult] = useState(null)
  const [userId, setUserId] = useState('')
  const [replaceEquipment, setReplaceEquipment] = useState(false)
  const [confirmOverwrite, setConfirmOverwrite] = useState(false)
  const [importing, setImporting] = useState(false)

  const sportUsers = useMemo(
    () =>
      users
        .filter((user) => user.role !== 'admin')
        .sort((a, b) =>
          getSportName(a.sport).localeCompare(getSportName(b.sport))
        ),
    [users]
  )

  const matchedCode = result ? matchSportCode(result.sportName, sports) : ''

  const selectedUser = sportUsers.find((user) => user.id === userId)

  const existingReport = reports
    .filter((report) => report.user_id === userId)
    .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))[0]

  const isLocked =
    existingReport && existingReport.status !== 'draft'

  const totalWarnings = result
    ? result.summary.reduce((n, s) => n + s.warnings.length, 0) + result.equipmentWarnings.length
    : 0

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setParseError('')
    setResult(null)
    setUserId('')
    setConfirmOverwrite(false)
    setParsing(true)

    try {
      const parsed = await parsePostMortemWorkbook(await file.arrayBuffer())
      setResult(parsed)

      const code = matchSportCode(parsed.sportName, sports)
      const candidates = users.filter(
        (user) => user.role !== 'admin' && user.sport === code
      )
      if (candidates.length === 1) setUserId(candidates[0].id)
    } catch (error) {
      console.error('IMPORT PARSE ERROR:', error)
      setParseError(error.message || 'Fail tidak dapat dibaca.')
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    if (!result || !selectedUser) {
      alert('Sila pilih akaun pengguna sukan.')
      return
    }

    if (matchedCode && selectedUser.sport !== matchedCode) {
      const confirmed = window.confirm(
        `Fail ini untuk sukan "${result.sportName}", tetapi akaun dipilih ialah ` +
        `${selectedUser.login_id} (${getSportName(selectedUser.sport)}).\n\nTeruskan juga?`
      )
      if (!confirmed) return
    }

    if (isLocked && !confirmOverwrite) {
      alert('Tandakan pengesahan untuk menulis ganti laporan yang telah dihantar.')
      return
    }

    setImporting(true)

    try {
      const data = await adminManage('report.import', {
        userId: selectedUser.id,
        sections: result.sections,
        equipment: result.equipment,
        replaceEquipment,
        overwriteSubmitted: isLocked ? confirmOverwrite : false,
      })

      alert(
        `Import berjaya untuk ${selectedUser.login_id}.\n\n` +
        `• 13 bahagian borang disimpan sebagai draf.\n` +
        `• ${data.equipmentCount || 0} item cadangan peralatan ${replaceEquipment ? 'menggantikan senarai lama' : 'ditambah'}.\n\n` +
        'Minta pengguna menyemak setiap bahagian dan menghantar laporan.'
      )

      onImported?.(data.reportId)
    } catch (error) {
      alert(`Import gagal.\n\n${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="ewcc-modal-overlay">
      <div className="ewcc-modal import-excel-modal" role="dialog" aria-modal="true">

        <div className="ewcc-modal-header">
          <div>
            <h2>Import Borang dari Excel</h2>
            <p>Fail Google Sheet borang post-mortem (.xlsx) bagi satu sukan.</p>
          </div>

          <button
            type="button"
            className="ewcc-modal-close"
            onClick={() => !importing && onClose()}
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <div className="ewcc-modal-body">

          <div className="ewcc-form-group">
            <label htmlFor="import-file">1. Pilih fail</label>
            <input
              id="import-file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFile}
              disabled={parsing || importing}
            />
            <small>
              Dari Google Sheet: File → Download → Microsoft Excel (.xlsx).
              Fail dibaca dalam pelayar ini sahaja.
            </small>
          </div>

          {parsing && <p className="import-note">Membaca {fileName}...</p>}

          {parseError && (
            <p className="import-note import-error" role="alert">{parseError}</p>
          )}

          {result && (
            <>
              <div className="ewcc-form-group">
                <label htmlFor="import-user">2. Akaun pengguna sukan</label>
                <select
                  id="import-user"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value)
                    setConfirmOverwrite(false)
                  }}
                >
                  <option value="">-- Pilih akaun --</option>
                  {sportUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {getSportName(user.sport) || '-'} — {user.login_id}
                    </option>
                  ))}
                </select>
                <small>
                  Nama sukan dalam fail: <strong>{result.sportName || '(tiada)'}</strong>
                  {result.sportName && !matchedCode && ' — tiada sukan sepadan dalam sistem; pilih akaun secara manual.'}
                </small>
              </div>

              {selectedUser && (
                <p className={`import-note ${isLocked ? 'import-error' : ''}`}>
                  {existingReport
                    ? `Laporan sedia ada: ${STATUS_LABELS[existingReport.status] || existingReport.status}. Bahagian 1–13 akan ditulis ganti dengan data dari fail.`
                    : 'Tiada laporan lagi. Draf baharu akan dicipta.'}
                </p>
              )}

              {isLocked && (
                <label className="import-check">
                  <input
                    type="checkbox"
                    checked={confirmOverwrite}
                    onChange={(e) => setConfirmOverwrite(e.target.checked)}
                  />
                  Saya faham laporan yang telah dihantar ini akan ditulis ganti.
                </label>
              )}

              <div className="ewcc-form-group">
                <label>3. Semak data yang akan diimport</label>
                <div className="import-summary">
                  <table>
                    <thead>
                      <tr>
                        <th>Bahagian</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.summary.map((section) => (
                        <tr key={section.number}>
                          <td>{section.label}</td>
                          <td>
                            <span className={section.warnings.length ? 'import-warn' : 'import-ok'}>
                              {section.found ? `${section.count} medan/baris` : 'Tidak dijumpai'}
                            </span>
                            {section.warnings.map((warning) => (
                              <small key={warning}>⚠ {warning}</small>
                            ))}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td>Cadangan Peralatan 2028</td>
                        <td>
                          <span className={result.equipmentWarnings.length ? 'import-warn' : 'import-ok'}>
                            {result.equipment.length} item
                          </span>
                          {result.equipmentWarnings.map((warning) => (
                            <small key={warning}>⚠ {warning}</small>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <small>
                  {totalWarnings === 0
                    ? 'Semua bahagian dibaca tanpa amaran.'
                    : `${totalWarnings} amaran. Medan berkaitan boleh dibetulkan dalam borang selepas import.`}
                  {' '}Helaian "Statistik Postmortem" tidak diimport.
                </small>
              </div>

              {result.equipment.length > 0 && (
                <label className="import-check">
                  <input
                    type="checkbox"
                    checked={replaceEquipment}
                    onChange={(e) => setReplaceEquipment(e.target.checked)}
                  />
                  Gantikan senarai cadangan peralatan sedia ada (jika tidak ditanda, item ditambah).
                </label>
              )}
            </>
          )}

        </div>

        <div className="ewcc-modal-footer">
          <button
            type="button"
            className="ewcc-secondary-button"
            onClick={onClose}
            disabled={importing}
          >
            Batal
          </button>

          <button
            type="button"
            className="ewcc-primary-button"
            onClick={handleImport}
            disabled={!result || !userId || importing || (isLocked && !confirmOverwrite)}
          >
            {importing ? 'Mengimport...' : 'Import'}
          </button>
        </div>

      </div>
    </div>
  )
}
