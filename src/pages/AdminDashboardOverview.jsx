import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../lib/supabase'
import { getEquipmentAmount } from '../lib/equipment'

import '../styles/AdminDashboardOverview.css'
import '../styles/AdminDashboardOverviewResponsive.css'
import {
  FINANCE_ITEMS,
  normaliseFinanceData,
} from '../lib/finance'
import {
  TRAINING_MAX_SCORE,
  TRAINING_RATINGS,
  TRAINING_RATING_SCORE,
  getTrainingComponents,
} from '../lib/training'
import { countMedalsByEvent } from '../lib/medals'
import { ATHLETE_STATUS_OPTIONS } from '../lib/athleteStatus'


// =========================================================
// EMPTY CHART
// =========================================================

function EmptyChart({
  icon = '◌',
  title,
  description,
}) {
  return (
    <div className="ewcc-dashboard-empty">
      <div className="ewcc-dashboard-empty-icon">
        {icon}
      </div>

      <strong>{title}</strong>

      <span>{description}</span>
    </div>
  )
}


// =========================================================
// KPI CARD
// =========================================================

function KpiCard({
  icon,
  label,
  value = '—',
  description,
  className = '',
}) {
  return (
    <div
      className={`ewcc-dashboard-kpi ${className}`}
    >
      <div className="ewcc-dashboard-kpi-icon">
        {icon}
      </div>

      <div className="ewcc-dashboard-kpi-content">
        <span>{label}</span>

        <strong>{value}</strong>

        <small>{description}</small>
      </div>
    </div>
  )
}


// =========================================================
// DASHBOARD PANEL
// =========================================================

function DashboardPanel({
  eyebrow,
  title,
  description,
  children,
  className = '',
}) {
  return (
    <section
      className={`ewcc-dashboard-panel ${className}`}
    >
      <div className="ewcc-dashboard-panel-header">
        <div>

          {eyebrow && (
            <span className="ewcc-dashboard-panel-eyebrow">
              {eyebrow}
            </span>
          )}

          <h3>{title}</h3>

          {description && (
            <p>{description}</p>
          )}

        </div>
      </div>

      <div className="ewcc-dashboard-panel-body">
        {children}
      </div>
    </section>
  )
}


// =========================================================
// SECTION 3
// =========================================================

function getSection3Rows(report) {
  const section3 = report?.section_3

  if (!section3) {
    return []
  }

  if (Array.isArray(section3)) {
    return section3
  }

  if (Array.isArray(section3.acaraList)) {
    return section3.acaraList
  }

  return []
}



// =========================================================
// PERFORMANCE ANALYTICS
// =========================================================

function calculatePerformance(reports) {

  // Counted per event within each report (sport), then summed:
  // a team event's rows share one Acara name and count once.
  const totals = {
    jumlahSasaran: 0,
    jumlahPencapaian: 0,
    sasaran: { emas: 0, perak: 0, gangsa: 0, total: 0 },
    pencapaian: { emas: 0, perak: 0, gangsa: 0, total: 0 },
  }

  reports.forEach((report) => {
    const counts = countMedalsByEvent(
      getSection3Rows(report)
    )

    totals.jumlahSasaran += counts.targetedEvents
    totals.jumlahPencapaian += counts.achievedEvents

    for (const key of ['emas', 'perak', 'gangsa', 'total']) {
      totals.sasaran[key] += counts.sasaran[key]
      totals.pencapaian[key] += counts.pencapaian[key]
    }
  })

  const {
    jumlahSasaran,
    jumlahPencapaian,
    sasaran,
    pencapaian,
  } = totals


  const kadarPencapaian =
    jumlahSasaran > 0
      ? Math.round(
          (
            jumlahPencapaian /
            jumlahSasaran
          ) * 100
        )
      : 0


  return {
    jumlahSasaran,
    jumlahPencapaian,
    kadarPencapaian,
    sasaran,
    pencapaian,
  }
}


// =========================================================
// TRAINING ANALYTICS
// =========================================================

const ratingOrder = TRAINING_RATINGS

const ratingScore = TRAINING_RATING_SCORE


function getTrainingItems(reports) {

  return reports.flatMap(
    (report) => {

      return getTrainingComponents(
        report?.section_5
      )
    }
  )
}


function calculateTrainingAnalytics(
  reports
) {

  const items =
    getTrainingItems(reports)

  const ratedItems =
    items.filter(
      (item) =>
        ratingScore[item?.rating]
    )

  const distribution =
    ratingOrder.reduce(
      (result, rating) => {

        result[rating] =
          ratedItems.filter(
            (item) =>
              item.rating === rating
          ).length

        return result
      },
      {}
    )


  const totalRatings =
    ratedItems.length


  const totalScore =
    ratedItems.reduce(
      (total, item) =>
        total +
        (
          ratingScore[
            item.rating
          ] || 0
        ),
      0
    )


  const average =
    totalRatings > 0
      ? (
          totalScore /
          totalRatings
        ).toFixed(1)
      : '—'


  // One row per component, averaged across all reports.
  const componentMap = new Map()

  items.forEach((item) => {
    const title =
      item?.title || 'Komponen'

    if (!componentMap.has(title)) {
      componentMap.set(title, [])
    }

    const score =
      ratingScore[item?.rating]

    if (score) {
      componentMap.get(title).push(score)
    }
  })

  const components =
    [...componentMap].map(
      ([title, scores]) => {
        if (scores.length === 0) {
          return {
            title,
            count: 0,
            average: null,
            rating: null,
          }
        }

        const componentAverage =
          scores.reduce(
            (total, score) =>
              total + score,
            0
          ) / scores.length

        return {
          title,
          count: scores.length,
          average: componentAverage,
          rating:
            ratingOrder[
              TRAINING_MAX_SCORE -
                Math.round(componentAverage)
            ],
        }
      }
    )

  return {
    items,
    components,
    ratedItems,
    distribution,
    totalRatings,
    average,
  }
}


// =========================================================
// TRAINING PANEL
// =========================================================

function TrainingAnalytics({
  analytics,
}) {

  const {
    distribution,
    average,
    totalRatings,
    components,
  } = analytics


  if (totalRatings === 0) {
    return (
      <EmptyChart
        icon="◒"
        title="Belum ada penilaian"
        description="Data penilaian program latihan akan dipaparkan selepas laporan mempunyai penilaian."
      />
    )
  }


  const maxCount =
    Math.max(
      ...ratingOrder.map(
        (rating) =>
          distribution[rating] || 0
      ),
      1
    )


  return (
    <div
      className="medal-summary-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
      }}
    >

      {/* SUMMARY */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
          gap: '14px',
        }}
      >

        <div
          style={{
            border:
              '1px solid #e5eaf0',
            borderRadius: '14px',
            padding: '18px',
            background: '#fafbfd',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '.7px',
              color: '#8794a7',
              marginBottom: '8px',
            }}
          >
            PURATA PENILAIAN
          </span>

          <strong
            style={{
              display: 'block',
              fontSize: '30px',
              lineHeight: 1,
              color: '#26364d',
            }}
          >
            {average}

            <small
              style={{
                fontSize: '14px',
                color: '#8794a7',
                marginLeft: '4px',
              }}
            >
              / {TRAINING_MAX_SCORE}
            </small>
          </strong>
        </div>


        <div
          style={{
            border:
              '1px solid #e5eaf0',
            borderRadius: '14px',
            padding: '18px',
            background: '#fafbfd',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '.7px',
              color: '#8794a7',
              marginBottom: '8px',
            }}
          >
            JUMLAH PENILAIAN
          </span>

          <strong
            style={{
              display: 'block',
              fontSize: '30px',
              lineHeight: 1,
              color: '#26364d',
            }}
          >
            {totalRatings}
          </strong>
        </div>

      </div>


      {/* DISTRIBUTION */}

      <div>

        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#40516a',
            marginBottom: '14px',
          }}
        >
          TABURAN PENILAIAN
        </div>


        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '11px',
          }}
        >

          {ratingOrder.map(
            (rating) => {

              const count =
                distribution[rating] || 0

              const width =
                maxCount > 0
                  ? (
                      count /
                      maxCount
                    ) * 100
                  : 0


              return (
                <div
                  key={rating}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '105px 1fr 32px',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >

                  <span
                    style={{
                      fontSize: '12px',
                      color: '#65748a',
                      fontWeight: 600,
                    }}
                  >
                    {rating}
                  </span>


                  <div
                    style={{
                      height: '8px',
                      borderRadius: '999px',
                      background: '#edf1f5',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${width}%`,
                        borderRadius: '999px',
                        background:
                          rating ===
                          'Sangat Baik'
                            ? '#2f8f68'
                            : rating ===
                              'Baik'
                              ? '#5a9f7e'
                              : rating ===
                                'Sederhana'
                                ? '#d69a32'
                                : rating ===
                                  'Kurang Baik'
                                  ? '#d47a43'
                                  : '#c95c5c',
                      }}
                    />
                  </div>


                  <strong
                    style={{
                      fontSize: '12px',
                      color: '#40516a',
                      textAlign: 'right',
                    }}
                  >
                    {count}
                  </strong>

                </div>
              )
            }
          )}

        </div>

      </div>


      {/* COMPONENTS */}

      <div>

        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#40516a',
            marginBottom: '12px',
          }}
        >
          KOMPONEN LATIHAN
        </div>


        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',
            gap: '9px',
          }}
        >

          {components.length === 0 ? (

            <span
              style={{
                color: '#8794a7',
                fontSize: '12px',
              }}
            >
              Tiada komponen direkodkan.
            </span>

          ) : (

            components.map(
              (item, index) => (

                <div
                  key={
                    `${
                      item?.title ||
                      'item'
                    }-${index}`
                  }
                  style={{
                    border:
                      '1px solid #e5eaf0',
                    borderRadius: '10px',
                    padding:
                      '11px 13px',
                    background: '#fff',
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >

                  <span
                    style={{
                      fontSize: '12px',
                      color: '#52627a',
                      fontWeight: 600,
                    }}
                  >
                    {item?.title ||
                      'Komponen'}
                  </span>


                  <strong
                    style={{
                      fontSize: '11px',
                      color:
                        item?.rating ===
                        'Sangat Baik'
                          ? '#2f8f68'
                          : item?.rating ===
                            'Baik'
                            ? '#4f8e70'
                            : item?.rating ===
                              'Sederhana'
                              ? '#c58a2a'
                              : item?.rating
                              ? '#c85e50'
                              : '#9aa5b4',
                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    {item.rating
                      ? `${item.rating} · ${item.average.toFixed(1)}`
                      : 'Belum dinilai'}

                    {item.count > 0 && (
                      <small
                        style={{
                          display: 'block',
                          textAlign: 'right',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#9aa5b4',
                          marginTop: '2px',
                        }}
                      >
                        {item.count} penilaian
                      </small>
                    )}
                  </strong>

                </div>
              )
            )

          )}

        </div>

      </div>

    </div>
  )
}


// =========================================================
// MEDAL SUMMARY
// =========================================================

function MedalSummary({
  title,
  data,
  tone = 'orange',
}) {

  return (
    <div
      className="medal-summary-card"
      style={{
        border:
          '1px solid #e5eaf0',
        borderRadius: '14px',
        padding: '17px',
        background: '#fff',
      }}
    >

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >

        <strong
          style={{
            fontSize: '13px',
            color: '#40516a',
          }}
        >
          {title}
        </strong>


        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color:
              tone === 'orange'
                ? '#d2872c'
                : '#5d718c',
          }}
        >
          {data.total} PINGAT
        </span>

      </div>


      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, 1fr)',
          gap: '8px',
        }}
      >

        <div
          style={{
            textAlign: 'center',
            padding: '10px 6px',
            borderRadius: '10px',
            background: '#fff9e9',
          }}
        >
          <div style={{ fontSize: '17px' }}>
            🥇
          </div>

          <strong
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              fontSize: '20px',
              color: '#b07b13',
            }}
          >
            {data.emas}
          </strong>

          <small
            style={{
              color: '#8c7b59',
              fontSize: '10px',
            }}
          >
            EMAS
          </small>
        </div>


        <div
          style={{
            textAlign: 'center',
            padding: '10px 6px',
            borderRadius: '10px',
            background: '#f5f7fa',
          }}
        >
          <div style={{ fontSize: '17px' }}>
            🥈
          </div>

          <strong
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              fontSize: '20px',
              color: '#6d7784',
            }}
          >
            {data.perak}
          </strong>

          <small
            style={{
              color: '#7f8995',
              fontSize: '10px',
            }}
          >
            PERAK
          </small>
        </div>


        <div
          style={{
            textAlign: 'center',
            padding: '10px 6px',
            borderRadius: '10px',
            background: '#fff4ec',
          }}
        >
          <div style={{ fontSize: '17px' }}>
            🥉
          </div>

          <strong
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              fontSize: '20px',
              color: '#a86c45',
            }}
          >
            {data.gangsa}
          </strong>

          <small
            style={{
              color: '#96715b',
              fontSize: '10px',
            }}
          >
            GANGSA
          </small>
        </div>

      </div>

    </div>
  )
}

// =========================================================
// SECTION 10 - STATUS ATLET
// =========================================================


function getSection10Athletes(report) {
  const section10 = report?.section_10

  if (!Array.isArray(section10)) {
    return []
  }

  return section10
}

function calculateAthleteAnalytics(reports) {
  const athletes = reports.flatMap((report) =>
    getSection10Athletes(report)
  )

  const validAthletes = athletes.filter(
    (athlete) =>
      athlete &&
      (
        athlete.namaAtlet ||
        athlete.status ||
        athlete.cadangan ||
        athlete.catatan
      )
  )

  const distribution = ATHLETE_STATUS_OPTIONS.reduce(
    (result, option) => {
      result[option.value] = validAthletes.filter(
        (athlete) =>
          String(athlete.status || '')
            .trim()
            .toUpperCase() === option.value
      ).length

      return result
    },
    {}
  )

  const total = validAthletes.length

  const statusList = ATHLETE_STATUS_OPTIONS.map(
    (option) => {
      const count = distribution[option.value] || 0

      return {
        ...option,
        count,
        percentage:
          total > 0
            ? Math.round((count / total) * 100)
            : 0,
      }
    }
  )

  return {
    athletes: validAthletes,
    total,
    distribution,
    statusList,
  }
}







// =========================================================
// SECTION 13 - PENGESAHAN
// =========================================================

function getSection13Data(report) {
  const section13 = report?.section_13

  if (
    !section13 ||
    typeof section13 !== 'object' ||
    Array.isArray(section13)
  ) {
    return {}
  }

  return section13
}

function calculateConfirmationAnalytics(
  reports
) {
  const records = reports.map(
    (report) =>
      getSection13Data(report)
  )

  const confirmed = records.filter(
    (section13) => {
      const checked =
        section13?.pengesahan === true ||
        section13?.disahkan === true ||
        section13?.confirmed === true

      const hasName =
        String(
          section13?.namaPengurusJurulatih ??
            ''
        ).trim() !== ''

      const hasDate =
        String(
          section13?.tarikh ?? ''
        ).trim() !== ''

      return (
        checked ||
        (hasName && hasDate)
      )
    }
  ).length

  const pending =
    reports.length - confirmed

  return {
    total: reports.length,
    confirmed,
    pending,
    percentage:
      reports.length > 0
        ? Math.round(
            (confirmed /
              reports.length) *
              100
          )
        : 0,
  }
}

// =========================================================
// FINANCE ANALYTICS
// =========================================================

function getFinanceValue(
  financeData,
  key,
  period
) {
  // Normalise so Jumlah Kelulusan is always the computed sum,
  // including for reports saved before it was automatic.
  const value =
    normaliseFinanceData(financeData)?.[key]?.[period]

  const number =
    Number(value)

  return Number.isFinite(number)
    ? number
    : 0
}

function calculatePercentageChange(
  previous,
  current
) {
  if (!previous && !current) {
    return 0
  }

  if (!previous) {
    return null
  }

  return (
    ((current - previous) /
      previous) *
    100
  )
}

function calculateFinanceAnalytics(
  reports
) {
  const rows =
    FINANCE_ITEMS.map((item) => {
      const previous =
        reports.reduce(
          (total, report) =>
            total +
            getFinanceValue(
              report.finance_data,
              item.key,
              '2023_2024'
            ),
          0
        )

      const current =
        reports.reduce(
          (total, report) =>
            total +
            getFinanceValue(
              report.finance_data,
              item.key,
              '2025_2026'
            ),
          0
        )

      const change =
        current - previous

      const percentage =
        calculatePercentageChange(
          previous,
          current
        )

      const notes =
        reports
          .map(
            (report) =>
              report
                ?.finance_data?.[
                item.key
              ]?.catatan
          )
          .filter(
            (value) =>
              String(
                value ?? ''
              ).trim() !== ''
          )

      return {
        ...item,
        previous,
        current,
        change,
        percentage,
        notes,
      }
    })

  const hasData =
    reports.some(
      (report) => {
        const finance =
          report?.finance_data

        if (
          !finance ||
          typeof finance !==
            'object'
        ) {
          return false
        }

        return Object.values(
          finance
        ).some((item) => {
          if (
            !item ||
            typeof item !==
              'object'
          ) {
            return false
          }

          return (
            Number(item['2023_2024']) >
              0 ||
            Number(item['2025_2026']) >
              0
          )
        })
      }
    )

  return {
    rows,
    hasData,
  }
}



// =========================================================
// ADMIN DASHBOARD OVERVIEW
// =========================================================

function AdminDashboardOverview({
  sports = [],
  postMortemReports = [],
  onOpenEquipment,
  onOpenReports,
  onOpenReport,
}) {

  const [
    selectedSport,
    setSelectedSport,
  ] = useState('ALL')


  const [
    analyticsReports,
    setAnalyticsReports,
  ] = useState([])


  const [
    loadingAnalytics,
    setLoadingAnalytics,
  ] = useState(true)

  const [equipmentData, setEquipmentData] = useState([])
  const [loadingEquipment, setLoadingEquipment] = useState(true)


  // =======================================================
  // LOAD ANALYTICS
  // =======================================================

  useEffect(() => {

    let active = true


    const loadAnalytics =
      async () => {

        setLoadingAnalytics(
          true
        )


        try {

          const {
            data,
            error,
          } = await supabase
            .from(
              'postmortem_reports'
            )
            .select(
              `
                id,
                sport,
                status,
                section_3,
                section_11,
                section_5,
                section_7,
                section_10,
                section_12,
                section_13,
                finance_data
              `
            )


          if (error) {

            console.error(
              'LOAD DASHBOARD ANALYTICS ERROR:',
              error
            )

            if (active) {
              setAnalyticsReports(
                []
              )
            }

            return
          }


          if (active) {

            setAnalyticsReports(
              data || []
            )

          }

        } catch (error) {

          console.error(
            'UNEXPECTED DASHBOARD ANALYTICS ERROR:',
            error
          )


          if (active) {

            setAnalyticsReports(
              []
            )

          }

        } finally {

          if (active) {

            setLoadingAnalytics(
              false
            )

          }

        }

      }


    loadAnalytics()


    return () => {
      active = false
    }

  }, [])

  useEffect(() => {
  let active = true

  const loadEquipment = async () => {
    setLoadingEquipment(true)

    try {
      const { data, error } = await supabase
        .from('equipment_2028')
        .select(`
          id,
          sport,
          peralatan,
          kuantiti,
          anggaran_harga_seunit,
          keutamaan
        `)
        .order('sport', {
          ascending: true,
        })
        .order('created_at', {
          ascending: true,
        })

      if (error) {
        console.error(
          'LOAD EQUIPMENT DASHBOARD ERROR:',
          error
        )

        if (active) {
          setEquipmentData([])
        }

        return
      }

      if (active) {
        setEquipmentData(data || [])
      }
    } catch (error) {
      console.error(
        'UNEXPECTED EQUIPMENT DASHBOARD ERROR:',
        error
      )

      if (active) {
        setEquipmentData([])
      }
    } finally {
      if (active) {
        setLoadingEquipment(false)
      }
    }
  }

  loadEquipment()

  return () => {
    active = false
  }
}, [])


  // =======================================================
  // FILTER
  // =======================================================

  const filteredReports =
    useMemo(() => {

      if (
        selectedSport === 'ALL'
      ) {
        return analyticsReports
      }


      return analyticsReports.filter(
        (report) =>
          report.sport ===
          selectedSport
      )

    }, [
      analyticsReports,
      selectedSport,
    ])


  // =======================================================
  // REPORT SUMMARY
  // =======================================================

  const reportSummary =
    useMemo(() => {

      const source =
        selectedSport === 'ALL'
          ? postMortemReports
          : postMortemReports.filter(
              (report) =>
                report.sport ===
                selectedSport
            )


      return {

        total:
          source.length,

        reviewed:
          source.filter(
            (report) =>
              report.status ===
              'reviewed'
          ).length,

        submitted:
          source.filter(
            (report) =>
              report.status ===
              'submitted'
          ).length,

        draft:
          source.filter(
            (report) =>
              report.status ===
              'draft'
          ).length,

      }

    }, [
      postMortemReports,
      selectedSport,
    ])


  // =======================================================
  // PERFORMANCE
  // =======================================================

  const performance =
    useMemo(
      () =>
        calculatePerformance(
          filteredReports
        ),
      [filteredReports]
    )


  // =======================================================
  // TRAINING
  // =======================================================

  const training =
    useMemo(
      () =>
        calculateTrainingAnalytics(
          filteredReports
        ),
      [filteredReports]
    )


  // =======================================================
  // ATHLETE STATUS
  // =======================================================

  const athleteAnalytics =
    useMemo(
      () =>
        calculateAthleteAnalytics(
          filteredReports
        ),
      [filteredReports]
    )

  // =======================================================
  // PENGESAHAN
  // =======================================================

  const confirmationAnalytics =
    useMemo(
      () =>
        calculateConfirmationAnalytics(
          filteredReports
        ),
      [filteredReports]
    )

  // =======================================================
  // FINANCE
  // =======================================================

  const financeAnalytics =
    useMemo(
      () =>
        calculateFinanceAnalytics(
          filteredReports
        ),
      [filteredReports]
    )

  // =======================================================
  // OFFICIAL SUKMA FIGURES
  // =======================================================

  const sukma2024 = {
    emas: 23,
    perak: 21,
    gangsa: 32,
    total: 76,
  }

  const sukma2026 = {
    emas: 28,
    perak: 19,
    gangsa: 36,
    total: 83,
  }


  // =======================================================
  // DASHBOARD MEDALS — ANGKA TETAP (BUKAN DIKIRA DARI LAPORAN)
  // =======================================================

  const sukmaMedals = {
    emas: 28,
    perak: 19,
    gangsa: 36,
    total: 83,
  }

  const paraMedals = {
    emas: 7,
    perak: 11,
    gangsa: 13,
    total: 31,
  }
  
  // =======================================================
// EQUIPMENT 2028
// =======================================================

const equipmentSummary = useMemo(() => {
  const rows =
    selectedSport === 'ALL'
      ? equipmentData
      : equipmentData.filter(
          (item) =>
            item.sport === selectedSport
        )

  const sportsWithEquipment = new Set(
    rows
      .map((item) => item.sport)
      .filter(Boolean)
  ).size

  const totalItems = rows.length

  const totalAmount = rows.reduce(
    (total, item) =>
      total + getEquipmentAmount(item),
    0
  )

  const priorityHigh = rows.filter(
    (item) =>
      item.keutamaan === 'Tinggi'
  ).length

  const priorityMedium = rows.filter(
    (item) =>
      item.keutamaan === 'Sederhana'
  ).length

  const priorityLow = rows.filter(
    (item) =>
      item.keutamaan === 'Rendah'
  ).length

  const sportMap = {}

  rows.forEach((item) => {
    const sport =
      item.sport || 'Tidak dinyatakan'

    if (!sportMap[sport]) {
      sportMap[sport] = {
        sport,
        itemCount: 0,
        totalAmount: 0,
      }
    }

    sportMap[sport].itemCount +=
      1

    sportMap[sport].totalAmount +=
      getEquipmentAmount(item)
  })

  const sportSummary =
    Object.values(sportMap)
      .sort(
        (a, b) =>
          b.totalAmount -
          a.totalAmount
      )

  return {
    sportsWithEquipment,
    totalItems,
    totalAmount,
    priorityHigh,
    priorityMedium,
    priorityLow,
    sportSummary,
  }
}, [
  equipmentData,
  selectedSport,
])


  return (
    <div className="ewcc-dashboard-overview">


      {/* =================================================
          HERO
          ================================================= */}

      <section className="ewcc-dashboard-hero">

        <div className="ewcc-dashboard-hero-content">

          <span className="ewcc-dashboard-eyebrow">
            EWCC POST-MORTEM • ADMINISTRATOR
          </span>


          <h2>
            Dashboard Post-Mortem
          </h2>


          <p>
            Pusat pemantauan prestasi,
            status laporan dan analisis
            Kontinjen Pahang.
          </p>


          <div className="ewcc-dashboard-hero-meta">

            <span>
              SUKMA XXII SELANGOR 2026 & PARA SUKMA SELANGOR 2026
            </span>

            <span>
              MAJLIS SUKAN PAHANG
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          FILTER
          ================================================= */}

      <section className="ewcc-dashboard-filter">

        <div>

          <span>
            TAPIS DATA
          </span>

          <strong>
            Paparan mengikut sukan
          </strong>

        </div>


        <select
          value={selectedSport}
          onChange={(event) =>
            setSelectedSport(
              event.target.value
            )
          }
        >

          <option value="ALL">
            Semua Sukan
          </option>


          {sports.map(
            (sport) => (

              <option
                key={sport.sport_code}
                value={sport.sport_code}
              >
                {sport.sport_name}
              </option>

            )
          )}

        </select>

      </section>


      {/* =================================================
          KPI
          ================================================= */}

      <section className="ewcc-dashboard-kpi-grid">

        <KpiCard
          icon="▣"
          label="Jumlah Laporan"
          value={
            reportSummary.total
          }
          description="Laporan post-mortem"
          className="blue"
        />


        <KpiCard
          icon="✓"
          label="Laporan Selesai"
          value={
            reportSummary.reviewed
          }
          description="Telah disemak"
          className="green"
        />


        <KpiCard
          icon="◷"
          label="Dalam Semakan"
          value={
            reportSummary.submitted
          }
          description="Menunggu semakan"
          className="orange"
        />


        <KpiCard
          icon="✎"
          label="Draft"
          value={
            reportSummary.draft
          }
          description="Belum dihantar"
          className="red"
        />


      </section>


      {/* =================================================
          PINGAT — SUKMA
          ================================================= */}

      <section className="ewcc-dashboard-medal-group">

        <div className="ewcc-dashboard-medal-group-heading">
          <span>🏆 SUKMA XXII SELANGOR 2026</span>
        </div>

        <div className="ewcc-dashboard-kpi-grid">

          <KpiCard
            icon="🥇"
            label="Jumlah Emas"
            value={sukmaMedals.emas}
            description="Angka rasmi ditetapkan"
            className="gold medal-kpi"
          />

          <KpiCard
            icon="🥈"
            label="Jumlah Perak"
            value={sukmaMedals.perak}
            description="Angka rasmi ditetapkan"
            className="silver medal-kpi"
          />

          <KpiCard
            icon="🥉"
            label="Jumlah Gangsa"
            value={sukmaMedals.gangsa}
            description="Angka rasmi ditetapkan"
            className="bronze medal-kpi"
          />

          <KpiCard
            icon="🏅"
            label="Jumlah Pingat"
            value={sukmaMedals.total}
            description="Angka rasmi ditetapkan"
            className="purple medal-kpi"
          />

        </div>

      </section>


      {/* =================================================
          PINGAT — PARA SUKMA
          ================================================= */}

      <section className="ewcc-dashboard-medal-group">

        <div className="ewcc-dashboard-medal-group-heading">
          <span>♿ PARA SUKMA SELANGOR 2026</span>
        </div>

        <div className="ewcc-dashboard-kpi-grid">

          <KpiCard
            icon="🥇"
            label="Emas Para Sukma"
            value={paraMedals.emas}
            description="Angka rasmi ditetapkan"
            className="gold medal-kpi para-medal"
          />

          <KpiCard
            icon="🥈"
            label="Perak Para Sukma"
            value={paraMedals.perak}
            description="Angka rasmi ditetapkan"
            className="silver medal-kpi para-medal"
          />

          <KpiCard
            icon="🥉"
            label="Gangsa Para Sukma"
            value={paraMedals.gangsa}
            description="Angka rasmi ditetapkan"
            className="bronze medal-kpi para-medal"
          />

          <KpiCard
            icon="🏅"
            label="Jumlah Pingat Para Sukma"
            value={paraMedals.total}
            description="Angka rasmi ditetapkan"
            className="purple medal-kpi para-medal"
          />

        </div>

      </section>


      {/* =================================================
          ANALYTICS
          ================================================= */}

      <div className="ewcc-dashboard-chart-grid">


        {/* =================================================
            SASARAN VS PENCAPAIAN
            ================================================= */}

        <DashboardPanel
          eyebrow="PRESTASI"
          title="Sasaran vs Pencapaian"
          description="Perbandingan sasaran dan pencapaian daripada Bahagian C."
          className="large"
        >

          {loadingAnalytics ? (

            <EmptyChart
              icon="◌"
              title="Memuatkan analitik"
              description="Data prestasi sedang diproses."
            />

          ) : (

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3, minmax(0, 1fr))',
                  gap: '12px',
                }}
              >

                <div
                  style={{
                    border:
                      '1px solid #e5eaf0',
                    borderRadius: '13px',
                    padding: '16px',
                    background: '#fafbfd',
                  }}
                >

                  <span
                    style={{
                      display: 'block',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#8995a7',
                      letterSpacing: '.7px',
                      marginBottom: '7px',
                    }}
                  >
                    JUMLAH SASARAN
                  </span>


                  <strong
                    style={{
                      fontSize: '27px',
                      color: '#33445c',
                    }}
                  >
                    {performance.jumlahSasaran}
                  </strong>

                </div>


                <div
                  style={{
                    border:
                      '1px solid #e5eaf0',
                    borderRadius: '13px',
                    padding: '16px',
                    background: '#fafbfd',
                  }}
                >

                  <span
                    style={{
                      display: 'block',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#8995a7',
                      letterSpacing: '.7px',
                      marginBottom: '7px',
                    }}
                  >
                    PENCAPAIAN
                  </span>


                  <strong
                    style={{
                      fontSize: '27px',
                      color: '#33445c',
                    }}
                  >
                    {performance.jumlahPencapaian}
                  </strong>

                </div>


                <div
                  style={{
                    border:
                      '1px solid #e5eaf0',
                    borderRadius: '13px',
                    padding: '16px',
                    background: '#fafbfd',
                  }}
                >

                  <span
                    style={{
                      display: 'block',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#8995a7',
                      letterSpacing: '.7px',
                      marginBottom: '7px',
                    }}
                  >
                    KADAR PENCAPAIAN
                  </span>


                  <strong
                    style={{
                      fontSize: '27px',
                      color: '#d2872c',
                    }}
                  >
                    {performance.kadarPencapaian}%
                  </strong>

                </div>

              </div>


              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap: '12px',
                }}
              >

                <MedalSummary
                  title="Sasaran Pingat"
                  data={
                    performance.sasaran
                  }
                  tone="silver"
                />


                <MedalSummary
                  title="Pencapaian Pingat"
                  data={
                    performance.pencapaian
                  }
                  tone="orange"
                />

              </div>

            </div>
          )}

        </DashboardPanel>


        {/* =================================================
            SUKMA
            ================================================= */}

        <DashboardPanel
          eyebrow="PERBANDINGAN"
          title="SUKMA 2024 vs 2026"
          description="Angka rujukan yang ditetapkan dalam sistem; KPI pingat di atas dikira daripada Bahagian C laporan."
        >

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >

            <MedalSummary
              title="SUKMA XXI 2024"
              data={sukma2024}
              tone="silver"
            />


            <MedalSummary
              title="SUKMA XXII 2026"
              data={sukma2026}
              tone="orange"
            />


            <div
              style={{
                borderTop:
                  '1px solid #edf0f4',
                paddingTop: '14px',
                fontSize: '11px',
                color: '#8995a7',
                lineHeight: 1.6,
              }}
            >
              Angka perbandingan 2024 dan 2026 ialah nilai rujukan sedia ada.
              Jumlah KPI semasa datang daripada pingat yang direkodkan dalam
              Bahagian C setiap laporan.
            </div>

          </div>

        </DashboardPanel>


        {/* =================================================
            LATIHAN
            ================================================= */}

        <DashboardPanel
          eyebrow="LATIHAN"
          title="Penilaian Program Latihan"
          description="Analisis penilaian komponen latihan daripada Bahagian E."
        >

          <TrainingAnalytics
            analytics={training}
          />

        </DashboardPanel>


        {/* =================================================
            ATLET
            ================================================= */}

            <DashboardPanel
              eyebrow="ATLET"
              title="Status Atlet Selepas SUKMA"
              description="Ringkasan status atlet daripada Bahagian J."
              className="large"
            >
              {loadingAnalytics ? (
                <EmptyChart
                  icon="◌"
                  title="Memuatkan analitik"
                  description="Data status atlet sedang diproses."
                />
              ) : athleteAnalytics.total === 0 ? (
                <EmptyChart
                  icon="♙"
                  title="Belum ada data atlet"
                  description="Status atlet akan dipaparkan selepas Bahagian J mempunyai rekod."
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  {/* RINGKASAN */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(3, minmax(0, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        border: '1px solid #e5eaf0',
                        borderRadius: '13px',
                        padding: '16px',
                        background: '#fafbfd',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#8995a7',
                          letterSpacing: '.7px',
                          marginBottom: '7px',
                        }}
                      >
                        JUMLAH ATLET
                      </span>

                      <strong
                        style={{
                          fontSize: '27px',
                          color: '#33445c',
                        }}
                      >
                        {athleteAnalytics.total}
                      </strong>
                    </div>

                    <div
                      style={{
                        border: '1px solid #dceee5',
                        borderRadius: '13px',
                        padding: '16px',
                        background: '#f7fcf9',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#69927d',
                          letterSpacing: '.7px',
                          marginBottom: '7px',
                        }}
                      >
                        POTENSI KEBANGSAAN
                      </span>

                      <strong
                        style={{
                          fontSize: '27px',
                          color: '#2f8f68',
                        }}
                      >
                        {athleteAnalytics.distribution.A || 0}
                      </strong>
                    </div>

                    <div
                      style={{
                        border: '1px solid #e5eaf0',
                        borderRadius: '13px',
                        padding: '16px',
                        background: '#fafbfd',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#8995a7',
                          letterSpacing: '.7px',
                          marginBottom: '7px',
                        }}
                      >
                        POTENSI SUKMA
                      </span>

                      <strong
                        style={{
                          fontSize: '27px',
                          color: '#33445c',
                        }}
                      >
                        {athleteAnalytics.distribution.B || 0}
                      </strong>
                    </div>
                  </div>

                  {/* TABURAN STATUS */}
                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#40516a',
                        marginBottom: '14px',
                      }}
                    >
                      TABURAN STATUS ATLET
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {athleteAnalytics.statusList.map(
                        (item) => {
                          const width =
                            item.percentage

                          return (
                            <div
                              key={item.value}
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  '175px 1fr 80px',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '12px',
                                  color: '#596a81',
                                  fontWeight: 600,
                                }}
                              >
                                {item.label}
                              </span>

                              <div
                                style={{
                                  height: '9px',
                                  borderRadius: '999px',
                                  background: '#edf1f5',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${width}%`,
                                    borderRadius: '999px',
                                    background:
                                      item.value === 'A'
                                        ? '#2f8f68'
                                        : item.value === 'B'
                                        ? '#5d718c'
                                        : item.value === 'C'
                                        ? '#d2872c'
                                        : item.value === 'D'
                                        ? '#d47a43'
                                        : '#c95c5c',
                                  }}
                                />
                              </div>

                              <strong
                                style={{
                                  fontSize: '11px',
                                  color: '#40516a',
                                  textAlign: 'right',
                                }}
                              >
                                {item.count} ({item.percentage}%)
                              </strong>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>

                  {/* RINGKASAN KATEGORI */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(2, minmax(0, 1fr))',
                      gap: '9px',
                    }}
                  >
                    {athleteAnalytics.statusList.map(
                      (item) => (
                        <div
                          key={item.value}
                          style={{
                            border:
                              '1px solid #e5eaf0',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            background: '#ffffff',
                            display: 'flex',
                            justifyContent:
                              'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span
                              style={{
                                display: 'block',
                                fontSize: '10px',
                                color: '#8995a7',
                                fontWeight: 800,
                                letterSpacing: '.5px',
                                marginBottom: '3px',
                              }}
                            >
                              STATUS {item.value}
                            </span>

                            <strong
                              style={{
                                fontSize: '12px',
                                color: '#52627a',
                              }}
                            >
                              {item.label.replace(
                                `${item.value} - `,
                                ''
                              )}
                            </strong>
                          </div>

                          <strong
                            style={{
                              fontSize: '18px',
                              color: '#33445c',
                            }}
                          >
                            {item.count}
                          </strong>
                        </div>
                      )
                    )}
                  </div>

                  <div
                    style={{
                      borderTop:
                        '1px solid #edf0f4',
                      paddingTop: '13px',
                      fontSize: '11px',
                      color: '#8995a7',
                      lineHeight: 1.55,
                    }}
                  >
                    Analisis ini dikira berdasarkan
                    rekod atlet yang diisi dalam
                    Bahagian J setiap laporan
                    post-mortem.
                  </div>
                </div>
              )}
            </DashboardPanel>
        
        {/* =================================================
        {/* =================================================
            KEWANGAN
            ================================================= */}

<DashboardPanel
  eyebrow="KEWANGAN"
  title="Statistik Kewangan"
  description="Perbandingan peruntukan dan kelulusan perbelanjaan bagi tempoh 2023–2024 dan 2025–2026."
  className="large"
>
  {!financeAnalytics.hasData ? (
    <EmptyChart
      icon="RM"
      title="Data kewangan belum tersedia"
      description="Data kewangan akan dipaparkan selepas nilai peruntukan dan kelulusan dimasukkan ke dalam laporan."
    />
  ) : (
    <div
      className="ewcc-finance-preview"
    >
      <div className="ewcc-finance-row header">
        <span>
          Komponen
        </span>

        <span>
          2023–2024
        </span>

        <span>
          2025–2026
        </span>

        <span>
          Perubahan
        </span>
      </div>

      {financeAnalytics.rows.map(
        (item) => (
          <div
            className="ewcc-finance-row"
            key={item.key}
          >
            <span>
              {item.label}
            </span>

            <span>
              RM{' '}
              {item.previous.toLocaleString(
                'ms-MY',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>

            <span>
              RM{' '}
              {item.current.toLocaleString(
                'ms-MY',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>

            <span
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                alignItems:
                  'flex-end',
                justifyContent:
                  'center',
                gap: '3px',
              }}
            >
              <strong
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {item.change >= 0
                  ? '+'
                  : '-'}
                RM{' '}
                {Math.abs(
                  item.change
                ).toLocaleString(
                  'ms-MY',
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>

              <small
                style={{
                  fontSize: '10px',
                  color: '#8995a7',
                }}
              >
                {item.percentage ===
                null
                  ? 'N/A'
                  : `${
                      item.percentage >=
                      0
                        ? '+'
                        : ''
                    }${item.percentage.toFixed(
                      1
                    )}%`}
              </small>
            </span>
          </div>
        )
      )}

      <div
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop:
            '1px solid #edf0f4',
          fontSize: '10px',
          color: '#8995a7',
          lineHeight: 1.5,
        }}
      >
        Perubahan dikira secara
        automatik berdasarkan
        perbezaan nilai 2025–2026
        berbanding 2023–2024.
      </div>
    </div>
  )}
</DashboardPanel>

      </div>

      

      {/* =================================================
          SUKMA 2028
          ================================================= */}

      <section className="ewcc-dashboard-section-heading">

        <div>

          <span>
            PERANCANGAN SUKMA 2028
          </span>

          <h2>
            Perancangan & Tindakan Susulan
          </h2>

        </div>

      </section>


      <div className="ewcc-dashboard-module-grid">


        <button
          type="button"
          className="ewcc-dashboard-module-card equipment"
          onClick={onOpenEquipment}
        >

          <div className="ewcc-dashboard-module-icon">
            ⚙
          </div>


          <div>

            <span>
              MODUL 2028
            </span>

            <h3>
              Cadangan Peralatan 2028
            </h3>

            <p>
              Rekod dan pantau cadangan
              keperluan peralatan untuk
              persediaan SUKMA 2028.
            </p>

          </div>


          <strong>
            →
          </strong>

        </button>


        <button
          type="button"
          className="ewcc-dashboard-module-card statistics"
          onClick={onOpenReports}
        >

          <div className="ewcc-dashboard-module-icon">
            ◫
          </div>


          <div>

            <span>
              LAPORAN
            </span>

            <h3>
              Laporan Post-Mortem
            </h3>

            <p>
              Buka dan semak laporan
              post-mortem bagi setiap sukan.
            </p>

          </div>


          <strong>
            →
          </strong>

        </button>

      </div>

      {/* =================================================
    PENGESAHAN
    ================================================= */}

<DashboardPanel
  eyebrow="PENGESAHAN"
  title="Status Pengesahan Laporan"
  description="Status pengesahan laporan post-mortem oleh pengurus atau jurulatih."
>
  {loadingAnalytics ? (
    <EmptyChart
      icon="◌"
      title="Memuatkan status"
      description="Status pengesahan sedang diproses."
    />
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            border:
              '1px solid #e5eaf0',
            borderRadius: '13px',
            padding: '16px',
            background: '#fafbfd',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#8995a7',
              letterSpacing: '.7px',
              marginBottom: '7px',
            }}
          >
            JUMLAH LAPORAN
          </span>

          <strong
            style={{
              fontSize: '27px',
              color: '#33445c',
            }}
          >
            {confirmationAnalytics.total}
          </strong>
        </div>

        <div
          style={{
            border:
              '1px solid #dceee5',
            borderRadius: '13px',
            padding: '16px',
            background: '#f7fcf9',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#69927d',
              letterSpacing: '.7px',
              marginBottom: '7px',
            }}
          >
            DISAHKAN
          </span>

          <strong
            style={{
              fontSize: '27px',
              color: '#2f8f68',
            }}
          >
            {
              confirmationAnalytics
                .confirmed
            }
          </strong>
        </div>

        <div
          style={{
            border:
              '1px solid #f0e3ce',
            borderRadius: '13px',
            padding: '16px',
            background: '#fffaf2',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#a47c42',
              letterSpacing: '.7px',
              marginBottom: '7px',
            }}
          >
            BELUM DISAHKAN
          </span>

          <strong
            style={{
              fontSize: '27px',
              color: '#d2872c',
            }}
          >
            {
              confirmationAnalytics
                .pending
            }
          </strong>
        </div>
      </div>

      <div
        style={{
          borderTop:
            '1px solid #edf0f4',
          paddingTop: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#66758a',
              letterSpacing: '.5px',
            }}
          >
            KADAR PENGESAHAN
          </span>

          <strong
            style={{
              fontSize: '14px',
              color: '#33445c',
            }}
          >
            {
              confirmationAnalytics
                .percentage
            }%
          </strong>
        </div>

        <div
          style={{
            height: '9px',
            borderRadius: '999px',
            background: '#edf1f5',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${confirmationAnalytics.percentage}%`,
              borderRadius: '999px',
              background: '#2f8f68',
            }}
          />
        </div>
      </div>
    </div>
  )}
</DashboardPanel>

<DashboardPanel
  eyebrow="SUKMA 2028"
  title="Cadangan Peralatan 2028"
  description="Ringkasan cadangan peralatan yang dikemukakan oleh setiap sukan."
  className="large equipment-dashboard-panel"
>
  {loadingEquipment ? (
    <EmptyChart
      icon="◌"
      title="Memuatkan data peralatan"
      description="Data cadangan peralatan sedang diproses."
    />
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >

      {/* KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, minmax(0, 1fr))',
          gap: '12px',
        }}
      >

        <div
          style={{
            border: '1px solid #e5eaf0',
            borderRadius: '13px',
            padding: '16px',
            background: '#fafbfd',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#8995a7',
              letterSpacing: '.7px',
              marginBottom: '7px',
            }}
          >
            SUKAN MENGISI
          </span>

          <strong
            style={{
              fontSize: '27px',
              color: '#33445c',
            }}
          >
            {equipmentSummary.sportsWithEquipment}
          </strong>

          <small
            style={{
              display: 'block',
              marginTop: '5px',
              color: '#8995a7',
            }}
          >
            Daripada {sports.length} sukan
          </small>
        </div>

        <div
          style={{
            border: '1px solid #e5eaf0',
            borderRadius: '13px',
            padding: '16px',
            background: '#fafbfd',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#8995a7',
              letterSpacing: '.7px',
              marginBottom: '7px',
            }}
          >
            JUMLAH ITEM
          </span>

          <strong
            style={{
              fontSize: '27px',
              color: '#33445c',
            }}
          >
            {equipmentSummary.totalItems}
          </strong>

          <small
            style={{
              display: 'block',
              marginTop: '5px',
              color: '#8995a7',
            }}
          >
            Cadangan peralatan
          </small>
        </div>

        <div
          style={{
            border: '1px solid #e5eaf0',
            borderRadius: '13px',
            padding: '16px',
            background: '#fafbfd',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#8995a7',
              letterSpacing: '.7px',
              marginBottom: '7px',
            }}
          >
            ANGGARAN KESELURUHAN
          </span>

          <strong
            style={{
              fontSize: '22px',
              color: '#d2872c',
            }}
          >
            RM{' '}
            {equipmentSummary.totalAmount.toLocaleString(
              'ms-MY',
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </strong>

          <small
            style={{
              display: 'block',
              marginTop: '5px',
              color: '#8995a7',
            }}
          >
            Jumlah anggaran
          </small>
        </div>

        <div
          style={{
            border: '1px solid #f0dedb',
            borderRadius: '13px',
            padding: '16px',
            background: '#fffafa',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 800,
              color: '#a47872',
              letterSpacing: '.7px',
              marginBottom: '7px',
            }}
          >
            KEUTAMAAN TINGGI
          </span>

          <strong
            style={{
              fontSize: '27px',
              color: '#c95c5c',
            }}
          >
            {equipmentSummary.priorityHigh}
          </strong>

          <small
            style={{
              display: 'block',
              marginTop: '5px',
              color: '#8995a7',
            }}
          >
            Cadangan segera
          </small>
        </div>

      </div>

      {/* SPORT SUMMARY */}

      <div>

        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#40516a',
            marginBottom: '13px',
          }}
        >
          RINGKASAN MENGIKUT SUKAN
        </div>

        {equipmentSummary.sportSummary.length === 0 ? (
          <EmptyChart
            icon="▣"
            title="Belum ada cadangan peralatan"
            description="Data akan muncul selepas sukan mengemukakan cadangan peralatan 2028."
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
            }}
          >

            {equipmentSummary.sportSummary.map(
              (item) => {

                const sportName =
                  sports.find(
                    (sport) =>
                      sport.sport_code ===
                      item.sport
                  )?.sport_name ||
                  item.sport

                return (
                  <div
                    key={item.sport}
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr 110px 170px',
                      alignItems: 'center',
                      gap: '14px',
                      padding:
                        '12px 14px',
                      border:
                        '1px solid #e5eaf0',
                      borderRadius: '10px',
                      background: '#fff',
                    }}
                  >

                    <div>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#40516a',
                        }}
                      >
                        {sportName}
                      </strong>
                    </div>

                    <strong
                      style={{
                        fontSize: '12px',
                        color: '#596a81',
                        textAlign: 'center',
                      }}
                    >
                      {item.itemCount} item
                    </strong>

                    <strong
                      style={{
                        fontSize: '12px',
                        color: '#d2872c',
                        textAlign: 'right',
                      }}
                    >
                      RM{' '}
                      {item.totalAmount.toLocaleString(
                        'ms-MY',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </strong>

                  </div>
                )
              }
            )}

          </div>
        )}

      </div>

      {/* PRIORITY SUMMARY */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',
          gap: '10px',
          paddingTop: '4px',
        }}
      >

        <div
          style={{
            padding: '11px 13px',
            borderRadius: '10px',
            background: '#fff7f5',
            border: '1px solid #f1dfdc',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '9px',
              fontWeight: 800,
              color: '#a47872',
            }}
          >
            TINGGI
          </span>

          <strong
            style={{
              fontSize: '20px',
              color: '#c95c5c',
            }}
          >
            {equipmentSummary.priorityHigh}
          </strong>
        </div>

        <div
          style={{
            padding: '11px 13px',
            borderRadius: '10px',
            background: '#fffaf0',
            border: '1px solid #efe2c4',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '9px',
              fontWeight: 800,
              color: '#a9853f',
            }}
          >
            SEDERHANA
          </span>

          <strong
            style={{
              fontSize: '20px',
              color: '#c58a2a',
            }}
          >
            {equipmentSummary.priorityMedium}
          </strong>
        </div>

        <div
          style={{
            padding: '11px 13px',
            borderRadius: '10px',
            background: '#f7fcf9',
            border: '1px solid #dceee5',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '9px',
              fontWeight: 800,
              color: '#69927d',
            }}
          >
            RENDAH
          </span>

          <strong
            style={{
              fontSize: '20px',
              color: '#2f8f68',
            }}
          >
            {equipmentSummary.priorityLow}
          </strong>
        </div>

      </div>

      {/* OPEN MODULE */}

      <div
        style={{
          borderTop: '1px solid #edf0f4',
          paddingTop: '14px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={onOpenEquipment}
          style={{
            border: 'none',
            borderRadius: '9px',
            padding: '10px 16px',
            background: '#d2872c',
            color: '#fff',
            fontWeight: 700,
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Lihat Perincian →
        </button>
      </div>

    </div>
  )}
</DashboardPanel>

      {/* =================================================
          STATUS SUKAN
          ================================================= */}

      <DashboardPanel
        eyebrow="PEMANTAUAN"
        title="Status Pengisian Post-Mortem"
        description="Ringkasan status laporan berdasarkan sukan."
        className="full"
      >

        {sports.length === 0 ? (

          <EmptyChart
            icon="📋"
            title="Data sukan belum tersedia"
            description="Senarai status pengisian akan dipaparkan selepas data sukan dimuatkan."
          />

        ) : (

          <div className="ewcc-dashboard-sport-status">

            {sports.map(
              (sport) => {

                const report =
                  postMortemReports.find(
                    (item) =>
                      item.sport ===
                      sport.sport_code
                  )


                const status =
                  report?.status ||
                  'not_started'


                return (
                  <div
                    className="ewcc-dashboard-sport-row"
                    key={
                      sport.sport_code
                    }
                  >

                    <div>

                      <strong>
                        {sport.sport_name}
                      </strong>

                    </div>


                    <span
                      className={`ewcc-dashboard-status ${status}`}
                    >

                      {
                        status ===
                        'reviewed'
                          ? 'SELESAI'
                          : status ===
                            'submitted'
                            ? 'DALAM SEMAKAN'
                            : status ===
                              'draft'
                              ? 'DRAFT'
                              : 'BELUM DIISI'
                      }

                    </span>

                    {report?.id ? (
                      <button
                        type="button"
                        className="ewcc-dashboard-report-button"
                        onClick={() => onOpenReport?.(report.id)}
                      >
                        Lihat Laporan
                      </button>
                    ) : (
                      <span className="ewcc-dashboard-report-empty">—</span>
                    )}

                  </div>
                )
              }
            )}

          </div>

        )}

      </DashboardPanel>


      {/* =================================================
          FOOTER
          ================================================= */}

      <div className="ewcc-dashboard-note">

        <span>
          EWCC POST-MORTEM
        </span>

        <p>
          Statistik prestasi, latihan,
          isu, kewangan dan analisis
          akan dikira secara automatik
          daripada laporan post-mortem
          yang disimpan dalam sistem.
        </p>

      </div>

    </div>
  )
}


export default AdminDashboardOverview
