import { useState } from 'react'

const createInitialFactors = (count) =>
  Array.from({ length: count }, () => '')

const defaultData = {
  faktorKejayaan: createInitialFactors(3),
  faktorKegagalan: createInitialFactors(3),
}

function Section6Faktor({
  initialData,
  onNext,
  onBack,
}) {
  const [faktorKejayaan, setFaktorKejayaan] = useState(
    initialData?.faktorKejayaan?.length
      ? initialData.faktorKejayaan
      : defaultData.faktorKejayaan
  )

  const [faktorKegagalan, setFaktorKegagalan] = useState(
    initialData?.faktorKegagalan?.length
      ? initialData.faktorKegagalan
      : defaultData.faktorKegagalan
  )


  // =========================================================
  // UPDATE FAKTOR KEJAYAAN
  // =========================================================
  const updateKejayaan = (index, value) => {
    setFaktorKejayaan((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  // =========================================================
  // UPDATE FAKTOR KEGAGALAN
  // =========================================================
  const updateKegagalan = (index, value) => {
    setFaktorKegagalan((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  // =========================================================
  // NEXT
  // =========================================================
  const handleNext = () => {
    onNext({
      faktorKejayaan,
      faktorKegagalan,
    })
  }

  return (
    <section className="postmortem-form-card">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="postmortem-form-header">

        <div>
          <span>BAHAGIAN 6</span>

          <h2>
            Faktor Kejayaan / Kegagalan
          </h2>

          <p>
            Kenal pasti tiga faktor utama yang menyumbang
            kepada kejayaan serta tiga faktor utama yang
            menyebabkan kegagalan atau sasaran tidak dicapai.
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
          Sila nyatakan faktor yang paling signifikan
          berdasarkan pengalaman sepanjang tempoh persediaan
          dan pertandingan. Huraikan faktor secara ringkas
          tetapi jelas.
        </p>
      </div>

      {/* =====================================================
          FAKTOR KEJAYAAN
      ====================================================== */}
      <div
        style={{
          marginBottom: '28px',
        }}
      >

        {/* SECTION HEADING */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            marginBottom: '16px',
          }}
        >

          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#eef8f0',
              color: '#238636',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ✓
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                color: '#222',
              }}
            >
              Faktor Kejayaan
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: '#777',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            >
              Nyatakan tiga faktor utama yang menyumbang
              kepada kejayaan atlet atau pasukan.
            </p>
          </div>

        </div>

        {/* SUCCESS FACTORS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >

          {faktorKejayaan.map((value, index) => (
            <div
              key={`kejayaan-${index}`}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                background: '#fff',
                padding: '16px',
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >

                {/* NUMBER */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#f1f1f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#555',
                    flexShrink: 0,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* TEXTAREA */}
                <div
                  style={{
                    flex: 1,
                  }}
                >

                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#444',
                      marginBottom: '7px',
                    }}
                  >
                    Faktor Kejayaan {index + 1}
                  </label>

                  <textarea
                    value={value}
                    onChange={(e) =>
                      updateKejayaan(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="Huraikan faktor kejayaan..."
                    rows={4}
                    style={{
                      width: '100%',
                      minHeight: '110px',
                      padding: '12px 13px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '7px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />

                  <div
                    style={{
                      marginTop: '5px',
                      fontSize: '11px',
                      color: '#999',
                      textAlign: 'right',
                    }}
                  >
                    {value.length} aksara
                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

      {/* =====================================================
          FAKTOR KEGAGALAN
      ====================================================== */}
      <div>

        {/* SECTION HEADING */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            marginBottom: '16px',
          }}
        >

          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#fff4f4',
              color: '#c62828',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            !
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                color: '#222',
              }}
            >
              Faktor Kegagalan
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: '#777',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            >
              Nyatakan tiga faktor utama yang menyebabkan
              kegagalan, sasaran tidak dicapai atau prestasi
              terjejas.
            </p>
          </div>

        </div>

        {/* FAILURE FACTORS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >

          {faktorKegagalan.map((value, index) => (
            <div
              key={`kegagalan-${index}`}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                background: '#fff',
                padding: '16px',
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >

                {/* NUMBER */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#f1f1f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#555',
                    flexShrink: 0,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* TEXTAREA */}
                <div
                  style={{
                    flex: 1,
                  }}
                >

                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#444',
                      marginBottom: '7px',
                    }}
                  >
                    Faktor Kegagalan {index + 1}
                  </label>

                  <textarea
                    value={value}
                    onChange={(e) =>
                      updateKegagalan(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="Huraikan faktor kegagalan atau faktor yang menyebabkan sasaran tidak dicapai..."
                    rows={4}
                    style={{
                      width: '100%',
                      minHeight: '110px',
                      padding: '12px 13px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '7px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />

                  <div
                    style={{
                      marginTop: '5px',
                      fontSize: '11px',
                      color: '#999',
                      textAlign: 'right',
                    }}
                  >
                    {value.length} aksara
                  </div>

                </div>

              </div>

            </div>
          ))}

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

export default Section6Faktor