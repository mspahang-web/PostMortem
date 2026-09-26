import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  FINANCE_ITEMS,
  FINANCE_PERIODS,
  FINANCE_TOTAL_KEY,
  createEmptyFinanceData,
  formatCurrency,
  normaliseFinanceData,
  withComputedTotal,
} from '../lib/finance'
import '../styles/Equipment2028.css'

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 40,
  border: '1px solid #d9e1ea',
  borderRadius: 8,
  padding: '0 9px 0 31px',
  textAlign: 'right',
  fontSize: 13,
  color: '#34445c',
  outline: 'none',
  background: '#fff',
}

const totalInputStyle = {
  ...inputStyle,
  background: '#f1f5f9',
  fontWeight: 700,
}

export default function UserFinance({
  userProfile,
  onBack,
}) {
  const [financeData, setFinanceData] =
    useState(createEmptyFinanceData())

  const [reportId, setReportId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const sportName =
    userProfile?.sport ||
    'Sukan'

  // ==========================================
  // LOAD
  // ==========================================

  const loadFinance = async () => {
    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('Sesi log masuk tamat. Sila log masuk semula.')
        return
      }

      const { data, error } = await supabase
        .from('postmortem_reports')
        .select('id, finance_data')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('LOAD FINANCE ERROR:', error)
        alert(`Data kewangan tidak dapat dimuatkan.\n\n${error.message}`)
        return
      }

      setReportId(data?.id || null)
      setFinanceData(normaliseFinanceData(data?.finance_data))
    } catch (error) {
      console.error('UNEXPECTED LOAD FINANCE ERROR:', error)
      alert('Berlaku ralat semasa memuatkan data kewangan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadFinance)
  }, [])

  // ==========================================
  // UPDATE FIELD
  // ==========================================

  const updateFinanceValue = (key, field, value) => {
    setFinanceData((current) =>
      withComputedTotal({
        ...current,
        [key]: {
          ...current[key],
          [field]:
            field === 'catatan'
              ? value
              : value === ''
                ? 0
                : Number(value),
        },
      })
    )
  }

  // ==========================================
  // SAVE
  // ==========================================

  const saveFinance = async () => {
    setSaving(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('Sesi log masuk tamat. Sila log masuk semula.')
        return
      }

      const payload = {
        finance_data: withComputedTotal(financeData),
        updated_at: new Date().toISOString(),
      }

      // Save on the sport's existing report, or start a draft report
      // (the post-mortem form picks up this same draft later).
      const query = reportId
        ? supabase
            .from('postmortem_reports')
            .update(payload)
            .eq('id', reportId)
            .eq('user_id', user.id)
        : supabase
            .from('postmortem_reports')
            .insert({
              ...payload,
              user_id: user.id,
              login_id: userProfile?.login_id || '',
              sport: userProfile?.sport || null,
              status: 'draft',
            })

      const { data, error } = await query
        .select('id')
        .maybeSingle()

      if (error || !data) {
        console.error('SAVE FINANCE ERROR:', error)
        alert(
          `Data kewangan gagal disimpan.\n\n${
            error?.message ||
            'Tiada rekod laporan dikemas kini.'
          }`
        )
        return
      }

      setReportId(data.id)
      alert('Data kewangan berjaya disimpan.')
    } catch (error) {
      console.error('UNEXPECTED SAVE FINANCE ERROR:', error)
      alert('Berlaku ralat semasa menyimpan data kewangan.')
    } finally {
      setSaving(false)
    }
  }

  const total = financeData[FINANCE_TOTAL_KEY]

  return (
    <main className="ewcc-user-dashboard equipment-page equipment-applicant">

      <section className="ewcc-admin-content">

        <div className="ewcc-admin-body">

          {/* HEADER */}

          <section className="ewcc-welcome">
            <span className="welcome-eyebrow">
              POST-MORTEM • MAKLUMAT KEWANGAN
            </span>

            <h2>
              Perbandingan Kewangan
            </h2>

            <p>
              Masukkan kelulusan perbelanjaan sukan anda bagi
              tempoh 2023–2024 dan 2025–2026. Jumlah Kelulusan
              Perbelanjaan dikira secara automatik.
            </p>

            <span className="welcome-note">
              {sportName}
            </span>
          </section>

          {/* KPI */}

          <section className="ewcc-kpi-grid">

            <div className="ewcc-kpi-card">
              <div className="kpi-icon kpi-blue">
                🏅
              </div>
              <div>
                <span>Sukan</span>
                <strong>{sportName}</strong>
                <small>Sukan Pengguna</small>
              </div>
            </div>

            <div className="ewcc-kpi-card">
              <div className="kpi-icon kpi-green">
                💰
              </div>
              <div>
                <span>Jumlah 2023–2024</span>
                <strong>RM {formatCurrency(total?.['2023_2024'])}</strong>
                <small>Jumlah kelulusan</small>
              </div>
            </div>

            <div className="ewcc-kpi-card">
              <div className="kpi-icon kpi-orange">
                💰
              </div>
              <div>
                <span>Jumlah 2025–2026</span>
                <strong>RM {formatCurrency(total?.['2025_2026'])}</strong>
                <small>Jumlah kelulusan</small>
              </div>
            </div>

          </section>

          {/* FORM */}

          <section className="ewcc-section">

            <div
              className="ewcc-section-title"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <span>BORANG KEWANGAN</span>
                <h2>Perbandingan Kewangan</h2>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
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
                  onClick={saveFinance}
                  disabled={loading || saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>

            <div className="ewcc-status-card">

              {loading ? (

                <div
                  style={{
                    padding: 50,
                    textAlign: 'center',
                    color: '#8995a7',
                  }}
                >
                  Memuatkan data kewangan...
                </div>

              ) : (

                <div
                  className="equipment-table-wrap"
                  style={{ width: '100%', overflowX: 'auto' }}
                >
                  <table
                    className="equipment-table"
                    style={{
                      width: '100%',
                      minWidth: 820,
                      borderCollapse: 'collapse',
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: '34%' }}>PERKARA</th>
                        {FINANCE_PERIODS.map((period) => (
                          <th
                            key={period.key}
                            style={{ width: '20%', textAlign: 'right' }}
                          >
                            {period.label} (RM)
                          </th>
                        ))}
                        <th>CATATAN</th>
                      </tr>
                    </thead>

                    <tbody>
                      {FINANCE_ITEMS.map((item) => {
                        const isTotal = item.key === FINANCE_TOTAL_KEY

                        return (
                          <tr
                            key={item.key}
                            style={
                              isTotal
                                ? { background: '#f8fafc' }
                                : undefined
                            }
                          >
                            <td>
                              <strong
                                style={{
                                  color: '#40516a',
                                  fontWeight: isTotal ? 800 : 600,
                                }}
                              >
                                {item.label}
                              </strong>
                              {isTotal && (
                                <small
                                  style={{
                                    display: 'block',
                                    color: '#8995a7',
                                    marginTop: 4,
                                  }}
                                >
                                  Dikira automatik
                                </small>
                              )}
                            </td>

                            {FINANCE_PERIODS.map((period) => (
                              <td key={period.key}>
                                <div style={{ position: 'relative' }}>
                                  <span
                                    style={{
                                      position: 'absolute',
                                      left: 10,
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      fontSize: 11,
                                      color: '#8995a7',
                                      pointerEvents: 'none',
                                    }}
                                  >
                                    RM
                                  </span>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    aria-label={`${item.label} ${period.label}`}
                                    readOnly={isTotal}
                                    placeholder="0.00"
                                    value={
                                      isTotal
                                        ? financeData[item.key]?.[period.key] ?? 0
                                        : financeData[item.key]?.[period.key] || ''
                                    }
                                    onChange={(e) =>
                                      updateFinanceValue(
                                        item.key,
                                        period.key,
                                        e.target.value
                                      )
                                    }
                                    style={
                                      isTotal
                                        ? totalInputStyle
                                        : inputStyle
                                    }
                                  />
                                </div>
                              </td>
                            ))}

                            <td>
                              <textarea
                                rows="2"
                                aria-label={`Catatan ${item.label}`}
                                value={financeData[item.key]?.catatan || ''}
                                onChange={(e) =>
                                  updateFinanceValue(
                                    item.key,
                                    'catatan',
                                    e.target.value
                                  )
                                }
                                placeholder="Catatan..."
                                style={{
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  resize: 'vertical',
                                  border: '1px solid #d9e1ea',
                                  borderRadius: 8,
                                  padding: '8px 10px',
                                  fontSize: 12,
                                  color: '#34445c',
                                  outline: 'none',
                                  fontFamily: 'inherit',
                                }}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

              )}

            </div>

          </section>

        </div>

      </section>

    </main>
  )
}
