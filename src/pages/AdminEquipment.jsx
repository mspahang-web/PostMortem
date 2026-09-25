import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getEquipmentAmount } from '../lib/equipment'
import '../styles/Equipment2028.css'

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('ms-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getPriorityClass(priority) {
  if (priority === 'Tinggi') {
    return {
      background: '#fff0ed',
      color: '#c84b35',
    }
  }

  if (priority === 'Rendah') {
    return {
      background: '#eef5ff',
      color: '#416fa3',
    }
  }

  return {
    background: '#fff7e6',
    color: '#b27600',
  }
}

export default function AdminEquipment({
  onBack,
}) {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedSport, setSelectedSport] =
    useState(null)

  async function loadEquipment() {
    try {
      setLoading(true)

      const {
        data,
        error,
      } = await supabase
        .from('equipment_2028')
        .select('*')
        .order('sport', {
          ascending: true,
        })
        .order('created_at', {
          ascending: true,
        })

      if (error) {
        console.error(
          'LOAD ADMIN EQUIPMENT ERROR:',
          error
        )

        alert(error.message)
        return
      }

      setEquipment(data || [])
    } catch (error) {
      console.error(error)

      alert(
        'Gagal memuatkan cadangan peralatan.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEquipment()
  }, [])

  /*
   * Kumpulkan semua data mengikut sukan.
   */
  const sportSummary = useMemo(() => {
    const grouped = {}

    equipment.forEach((item) => {
      const sport =
        item.sport || 'Tidak Dinyatakan'

      if (!grouped[sport]) {
        grouped[sport] = {
          sport,
          items: [],
          totalAmount: 0,
          highPriority: 0,
        }
      }

      grouped[sport].items.push(item)

      grouped[sport].totalAmount +=
        getEquipmentAmount(item)

      if (
        item.keutamaan === 'Tinggi'
      ) {
        grouped[sport].highPriority += 1
      }
    })

    return Object.values(grouped).sort(
      (a, b) =>
        a.sport.localeCompare(
          b.sport
        )
    )
  }, [equipment])

  const totalAmount = useMemo(() => {
    return equipment.reduce(
      (total, item) =>
        total + getEquipmentAmount(item),
      0
    )
  }, [equipment])

  const totalHighPriority =
    equipment.filter(
      (item) =>
        item.keutamaan === 'Tinggi'
    ).length

  const selectedSportData =
    selectedSport
      ? sportSummary.find(
          (sport) =>
            sport.sport ===
            selectedSport
        )
      : null

  return (
    <div className="equipment-page equipment-admin equipment-admin-view">

          {/* KPI */}

          <section className="ewcc-kpi-grid">

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-blue">
                🏅
              </div>

              <div>

                <span>
                  Sukan
                </span>

                <strong>
                  {sportSummary.length}
                </strong>

                <small>
                  Sukan yang mempunyai
                  cadangan
                </small>

              </div>

            </div>

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-green">
                📦
              </div>

              <div>

                <span>
                  Jumlah Item
                </span>

                <strong>
                  {equipment.length}
                </strong>

                <small>
                  Cadangan peralatan
                </small>

              </div>

            </div>

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-orange">
                💰
              </div>

              <div>

                <span>
                  Jumlah Anggaran
                </span>

                <strong>
                  RM{' '}
                  {formatCurrency(
                    totalAmount
                  )}
                </strong>

                <small>
                  Semua sukan
                </small>

              </div>

            </div>

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-red">
                ⚠️
              </div>

              <div>

                <span>
                  Keutamaan Tinggi
                </span>

                <strong>
                  {totalHighPriority}
                </strong>

                <small>
                  Item perlu diberi
                  perhatian
                </small>

              </div>

            </div>

          </section>

          {/* CONTENT */}

          <section className="ewcc-section">

            <div
              className="ewcc-section-title"
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >

              <div>

                <span>
                  PEMANTAUAN
                </span>

                <h2>
                  Cadangan Mengikut Sukan
                </h2>

              </div>

              <button
                type="button"
                className="ewcc-secondary-button"
                onClick={onBack}
              >
                ← Kembali
              </button>

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
                  Memuatkan data
                  peralatan...
                </div>

              ) : sportSummary.length ===
                0 ? (

                <div
                  style={{
                    padding: 50,
                    textAlign: 'center',
                  }}
                >

                  <div
                    style={{
                      fontSize: 40,
                      marginBottom: 12,
                    }}
                  >
                    📦
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      color: '#34445c',
                    }}
                  >
                    Belum ada cadangan
                    peralatan
                  </h3>

                  <p
                    style={{
                      marginTop: 8,
                      color: '#8995a7',
                    }}
                  >
                    Tiada sukan yang
                    menghantar cadangan
                    peralatan 2028.
                  </p>

                </div>

              ) : (

                <div
                  style={{
                    display: 'grid',
                    gap: 12,
                  }}
                >

                  {sportSummary.map(
                    (sport) => (
                      <button
                        className="equipment-sport-card"
                        key={
                          sport.sport
                        }
                        type="button"
                        onClick={() =>
                          setSelectedSport(
                            sport.sport
                          )
                        }
                        style={{
                          width: '100%',
                          border:
                            '1px solid #e4e9ef',
                          borderRadius: 12,
                          background:
                            '#ffffff',
                          padding: 18,
                          display: 'grid',
                          gridTemplateColumns:
                            '1fr auto auto auto',
                          alignItems:
                            'center',
                          gap: 20,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >

                        <div>

                          <strong
                            style={{
                              display:
                                'block',
                              color:
                                '#34445c',
                              fontSize: 15,
                              marginBottom: 4,
                            }}
                          >
                            {
                              sport.sport
                            }
                          </strong>

                          <small
                            style={{
                              color:
                                '#8995a7',
                            }}
                          >
                            {
                              sport.items
                                .length
                            } item
                            peralatan
                          </small>

                        </div>

                        <div
                          style={{
                            textAlign:
                              'right',
                          }}
                        >

                          <small
                            style={{
                              display:
                                'block',
                              color:
                                '#8995a7',
                              fontSize: 10,
                              fontWeight:
                                800,
                            }}
                          >
                            JUMLAH
                          </small>

                          <strong
                            style={{
                              color:
                                '#34445c',
                            }}
                          >
                            RM{' '}
                            {formatCurrency(
                              sport.totalAmount
                            )}
                          </strong>

                        </div>

                        <div
                          style={{
                            textAlign:
                              'center',
                          }}
                        >

                          <small
                            style={{
                              display:
                                'block',
                              color:
                                '#8995a7',
                              fontSize: 10,
                              fontWeight:
                                800,
                              marginBottom: 4,
                            }}
                          >
                            TINGGI
                          </small>

                          <span
                            style={{
                              display:
                                'inline-block',
                              padding:
                                '5px 9px',
                              borderRadius:
                                20,
                              background:
                                sport.highPriority >
                                0
                                  ? '#fff0ed'
                                  : '#eef7f0',
                              color:
                                sport.highPriority >
                                0
                                  ? '#c84b35'
                                  : '#43835a',
                              fontSize: 11,
                              fontWeight:
                                800,
                            }}
                          >
                            {
                              sport.highPriority
                            }
                          </span>

                        </div>

                        <span
                          style={{
                            fontSize: 20,
                            color:
                              '#8995a7',
                          }}
                        >
                          →
                        </span>

                      </button>
                    )
                  )}

                </div>

              )}

            </div>

          </section>

          {/* DETAIL */}

          {selectedSportData && (

            <section className="ewcc-section">

              <div
                className="ewcc-section-title"
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >

                <div>

                  <span>
                    BUTIRAN SUKAN
                  </span>

                  <h2>
                    {
                      selectedSportData.sport
                    }
                  </h2>

                </div>

                <button
                  type="button"
                  className="ewcc-secondary-button"
                  onClick={() =>
                    setSelectedSport(
                      null
                    )
                  }
                >
                  Tutup
                </button>

              </div>

              <div className="ewcc-status-card">

                <div
                  className="equipment-table-wrap"
                  style={{
                    width: '100%',
                    overflowX:
                      'auto',
                  }}
                >

                  <table
                    className="equipment-table"
                    style={{
                      width: '100%',
                      minWidth: 1350,
                      borderCollapse:
                        'collapse',
                    }}
                  >

                    <thead>

                      <tr
                        style={{
                          background:
                            '#f5f7fa',
                        }}
                      >

                        <th>
                          Bil
                        </th>

                        <th>
                          Peralatan
                        </th>

                        <th>
                          Kuantiti
                        </th>

                        <th>
                          Spesifikasi /
                          Jenama
                        </th>

                        <th>
                          Kegunaan
                        </th>

                        <th>
                          Keutamaan
                        </th>

                        <th>
                          Anggaran Harga
                          Seunit
                        </th>

                        <th>
                          Jumlah Anggaran
                        </th>

                        <th>
                          Justifikasi /
                          Keperluan
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {selectedSportData.items.map(
                        (
                          item,
                          index
                        ) => {

                          const priorityStyle =
                            getPriorityClass(
                              item.keutamaan
                            )

                          return (
                            <tr
                              key={
                                item.id
                              }
                            >

                              <td>
                                {index + 1}
                              </td>

                              <td>

                                <strong>
                                  {
                                    item.peralatan
                                  }
                                </strong>

                              </td>

                              <td>
                                {
                                  item.kuantiti
                                }
                              </td>

                              <td>
                                {
                                  item.spesifikasi_jenama ||
                                  '-'
                                }
                              </td>

                              <td>
                                {
                                  item.kegunaan ||
                                  '-'
                                }
                              </td>

                              <td>

                                <span
                                  style={{
                                    display:
                                      'inline-block',
                                    padding:
                                      '5px 10px',
                                    borderRadius:
                                      20,
                                    background:
                                      priorityStyle.background,
                                    color:
                                      priorityStyle.color,
                                    fontSize:
                                      11,
                                    fontWeight:
                                      800,
                                  }}
                                >
                                  {
                                    item.keutamaan
                                  }
                                </span>

                              </td>

                              <td>
                                RM{' '}
                                {formatCurrency(
                                  item.anggaran_harga_seunit
                                )}
                              </td>

                              <td>

                                <strong>
                                  RM{' '}
                                  {formatCurrency(
                                    getEquipmentAmount(item)
                                  )}
                                </strong>

                              </td>

                              <td>
                                {
                                  item.justifikasi_keperluan ||
                                  '-'
                                }
                              </td>

                            </tr>
                          )
                        }
                      )}

                    </tbody>

                    <tfoot>

                      <tr
                        style={{
                          background:
                            '#fbfcfe',
                        }}
                      >

                        <td
                          colSpan="7"
                          style={{
                            textAlign:
                              'right',
                            fontWeight: 800,
                          }}
                        >
                          JUMLAH
                        </td>

                        <td
                          style={{
                            fontWeight:
                              900,
                            color:
                              '#d96b00',
                          }}
                        >
                          RM{' '}
                          {formatCurrency(
                            selectedSportData.totalAmount
                          )}
                        </td>

                        <td></td>

                      </tr>

                    </tfoot>

                  </table>

                </div>

              </div>

            </section>

          )}

          {/* FOOTER */}

          <footer
            className="ewcc-content-footer"
          >

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
  )
}
