import { useState } from 'react'
import { ATHLETE_STATUS_OPTIONS } from '../../lib/athleteStatus'


const createEmptyAthlete = () => ({
  namaAtlet: '',
  status: '',
  cadangan: '',
  catatan: '',
})

const Section10StatusAtlet = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [athletes, setAthletes] = useState(
    Array.isArray(initialData) && initialData.length > 0
      ? initialData
      : [createEmptyAthlete()]
  )


  const updateAthlete = (
    index,
    field,
    value
  ) => {
    setAthletes((current) =>
      current.map((athlete, athleteIndex) =>
        athleteIndex === index
          ? {
              ...athlete,
              [field]: value,
            }
          : athlete
      )
    )
  }

  const addAthlete = () => {
    setAthletes((current) => [
      ...current,
      createEmptyAthlete(),
    ])
  }

  const removeAthlete = (index) => {
    setAthletes((current) => {
      if (current.length === 1) {
        return [createEmptyAthlete()]
      }

      return current.filter(
        (_, athleteIndex) =>
          athleteIndex !== index
      )
    })
  }

  const handleNext = () => {
    onNext(athletes)
  }

  return (
    <div className="postmortem-section">

      {/* HEADER */}
      <div className="section-header">

        <div
          style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '6px',
            fontWeight: 600,
          }}
        >
          BAHAGIAN 10
        </div>

        <h2>
          Status Atlet Selepas SUKMA
        </h2>

        <p>
          Nyatakan status dan cadangan susulan bagi
          setiap atlet selepas penyertaan SUKMA.
        </p>

      </div>

      {/* INFO */}
      <div
        className="section-info-box"
        style={{
          marginBottom: '24px',
        }}
      >
        <strong>Panduan:</strong>

        <span>
          Sila masukkan nama setiap atlet secara
          manual dan tentukan status berdasarkan
          penilaian pasukan selepas SUKMA.
        </span>
      </div>

      {/* ATHLETE TABLE */}
      <div
        className="postmortem-card"
        style={{
          padding: '0',
          overflow: 'hidden',
        }}
      >

        <div
          style={{
            overflowX: 'auto',
            width: '100%',
          }}
        >

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '1050px',
            }}
          >

            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom:
                    '1px solid #e2e8f0',
                }}
              >

                <th
                  style={{
                    width: '60px',
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#475569',
                  }}
                >
                  Bil.
                </th>

                <th
                  style={{
                    minWidth: '220px',
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#475569',
                  }}
                >
                  Nama Atlet
                </th>

                <th
                  style={{
                    minWidth: '220px',
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#475569',
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    minWidth: '300px',
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#475569',
                  }}
                >
                  Cadangan
                </th>

                <th
                  style={{
                    minWidth: '280px',
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#475569',
                  }}
                >
                  Catatan
                </th>

                <th
                  style={{
                    width: '90px',
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#475569',
                  }}
                >
                  Tindakan
                </th>

              </tr>
            </thead>

            <tbody>

              {athletes.map(
                (athlete, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom:
                        '1px solid #e2e8f0',
                    }}
                  >

                    {/* BIL */}
                    <td
                      style={{
                        padding: '14px 16px',
                        textAlign: 'center',
                        verticalAlign: 'top',
                        color: '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
                    </td>

                    {/* NAMA */}
                    <td
                      style={{
                        padding: '14px 16px',
                        verticalAlign: 'top',
                      }}
                    >

                      <input
                        type="text"
                        value={
                          athlete.namaAtlet ||
                          ''
                        }
                        onChange={(e) =>
                          updateAthlete(
                            index,
                            'namaAtlet',
                            e.target.value
                          )
                        }
                        placeholder="Nama atlet"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />

                    </td>

                    {/* STATUS */}
                    <td
                      style={{
                        padding: '14px 16px',
                        verticalAlign: 'top',
                      }}
                    >

                      <select
                        value={
                          athlete.status || ''
                        }
                        onChange={(e) =>
                          updateAthlete(
                            index,
                            'status',
                            e.target.value
                          )
                        }
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding:
                            '10px 12px',
                          border:
                            '1px solid #cbd5e1',
                          borderRadius: '8px',
                          background:
                            '#ffffff',
                          color:
                            '#334155',
                        }}
                      >

                        <option value="">
                          Pilih status
                        </option>

                        {ATHLETE_STATUS_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {option.label}
                            </option>
                          )
                        )}

                      </select>

                    </td>

                    {/* CADANGAN */}
                    <td
                      style={{
                        padding: '14px 16px',
                        verticalAlign: 'top',
                      }}
                    >

                      <textarea
                        rows={4}
                        value={
                          athlete.cadangan ||
                          ''
                        }
                        onChange={(e) =>
                          updateAthlete(
                            index,
                            'cadangan',
                            e.target.value
                          )
                        }
                        placeholder="Nyatakan cadangan susulan untuk atlet."
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />

                    </td>

                    {/* CATATAN */}
                    <td
                      style={{
                        padding: '14px 16px',
                        verticalAlign: 'top',
                      }}
                    >

                      <textarea
                        rows={4}
                        value={
                          athlete.catatan ||
                          ''
                        }
                        onChange={(e) =>
                          updateAthlete(
                            index,
                            'catatan',
                            e.target.value
                          )
                        }
                        placeholder="Catatan tambahan."
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />

                    </td>

                    {/* TINDAKAN */}
                    <td
                      style={{
                        padding: '14px 16px',
                        textAlign: 'center',
                        verticalAlign: 'top',
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          removeAthlete(index)
                        }
                        style={{
                          border: 'none',
                          background:
                            '#fee2e2',
                          color: '#b91c1c',
                          padding:
                            '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Padam
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ADD ATHLETE */}
      <div
        style={{
          marginTop: '20px',
          marginBottom: '32px',
        }}
      >

        <button
          type="button"
          onClick={addAthlete}
          style={{
            border: 'none',
            background: '#f97316',
            color: '#ffffff',
            padding: '11px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Tambah Atlet
        </button>

      </div>

      {/* NAVIGATION */}
      <div className="postmortem-form-footer">

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
          onClick={handleNext}
        >
          Simpan & Seterusnya →
        </button>

      </div>

    </div>
  )
}

export default Section10StatusAtlet