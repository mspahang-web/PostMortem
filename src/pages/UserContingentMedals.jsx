import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  CONTINGENTS,
  HOME_CONTINGENT,
  MEDAL_EDITIONS,
  MEDAL_GAMES,
  MEDAL_KINDS,
  createEmptyContingentMedals,
  getContingentRank,
  normaliseContingentMedals,
  rankContingents,
  sumMedals,
} from '../lib/contingentMedals'
import PageHero from '../components/PageHero'
import { getSportName } from '../lib/sports'
import '../styles/ContingentMedals.css'

const MISSING_COLUMN_MESSAGE =
  'Lajur contingent_medals belum wujud dalam pangkalan data. Sila minta pentadbir menjalankan skrip SQL yang disediakan.'

const isMissingColumn = (error) =>
  /contingent_medals/i.test(error?.message || '')

export default function UserContingentMedals({
  userProfile,
  onBack,
}) {
  const [medals, setMedals] = useState(createEmptyContingentMedals())
  const [edition, setEdition] = useState(MEDAL_EDITIONS[0].key)
  const [reportId, setReportId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  const sportName = getSportName(userProfile?.sport) || 'Sukan'

  // ==========================================
  // LOAD
  // ==========================================

  const loadMedals = async () => {
    setLoading(true)
    setLoadError('')

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
        .select('id, contingent_medals')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('LOAD CONTINGENT MEDALS ERROR:', error)
        setLoadError(
          isMissingColumn(error)
            ? MISSING_COLUMN_MESSAGE
            : `Data pingat tidak dapat dimuatkan. ${error.message}`
        )
        return
      }

      setReportId(data?.id || null)
      setMedals(normaliseContingentMedals(data?.contingent_medals))
    } catch (error) {
      console.error('UNEXPECTED LOAD CONTINGENT MEDALS ERROR:', error)
      setLoadError('Berlaku ralat semasa memuatkan data pingat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadMedals)
  }, [])

  // ==========================================
  // UPDATE
  // ==========================================

  const setGames = (kejohanan) =>
    setMedals((current) => ({ ...current, kejohanan }))

  const updateCell = (name, field, value) => {
    setMedals((current) => ({
      ...current,
      [edition]: {
        ...current[edition],
        [name]: {
          ...current[edition][name],
          // Keep what was typed; numbers are normalised on save.
          [field]: value,
        },
      },
    }))
  }

  // ==========================================
  // SAVE
  // ==========================================

  const saveMedals = async () => {
    if (loadError) {
      alert(loadError)
      return
    }

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

      const saved = normaliseContingentMedals(medals)

      const payload = {
        contingent_medals: saved,
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
        console.error('SAVE CONTINGENT MEDALS ERROR:', error)
        alert(
          `Data pingat gagal disimpan.\n\n${
            isMissingColumn(error)
              ? MISSING_COLUMN_MESSAGE
              : error?.message || 'Tiada rekod laporan dikemas kini.'
          }`
        )
        return
      }

      setReportId(data.id)
      setMedals(saved)
      alert('Pencapaian pingat kontinjen berjaya disimpan.')
    } catch (error) {
      console.error('UNEXPECTED SAVE CONTINGENT MEDALS ERROR:', error)
      alert('Berlaku ralat semasa menyimpan data pingat.')
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // DERIVED
  // ==========================================

  const [current, previous] = MEDAL_EDITIONS
  const homeNow = getContingentRank(medals[current.key])
  const homeBefore = getContingentRank(medals[previous.key])
  const goldChange = homeNow.emas - homeBefore.emas

  const standings = rankContingents(medals[edition])
  const rankOf = Object.fromEntries(standings.map((row) => [row.name, row]))
  const editionTotal = sumMedals(medals[edition])
  const editionLabel = `${medals.kejohanan} ${edition}`

  const saveButton = (
    <button
      type="button"
      className="ewcc-primary-button"
      onClick={saveMedals}
      disabled={loading || saving || Boolean(loadError)}
    >
      {saving ? 'Menyimpan...' : 'Simpan'}
    </button>
  )

  return (
    <>
      {/* HEADER */}

      <PageHero
        eyebrow="EWCC POST-MORTEM • PINGAT KONTINJEN"
        title="Pencapaian Pingat Kontinjen"
        description="Masukkan jadual pingat semua kontinjen bagi sukan anda. Kedudukan disusun secara automatik mengikut Emas, Perak dan Gangsa."
        meta={[
          `${medals.kejohanan} ${MEDAL_EDITIONS.map((item) => item.label).join(' & ')}`,
          sportName,
        ]}
        actions={
          <>
            <button
              type="button"
              className="ewcc-secondary-button"
              onClick={onBack}
            >
              ← Kembali
            </button>

            {saveButton}
          </>
        }
      />

      {loadError && (
        <div className="cm-alert" role="alert">
          <strong>Perhatian</strong>
          <span>{loadError}</span>
        </div>
      )}

      {/* KPI */}

      <section className="ewcc-kpi-grid">
        <div className="ewcc-kpi-card">
          <div className="kpi-icon kpi-orange">🏆</div>
          <div>
            <span>Kedudukan Pahang {current.label}</span>
            <strong>{homeNow.jumlah > 0 ? `#${homeNow.rank}` : '-'}</strong>
            <small>daripada {CONTINGENTS.length} kontinjen</small>
          </div>
        </div>

        <div className="ewcc-kpi-card">
          <div className="kpi-icon kpi-green">🥇</div>
          <div>
            <span>Pingat Pahang {current.label}</span>
            <strong>{homeNow.jumlah}</strong>
            <small>
              {homeNow.emas} Emas · {homeNow.perak} Perak · {homeNow.gangsa} Gangsa
            </small>
          </div>
        </div>

        <div className="ewcc-kpi-card">
          <div className="kpi-icon kpi-blue">📅</div>
          <div>
            <span>Kedudukan Pahang {previous.label}</span>
            <strong>{homeBefore.jumlah > 0 ? `#${homeBefore.rank}` : '-'}</strong>
            <small>
              {homeBefore.emas} Emas · {homeBefore.perak} Perak · {homeBefore.gangsa} Gangsa
            </small>
          </div>
        </div>

        <div className="ewcc-kpi-card">
          <div className="kpi-icon kpi-red">📈</div>
          <div>
            <span>Perubahan Emas</span>
            <strong className={`cm-change ${goldChange > 0 ? 'up' : goldChange < 0 ? 'down' : ''}`}>
              {goldChange > 0 ? '+' : ''}{goldChange}
            </strong>
            <small>{current.label} berbanding {previous.label}</small>
          </div>
        </div>
      </section>

      {/* FORM */}

      <section className="ewcc-section">
        <div className="ewcc-section-title">
          <div>
            <span>PENCAPAIAN PINGAT KONTINJEN</span>
            <h2>{editionLabel}</h2>
          </div>
        </div>

        <div className="cm-toolbar">
          <div className="cm-toolbar-group">
            <span className="cm-toolbar-label">Kejohanan</span>
            <div className="cm-segment" role="group" aria-label="Kejohanan">
              {MEDAL_GAMES.map((games) => (
                <button
                  key={games}
                  type="button"
                  className={medals.kejohanan === games ? 'active' : ''}
                  aria-pressed={medals.kejohanan === games}
                  onClick={() => setGames(games)}
                >
                  {games === 'PARA SUKMA' ? '♿ ' : '🏅 '}
                  {games}
                </button>
              ))}
            </div>
          </div>

          <div className="cm-toolbar-group">
            <span className="cm-toolbar-label">Edisi</span>
            <div className="cm-segment" role="tablist" aria-label="Edisi">
              {MEDAL_EDITIONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={edition === item.key}
                  className={edition === item.key ? 'active' : ''}
                  onClick={() => setEdition(item.key)}
                >
                  {medals.kejohanan} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="cm-empty">Memuatkan data pingat...</div>
        ) : (
          <div className="cm-layout">
            <div className="cm-table-card">
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
                      <th className="cm-col-num">Kedudukan</th>
                      <th>Rekod</th>
                    </tr>
                  </thead>

                  <tbody>
                    {CONTINGENTS.map((name, index) => {
                      const row = medals[edition][name]
                      const ranked = rankOf[name]
                      const isHome = name === HOME_CONTINGENT

                      return (
                        <tr key={name} className={isHome ? 'cm-home' : ''}>
                          <td className="cm-col-no">{index + 1}</td>
                          <td className="cm-name">
                            {name}
                            {isHome && <span className="cm-home-tag">Kontinjen kita</span>}
                          </td>

                          {MEDAL_KINDS.map((kind) => (
                            <td key={kind.key} className="cm-col-medal">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                inputMode="numeric"
                                placeholder="0"
                                aria-label={`${name} ${kind.label} ${edition}`}
                                className={`cm-input ${kind.key}`}
                                value={row[kind.key] === 0 ? '' : row[kind.key] ?? ''}
                                onChange={(e) => updateCell(name, kind.key, e.target.value)}
                              />
                            </td>
                          ))}

                          <td className="cm-col-num">
                            <strong>{ranked.jumlah}</strong>
                          </td>

                          <td className="cm-col-num">
                            <span className={`cm-rank ${ranked.rank <= 3 && ranked.jumlah > 0 ? `top-${ranked.rank}` : ''}`}>
                              {ranked.jumlah > 0 ? ranked.rank : '-'}
                            </span>
                          </td>

                          <td>
                            <textarea
                              rows="1"
                              className="cm-record"
                              aria-label={`Rekod ${name} ${edition}`}
                              placeholder="Tiada rekod"
                              value={row.rekod || ''}
                              onChange={(e) => updateCell(name, 'rekod', e.target.value)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td />
                      <td>JUMLAH PINGAT</td>
                      {MEDAL_KINDS.map((kind) => (
                        <td key={kind.key} className="cm-col-medal">
                          {editionTotal[kind.key]}
                        </td>
                      ))}
                      <td className="cm-col-num">
                        {editionTotal.emas + editionTotal.perak + editionTotal.gangsa}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="cm-hint">
                Rekod: nyatakan rekod yang dipecahkan, cth. <strong>GR: 25m Sport Pistol Individu Lelaki</strong> (GR = Rekod Kejohanan, NR = Rekod Kebangsaan).
              </p>
            </div>

            {/* LIVE STANDINGS */}

            <aside className="cm-standings">
              <div className="cm-standings-head">
                <span>Carta Kedudukan</span>
                <strong>{editionLabel}</strong>
              </div>

              <ol>
                {standings.map((row) => (
                  <li
                    key={row.name}
                    className={`${row.name === HOME_CONTINGENT ? 'cm-home' : ''} ${row.jumlah === 0 ? 'cm-none' : ''}`}
                  >
                    <span className={`cm-rank ${row.rank <= 3 && row.jumlah > 0 ? `top-${row.rank}` : ''}`}>
                      {row.rank}
                    </span>
                    <span className="cm-standings-name">{row.name}</span>
                    <span className="cm-pills">
                      <b className="emas">{row.emas}</b>
                      <b className="perak">{row.perak}</b>
                      <b className="gangsa">{row.gangsa}</b>
                    </span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        )}

        <div className="cm-actions">{saveButton}</div>
      </section>
    </>
  )
}
