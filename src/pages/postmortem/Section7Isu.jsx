import { useEffect, useState } from 'react'

const categoryOptions = [
  'Teknikal Pertandingan',
  'Juri/Wasit',
  'Penganjur',
  'Venue/Fasiliti',
  'Peralatan',
  'Keputusan Pertandingan',
  'Bantahan/Protes',
  'Penjadualan',
  'Keselamatan',
  'Kebajikan',
  'Lain-lain',
]

const createInitialIssue = () => ({
  kategori: '',
  tarikhAcara: '',
  isuPermasalahan: '',
  tindakanBantahan: '',
  keputusanRasmi: '',
  kesanAtletPasukan: '',
  cadangan: '',
})

function Section7Isu({
  initialData,
  onNext,
  onBack,
}) {
  const [issues, setIssues] = useState(
    Array.isArray(initialData) && initialData.length
      ? initialData
      : [createInitialIssue()]
  )

  useEffect(() => {
    if (Array.isArray(initialData) && initialData.length) {
      setIssues(initialData)
    }
  }, [initialData])

  // =========================================================
  // UPDATE ISSUE
  // =========================================================
  const updateIssue = (index, field, value) => {
    setIssues((prev) =>
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
  // TAMBAH ISU
  // =========================================================
  const tambahIsu = () => {
    setIssues((prev) => [
      ...prev,
      createInitialIssue(),
    ])
  }

  // =========================================================
  // BUANG ISU
  // =========================================================
  const buangIsu = (index) => {
    if (issues.length === 1) {
      return
    }

    setIssues((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  // =========================================================
  // NEXT
  // =========================================================
  const handleNext = () => {
    onNext(issues)
  }

  return (
    <section className="postmortem-form-card">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="postmortem-form-header">

        <div>
          <span>BAHAGIAN 7</span>

          <h2>
            Isu Teknikal Pertandingan, Juri / Wasit &amp; Penganjur
          </h2>

          <p>
            Rekodkan sebarang isu atau permasalahan yang
            berlaku sepanjang pertandingan serta tindakan,
            keputusan dan cadangan penambahbaikan.
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
          Rekodkan setiap isu secara berasingan. Pilih
          kategori yang paling sesuai bagi setiap isu dan
          nyatakan tindakan atau bantahan yang telah dibuat,
          keputusan rasmi serta kesannya kepada atlet atau
          pasukan.
        </p>
      </div>

      {/* =====================================================
          ISSUE TABLE
      ====================================================== */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#fff',
        }}
      >

        {/* ===================================================
            TABLE HEADER / ACTION
        ==================================================== */}
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
              Senarai Isu Pertandingan
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: '#777',
                fontSize: '13px',
              }}
            >
              {issues.length}{' '}
              {issues.length === 1
                ? 'isu direkodkan'
                : 'isu direkodkan'}
            </p>
          </div>

          <button
            type="button"
            className="add-coach-button"
            onClick={tambahIsu}
          >
            + Tambah Isu
          </button>

        </div>

        {/* ===================================================
            RESPONSIVE TABLE
        ==================================================== */}
        <div
          style={{
            overflowX: 'auto',
          }}
        >

          <table
            style={{
              width: '100%',
              minWidth: '1450px',
              borderCollapse: 'collapse',
            }}
          >

            {/* =================================================
                HEADER
            ================================================== */}
            <thead>
              <tr
                style={{
                  background: '#f7f7f7',
                }}
              >

                <th style={thStyle}>
                  Bil.
                </th>

                <th
                  style={{
                    ...thStyle,
                    minWidth: '180px',
                  }}
                >
                  Kategori
                </th>

                <th
                  style={{
                    ...thStyle,
                    minWidth: '190px',
                  }}
                >
                  Tarikh / Acara
                </th>

                <th
                  style={{
                    ...thStyle,
                    minWidth: '280px',
                  }}
                >
                  Isu / Permasalahan
                </th>

                <th
                  style={{
                    ...thStyle,
                    minWidth: '250px',
                  }}
                >
                  Tindakan / Bantahan
                </th>

                <th
                  style={{
                    ...thStyle,
                    minWidth: '280px',
                  }}
                >
                  Keputusan Penganjur / Juri / Wasit
                </th>

                <th
                  style={{
                    ...thStyle,
                    minWidth: '250px',
                  }}
                >
                  Kesan Kepada Atlet / Pasukan
                </th>

                <th
                  style={{
                    ...thStyle,
                    minWidth: '250px',
                  }}
                >
                  Cadangan
                </th>

                <th
                  style={{
                    ...thStyle,
                    width: '80px',
                  }}
                >
                  Tindakan
                </th>

              </tr>
            </thead>

            {/* =================================================
                BODY
            ================================================== */}
            <tbody>

              {issues.map((issue, index) => (
                <tr key={index}>

                  {/* BIL */}
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </td>

                  {/* KATEGORI */}
                  <td style={tdStyle}>
                    <select
                      value={issue.kategori || ''}
                      onChange={(e) =>
                        updateIssue(
                          index,
                          'kategori',
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        -- Pilih Kategori --
                      </option>

                      {categoryOptions.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        )
                      )}
                    </select>
                  </td>

                  {/* TARIKH / ACARA */}
                  <td style={tdStyle}>
                    <textarea
                      value={
                        issue.tarikhAcara || ''
                      }
                      onChange={(e) =>
                        updateIssue(
                          index,
                          'tarikhAcara',
                          e.target.value
                        )
                      }
                      placeholder={
                        'Contoh:\n12 Sept 2026\n100m Lelaki'
                      }
                      rows={3}
                      style={textareaStyle}
                    />
                  </td>

                  {/* ISU / PERMASALAHAN */}
                  <td style={tdStyle}>
                    <textarea
                      value={
                        issue.isuPermasalahan || ''
                      }
                      onChange={(e) =>
                        updateIssue(
                          index,
                          'isuPermasalahan',
                          e.target.value
                        )
                      }
                      placeholder="Nyatakan isu atau permasalahan yang berlaku..."
                      rows={4}
                      style={textareaStyle}
                    />
                  </td>

                  {/* TINDAKAN / BANTAHAN */}
                  <td style={tdStyle}>
                    <textarea
                      value={
                        issue.tindakanBantahan || ''
                      }
                      onChange={(e) =>
                        updateIssue(
                          index,
                          'tindakanBantahan',
                          e.target.value
                        )
                      }
                      placeholder="Nyatakan tindakan, bantahan atau protes yang telah dibuat..."
                      rows={4}
                      style={textareaStyle}
                    />
                  </td>

                  {/* KEPUTUSAN RASMI */}
                  <td style={tdStyle}>
                    <textarea
                      value={
                        issue.keputusanRasmi || ''
                      }
                      onChange={(e) =>
                        updateIssue(
                          index,
                          'keputusanRasmi',
                          e.target.value
                        )
                      }
                      placeholder="Nyatakan keputusan rasmi penganjur, juri atau wasit..."
                      rows={4}
                      style={textareaStyle}
                    />
                  </td>

                  {/* KESAN */}
                  <td style={tdStyle}>
                    <textarea
                      value={
                        issue.kesanAtletPasukan || ''
                      }
                      onChange={(e) =>
                        updateIssue(
                          index,
                          'kesanAtletPasukan',
                          e.target.value
                        )
                      }
                      placeholder="Nyatakan kesan kepada atlet atau pasukan..."
                      rows={4}
                      style={textareaStyle}
                    />
                  </td>

                  {/* CADANGAN */}
                  <td style={tdStyle}>
                    <textarea
                      value={
                        issue.cadangan || ''
                      }
                      onChange={(e) =>
                        updateIssue(
                          index,
                          'cadangan',
                          e.target.value
                        )
                      }
                      placeholder="Nyatakan cadangan penambahbaikan..."
                      rows={4}
                      style={textareaStyle}
                    />
                  </td>

                  {/* BUANG */}
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        buangIsu(index)
                      }
                      disabled={issues.length === 1}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color:
                          issues.length === 1
                            ? '#aaa'
                            : '#dc3545',
                        cursor:
                          issues.length === 1
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
  textAlign: 'left',
  verticalAlign: 'middle',
  whiteSpace: 'normal',
}

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
  borderRight: '1px solid #e5e7eb',
  verticalAlign: 'top',
}

const inputStyle = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  fontSize: '13px',
  background: '#fff',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const textareaStyle = {
  width: '100%',
  minHeight: '85px',
  padding: '9px 10px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  fontSize: '13px',
  lineHeight: '1.5',
  resize: 'vertical',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export default Section7Isu