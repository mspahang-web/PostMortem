// Extra cards on the admin report page so the whole sport can be read in
// one place: its Cadangan Peralatan 2028, its finance comparison and its
// contingent medal table.
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getEquipmentAmount } from '../lib/equipment'
import {
  FINANCE_ITEMS,
  FINANCE_TOTAL_KEY,
  calculateFinanceChange,
  formatCurrency,
  formatPercent,
  normaliseFinanceData,
} from '../lib/finance'
import {
  HOME_CONTINGENT,
  MEDAL_EDITIONS,
  MEDAL_KINDS,
  hasContingentMedalData,
  normaliseContingentMedals,
  rankContingents,
} from '../lib/contingentMedals'
import '../styles/ContingentMedals.css'

const PRIORITY_CLASS = {
  Tinggi: 'high',
  Sederhana: 'medium',
  Rendah: 'low',
}

function PanelHeader({ kicker, title, badge }) {
  return (
    <div className="overview-panel-header">
      <div>
        <span>{kicker}</span>
        <h3>{title}</h3>
      </div>

      {badge && (
        <span className="overview-panel-badge">
          {badge}
        </span>
      )}
    </div>
  )
}

export function ReportEquipmentPanel({ sport }) {
  // Loaded for the sport shown; null until the first load finishes.
  const [loaded, setLoaded] = useState(null)

  useEffect(() => {
    if (!sport) return undefined

    let active = true

    supabase
      .from('equipment_2028')
      .select('id, bil, peralatan, kuantiti, spesifikasi_jenama, kegunaan, keutamaan, anggaran_harga_seunit, justifikasi_keperluan')
      .eq('sport', sport)
      .order('bil', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (error) console.error('LOAD REPORT EQUIPMENT ERROR:', error)
        setLoaded({ sport, items: data || [], error: Boolean(error) })
      })

    return () => {
      active = false
    }
  }, [sport])

  const isLoading = Boolean(sport) && loaded?.sport !== sport
  const items = loaded?.sport === sport ? loaded.items : []
  const failed = loaded?.sport === sport && loaded.error

  const total = items.reduce((sum, item) => sum + getEquipmentAmount(item), 0)

  return (
    <div className="postmortem-overview-panel report-extra-panel">
      <PanelHeader
        kicker="SUKMA 2028"
        title="Cadangan Peralatan 2028"
        badge={
          items.length > 0
            ? `${items.length} item · RM ${formatCurrency(total)}`
            : null
        }
      />

      {isLoading ? (
        <div className="overview-empty">Memuatkan cadangan peralatan...</div>
      ) : failed ? (
        <div className="overview-empty">Cadangan peralatan tidak dapat dimuatkan.</div>
      ) : items.length === 0 ? (
        <div className="overview-empty">Sukan ini belum menghantar cadangan peralatan.</div>
      ) : (
        <div className="overview-performance-table-wrapper">
          <table className="overview-performance-table report-extra-table">
            <thead>
              <tr>
                <th>Bil</th>
                <th>Peralatan</th>
                <th>Spesifikasi / Kegunaan</th>
                <th>Keutamaan</th>
                <th className="num">Kuantiti</th>
                <th className="num">Harga Seunit (RM)</th>
                <th className="num">Jumlah (RM)</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{item.peralatan || '-'}</strong>
                    {item.justifikasi_keperluan && (
                      <small>{item.justifikasi_keperluan}</small>
                    )}
                  </td>
                  <td>
                    {[item.spesifikasi_jenama, item.kegunaan].filter(Boolean).join(' · ') || '-'}
                  </td>
                  <td>
                    <span className={`report-priority ${PRIORITY_CLASS[item.keutamaan] || ''}`}>
                      {item.keutamaan || '-'}
                    </span>
                  </td>
                  <td className="num">{item.kuantiti ?? '-'}</td>
                  <td className="num">{formatCurrency(item.anggaran_harga_seunit)}</td>
                  <td className="num">
                    <strong>{formatCurrency(getEquipmentAmount(item))}</strong>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={6} className="num">JUMLAH KESELURUHAN</td>
                <td className="num">
                  <strong>RM {formatCurrency(total)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

const changeClass = (amount) =>
  amount > 0 ? 'up' : amount < 0 ? 'down' : ''

export function ReportFinancePanel({ financeData }) {
  const data = normaliseFinanceData(financeData)

  const hasData = FINANCE_ITEMS.some(
    (item) =>
      Number(data[item.key]?.['2023_2024']) ||
      Number(data[item.key]?.['2025_2026']) ||
      data[item.key]?.catatan
  )

  const total = data[FINANCE_TOTAL_KEY]
  const totalChange = calculateFinanceChange(total['2023_2024'], total['2025_2026'])

  return (
    <div className="postmortem-overview-panel report-extra-panel">
      <PanelHeader
        kicker="KEWANGAN"
        title="Perbandingan Kewangan"
        badge={
          hasData
            ? `Jumlah 2025–2026: RM ${formatCurrency(total['2025_2026'])}`
            : null
        }
      />

      {!hasData ? (
        <div className="overview-empty">Sukan ini belum mengisi maklumat kewangan.</div>
      ) : (
        <div className="overview-performance-table-wrapper">
          <table className="overview-performance-table report-extra-table">
            <thead>
              <tr>
                <th>Komponen</th>
                <th className="num">2023–2024 (RM)</th>
                <th className="num">2025–2026 (RM)</th>
                <th className="num">Perubahan (RM)</th>
                <th className="num">Perubahan (%)</th>
                <th>Catatan</th>
              </tr>
            </thead>

            <tbody>
              {FINANCE_ITEMS.map((item) => {
                const row = data[item.key]
                const change = calculateFinanceChange(row['2023_2024'], row['2025_2026'])
                const isTotal = item.key === FINANCE_TOTAL_KEY

                return (
                  <tr key={item.key} className={isTotal ? 'report-total-row' : ''}>
                    <td>{isTotal ? <strong>{item.label}</strong> : item.label}</td>
                    <td className="num">{formatCurrency(row['2023_2024'])}</td>
                    <td className="num">{formatCurrency(row['2025_2026'])}</td>
                    <td className={`num report-change ${changeClass(change.amount)}`}>
                      {formatCurrency(change.amount)}
                    </td>
                    <td className={`num report-change ${changeClass(change.amount)}`}>
                      {formatPercent(change.percent)}
                    </td>
                    <td>{row.catatan || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <p className="report-extra-note">
            Perubahan keseluruhan:{' '}
            <strong className={`report-change ${changeClass(totalChange.amount)}`}>
              RM {formatCurrency(totalChange.amount)} ({formatPercent(totalChange.percent)})
            </strong>
          </p>
        </div>
      )}
    </div>
  )
}

const rankClass = (row) =>
  row.rank <= 3 && row.jumlah > 0 ? `top-${row.rank}` : ''

// Loaded on its own (not with the report list) so the report page keeps
// working even before the contingent_medals column is added.
export function ReportContingentMedalsPanel({ reportId }) {
  const [loaded, setLoaded] = useState(null)

  useEffect(() => {
    if (!reportId) return undefined

    let active = true

    supabase
      .from('postmortem_reports')
      .select('contingent_medals')
      .eq('id', reportId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) console.error('LOAD REPORT CONTINGENT MEDALS ERROR:', error)
        setLoaded({ reportId, data: data?.contingent_medals, error: Boolean(error) })
      })

    return () => {
      active = false
    }
  }, [reportId])

  const isLoading = Boolean(reportId) && loaded?.reportId !== reportId
  const failed = loaded?.reportId === reportId && loaded.error
  const medals = normaliseContingentMedals(
    loaded?.reportId === reportId ? loaded.data : null
  )
  const hasData = hasContingentMedalData(medals)

  const editions = MEDAL_EDITIONS.map((edition) => {
    const standings = rankContingents(medals[edition.key])

    return {
      ...edition,
      standings,
      home: standings.find((row) => row.name === HOME_CONTINGENT),
      records: standings.filter((row) => row.rekod),
    }
  })

  const current = editions[0]

  return (
    <div className="postmortem-overview-panel report-extra-panel">
      <PanelHeader
        kicker={`PINGAT KONTINJEN · ${medals.kejohanan}`}
        title="Pencapaian Pingat Kontinjen"
        badge={
          hasData && current.home.jumlah > 0
            ? `Pahang #${current.home.rank} · ${medals.kejohanan} ${current.label}`
            : null
        }
      />

      {isLoading ? (
        <div className="overview-empty">Memuatkan pencapaian pingat...</div>
      ) : failed ? (
        <div className="overview-empty">Pencapaian pingat kontinjen tidak dapat dimuatkan.</div>
      ) : !hasData ? (
        <div className="overview-empty">Sukan ini belum mengisi pencapaian pingat kontinjen.</div>
      ) : (
        <>
          <div className="cm-report-summary">
            {editions.map((edition, index) => (
              <div
                key={edition.key}
                className={`cm-summary-card ${index > 0 ? 'previous' : ''}`}
              >
                <div className="cm-summary-rank">
                  <small>Kedudukan</small>
                  <strong>{edition.home.jumlah > 0 ? `#${edition.home.rank}` : '-'}</strong>
                </div>

                <div className="cm-summary-body">
                  <span>PAHANG · {medals.kejohanan} {edition.label}</span>

                  <div className="cm-summary-medals">
                    <b className="emas">🥇 {edition.home.emas} Emas</b>
                    <b className="perak">🥈 {edition.home.perak} Perak</b>
                    <b className="gangsa">🥉 {edition.home.gangsa} Gangsa</b>
                    <b className="jumlah">Jumlah {edition.home.jumlah}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cm-report-tables">
            {editions.map((edition) => (
              <div key={edition.key} className="cm-report-block">
                <h4>PENCAPAIAN PINGAT KONTINJEN {medals.kejohanan} {edition.label}</h4>

                <div className="cm-table-scroll">
                  <table className="cm-table">
                    <thead>
                      <tr>
                        <th className="cm-col-no">Bil.</th>
                        <th>Negeri</th>
                        {MEDAL_KINDS.map((kind) => (
                          <th key={kind.key} className="cm-col-medal">
                            <span className={`cm-medal-dot ${kind.key}`} />
                            {kind.label}
                          </th>
                        ))}
                        <th className="cm-col-num">Jumlah</th>
                      </tr>
                    </thead>

                    <tbody>
                      {edition.standings.map((row) => (
                        <tr
                          key={row.name}
                          className={`${row.name === HOME_CONTINGENT ? 'cm-home' : ''} ${row.jumlah === 0 ? 'cm-none' : ''}`}
                        >
                          <td className="cm-col-no">
                            <span className={`cm-rank ${rankClass(row)}`}>
                              {row.rank}
                            </span>
                          </td>
                          <td className="cm-name">{row.name}</td>
                          {MEDAL_KINDS.map((kind) => (
                            <td key={kind.key} className="cm-col-medal">
                              <span className={`cm-medal-count ${row[kind.key] ? kind.key : 'zero'}`}>
                                {row[kind.key]}
                              </span>
                            </td>
                          ))}
                          <td className="cm-col-num">
                            <strong>{row.jumlah}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {edition.records.length > 0 && (
                  <div className="cm-report-records">
                    <strong>Rekod {edition.label}</strong>
                    <ul>
                      {edition.records.map((row) => (
                        <li key={row.name}>
                          <b>{row.name}:</b> {row.rekod}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
