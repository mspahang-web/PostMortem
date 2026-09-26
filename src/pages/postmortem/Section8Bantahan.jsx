import { useState } from 'react'

const createEmptyProtest = () => ({
  acaraTarikh: '',
  asasBantahan: '',
  pihakMenerima: '',
  tindakanPasukan: '',
  keputusanRasmi: '',
  kesanAtletPasukan: '',
  dokumenBukti: '',
})

const Section8Bantahan = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [protests, setProtests] = useState(
    Array.isArray(initialData) && initialData.length > 0
      ? initialData
      : [createEmptyProtest()]
  )


  const updateProtest = (
    index,
    field,
    value
  ) => {
    setProtests((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )
  }

  const addProtest = () => {
    setProtests((current) => [
      ...current,
      createEmptyProtest(),
    ])
  }

  const removeProtest = (index) => {
    setProtests((current) => {
      if (current.length === 1) {
        return [createEmptyProtest()]
      }

      return current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    })
  }

  const handleNext = () => {
    onNext(protests)
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
          BAHAGIAN 8
        </div>

        <h2>
          Bantahan / Protes Rasmi
        </h2>

        <p>
          Rekodkan semua bantahan atau protes rasmi
          yang telah dibuat oleh pasukan sepanjang
          kejohanan SUKMA.
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
          Sila rekodkan setiap bantahan atau protes
          secara berasingan termasuk asas bantahan,
          pihak yang menerima, tindakan pasukan,
          keputusan rasmi dan kesan kepada atlet
          atau pasukan.
        </span>
      </div>

      {/* PROTEST LIST */}
      {protests.map((protest, index) => (
        <div
          key={index}
          className="postmortem-card"
          style={{
            marginBottom: '24px',
          }}
        >

          {/* CARD HEADER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                REKOD
              </div>

              <h3
                style={{
                  margin: 0,
                }}
              >
                Bantahan / Protes #{index + 1}
              </h3>
            </div>

            {protests.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  removeProtest(index)
                }
                style={{
                  border: 'none',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Padam
              </button>
            )}
          </div>

          {/* ACARA / TARIKH */}
          <div className="form-group">
            <label>
              Acara / Tarikh
            </label>

            <input
              type="text"
              value={protest.acaraTarikh || ''}
              onChange={(e) =>
                updateProtest(
                  index,
                  'acaraTarikh',
                  e.target.value
                )
              }
              placeholder="Contoh: 100m Lelaki / 15 Ogos 2026"
            />
          </div>

          {/* ASAS BANTAHAN */}
          <div className="form-group">
            <label>
              Asas Bantahan
            </label>

            <textarea
              rows={5}
              value={protest.asasBantahan || ''}
              onChange={(e) =>
                updateProtest(
                  index,
                  'asasBantahan',
                  e.target.value
                )
              }
              placeholder="Nyatakan sebab atau asas bantahan yang dikemukakan."
            />
          </div>

          {/* PIHAK MENERIMA */}
          <div className="form-group">
            <label>
              Pihak Menerima
            </label>

            <input
              type="text"
              value={protest.pihakMenerima || ''}
              onChange={(e) =>
                updateProtest(
                  index,
                  'pihakMenerima',
                  e.target.value
                )
              }
              placeholder="Contoh: Juri Teknikal / Ketua Pengadil / Urusetia Pertandingan"
            />
          </div>

          {/* TINDAKAN PASUKAN */}
          <div className="form-group">
            <label>
              Tindakan Pasukan
            </label>

            <textarea
              rows={5}
              value={protest.tindakanPasukan || ''}
              onChange={(e) =>
                updateProtest(
                  index,
                  'tindakanPasukan',
                  e.target.value
                )
              }
              placeholder="Nyatakan tindakan yang telah diambil oleh pasukan selepas bantahan dibuat."
            />
          </div>

          {/* KEPUTUSAN RASMI */}
          <div className="form-group">
            <label>
              Keputusan Rasmi
            </label>

            <textarea
              rows={5}
              value={protest.keputusanRasmi || ''}
              onChange={(e) =>
                updateProtest(
                  index,
                  'keputusanRasmi',
                  e.target.value
                )
              }
              placeholder="Nyatakan keputusan rasmi daripada pihak penganjur, juri atau pengadil."
            />
          </div>

          {/* KESAN */}
          <div className="form-group">
            <label>
              Kesan Kepada Atlet / Pasukan
            </label>

            <textarea
              rows={5}
              value={
                protest.kesanAtletPasukan || ''
              }
              onChange={(e) =>
                updateProtest(
                  index,
                  'kesanAtletPasukan',
                  e.target.value
                )
              }
              placeholder="Nyatakan kesan bantahan atau keputusan tersebut kepada atlet atau pasukan."
            />
          </div>

          {/* DOKUMEN / BUKTI */}
          <div className="form-group">
            <label>
              Dokumen / Bukti Sokongan
            </label>

            <textarea
              rows={5}
              value={protest.dokumenBukti || ''}
              onChange={(e) =>
                updateProtest(
                  index,
                  'dokumenBukti',
                  e.target.value
                )
              }
              placeholder="Nyatakan dokumen, gambar, video, surat atau bukti lain yang berkaitan."
            />
          </div>

        </div>
      ))}

      {/* TAMBAH PROTES */}
      <div
        style={{
          marginTop: '8px',
          marginBottom: '32px',
        }}
      >
        <button
          type="button"
          onClick={addProtest}
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
          + Tambah Bantahan / Protes
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

export default Section8Bantahan