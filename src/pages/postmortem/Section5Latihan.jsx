import { useState } from 'react'

const ratingOptions = [
  'Sangat Baik',
  'Baik',
  'Sederhana',
  'Lemah',
]

const defaultComponents = [
  {
    id: 'programLatihan',
    title: 'Program latihan',
    rating: '',
    catatan: '',
  },
  {
    id: 'intensitiLatihan',
    title: 'Intensiti latihan',
    rating: '',
    catatan: '',
  },
  {
    id: 'kecergasan',
    title: 'Kecergasan',
    rating: '',
    catatan: '',
  },
  {
    id: 'teknikal',
    title: 'Teknikal',
    rating: '',
    catatan: '',
  },
  {
    id: 'taktikal',
    title: 'Taktikal',
    rating: '',
    catatan: '',
  },
  {
    id: 'mental',
    title: 'Mental',
    rating: '',
    catatan: '',
  },
  {
    id: 'pemakanan',
    title: 'Pemakanan',
    rating: '',
    catatan: '',
  },
  {
    id: 'pemulihan',
    title: 'Pemulihan',
    rating: '',
    catatan: '',
  },
  {
    id: 'sainsSukan',
    title: 'Sains sukan',
    rating: '',
    catatan: '',
  },
]

function Section5Latihan({
  initialData,
  onNext,
  onBack,
}) {
  const [components, setComponents] = useState(
    initialData?.components?.length
      ? initialData.components
      : defaultComponents
  )


  // =========================================================
  // UPDATE RATING
  // =========================================================
  const updateRating = (index, rating) => {
    setComponents((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              rating,
            }
          : item
      )
    )
  }

  // =========================================================
  // UPDATE CATATAN
  // =========================================================
  const updateCatatan = (index, catatan) => {
    setComponents((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              catatan,
            }
          : item
      )
    )
  }

  // =========================================================
  // NEXT
  // =========================================================
  const handleNext = () => {
    onNext({
      components,
    })
  }

  return (
    <section className="postmortem-form-card">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="postmortem-form-header">

        <div>
          <span>BAHAGIAN 5</span>

          <h2>
            Penilaian Program Latihan
          </h2>

          <p>
            Nilai keberkesanan program latihan berdasarkan
            komponen yang telah dilaksanakan sepanjang
            persediaan ke SUKMA.
          </p>
        </div>

      </div>

      {/* =====================================================
          INTRO
      ====================================================== */}
      <div
        style={{
          background: '#f8f9fa',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '16px 18px',
          marginBottom: '24px',
        }}
      >
        <strong
          style={{
            display: 'block',
            marginBottom: '6px',
          }}
        >
          Panduan Pengisian
        </strong>

        <p
          style={{
            margin: 0,
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.7',
          }}
        >
          Sila pilih satu tahap penilaian bagi setiap
          komponen. Gunakan ruang catatan untuk memberikan
          penjelasan, pemerhatian atau perkara yang perlu
          diberi perhatian.
        </p>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#fff',
        }}
      >

        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '1100px',
              borderCollapse: 'collapse',
            }}
          >

            {/* =================================================
                TABLE HEADER
            ================================================== */}
            <thead>
              <tr
                style={{
                  background: '#f7f7f7',
                }}
              >
                <th
                  style={{
                    ...thStyle,
                    width: '210px',
                    textAlign: 'left',
                  }}
                >
                  Komponen
                </th>

                {ratingOptions.map((option) => (
                  <th
                    key={option}
                    style={{
                      ...thStyle,
                      width: '125px',
                      textAlign: 'center',
                    }}
                  >
                    {option}
                  </th>
                ))}

                <th
                  style={{
                    ...thStyle,
                    minWidth: '300px',
                    textAlign: 'left',
                  }}
                >
                  Catatan
                </th>
              </tr>
            </thead>

            {/* =================================================
                TABLE BODY
            ================================================== */}
            <tbody>

              {components.map((item, index) => (
                <tr key={item.id}>

                  {/* COMPONENT */}
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 600,
                      color: '#333',
                    }}
                  >
                    {item.title}
                  </td>

                  {/* RATINGS */}
                  {ratingOptions.map((option) => (
                    <td
                      key={option}
                      style={{
                        ...tdStyle,
                        textAlign: 'center',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          minHeight: '48px',
                        }}
                      >
                        <input
                          type="radio"
                          name={`rating-${item.id}`}
                          value={option}
                          checked={
                            item.rating === option
                          }
                          onChange={() =>
                            updateRating(
                              index,
                              option
                            )
                          }
                          style={{
                            width: '19px',
                            height: '19px',
                            cursor: 'pointer',
                          }}
                        />
                      </label>
                    </td>
                  ))}

                  {/* CATATAN */}
                  <td
                    style={{
                      ...tdStyle,
                      minWidth: '300px',
                    }}
                  >
                    <textarea
                      value={item.catatan || ''}
                      onChange={(e) =>
                        updateCatatan(
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Masukkan catatan..."
                      rows={3}
                      style={{
                        width: '100%',
                        minHeight: '75px',
                        padding: '9px 10px',
                        border:
                          '1px solid #d9d9d9',
                        borderRadius: '6px',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>
      </div>

      {/* =====================================================
          SELECTED SUMMARY
      ====================================================== */}
      <div
        style={{
          marginTop: '18px',
          padding: '14px 16px',
          background: '#fafafa',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666',
        }}
      >
        <strong style={{ color: '#333' }}>
          Status Pengisian:
        </strong>{' '}

        {
          components.filter(
            (item) => item.rating
          ).length
        }

        daripada {components.length} komponen telah
        dinilai.
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
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
          Simpan &amp; Seterusnya →
        </button>

      </div>

    </section>
  )
}

// =========================================================
// TABLE STYLES
// =========================================================

const thStyle = {
  padding: '13px 10px',
  borderBottom: '1px solid #e5e7eb',
  borderRight: '1px solid #e5e7eb',
  fontSize: '12px',
  fontWeight: 700,
  color: '#555',
  verticalAlign: 'middle',
}

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
  borderRight: '1px solid #e5e7eb',
  verticalAlign: 'middle',
}

export default Section5Latihan