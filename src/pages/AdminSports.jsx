import { useMemo, useState } from 'react'
import PageHero from '../components/PageHero'

function AdminSports({
  sports,
  postMortemReports,
  onBack,
  onOpenReport,
}) {

  const [sportSearch, setSportSearch] = useState('')


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

        postMortemStatus:
          report?.status || 'not_started',

        reportId:
          report?.id || null,
      }

    })

  }, [sports, postMortemReports])


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


  // =====================================================
  // PAPARAN
  // =====================================================

  return (

    <>
      <PageHero
        eyebrow="EWCC POST-MORTEM • PENGURUSAN SISTEM"
        title="Senarai Sukan"
        description="Senarai sukan aktif Kontinjen Pahang yang didaftarkan dalam sistem EWCC."
        actions={
          <button
            type="button"
            className="ewcc-secondary-button"
            onClick={onBack}
          >
            ← Kembali
          </button>
        }
      />

    <section className="ewcc-section admin-sports-page">


      {/* =================================================
          HEADER
      ================================================= */}



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
              Sukan aktif
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
              Status
            </span>

            <strong>
              AKTIF
            </strong>

            <small>
              Semua sukan berdaftar
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

                        <span className="user-status Aktif">

                          {sport.status?.toUpperCase() ||
                            'ACTIVE'}

                        </span>

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
                        {sport.reportId ? (
                          <button
                            type="button"
                            className="ewcc-secondary-button report-action-button"
                            onClick={() => onOpenReport?.(sport.reportId)}
                          >
                            Lihat Laporan
                          </button>
                        ) : (
                          <span className="admin-no-report">Belum ada laporan</span>
                        )}
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
    </>

  )

}


export default AdminSports
