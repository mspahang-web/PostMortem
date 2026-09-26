import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Equipment2028 from './Equipment2028'

function UserDashboard({
  userProfile,
  onPostMortem,
  onLogout,
}) {

  // ==========================================
  // POST-MORTEM STATUS
  // ==========================================

  const [report, setReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const [reportLoadError, setReportLoadError] = useState(false)
  const [showEquipment2028, setShowEquipment2028] = useState(false)

  const loadReportStatus = async () => {

    try {

      setLoadingReport(true)
      setReportLoadError(false)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error(
          'Get user error:',
          userError
        )

        setReport(null)
        setReportLoadError(true)
        return
      }

      const {
        data,
        error,
      } = await supabase
        .from('postmortem_reports')
        .select(`
          id,
          login_id,
          sport,
          status,
          created_at,
          updated_at,
          submitted_at
        `)
        .eq('user_id', user.id)
        .order('updated_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle()

      if (error) {

        console.error(
          'Load report status error:',
          error
        )

        setReport(null)
        setReportLoadError(true)
        return
      }

      setReport(data || null)

    } catch (error) {

      console.error(
        'Unexpected report status error:',
        error
      )

      setReport(null)
      setReportLoadError(true)

    } finally {

      setLoadingReport(false)

    }
  }


  // ==========================================
  // LOAD STATUS
  // ==========================================

  useEffect(() => {

    Promise.resolve().then(loadReportStatus)

  }, [])


  // ==========================================
  // STATUS HELPER
  // ==========================================

  const getReportStatus = () => {

    if (loadingReport) {
      return {
        label: 'MEMUATKAN',
        description: 'Memeriksa status laporan...',
      }
    }

    if (reportLoadError) {
      return {
        label: 'RALAT DATA',
        description: 'Status laporan tidak dapat dimuatkan. Cuba muat semula halaman atau hubungi pentadbir.',
      }
    }

    if (!report) {
      return {
        label: 'BELUM MULA',
        description: 'Laporan post-mortem belum dimulakan.',
      }
    }

    if (report.status === 'draft') {
      return {
        label: 'DRAF',
        description: 'Laporan masih dalam proses pengisian.',
      }
    }

    if (report.status === 'submitted') {
      return {
        label: 'SUBMITTED',
        description: 'Laporan telah dihantar dan sedang menunggu semakan.',
      }
    }

    if (report.status === 'reviewed') {
      return {
        label: 'REVIEWED',
        description: 'Laporan telah disemak oleh Administrator EWCC.',
      }
    }

    return {
      label: 'TIDAK DIKETAHUI',
      description: 'Status laporan tidak dapat dikenal pasti.',
    }
  }


  const reportStatus = getReportStatus()


  // ==========================================
  // BUTTON
  // ==========================================

  const handlePostMortemClick = () => {

    if (loadingReport || reportLoadError) {
      alert(
        loadingReport
          ? 'Status laporan masih dimuatkan. Sila cuba sebentar lagi.'
          : 'Status laporan tidak dapat dimuatkan. Borang tidak dibuka untuk mengelakkan rekod pendua.'
      )
      return
    }

    if (report?.status === 'submitted') {

      alert(
        'Laporan Post-Mortem telah dihantar dan dikunci.\n\n' +
        'Laporan tidak lagi boleh diedit.'
      )

      return
    }

    if (report?.status === 'reviewed') {

      alert(
        'Laporan Post-Mortem telah disemak oleh Administrator EWCC.\n\n' +
        'Laporan tidak lagi boleh diedit.'
      )

      return
    }

    onPostMortem()

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleUserLogout = async () => {

    await supabase.auth.signOut()

    onLogout()

  }


  // ==========================================
  // RENDER
  // ==========================================

if (showEquipment2028) {
  return (
    <Equipment2028
      userProfile={userProfile}
      onBack={() => setShowEquipment2028(false)}
    />
  )
}

  return (

    <main className="ewcc-user-dashboard">

      {/* ======================================
          SIDEBAR
          ====================================== */}

      <aside className="ewcc-sidebar">

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


        {/* MENU */}

        <nav className="sidebar-menu">

          <button
            className="sidebar-menu-item active"
          >

            <span className="sidebar-menu-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>

          </button>


          <button
            className="sidebar-menu-item"
            onClick={handlePostMortemClick}
          >

            <span className="sidebar-menu-icon">
              📝
            </span>

            <span>
              Post-Mortem
            </span>

          </button>


          <button
            className="sidebar-menu-item"
            onClick={() =>
              alert(
                'Profil pengguna akan dibina selepas ini.'
              )
            }
          >

            <span className="sidebar-menu-icon">
              👤
            </span>

            <span>
              Profil
            </span>

          </button>

        </nav>


        {/* FOOTER */}

        <div className="sidebar-footer">

          <div className="sidebar-footer-info">

            <strong>
              {userProfile?.name || 'Pengguna'}
            </strong>

            <span>
              Pengguna Sukan
            </span>

            <small>
              {userProfile?.login_id || ''}
            </small>

          </div>


          <button
            className="sidebar-logout"
            onClick={handleUserLogout}
          >

            <span>
              ↪
            </span>

            Log Keluar

          </button>

        </div>

      </aside>


      {/* ======================================
          MAIN
          ====================================== */}

      <section className="ewcc-admin-content">

        {/* BODY */}

        <div className="ewcc-admin-body">


          {/* ==================================
              WELCOME
              ================================== */}

          <section className="ewcc-welcome">

            <span className="welcome-eyebrow">
              EWCC POST-MORTEM • PENGGUNA SUKAN
            </span>

            <h2>
              Selamat Datang,{' '}
              {userProfile?.name}
            </h2>

            <p>
              Selamat datang ke Sistem
              Pengurusan Post-Mortem
              Kontinjen Pahang.
            </p>

            <span className="welcome-note">
              SUKMA XXII & PARA SUKMA
              SELANGOR 2026
            </span>

          </section>


          {/* ==================================
              KPI
              ================================== */}

          <section className="ewcc-kpi-grid">


            {/* SUKAN */}

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-blue">
                🏅
              </div>

              <div>

                <span>
                  Sukan Anda
                </span>

                <strong>
                  {userProfile?.sport || '-'}
                </strong>

                <small>
                  Kod Sukan
                </small>

              </div>

            </div>


            {/* ID */}

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-green">
                👤
              </div>

              <div>

                <span>
                  ID Pengguna
                </span>

                <strong>
                  {userProfile?.login_id || '-'}
                </strong>

                <small>
                  Pengguna Berdaftar
                </small>

              </div>

            </div>


            {/* STATUS */}

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-orange">
                📝
              </div>

              <div>

                <span>
                  Status Post-Mortem
                </span>

                <strong>
                  {reportStatus.label}
                </strong>

                <small>
                  {reportStatus.description}
                </small>

              </div>

            </div>


            {/* PROGRAM */}

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-red">
                📅
              </div>

              <div>

                <span>
                  Program
                </span>

                <strong>
                  SUKMA 2026
                </strong>

                <small>
                  Kontinjen Pahang
                </small>

              </div>

            </div>

          </section>


          {/* ==================================
              POST-MORTEM
              ================================== */}

          <section className="ewcc-section">

            <div className="ewcc-section-title">

              <div>

                <span>
                  MODUL UTAMA
                </span>

                <h2>
                  Laporan Post-Mortem
                </h2>

              </div>

            </div>


            <div className="ewcc-module-grid">


              {/* BORANG */}

              <button
                className="ewcc-module-card"
                onClick={handlePostMortemClick}
              >

                <div className="module-icon module-orange">
                  📝
                </div>

                <div className="module-content">

                  <h3>
                    {report?.status === 'draft'
                      ? 'Sambung Borang Post-Mortem'
                      : 'Isi Borang Post-Mortem'}
                  </h3>

                  <p>

                    {report?.status === 'draft'
                      ? 'Sambung pengisian laporan yang masih dalam bentuk draf.'
                      : report?.status === 'submitted'
                        ? 'Laporan telah dihantar dan tidak boleh diedit.'
                        : report?.status === 'reviewed'
                          ? 'Laporan telah disemak dan tidak boleh diedit.'
                          : 'Lengkapkan laporan post-mortem bagi sukan anda.'}

                  </p>

                </div>

                <span className="module-arrow">
                  →
                </span>

              </button>


              {/* STATUS */}

              <button
                className="ewcc-module-card"
                onClick={() => {

                  if (loadingReport) {

                    alert(
                      'Sedang memuatkan status laporan...'
                    )

                    return
                  }

                  if (!report) {

                    alert(
                      'Laporan Post-Mortem belum dimulakan.'
                    )

                    return
                  }

                  if (report.status === 'draft') {

                    alert(
                      'Status: DRAF\n\n' +
                      'Laporan masih dalam proses pengisian.'
                    )

                    return
                  }

                  if (report.status === 'submitted') {

                    alert(
                      'Status: SUBMITTED\n\n' +
                      'Laporan telah dihantar dan sedang menunggu semakan Administrator EWCC.'
                    )

                    return
                  }

                  if (report.status === 'reviewed') {

                    alert(
                      'Status: REVIEWED\n\n' +
                      'Laporan telah disemak oleh Administrator EWCC.'
                    )

                  }

                }}
              >

                <div className="module-icon module-blue">
                  📊
                </div>

                <div className="module-content">

                  <h3>
                    Status Laporan
                  </h3>

                  <p>
                    {reportStatus.description}
                  </p>

                </div>

                <span className="module-arrow">
                  →
                </span>

              </button>

            </div>

          </section>

          <button
          className="ewcc-module-card"
          onClick={() => setShowEquipment2028(true)}
        >
          <div className="module-icon module-green">
            📦
          </div>

          <div className="module-content">
            <h3>
              Cadangan Peralatan 2028
            </h3>

            <p>
              Masukkan cadangan peralatan yang diperlukan
              oleh sukan anda bagi persediaan SUKMA 2028.
            </p>
          </div>

          <span className="module-arrow">
            →
          </span>
        </button>


          {/* ==================================
              FOOTER
              ================================== */}

          <footer className="ewcc-content-footer">

            <span>
              EWCC Post-Mortem
            </span>

            <span>
              Versi 1.0
            </span>

            <span>
              Majlis Sukan Pahang
            </span>

          </footer>

        </div>

      </section>

    </main>

  )
}

export default UserDashboard
