import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/AdminFinance.css'

const FINANCE_ITEMS = [
  {
    key: 'kosPeruntukanKeseluruhan',
    label: 'Kos / Peruntukan Keseluruhan',
  },
  {
    key: 'peralatan',
    label: 'Kelulusan Perbelanjaan Peralatan',
  },
  {
    key: 'latihanPusat',
    label: 'Kelulusan Perbelanjaan Latihan Pusat',
  },
  {
    key: 'kejohanan',
    label: 'Kelulusan Perbelanjaan Kejohanan',
  },
  {
    key: 'elaunAtlet',
    label: 'Elaun Atlet',
  },
  {
    key: 'lantikanJurulatih',
    label: 'Lantikan Jurulatih',
  },
  {
    key: 'lainLain',
    label: 'Lain-lain Kelulusan',
  },
  {
    key: 'jumlahKelulusan',
    label: 'Jumlah Kelulusan Perbelanjaan',
  },
]

const createEmptyFinanceData = () => {
  return FINANCE_ITEMS.reduce((result, item) => {
    result[item.key] = {
      '2023_2024': 0,
      '2025_2026': 0,
      catatan: '',
    }

    return result
  }, {})
}

function normaliseFinanceData(data) {
  const empty = createEmptyFinanceData()

  if (!data || typeof data !== 'object') {
    return empty
  }

  FINANCE_ITEMS.forEach((item) => {
    const source = data[item.key]

    if (!source || typeof source !== 'object') {
      return
    }

    empty[item.key] = {
      '2023_2024':
        Number(source['2023_2024']) || 0,

      '2025_2026':
        Number(source['2025_2026']) || 0,

      catatan:
        source.catatan || '',
    }
  })

  return empty
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(
    'ms-MY',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )
}

function AdminFinance({ onBack }) {
  const [reports, setReports] = useState([])
  const [selectedReportId, setSelectedReportId] =
    useState('')

  const [financeData, setFinanceData] =
    useState(createEmptyFinanceData())

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [loadingReport, setLoadingReport] =
    useState(false)

  const [search, setSearch] =
    useState('')

  // ==========================================
  // LOAD REPORTS
  // ==========================================

  const loadReports = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('postmortem_reports')
        .select(`
          id,
          login_id,
          sport,
          status,
          finance_data,
          updated_at
        `)
        .order('sport', {
          ascending: true,
        })

      if (error) {
        console.error(
          'LOAD FINANCE REPORTS ERROR:',
          error
        )

        alert(
          'Senarai laporan kewangan tidak dapat dimuatkan.'
        )

        setReports([])
        return
      }

      setReports(data || [])

      if (data?.length > 0) {
        setSelectedReportId(
          (current) =>
            current ||
            data[0].id
        )
      }
    } catch (error) {
      console.error(error)

      alert(
        'Berlaku ralat semasa memuatkan data kewangan.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // LOAD SELECTED REPORT
  // ==========================================

  const loadSelectedFinance = async (
    reportId
  ) => {
    if (!reportId) {
      setFinanceData(
        createEmptyFinanceData()
      )
      return
    }

    setLoadingReport(true)

    try {
      const { data, error } =
        await supabase
          .from('postmortem_reports')
          .select(
            'id, finance_data'
          )
          .eq('id', reportId)
          .single()

      if (error) {
        console.error(
          'LOAD FINANCE DATA ERROR:',
          error
        )

        alert(
          'Data kewangan tidak dapat dimuatkan.'
        )

        return
      }

      setFinanceData(
        normaliseFinanceData(
          data?.finance_data
        )
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingReport(false)
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    Promise.resolve().then(loadReports)
  }, [])

  // ==========================================
  // SELECTED REPORT
  // ==========================================

  useEffect(() => {
    Promise.resolve().then(() =>
      loadSelectedFinance(
        selectedReportId
      )
    )
  }, [selectedReportId])

  // ==========================================
  // FILTER REPORTS
  // ==========================================

  const filteredReports = useMemo(() => {
    const keyword =
      search
        .trim()
        .toLowerCase()

    if (!keyword) {
      return reports
    }

    return reports.filter(
      (report) =>
        report.sport
          ?.toLowerCase()
          .includes(keyword) ||
        report.login_id
          ?.toLowerCase()
          .includes(keyword) ||
        report.status
          ?.toLowerCase()
          .includes(keyword)
    )
  }, [reports, search])

  const selectedReport =
    reports.find(
      (report) =>
        report.id === selectedReportId
    )

  // ==========================================
  // UPDATE FIELD
  // ==========================================

  const updateFinanceValue = (
    key,
    field,
    value
  ) => {
    setFinanceData((current) => ({
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
    }))
  }

  // ==========================================
  // SAVE
  // ==========================================

  const saveFinance = async () => {
    if (!selectedReportId) {
      alert(
        'Sila pilih laporan/sukan terlebih dahulu.'
      )

      return
    }

    setSaving(true)

    try {
      const { error } =
        await supabase
          .from('postmortem_reports')
          .update({
            finance_data: financeData,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            selectedReportId
          )

      if (error) {
        console.error(
          'SAVE FINANCE ERROR:',
          error
        )

        alert(
          `Data kewangan gagal disimpan.\n\n${
            error.message ||
            'Ralat tidak diketahui.'
          }`
        )

        return
      }

      setReports((current) =>
        current.map((report) =>
          report.id ===
          selectedReportId
            ? {
                ...report,
                finance_data:
                  financeData,
                updated_at:
                  new Date().toISOString(),
              }
            : report
        )
      )

      alert(
        'Data kewangan berjaya disimpan.'
      )
    } catch (error) {
      console.error(error)

      alert(
        'Berlaku ralat semasa menyimpan data kewangan.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // RESET
  // ==========================================

  const resetFinance = () => {
    if (!selectedReport) {
      return
    }

    const confirmed =
      window.confirm(
        'Adakah anda pasti mahu kosongkan data kewangan untuk laporan ini?'
      )

    if (!confirmed) {
      return
    }

    setFinanceData(
      createEmptyFinanceData()
    )
  }

  // ==========================================
  // TOTALS
  // ==========================================

  const totals = useMemo(() => {
    const previous =
      Number(
        financeData
          ?.jumlahKelulusan
          ?.['2023_2024']
      ) || 0

    const current =
      Number(
        financeData
          ?.jumlahKelulusan
          ?.['2025_2026']
      ) || 0

    return {
      previous,
      current,
      change:
        current - previous,
    }
  }, [financeData])

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="ewcc-finance-page">
      <div
        className="ewcc-finance-canvas"
        style={{
          width: '100%',
          minHeight: 'auto',
          background:
            '#f4f6f8',
        }}
      >
        {/* ======================================
            HEADER
            ====================================== */}

        <header
          style={{
            background:
              '#ffffff',
            borderBottom:
              '1px solid #e3e8ee',
            padding:
              '24px 32px',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'space-between',
            gap: '20px',
          }}
        >
          <div>
            <span
              style={{
                display:
                  'block',
                fontSize:
                  '11px',
                fontWeight:
                  800,
                letterSpacing:
                  '1.4px',
                color:
                  '#d2872c',
                marginBottom:
                  '7px',
              }}
            >
              EWCC POST-MORTEM
            </span>

            <h1
              style={{
                margin: 0,
                fontSize:
                  '25px',
                fontWeight:
                  800,
                color:
                  '#23344d',
              }}
            >
              Statistik Kewangan
            </h1>

            <p
              style={{
                margin:
                  '7px 0 0',
                fontSize:
                  '13px',
                color:
                  '#7c899a',
              }}
            >
              Pengurusan peruntukan dan
              kelulusan perbelanjaan
              post-mortem.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            style={{
              border:
                '1px solid #d9e0e8',
              background:
                '#ffffff',
              color:
                '#40516a',
              borderRadius:
                '10px',
              padding:
                '11px 18px',
              fontWeight:
                750,
              cursor:
                'pointer',
            }}
          >
            ← Kembali
          </button>
        </header>

        {/* ======================================
            CONTENT
            ====================================== */}

        <div
          style={{
            padding:
              '28px 32px 50px',
            maxWidth:
              '1400px',
            margin:
              '0 auto',
          }}
        >
          {/* REPORT SELECTOR */}

          <section
            style={{
              background:
                '#ffffff',
              border:
                '1px solid #e1e7ee',
              borderRadius:
                '14px',
              padding:
                '22px',
              marginBottom:
                '20px',
            }}
          >
            <div
              style={{
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'flex-end',
                gap:
                  '20px',
                flexWrap:
                  'wrap',
              }}
            >
              <div
                style={{
                  flex:
                    '1 1 420px',
                }}
              >
                <label
                  style={{
                    display:
                      'block',
                    fontSize:
                      '11px',
                    fontWeight:
                      800,
                    letterSpacing:
                      '.8px',
                    color:
                      '#7d8a9d',
                    marginBottom:
                      '8px',
                  }}
                >
                  PILIH LAPORAN / SUKAN
                </label>

                <select
                  value={
                    selectedReportId
                  }
                  onChange={(e) =>
                    setSelectedReportId(
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      '100%',
                    minHeight:
                      '46px',
                    border:
                      '1px solid #d9e1ea',
                    borderRadius:
                      '9px',
                    padding:
                      '0 13px',
                    fontSize:
                      '13px',
                    color:
                      '#34445c',
                    background:
                      '#ffffff',
                    outline:
                      'none',
                  }}
                >
                  <option value="">
                    -- Pilih laporan --
                  </option>

                  {filteredReports.map(
                    (report) => (
                      <option
                        key={
                          report.id
                        }
                        value={
                          report.id
                        }
                      >
                        {report.sport ||
                          'Sukan tidak dinyatakan'}{' '}
                        •{' '}
                        {report.login_id ||
                          '-'}{' '}
                        •{' '}
                        {String(
                          report.status ||
                            ''
                        ).toUpperCase()}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div
                style={{
                  flex:
                    '1 1 260px',
                }}
              >
                <label
                  style={{
                    display:
                      'block',
                    fontSize:
                      '11px',
                    fontWeight:
                      800,
                    letterSpacing:
                      '.8px',
                    color:
                      '#7d8a9d',
                    marginBottom:
                      '8px',
                  }}
                >
                  CARI
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Cari sukan, ID pengguna atau status..."
                  style={{
                    width:
                      '100%',
                    minHeight:
                      '46px',
                    boxSizing:
                      'border-box',
                    border:
                      '1px solid #d9e1ea',
                    borderRadius:
                      '9px',
                    padding:
                      '0 13px',
                    fontSize:
                      '13px',
                    color:
                      '#34445c',
                    outline:
                      'none',
                  }}
                />
              </div>
            </div>
          </section>

          {loading ? (
            <section
              style={{
                background:
                  '#ffffff',
                border:
                  '1px solid #e1e7ee',
                borderRadius:
                  '14px',
                padding:
                  '60px 20px',
                textAlign:
                  'center',
                color:
                  '#7d8a9d',
              }}
            >
              Memuatkan laporan...
            </section>
          ) : !selectedReportId ? (
            <section
              style={{
                background:
                  '#ffffff',
                border:
                  '1px solid #e1e7ee',
                borderRadius:
                  '14px',
                padding:
                  '60px 20px',
                textAlign:
                  'center',
                color:
                  '#7d8a9d',
              }}
            >
              <strong
                style={{
                  display:
                    'block',
                  color:
                    '#40516a',
                  marginBottom:
                    '7px',
                }}
              >
                Tiada laporan dipilih
              </strong>

              Pilih laporan atau sukan
              untuk mengurus data kewangan.
            </section>
          ) : (
            <>
              {/* SELECTED REPORT */}

              <section
                style={{
                  background:
                    '#23344d',
                  borderRadius:
                    '14px',
                  padding:
                    '22px 24px',
                  marginBottom:
                    '20px',
                  color:
                    '#ffffff',
                }}
              >
                <div
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center',
                    gap:
                      '20px',
                    flexWrap:
                      'wrap',
                  }}
                >
                  <div>
                    <span
                      style={{
                        display:
                          'block',
                        fontSize:
                          '10px',
                        fontWeight:
                          800,
                        letterSpacing:
                          '1px',
                        opacity:
                          0.65,
                        marginBottom:
                          '6px',
                      }}
                    >
                      LAPORAN DIPILIH
                    </span>

                    <strong
                      style={{
                        fontSize:
                          '21px',
                      }}
                    >
                      {selectedReport?.sport ||
                        'Sukan tidak dinyatakan'}
                    </strong>

                    <div
                      style={{
                        marginTop:
                          '5px',
                        fontSize:
                          '12px',
                        opacity:
                          0.72,
                      }}
                    >
                      ID Pengguna:{' '}
                      {selectedReport?.login_id ||
                        '-'}
                      {' • '}
                      Status:{' '}
                      {String(
                        selectedReport?.status ||
                          '-'
                      ).toUpperCase()}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign:
                        'right',
                    }}
                  >
                    <span
                      style={{
                        display:
                          'block',
                        fontSize:
                          '10px',
                        opacity:
                          0.6,
                        marginBottom:
                          '4px',
                      }}
                    >
                      JUMLAH KELULUSAN
                    </span>

                    <strong
                      style={{
                        display:
                          'block',
                        fontSize:
                          '20px',
                      }}
                    >
                      RM{' '}
                      {formatCurrency(
                        totals.current
                      )}
                    </strong>
                  </div>
                </div>
              </section>

              {loadingReport ? (
                <section
                  style={{
                    background:
                      '#ffffff',
                    border:
                      '1px solid #e1e7ee',
                    borderRadius:
                      '14px',
                    padding:
                      '50px',
                    textAlign:
                      'center',
                    color:
                      '#7d8a9d',
                  }}
                >
                  Memuatkan data kewangan...
                </section>
              ) : (
                <>
                  {/* FINANCE TABLE */}

                  <section
                    style={{
                      background:
                        '#ffffff',
                      border:
                        '1px solid #e1e7ee',
                      borderRadius:
                        '14px',
                      overflow:
                        'hidden',
                      marginBottom:
                        '20px',
                    }}
                  >
                    <div
                      style={{
                        padding:
                          '20px 22px',
                        borderBottom:
                          '1px solid #edf0f4',
                      }}
                    >
                      <span
                        style={{
                          display:
                            'block',
                          fontSize:
                            '10px',
                          fontWeight:
                            800,
                          letterSpacing:
                            '1px',
                          color:
                            '#d2872c',
                          marginBottom:
                            '5px',
                        }}
                      >
                        PERBANDINGAN KEWANGAN
                      </span>

                      <h2
                        style={{
                          margin: 0,
                          fontSize:
                            '18px',
                          color:
                            '#34445c',
                        }}
                      >
                        2023–2024 vs 2025–2026
                      </h2>
                    </div>

                      <div
                        className="finance-entry-table-wrap"
                        style={{
                          overflowX:
                            'auto',
                        }}
                      >
                        <div
                          className="finance-entry-table"
                          style={{
                            width: '100%',
                          }}
                        >
                        <div
                          className="finance-entry-header"
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              '38% 18% 18% 26%',
                            minHeight:
                              '58px',
                            alignItems:
                              'center',
                            background:
                              '#f5f7fa',
                            borderBottom:
                              '1px solid #e7ebf0',
                          }}
                        >
                          <span
                            style={{
                              padding:
                                '0 20px',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                              color:
                                '#7d8a9d',
                            }}
                          >
                            KOMPONEN
                          </span>

                          <span
                            style={{
                              textAlign:
                                'right',
                              padding:
                                '0 20px',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                              color:
                                '#7d8a9d',
                            }}
                          >
                            2023–2024
                          </span>

                          <span
                            style={{
                              textAlign:
                                'right',
                              padding:
                                '0 20px',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                              color:
                                '#7d8a9d',
                            }}
                          >
                            2025–2026
                          </span>

                          <span
                            style={{
                              textAlign:
                                'right',
                              padding:
                                '0 20px',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                              color:
                                '#7d8a9d',
                            }}
                          >
                            CATATAN
                          </span>
                        </div>

                        {FINANCE_ITEMS.map(
                          (item) => (
                            <div
                              className="finance-entry-row"
                              key={
                                item.key
                              }
                              style={{
                                display:
                                  'grid',
                                gridTemplateColumns:
                                  '38% 18% 18% 26%',
                                minHeight:
                                  '78px',
                                alignItems:
                                  'center',
                                borderBottom:
                                  '1px solid #edf0f4',
                              }}
                            >
                              <div
                                className="finance-entry-label"
                                style={{
                                  padding:
                                    '12px 20px',
                                }}
                              >
                                <strong
                                  style={{
                                    display:
                                      'block',
                                    fontSize:
                                      '13px',
                                    color:
                                      '#40516a',
                                    lineHeight:
                                      1.35,
                                  }}
                                >
                                  {
                                    item.label
                                  }
                                </strong>
                              </div>

                              <div
                                className="finance-entry-field finance-entry-previous"
                                data-label="2023–2024"
                                style={{
                                  padding:
                                    '12px 20px',
                                }}
                              >
                                <div
                                  style={{
                                    position:
                                      'relative',
                                  }}
                                >
                                  <span
                                    style={{
                                      position:
                                        'absolute',
                                      left:
                                        '10px',
                                      top:
                                        '50%',
                                      transform:
                                        'translateY(-50%)',
                                      fontSize:
                                        '11px',
                                      color:
                                        '#8995a7',
                                      pointerEvents:
                                        'none',
                                    }}
                                  >
                                    RM
                                  </span>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      financeData[
                                        item.key
                                      ]?.[
                                        '2023_2024'
                                      ] ?? 0
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateFinanceValue(
                                        item.key,
                                        '2023_2024',
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    style={{
                                      width:
                                        '100%',
                                      boxSizing:
                                        'border-box',
                                      minHeight:
                                        '40px',
                                      border:
                                        '1px solid #d9e1ea',
                                      borderRadius:
                                        '8px',
                                      padding:
                                        '0 9px 0 31px',
                                      textAlign:
                                        'right',
                                      fontSize:
                                        '12px',
                                      color:
                                        '#34445c',
                                      outline:
                                        'none',
                                    }}
                                  />
                                </div>
                              </div>

                              <div
                                className="finance-entry-field finance-entry-current"
                                data-label="2025–2026"
                                style={{
                                  padding:
                                    '12px 20px',
                                }}
                              >
                                <div
                                  style={{
                                    position:
                                      'relative',
                                  }}
                                >
                                  <span
                                    style={{
                                      position:
                                        'absolute',
                                      left:
                                        '10px',
                                      top:
                                        '50%',
                                      transform:
                                        'translateY(-50%)',
                                      fontSize:
                                        '11px',
                                      color:
                                        '#8995a7',
                                      pointerEvents:
                                        'none',
                                    }}
                                  >
                                    RM
                                  </span>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      financeData[
                                        item.key
                                      ]?.[
                                        '2025_2026'
                                      ] ?? 0
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateFinanceValue(
                                        item.key,
                                        '2025_2026',
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    style={{
                                      width:
                                        '100%',
                                      boxSizing:
                                        'border-box',
                                      minHeight:
                                        '40px',
                                      border:
                                        '1px solid #d9e1ea',
                                      borderRadius:
                                        '8px',
                                      padding:
                                        '0 9px 0 31px',
                                      textAlign:
                                        'right',
                                      fontSize:
                                        '12px',
                                      color:
                                        '#34445c',
                                      outline:
                                        'none',
                                    }}
                                  />
                                </div>
                              </div>

                              <div
                                className="finance-entry-notes"
                                style={{
                                  padding:
                                    '12px 20px',
                                }}
                              >
                                <textarea
                                  rows="2"
                                  value={
                                    financeData[
                                      item.key
                                    ]?.catatan ||
                                    ''
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateFinanceValue(
                                      item.key,
                                      'catatan',
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  placeholder="Catatan..."
                                  style={{
                                    width:
                                      '100%',
                                    boxSizing:
                                      'border-box',
                                    resize:
                                      'vertical',
                                    border:
                                      '1px solid #d9e1ea',
                                    borderRadius:
                                      '8px',
                                    padding:
                                      '8px 10px',
                                    fontSize:
                                      '11px',
                                    color:
                                      '#34445c',
                                    outline:
                                      'none',
                                    fontFamily:
                                      'inherit',
                                  }}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </section>

                  {/* SUMMARY */}

                  <section
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        'repeat(3, minmax(0, 1fr))',
                      gap:
                        '14px',
                      marginBottom:
                        '22px',
                    }}
                  >
                    <div
                      style={{
                        background:
                          '#ffffff',
                        border:
                          '1px solid #e1e7ee',
                        borderRadius:
                          '12px',
                        padding:
                          '18px',
                      }}
                    >
                      <span
                        style={{
                          fontSize:
                            '10px',
                          fontWeight:
                            800,
                          color:
                            '#8995a7',
                        }}
                      >
                        2023–2024
                      </span>

                      <strong
                        style={{
                          display:
                            'block',
                          marginTop:
                            '6px',
                          fontSize:
                            '19px',
                          color:
                            '#40516a',
                        }}
                      >
                        RM{' '}
                        {formatCurrency(
                          totals.previous
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        background:
                          '#ffffff',
                        border:
                          '1px solid #e1e7ee',
                        borderRadius:
                          '12px',
                        padding:
                          '18px',
                      }}
                    >
                      <span
                        style={{
                          fontSize:
                            '10px',
                          fontWeight:
                            800,
                          color:
                            '#8995a7',
                        }}
                      >
                        2025–2026
                      </span>

                      <strong
                        style={{
                          display:
                            'block',
                          marginTop:
                            '6px',
                          fontSize:
                            '19px',
                          color:
                            '#d2872c',
                        }}
                      >
                        RM{' '}
                        {formatCurrency(
                          totals.current
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        background:
                          '#ffffff',
                        border:
                          '1px solid #e1e7ee',
                        borderRadius:
                          '12px',
                        padding:
                          '18px',
                      }}
                    >
                      <span
                        style={{
                          fontSize:
                            '10px',
                          fontWeight:
                            800,
                          color:
                            '#8995a7',
                        }}
                      >
                        PERUBAHAN
                      </span>

                      <strong
                        style={{
                          display:
                            'block',
                          marginTop:
                            '6px',
                          fontSize:
                            '19px',
                          color:
                            totals.change >=
                            0
                              ? '#40516a'
                              : '#b85b5b',
                        }}
                      >
                        {totals.change >=
                        0
                          ? '+'
                          : '-'}
                        RM{' '}
                        {formatCurrency(
                          Math.abs(
                            totals.change
                          )
                        )}
                      </strong>
                    </div>
                  </section>

                  {/* ACTIONS */}

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'flex-end',
                      gap:
                        '10px',
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={
                        resetFinance
                      }
                      disabled={saving}
                      style={{
                        border:
                          '1px solid #d9e0e8',
                        background:
                          '#ffffff',
                        color:
                          '#596a81',
                        borderRadius:
                          '9px',
                        padding:
                          '11px 18px',
                        fontWeight:
                          700,
                        cursor:
                          saving
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      Kosongkan
                    </button>

                    <button
                      type="button"
                      onClick={
                        saveFinance
                      }
                      disabled={
                        saving
                      }
                      style={{
                        border:
                          'none',
                        background:
                          '#d2872c',
                        color:
                          '#ffffff',
                        borderRadius:
                          '9px',
                        padding:
                          '11px 22px',
                        fontWeight:
                          800,
                        cursor:
                          saving
                            ? 'not-allowed'
                            : 'pointer',
                        opacity:
                          saving
                            ? 0.7
                            : 1,
                      }}
                    >
                      {saving
                        ? 'Menyimpan...'
                        : 'Simpan Data Kewangan'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminFinance
