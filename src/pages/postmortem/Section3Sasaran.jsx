import { useState } from 'react'

const createAcara = () => ({
  acara: '',
  atlet: '',
  sasaran: '',
  pencapaian: '',
  pingat: '',
  status: '',
  keputusan: '',
})

// Totals are typed in by the user (as in the Google Sheet), not counted
// from the rows: a team event has one row per athlete but one medal.
const TOTAL_FIELDS = [
  'jumlahAcara',
  'sasaranEmas',
  'sasaranPerak',
  'sasaranGangsa',
  'pencapaianEmas',
  'pencapaianPerak',
  'pencapaianGangsa',
]

const toInput = (value) =>
  value === undefined || value === null || value === ''
    ? ''
    : String(value)

const toNumber = (value) => Number(value) || 0

const defaultData = {
  acaraList: [createAcara()],
  jumlahAcara: 0,
  jumlahSasaran: 0,
  jumlahPencapaian: 0,

  // Pecahan sasaran asal
  sasaranEmas: 0,
  sasaranPerak: 0,
  sasaranGangsa: 0,

  // Pecahan pencapaian sebenar
  pencapaianEmas: 0,
  pencapaianPerak: 0,
  pencapaianGangsa: 0,
}

function Section3Sasaran({
  initialData,
  onNext,
  onBack,
}) {
  const [acaraList, setAcaraList] = useState(
    initialData?.acaraList?.length
      ? initialData.acaraList
      : defaultData.acaraList
  )


  // =========================================================
  // JUMLAH (DIISI MANUAL)
  // =========================================================
  const [totals, setTotals] = useState(() =>
    Object.fromEntries(
      TOTAL_FIELDS.map((key) => [key, toInput(initialData?.[key])])
    )
  )

  const updateTotal = (key, value) => {
    setTotals((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const jumlahSasaran =
    toNumber(totals.sasaranEmas) +
    toNumber(totals.sasaranPerak) +
    toNumber(totals.sasaranGangsa)

  const jumlahPencapaian =
    toNumber(totals.pencapaianEmas) +
    toNumber(totals.pencapaianPerak) +
    toNumber(totals.pencapaianGangsa)

  // =========================================================
  // KEMASKINI DATA ACARA
  // =========================================================
  const updateAcara = (index, field, value) => {
    setAcaraList((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )
  }

  // =========================================================
  // TAMBAH ACARA
  // =========================================================
  const addAcara = () => {
    setAcaraList((prev) => [
      ...prev,
      createAcara(),
    ])
  }

  // =========================================================
  // BUANG ACARA
  // =========================================================
  const removeAcara = (index) => {
    if (acaraList.length === 1) {
      return
    }

    setAcaraList((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  // =========================================================
  // NEXT
  // =========================================================
  const handleNext = () => {
    onNext({
      acaraList,

      // Jumlah (diisi manual oleh pengguna)
      jumlahAcara: toNumber(totals.jumlahAcara),
      jumlahSasaran,
      jumlahPencapaian,

      sasaranEmas: toNumber(totals.sasaranEmas),
      sasaranPerak: toNumber(totals.sasaranPerak),
      sasaranGangsa: toNumber(totals.sasaranGangsa),

      pencapaianEmas: toNumber(totals.pencapaianEmas),
      pencapaianPerak: toNumber(totals.pencapaianPerak),
      pencapaianGangsa: toNumber(totals.pencapaianGangsa),
    })
  }

  return (
    <div className="ewcc-section">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="ewcc-section-header">
        <div>
          <div className="ewcc-section-kicker">
            BAHAGIAN 3
          </div>

          <h2>
            Sasaran &amp; Pencapaian
          </h2>

          <p>
            Rekodkan semua acara yang disertai serta
            bandingkan sasaran asal sebelum SUKMA dengan
            pencapaian sebenar selepas pertandingan.
          </p>
        </div>
      </div>

      {/* =====================================================
          NOTA PENTING
      ====================================================== */}
      <div
        style={{
          background: '#fff8e8',
          border: '1px solid #f1d48a',
          borderRadius: '10px',
          padding: '16px 18px',
          marginBottom: '20px',
        }}
      >
        <strong style={{ display: 'block', marginBottom: '6px' }}>
          Panduan Pengisian
        </strong>

        <div
          style={{
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#111827',
          }}
        >
          <div>
            • <strong>Sasaran</strong> ialah sasaran pingat
            yang telah ditetapkan sebelum SUKMA & PARA SUKMA.
          </div>

          <div>
            • <strong>Pingat / Kedudukan</strong> ialah
            keputusan sebenar selepas pertandingan.
          </div>

          <div>
            • Isi <strong>Jumlah Acara</strong>, <strong>Jumlah Sasaran</strong> dan
            <strong> Jumlah Pencapaian</strong> secara manual. Bagi acara
            berpasukan, satu pingat pasukan dikira sekali sahaja walaupun
            beberapa atlet disenaraikan.
          </div>

          <div>
            • Jika sesuatu acara tidak mempunyai sasaran
            asal tetapi berjaya memperoleh pingat, pilih
            <strong> TIADA SASARAN</strong> pada ruangan Sasaran.
          </div>

          <div>
            • Semua acara yang disertai perlu direkodkan,
            termasuk acara yang tidak mempunyai sasaran asal.
          </div>
        </div>
      </div>

      {/* =====================================================
          JUMLAH (DIISI MANUAL)
      ====================================================== */}
      <div className="sasaran-total-grid">

        <div className="sasaran-total-card">
          <div className="sasaran-total-title">
            Jumlah Acara
          </div>

          <div className="sasaran-total-medals single">
            <label>
              <span>ACARA</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="0"
                value={totals.jumlahAcara}
                onChange={(e) =>
                  updateTotal('jumlahAcara', e.target.value)
                }
              />
            </label>
          </div>
        </div>

        <div className="sasaran-total-card">
          <div className="sasaran-total-title">
            Jumlah Sasaran
            <strong>
              {jumlahSasaran}
            </strong>
          </div>

          <div className="sasaran-total-medals">
            {[
              ['sasaranEmas', 'EMAS'],
              ['sasaranPerak', 'PERAK'],
              ['sasaranGangsa', 'GANGSA'],
            ].map(([key, label]) => (
              <label key={key}>
                <span>{label}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="0"
                  value={totals[key]}
                  onChange={(e) =>
                    updateTotal(key, e.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="sasaran-total-card">
          <div className="sasaran-total-title">
            Jumlah Pencapaian
            <strong>
              {jumlahPencapaian}
            </strong>
          </div>

          <div className="sasaran-total-medals">
            {[
              ['pencapaianEmas', 'EMAS'],
              ['pencapaianPerak', 'PERAK'],
              ['pencapaianGangsa', 'GANGSA'],
            ].map(([key, label]) => (
              <label key={key}>
                <span>{label}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="0"
                  value={totals[key]}
                  onChange={(e) =>
                    updateTotal(key, e.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* =====================================================
          SENARAI ACARA
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
            padding: '18px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '17px',
              }}
            >
              Senarai Acara
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: '#111827',
                fontSize: '13px',
              }}
            >
              Masukkan semua acara yang disertai oleh
              pasukan / atlet.
            </p>
          </div>

          <button
            type="button"
            onClick={addAcara}
            className="ewcc-btn ewcc-btn-primary"
          >
            + Tambah Acara
          </button>
        </div>

        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '1200px',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#f8f9fa',
                }}
              >
                <th style={thStyle}>Bil.</th>
                <th style={thStyle}>Acara</th>
                <th style={thStyle}>Atlet</th>
                <th style={thStyle}>Sasaran</th>
                <th style={thStyle}>Pencapaian</th>
                <th style={thStyle}>Pingat / Kedudukan</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Keputusan / Masa</th>
                <th style={thStyle}>Tindakan</th>
              </tr>
            </thead>

            <tbody>
              {acaraList.map((item, index) => (
                <tr key={index}>

                  {/* BIL */}
                  <td style={tdStyle}>
                    {index + 1}
                  </td>

                  {/* ACARA */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={item.acara || ''}
                      onChange={(e) =>
                        updateAcara(
                          index,
                          'acara',
                          e.target.value
                        )
                      }
                      placeholder="Contoh: 100m"
                      style={inputStyle}
                    />
                  </td>

                  {/* ATLET */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={item.atlet || ''}
                      onChange={(e) =>
                        updateAcara(
                          index,
                          'atlet',
                          e.target.value
                        )
                      }
                      placeholder="Nama atlet / pasukan"
                      style={inputStyle}
                    />
                  </td>

                  {/* SASARAN */}
                  <td style={tdStyle}>
                    <select
                      value={item.sasaran || ''}
                      onChange={(e) =>
                        updateAcara(
                          index,
                          'sasaran',
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        Pilih
                      </option>

                      <option value="EMAS">
                        EMAS
                      </option>

                      <option value="PERAK">
                        PERAK
                      </option>

                      <option value="GANGSA">
                        GANGSA
                      </option>

                      <option value="TIADA SASARAN">
                        TIADA SASARAN
                      </option>
                    </select>
                  </td>

                  {/* PENCAPAIAN / PERINGKAT */}
                  <td style={tdStyle}>
                    <select
                      value={item.pencapaian || ''}
                      onChange={(e) =>
                        updateAcara(
                          index,
                          'pencapaian',
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        Pilih
                      </option>

                      <option value="AKHIR">
                        AKHIR
                      </option>

                      <option value="SEPARUH AKHIR">
                        SEPARUH AKHIR
                      </option>

                      <option value="SUKU AKHIR">
                        SUKU AKHIR
                      </option>

                      <option value="PUSINGAN 16">
                        PUSINGAN 16
                      </option>

                      <option value="PERINGKAT KUMPULAN">
                        PERINGKAT KUMPULAN
                      </option>
                    </select>
                  </td>

                  {/* PINGAT */}
                  <td style={tdStyle}>
                    <select
                      value={item.pingat || ''}
                      onChange={(e) =>
                        updateAcara(
                          index,
                          'pingat',
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        Tiada / Pilih
                      </option>

                      <option value="EMAS">
                        EMAS
                      </option>

                      <option value="PERAK">
                        PERAK
                      </option>

                      <option value="GANGSA">
                        GANGSA
                      </option>

                      <option value="KEEMPAT">
                        KEEMPAT
                      </option>

                      <option value="KELIMA">
                        KELIMA
                      </option>

                      <option value="TIADA">
                        TIADA
                      </option>
                    </select>
                  </td>

                  {/* STATUS */}
                  <td style={tdStyle}>
                    <select
                      value={item.status || ''}
                      onChange={(e) =>
                        updateAcara(
                          index,
                          'status',
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        Pilih
                      </option>

                      <option value="Capai">
                        Capai
                      </option>

                      <option value="Tidak Capai">
                        Tidak Capai
                      </option>
                    </select>
                  </td>

                  {/* KEPUTUSAN */}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={item.keputusan || ''}
                      onChange={(e) =>
                        updateAcara(
                          index,
                          'keputusan',
                          e.target.value
                        )
                      }
                      placeholder="Contoh: 10.42s"
                      style={inputStyle}
                    />
                  </td>

                  {/* TINDAKAN */}
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        removeAcara(index)
                      }
                      disabled={acaraList.length === 1}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color:
                          acaraList.length === 1
                            ? '#aaa'
                            : '#dc3545',
                        cursor:
                          acaraList.length === 1
                            ? 'not-allowed'
                            : 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Buang
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
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
          Simpan & Seterusnya →
        </button>

      </div>

    </div>
  )
}

// =========================================================
// TABLE STYLE
// =========================================================

const thStyle = {
  padding: '12px 10px',
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 700,
  color: '#111827',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'middle',
}

const inputStyle = {
  width: '100%',
  minWidth: '120px',
  padding: '9px 10px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  fontSize: '13px',
  background: '#fff',
  boxSizing: 'border-box',
}

export default Section3Sasaran
