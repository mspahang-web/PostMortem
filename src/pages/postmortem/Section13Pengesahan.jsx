import { useState } from 'react'

const DEFAULT_DATA = {
  pengesahan: false,
  namaPengurusJurulatih: '',
  tarikh: '',
  disahkanOlehPenyelaras: '',
}

const Section13Pengesahan = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState({
    ...DEFAULT_DATA,
    ...(initialData || {}),
  })


  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleNext = () => {
    onNext(formData)
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
          BAHAGIAN 13
        </div>

        <h2>
          Pengesahan
        </h2>

        <p>
          Pengesahan bahawa maklumat yang
          dikemukakan dalam laporan post-mortem
          adalah benar dan telah disemak oleh
          pihak pasukan.
        </p>

      </div>

      {/* DECLARATION */}
      <div
        className="postmortem-card"
        style={{
          marginBottom: '24px',
        }}
      >

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '22px',
            lineHeight: '1.7',
            color: '#334155',
          }}
        >

          <div
            style={{
              fontSize: '13px',
              color: '#64748b',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            PERNYATAAN PENGESAHAN
          </div>

          <p
            style={{
              margin: 0,
            }}
          >
            Saya mengesahkan bahawa semua maklumat
            yang dinyatakan dalam laporan
            Post-Mortem SUKMA ini adalah benar,
            tepat dan telah disemak oleh pihak
            pasukan untuk tujuan penilaian serta
            perancangan penambahbaikan program.
          </p>

        </div>

      </div>

      {/* CHECKBOX */}
      <div
        className="postmortem-card"
        style={{
          marginBottom: '24px',
        }}
      >

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
            lineHeight: '1.6',
          }}
        >

          <input
            type="checkbox"
            checked={
              Boolean(formData.pengesahan)
            }
            onChange={(e) =>
              handleChange(
                'pengesahan',
                e.target.checked
              )
            }
            style={{
              width: '18px',
              height: '18px',
              marginTop: '3px',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          />

          <span
            style={{
              color: '#334155',
              fontWeight: 500,
            }}
          >
            Saya mengesahkan bahawa maklumat yang
            diberikan dalam laporan ini adalah benar
            berdasarkan pengetahuan dan rekod
            pasukan.
          </span>

        </label>

      </div>

      {/* NAME */}
      <div
        className="postmortem-card"
        style={{
          marginBottom: '24px',
        }}
      >

        <div className="form-group">

          <label>
            Nama Pengurus / Jurulatih
          </label>

          <input
            type="text"
            value={
              formData.namaPengurusJurulatih ||
              ''
            }
            onChange={(e) =>
              handleChange(
                'namaPengurusJurulatih',
                e.target.value
              )
            }
            placeholder="Masukkan nama Pengurus atau Jurulatih yang membuat pengesahan."
          />

        </div>

      </div>

      {/* DATE */}
      <div
        className="postmortem-card"
        style={{
          marginBottom: '24px',
        }}
      >

        <div className="form-group">

          <label>
            Tarikh
          </label>

          <input
            type="date"
            value={
              formData.tarikh || ''
            }
            onChange={(e) =>
              handleChange(
                'tarikh',
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* COORDINATOR */}
      <div
        className="postmortem-card"
        style={{
          marginBottom: '24px',
        }}
      >

        <div className="form-group">

          <label>
            Disahkan oleh Penyelaras Pasukan
          </label>

          <input
            type="text"
            value={
              formData.disahkanOlehPenyelaras ||
              ''
            }
            onChange={(e) =>
              handleChange(
                'disahkanOlehPenyelaras',
                e.target.value
              )
            }
            placeholder="Masukkan nama Penyelaras Pasukan."
          />

        </div>

      </div>

      {/* FINAL NOTICE */}
      <div
        className="section-info-box"
        style={{
          marginBottom: '32px',
        }}
      >

        <strong>Nota:</strong>

        <span>
          Selepas bahagian ini disimpan, anda akan
          dibawa ke halaman semakan akhir laporan
          sebelum laporan dihantar.
        </span>

      </div>

      {/* NAVIGATION */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          paddingTop: '24px',
          borderTop:
            '1px solid #e5e7eb',
        }}
      >

        <button
          type="button"
          onClick={onBack}
          style={{
            border:
              '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            padding: '12px 22px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ← Kembali
        </button>

        <button
          type="button"
          onClick={handleNext}
          style={{
            border: 'none',
            background: '#f97316',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Simpan & Semak Laporan →
        </button>

      </div>

    </div>
  )
}

export default Section13Pengesahan