import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PostMortemSectionViewer from './postmortem/PostMortemSectionViewer'

function AdminPostMortem({

  onBack,

  initialReportId,

  embedded = false,

}) {

  // ==========================================

  // STATE

  // ==========================================

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [openSection, setOpenSection] = useState(null)
  const [reviewing, setReviewing] = useState(false)

  const handleDetailBack = () => {
    if (embedded) {
      setSelectedReport(null)
      setOpenSection(null)
      return
    }

    onBack?.()
  }


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
          user_id,
          login_id,
          sport,
          status,
          section_1,
          section_2,
          section_3,
          section_4,
          section_5,
          section_6,
          section_7,
          section_8,
          section_9,
          section_10,
          section_11,
          section_12,
          section_13,
          created_at,
          updated_at,
          submitted_at
        `)

        .order('updated_at', {

          ascending: false,

        })



      if (error) {



        console.error(

          'LOAD POST-MORTEM ERROR:',

          error

        )



        alert(

          `Senarai laporan tidak dapat dimuatkan.\n\n${error.message}`

        )



        return

      }



      console.log(

        'POST-MORTEM REPORTS:',

        data

      )



      setReports(data || [])

      if (initialReportId) {
        setSelectedReport((current) =>
          current ||
          (data || []).find(
            (item) => item.id === initialReportId
          ) ||
          null
        )
      }



    } catch (error) {



      console.error(

        'UNEXPECTED LOAD REPORT ERROR:',

        error

      )



      alert(

        'Berlaku masalah semasa memuatkan laporan.'

      )



    } finally {



      setLoading(false)

    }

  }



  // ==========================================

  // INITIAL LOAD

  // ==========================================



  useEffect(() => {



    Promise.resolve().then(loadReports)
    // Load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])






  // ==========================================

  // FILTER

  // ==========================================



  const filteredReports =

    reports.filter((report) => {



      const keyword =

        search.trim().toLowerCase()



      const matchesSearch =

        !keyword ||

        report.login_id

          ?.toLowerCase()

          .includes(keyword) ||

        report.sport

          ?.toLowerCase()

          .includes(keyword)



      const matchesStatus =

        statusFilter === 'all' ||

        report.status === statusFilter



      return (

        matchesSearch &&

        matchesStatus

      )

    })



  // ==========================================

  // STATUS COUNTS

  // ==========================================



  const totalReports =

    reports.length



  const draftCount =

    reports.filter(

      (report) =>

        report.status === 'draft'

    ).length



  const submittedCount =

    reports.filter(

      (report) =>

        report.status === 'submitted'

    ).length



  const reviewedCount =

    reports.filter(

      (report) =>

        report.status === 'reviewed'

    ).length



  // ==========================================

  // FORMAT DATE

  // ==========================================



  const formatDate = (date) => {



    if (!date) {

      return '-'

    }



    return new Date(date)

      .toLocaleString(

        'ms-MY',

        {

          day: '2-digit',

          month: '2-digit',

          year: 'numeric',

          hour: '2-digit',

          minute: '2-digit',

        }

      )

  }



  // ==========================================

  // STATUS LABEL

  // ==========================================



  const getStatusLabel = (status) => {



    switch (status) {



      case 'draft':

        return 'DRAFT'



      case 'submitted':

        return 'SUBMITTED'



      case 'reviewed':

        return 'REVIEWED'



      default:

        return status || '-'

    }

  }



  // ==========================================

// REPORT DASHBOARD METRICS

// ==========================================



const getReportMetrics = (report) => {

  const section1 = report?.section_1 || {}

  const section3 = report?.section_3 || {}

  const section5 = report?.section_5 || []



  const atletLelaki =

    Number(section1.atletLelaki) || 0



  const atletWanita =

    Number(section1.atletWanita) || 0



  const jumlahAtlet =

    atletLelaki + atletWanita



  const acaraList =

    Array.isArray(section3.acaraList)

      ? section3.acaraList

      : []



  const jumlahAcara =

    acaraList.length



  const jumlahSasaran =

    Number(section3.jumlahSasaran) ||

    acaraList.filter(

      (item) => item?.sasaran

    ).length



  const jumlahPencapaian =

    Number(section3.jumlahPencapaian) ||

    acaraList.filter(

      (item) =>

        item?.status === 'Capai'

    ).length



  const kadarPencapaian =

    jumlahSasaran > 0

      ? Math.round(

          (jumlahPencapaian /

            jumlahSasaran) *

            100

        )

      : 0



  const latihanItems =

    Array.isArray(section5)

      ? section5

      : []



  const ratingMap = {

    'Tidak Baik': 1,

    'Kurang Baik': 2,

    'Sederhana': 3,

    'Baik': 4,

    'Sangat Baik': 5,

  }



  const latihanRatings =

    latihanItems

      .map((item) => ({

        title:

          item?.title || '-',



        rating:

          ratingMap[item?.rating] || 0,



        label:

          item?.rating || 'Belum dinilai',

      }))

      .filter(

        (item) => item.rating > 0

      )



  return {

    atletLelaki,

    atletWanita,

    jumlahAtlet,

    jumlahAcara,

    jumlahSasaran,

    jumlahPencapaian,

    kadarPencapaian,

    acaraList,

    latihanRatings,

  }

}



  // ==========================================

  // REVIEW REPORT

  // ==========================================



const handleMarkReviewed = async () => {

  if (!selectedReport) {

    return

  }



  if (selectedReport.status !== 'submitted') {

    alert(

      'Hanya laporan yang berstatus SUBMITTED boleh ditandakan sebagai REVIEWED.'

    )



    return

  }



  const confirmed = window.confirm(

    'Adakah anda pasti mahu menandakan laporan ini sebagai REVIEWED?'

  )



  if (!confirmed) {

    return

  }



  setReviewing(true)



  try {

    const { error } = await supabase.rpc(

      'review_postmortem',

      {

        p_report_id: selectedReport.id,

      }

    )



    if (error) {

      console.error(

        'REVIEW REPORT ERROR:',

        error

      )



      alert(

        `Gagal mengemaskini status laporan.\n\n${error.message}`

      )



      return

    }



    console.log(

      'REPORT REVIEWED:',

      selectedReport.id

    )



    alert(

      'Laporan berjaya ditandakan sebagai REVIEWED.'

    )



    setSelectedReport(null)



    await loadReports()



  } catch (error) {

    console.error(

      'UNEXPECTED REVIEW ERROR:',

      error

    )



    alert(

      'Berlaku masalah semasa mengemaskini laporan.'

    )



  } finally {

    setReviewing(false)

  }

}



  // ==========================================

  // RENDER

  // ==========================================



  return (



    <main className={`ewcc-admin${embedded ? ' ewcc-admin-report-embedded' : ''}`}>



      {/* ======================================

          SIDEBAR

          ====================================== */}



      {!embedded && <aside className="ewcc-sidebar">



        <div className="sidebar-brand">



          <div className="sidebar-logo">



            <div className="logo-shield">

              <span>EW</span>

            </div>



          </div>



          <h1>

            EWCC

          </h1>



          <p>

            Post-Mortem

          </p>



          <span className="sidebar-role">

            Majlis Sukan Pahang

          </span>



        </div>



        <nav className="sidebar-menu">



          <button

            className="sidebar-menu-item"

            onClick={onBack}

          >

            <span className="sidebar-menu-icon">

              ←

            </span>



            <span>

              Kembali

            </span>

          </button>



          <button

            className="sidebar-menu-item active"

          >

            <span className="sidebar-menu-icon">

              📊

            </span>



            <span>

              Laporan

            </span>

          </button>



        </nav>



      </aside>}



      {/* ======================================

          MAIN CONTENT

          ====================================== */}



      <section className="ewcc-admin-content">



        <div className="ewcc-admin-body">



          {/* ==================================

              TITLE

              ================================== */}



          <section className="ewcc-section">



            <div className="ewcc-section-title admin-page-heading">



              <div>



                <span>

                  PENGURUSAN LAPORAN

                </span>



                <h2>

                  Laporan Post-Mortem

                </h2>



              </div>



              <button

                className="ewcc-secondary-button"

                onClick={loadReports}

                disabled={loading}

              >

                {loading

                  ? 'Memuatkan...'

                  : '↻ Muat Semula'}

              </button>



            </div>



          </section>



          {/* ==================================

              KPI

              ================================== */}



          <section className="ewcc-kpi-grid">



            <div className="ewcc-kpi-card">



              <div className="kpi-icon kpi-blue">

                📋

              </div>



              <div>



                <span>

                  Jumlah Laporan

                </span>



                <strong>

                  {totalReports}

                </strong>



                <small>

                  Semua laporan

                </small>



              </div>



            </div>



            <div className="ewcc-kpi-card">



              <div className="kpi-icon kpi-orange">

                📝

              </div>



              <div>



                <span>

                  Draft

                </span>



                <strong>

                  {draftCount}

                </strong>



                <small>

                  Belum dihantar

                </small>



              </div>



            </div>



            <div className="ewcc-kpi-card">



              <div className="kpi-icon kpi-green">

                📤

              </div>



              <div>



                <span>

                  Submitted

                </span>



                <strong>

                  {submittedCount}

                </strong>



                <small>

                  Menunggu semakan

                </small>



              </div>



            </div>



            <div className="ewcc-kpi-card">



              <div className="kpi-icon kpi-red">

                ✓

              </div>



              <div>



                <span>

                  Reviewed

                </span>



                <strong>

                  {reviewedCount}

                </strong>



                <small>

                  Telah disemak

                </small>



              </div>



            </div>



          </section>



          {/* ==================================

              FILTER

              ================================== */}



          {!selectedReport && (



            <section className="ewcc-section admin-reports-page">



              <div className="user-search-box">



                <input

                  type="text"

                  placeholder="Cari ID pengguna atau sukan..."

                  value={search}

                  onChange={(e) =>

                    setSearch(

                      e.target.value

                    )

                  }

                />



              </div>



              <div

                style={{

                  display: 'flex',

                  gap: '10px',

                  marginTop: '15px',

                  flexWrap: 'wrap',

                }}

              >



                <button

                  className="ewcc-secondary-button"

                  onClick={() =>

                    setStatusFilter('all')

                  }

                >

                  Semua

                </button>



                <button

                  className="ewcc-secondary-button"

                  onClick={() =>

                    setStatusFilter('draft')

                  }

                >

                  Draft

                </button>



                <button

                  className="ewcc-secondary-button"

                  onClick={() =>

                    setStatusFilter('submitted')

                  }

                >

                  Submitted

                </button>



                <button

                  className="ewcc-secondary-button"

                  onClick={() =>

                    setStatusFilter('reviewed')

                  }

                >

                  Reviewed

                </button>



              </div>



            </section>

          )}



          {/* ==================================

              REPORT TABLE

              ================================== */}



          {!selectedReport && (



            <section className="ewcc-section admin-reports-page">



              <div className="user-table-card">



                {loading ? (



                  <div className="user-empty">

                    Memuatkan laporan...

                  </div>



                ) : filteredReports.length === 0 ? (



                  <div className="user-empty">



                    <h3>

                      Tiada laporan ditemui

                    </h3>



                    <p>

                      Belum ada laporan yang

                      sepadan dengan carian.

                    </p>



                  </div>



                ) : (



                  <div className="user-table-wrapper">



                    <table className="user-table admin-reports-table">



                      <thead>



                        <tr>



                          <th>

                            ID PENGGUNA

                          </th>



                          <th>

                            SUKAN

                          </th>



                          <th>

                            STATUS

                          </th>



                          <th>

                            DIKEMASKINI

                          </th>



                          <th>

                            TINDAKAN

                          </th>



                        </tr>



                      </thead>



                      <tbody>



                        {filteredReports.map(

                          (report) => (



                            <tr

                              key={report.id}

                            >



                              <td>



                                <strong>

                                  {report.login_id}

                                </strong>



                              </td>



                              <td>

                                {report.sport ||

                                  '-'}

                              </td>



                              <td>



                                <span className="user-status Aktif">

                                  {getStatusLabel(

                                    report.status

                                  )}

                                </span>



                              </td>



                              <td>

                                {formatDate(

                                  report.updated_at

                                )}

                              </td>



                              <td>



                                <button

                                  className="ewcc-primary-button"

                                  onClick={() =>

                                    setSelectedReport(

                                      report

                                    )

                                  }

                                >

                                  Lihat

                                </button>



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



          )}



          {/* ==================================

              REPORT DETAIL

              ================================== */}



          {selectedReport && (



            <section className="ewcc-section">



              <div className="ewcc-section-title">



                <div>



                  <span>

                    SEMAKAN LAPORAN

                  </span>



                  <h2>

                    {selectedReport.sport ||

                      'Sukan'}

                  </h2>



                </div>



              <button

                className="ewcc-secondary-button"

                onClick={handleDetailBack}

              >

                ← Kembali

              </button>



              </div>



              {/* REPORT INFO */}



              <div className="ewcc-kpi-grid">



                <div className="ewcc-kpi-card">



                  <div>

                    <span>

                      ID Pengguna

                    </span>



                    <strong>

                      {selectedReport.login_id}

                    </strong>

                  </div>



                </div>



                <div className="ewcc-kpi-card">



                  <div>

                    <span>

                      Sukan

                    </span>



                    <strong>

                      {selectedReport.sport ||

                        '-'}

                    </strong>

                  </div>



                </div>



                <div className="ewcc-kpi-card">



                  <div>

                    <span>

                      Status

                    </span>



                    <strong>

                      {getStatusLabel(

                        selectedReport.status

                      )}

                    </strong>

                  </div>



                </div>



                <div className="ewcc-kpi-card">



                  <div>

                    <span>

                      Dihantar

                    </span>



                    <strong

                      style={{

                        fontSize: '14px',

                      }}

                    >

                      {formatDate(

                        selectedReport.submitted_at

                      )}

                    </strong>

                  </div>



                </div>



              </div>



              {/* ==========================================

                  REPORT DASHBOARD OVERVIEW

                  ========================================== */}



              {(() => {

                const metrics =

                  getReportMetrics(selectedReport)



                return (

                  <div className="postmortem-overview">



                    {/* REPORT HERO */}

                    <div className="postmortem-overview-hero">



                      <div>

                        <span className="postmortem-overview-eyebrow">

                          POST-MORTEM SUKMA XXII SELANGOR 2026

                        </span>



                        <h1>

                          {selectedReport.sport || 'Sukan'}

                        </h1>



                        <p>

                          Ringkasan prestasi, pencapaian dan

                          penilaian pasukan berdasarkan laporan

                          Post-Mortem yang dikemukakan.

                        </p>

                      </div>



                      <div className="postmortem-report-status">

                        <span className="postmortem-status-dot"></span>



                        {getStatusLabel(

                          selectedReport.status

                        )}

                      </div>



                    </div>





                    {/* MAIN METRICS */}

                    <div className="postmortem-overview-kpi">



                      <div className="postmortem-overview-card">



                        <div className="overview-card-icon">

                          👥

                        </div>



                        <div>

                          <span>JUMLAH ATLET</span>



                          <strong>

                            {metrics.jumlahAtlet}

                          </strong>



                          <small>

                            {metrics.atletLelaki} lelaki ·{' '}

                            {metrics.atletWanita} wanita

                          </small>

                        </div>



                      </div>





                      <div className="postmortem-overview-card">



                        <div className="overview-card-icon">

                          🏅

                        </div>



                        <div>

                          <span>JUMLAH ACARA</span>



                          <strong>

                            {metrics.jumlahAcara}

                          </strong>



                          <small>

                            Acara direkodkan

                          </small>

                        </div>



                      </div>





                      <div className="postmortem-overview-card">



                        <div className="overview-card-icon">

                          🎯

                        </div>



                        <div>

                          <span>JUMLAH SASARAN</span>



                          <strong>

                            {metrics.jumlahSasaran}

                          </strong>



                          <small>

                            Sasaran ditetapkan

                          </small>

                        </div>



                      </div>





                      <div className="postmortem-overview-card">



                        <div className="overview-card-icon">

                          🏆

                        </div>



                        <div>

                          <span>PENCAPAIAN</span>



                          <strong>

                            {metrics.jumlahPencapaian}

                          </strong>



                          <small>

                            {metrics.kadarPencapaian}% daripada sasaran

                          </small>

                        </div>



                      </div>



                    </div>





                    {/* TWO COLUMN AREA */}

                    <div className="postmortem-overview-grid">





                      {/* SASARAN VS PENCAPAIAN */}

                      <div className="postmortem-overview-panel">



                        <div className="overview-panel-header">



                          <div>

                            <span>

                              PRESTASI

                            </span>



                            <h3>

                              Sasaran & Pencapaian

                            </h3>

                          </div>



                          <div className="overview-percentage">

                            {metrics.kadarPencapaian}%

                          </div>



                        </div>





                        <div className="performance-bars">



                          <div className="performance-bar-item">



                            <div className="performance-bar-label">

                              <span>

                                Sasaran

                              </span>



                              <strong>

                                {metrics.jumlahSasaran}

                              </strong>

                            </div>



                            <div className="performance-bar-track">

                              <div

                                className="performance-bar-fill target"

                                style={{

                                  width:

                                    metrics.jumlahSasaran > 0

                                      ? '100%'

                                      : '0%',

                                }}

                              />

                            </div>



                          </div>





                          <div className="performance-bar-item">



                            <div className="performance-bar-label">

                              <span>

                                Pencapaian

                              </span>



                              <strong>

                                {metrics.jumlahPencapaian}

                              </strong>

                            </div>



                            <div className="performance-bar-track">

                              <div

                                className="performance-bar-fill achievement"

                                style={{

                                  width:

                                    metrics.jumlahSasaran > 0

                                      ? `${Math.min(

                                          metrics.kadarPencapaian,

                                          100

                                        )}%`

                                      : '0%',

                                }}

                              />

                            </div>



                          </div>



                        </div>





                        <div className="performance-result">



                          <div>

                            <span>

                              KADAR PENCAPAIAN

                            </span>



                            <strong>

                              {metrics.kadarPencapaian}%

                            </strong>

                          </div>



                          <small>

                            Berdasarkan jumlah sasaran dan

                            pencapaian yang direkodkan.

                          </small>



                        </div>



                      </div>





                      {/* PROGRAM LATIHAN */}

                      <div className="postmortem-overview-panel">



                        <div className="overview-panel-header">



                          <div>

                            <span>

                              PENILAIAN

                            </span>



                            <h3>

                              Program Latihan

                            </h3>

                          </div>



                          <span className="overview-panel-badge">

                            {metrics.latihanRatings.length} komponen

                          </span>



                        </div>





                        <div className="training-rating-list">



                          {metrics.latihanRatings.length > 0 ? (



                            metrics.latihanRatings.map(

                              (item, index) => (



                                <div

                                  className="training-rating-row"

                                  key={`${item.title}-${index}`}

                                >



                                  <div className="training-rating-info">



                                    <span>

                                      {item.title}

                                    </span>



                                    <small>

                                      {item.label}

                                    </small>



                                  </div>





                                  <div className="training-rating-track">



                                    <div

                                      className="training-rating-fill"

                                      style={{

                                        width: `${

                                          item.rating * 20

                                        }%`,

                                      }}

                                    />



                                  </div>



                                </div>



                              )

                            )



                          ) : (



                            <div className="overview-empty">

                              Tiada penilaian program latihan

                              direkodkan.

                            </div>



                          )}



                        </div>



                      </div>



                    </div>





                    {/* TEAM INFORMATION */}

                    <div className="postmortem-overview-panel team-information-panel">



                      <div className="overview-panel-header">



                        <div>

                          <span>

                            MAKLUMAT PASUKAN

                          </span>



                          <h3>

                            Maklumat Asas

                          </h3>

                        </div>



                      </div>





                      <div className="team-information-grid">



                        <div className="team-info-item">



                          <span>

                            Pengurus Pasukan

                          </span>



                          <strong>

                            {selectedReport.section_1?.pengurusPasukan ||

                              '-'}

                          </strong>



                        </div>





                        <div className="team-info-item">



                          <span>

                            Ketua Jurulatih

                          </span>



                          <strong>

                            {selectedReport.section_1?.ketuaJurulatih ||

                              '-'}

                          </strong>



                        </div>





                        <div className="team-info-item">



                          <span>

                            Atlet Lelaki

                          </span>



                          <strong>

                            {metrics.atletLelaki}

                          </strong>



                        </div>





                        <div className="team-info-item">



                          <span>

                            Atlet Wanita

                          </span>



                          <strong>

                            {metrics.atletWanita}

                          </strong>



                        </div>





                        <div className="team-info-item">



                          <span>

                            Tempoh Persediaan

                          </span>



                          <strong>

                            {selectedReport.section_1?.tempohPersediaan ||

                              '-'}

                          </strong>



                        </div>





                        <div className="team-info-item">



                          <span>

                            Tempat Pertandingan

                          </span>



                          <strong>

                            {selectedReport.section_1?.tempatPertandingan ||

                              '-'}

                          </strong>



                        </div>



                      </div>



                    </div>





                    {/* PERFORMANCE TABLE */}

                    <div className="postmortem-overview-panel">



                      <div className="overview-panel-header">



                        <div>

                          <span>

                            PRESTASI ACARA

                          </span>



                          <h3>

                            Sasaran & Keputusan

                          </h3>

                        </div>



                        <span className="overview-panel-badge">

                          {metrics.jumlahAcara} acara

                        </span>



                      </div>





                      {metrics.acaraList.length > 0 ? (



                        <div className="overview-performance-table-wrapper">



                          <table className="overview-performance-table">



                            <thead>



                              <tr>

                                <th>Bil</th>

                                <th>Acara</th>

                                <th>Atlet</th>

                                <th>Sasaran</th>

                                <th>Pencapaian</th>

                                <th>Status</th>

                                <th>Keputusan</th>

                              </tr>



                            </thead>





                            <tbody>



                              {metrics.acaraList.map(

                                (item, index) => (



                                  <tr key={index}>



                                    <td>

                                      <span className="table-number">

                                        {index + 1}

                                      </span>

                                    </td>



                                    <td>

                                      <strong>

                                        {item?.acara || '-'}

                                      </strong>

                                    </td>



                                    <td>

                                      {item?.atlet || '-'}

                                    </td>



                                    <td>

                                      {item?.sasaran || '-'}

                                    </td>



                                    <td>

                                      {item?.pencapaian || '-'}

                                    </td>



                                    <td>



                                      <span

                                        className={`performance-status ${

                                          item?.status === 'Capai'

                                            ? 'achieved'

                                            : item?.status ===

                                              'Tidak Capai'

                                            ? 'not-achieved'

                                            : 'pending'

                                        }`}

                                      >

                                        {item?.status ||

                                          'Belum dinilai'}

                                      </span>



                                    </td>



                                    <td>

                                      {item?.keputusan || '-'}

                                    </td>



                                  </tr>



                                )

                              )}



                            </tbody>



                          </table>



                        </div>



                      ) : (



                        <div className="overview-empty large">

                          Tiada data acara direkodkan.

                        </div>



                      )}



                    </div>





                    {/* COACH LIST */}

                    <div className="postmortem-overview-panel">



                      <div className="overview-panel-header">



                        <div>

                          <span>

                            KEJURULATIHAN

                          </span>



                          <h3>

                            Barisan Jurulatih

                          </h3>

                        </div>



                      </div>





                      <div className="coach-overview-grid">



                        {Array.isArray(

                          selectedReport.section_1?.jurulatih

                        ) &&

                        selectedReport.section_1.jurulatih.some(

                          (coach) =>

                            coach &&

                            coach.trim() !== ''

                        ) ? (



                          selectedReport.section_1.jurulatih

                            .filter(

                              (coach) =>

                                coach &&

                                coach.trim() !== ''

                            )

                            .map(

                              (coach, index) => (



                                <div

                                  className="coach-overview-item"

                                  key={index}

                                >



                                  <div className="coach-overview-number">

                                    {index + 1}

                                  </div>



                                  <div>

                                    <span>

                                      JURULATIH

                                    </span>



                                    <strong>

                                      {coach}

                                    </strong>

                                  </div>



                                </div>



                              )

                            )



                        ) : (



                          <div className="overview-empty">

                            Tiada maklumat jurulatih direkodkan.

                          </div>



                        )}



                      </div>



                    </div>



                  </div>

                )

              })()}



{/* ==========================================

    13 SECTION LAPORAN

    ========================================== */}



<div className="postmortem-sections-wrapper">



  <div className="postmortem-sections-header">



    <div>

      <span>PERINCIAN LAPORAN</span>



      <h3>

        13 Section Post-Mortem

      </h3>



      <p>

        Klik mana-mana bahagian untuk melihat

        maklumat lengkap laporan.

      </p>

    </div>



    <div className="postmortem-section-count">

      13 Bahagian

    </div>



  </div>





  {[

    {

      number: 1,

      title: 'Maklumat Sukan',

      description:

        'Maklumat asas pasukan, pengurusan, jurulatih dan atlet.',

      data: selectedReport.section_1,

    },



    {

      number: 2,

      title: 'Ringkasan Persiapan Program',

      description:

        'Rekod latihan, kejohanan, ujian prestasi dan program sokongan.',

      data: selectedReport.section_2,

    },



    {

      number: 3,

      title: 'Sasaran & Pencapaian',

      description:

        'Sasaran acara, pencapaian atlet, pingat dan keputusan pertandingan.',

      data: selectedReport.section_3,

    },



    {

      number: 4,

      title: 'Analisis Teknikal / Taktikal',

      description:

        'Penilaian kekuatan, kelemahan, teknikal, taktikal dan strategi.',

      data: selectedReport.section_4,

    },



    {

      number: 5,

      title: 'Penilaian Program Latihan',

      description:

        'Penilaian intensiti, kecergasan, teknikal, mental dan sokongan prestasi.',

      data: selectedReport.section_5,

    },



    {

      number: 6,

      title: 'Faktor Kejayaan / Kegagalan',

      description:

        'Faktor utama yang menyumbang kepada kejayaan dan kegagalan pasukan.',

      data: selectedReport.section_6,

    },



    {

      number: 7,

      title: 'Isu Teknikal Pertandingan',

      description:

        'Isu pertandingan, tindakan, kesan kepada atlet dan cadangan.',

      data: selectedReport.section_7,

    },



    {

      number: 8,

      title: 'Bantahan / Protes Rasmi',

      description:

        'Rekod bantahan atau protes rasmi, tindakan pasukan, keputusan dan bukti.',

      data: selectedReport.section_8,

    },



    {

      number: 9,

      title: 'Penilaian Barisan Kejurulatihan',

      description:

        'Penilaian keberkesanan, kecukupan dan kesesuaian kepakaran jurulatih.',

      data: selectedReport.section_9,

    },



    {

      number: 10,

      title: 'Status Atlet Selepas SUKMA',

      description:

        'Status atlet, cadangan hala tuju dan catatan selepas SUKMA.',

      data: selectedReport.section_10,

    },



    {

      number: 11,

      title: 'Cadangan Program SUKMA 2028',

      description:

        'Cadangan atlet, jurulatih, kem, pertandingan, peralatan dan sokongan.',

      data: selectedReport.section_11,

    },



    {

      number: 12,

      title: 'Rumusan Pasukan',

      description:

        'Perkara utama yang perlu diperbaiki, sokongan Majlis Sukan Pahang dan cadangan persediaan SUKMA 2028.',

      data: selectedReport.section_12,

    },



    {

      number: 13,

      title: 'Pengesahan',

      description:

        'Pernyataan pengesahan, nama pengurus atau jurulatih dan pengesahan penyelaras pasukan.',

      data: selectedReport.section_13,

    },

  ].map((section) => {



    const isOpen =

      openSection === section.number



    return (



      <div

        key={section.number}

        className={`postmortem-accordion ${

          isOpen ? 'open' : ''

        }`}

      >



        {/* ACCORDION HEADER */}



        <button

          type="button"

          className="postmortem-accordion-header"

          onClick={() => {



            setOpenSection(

              isOpen

                ? null

                : section.number

            )



          }}

        >



          <div className="postmortem-accordion-left">



            <div className="postmortem-accordion-number">



              {String(section.number).padStart(

                2,

                '0'

              )}



            </div>



            <div className="postmortem-accordion-title">



              <span>

                BAHAGIAN {section.number}

              </span>



              <strong>

                {section.title}

              </strong>



              <small>

                {section.description}

              </small>



            </div>



          </div>





          <div

            className={`postmortem-accordion-icon ${

              isOpen ? 'active' : ''

            }`}

          >

            {isOpen ? '−' : '+'}

          </div>



        </button>





        {/* ACCORDION CONTENT */}



        {isOpen && (



          <div className="postmortem-accordion-content">



            {section.data ? (



              <PostMortemSectionViewer

                sectionNumber={

                  section.number

                }

                data={

                  section.data

                }

              />



            ) : (



              <div className="postmortem-section-empty">



                <div>

                  ○

                </div>



                <strong>

                  Tiada data

                </strong>



                <p>

                  Tiada maklumat direkodkan

                  untuk bahagian ini.

                </p>



              </div>



            )}



          </div>



        )}



      </div>



    )



  })}



</div>



              {/* REVIEW ACTION */}



              <div

                style={{

                  display: 'flex',

                  justifyContent:

                    'flex-end',

                  gap: '10px',

                  marginTop: '20px',

                }}

              >



                {selectedReport.status ===

                  'submitted' && (



                  <button

                    className="ewcc-primary-button"

                    onClick={

                      handleMarkReviewed

                    }

                    disabled={reviewing}

                  >

                    {reviewing

                      ? 'Memproses...'

                      : '✓ Tandakan Sebagai Reviewed'}

                  </button>



                )}



              </div>



            </section>



          )}



        </div>



      </section>



    </main>

  )

}



export default AdminPostMortem
