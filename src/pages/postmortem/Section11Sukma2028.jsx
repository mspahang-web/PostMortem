import { useState } from 'react'

const DEFAULT_ITEMS = [
  {
    key: 'atletDikekalkan',
    label: 'Atlet dikekalkan',
    placeholder:
      'Nyatakan atlet yang dicadangkan untuk dikekalkan serta alasan atau pertimbangan berkaitan.',
  },
  {
    key: 'atletDinaikkanProgramPrestasiTinggi',
    label: 'Atlet dinaikkan ke program prestasi tinggi',
    placeholder:
      'Nyatakan atlet yang dicadangkan untuk dinaikkan ke program prestasi tinggi serta justifikasi.',
  },
  {
    key: 'atletBaharuDiberiPeluang',
    label: 'Atlet baharu yang perlu diberi peluang',
    placeholder:
      'Nyatakan cadangan atlet baharu yang wajar diberi peluang dalam program persediaan SUKMA 2028.',
  },
  {
    key: 'atletPerluIntervensi',
    label: 'Atlet yang memerlukan intervensi',
    placeholder:
      'Nyatakan atlet yang memerlukan intervensi serta bentuk intervensi yang dicadangkan.',
  },
  {
    key: 'keperluanJurulatih',
    label: 'Keperluan jurulatih',
    placeholder:
      'Nyatakan keperluan jurulatih termasuk bilangan, kepakaran atau keperluan tambahan.',
  },
  {
    key: 'keperluanKemLatihan',
    label: 'Keperluan kem latihan',
    placeholder:
      'Nyatakan cadangan berkaitan kem latihan, lokasi, tempoh atau keperluan khusus.',
  },
  {
    key: 'keperluanPertandingan',
    label: 'Keperluan pertandingan',
    placeholder:
      'Nyatakan cadangan pertandingan atau pendedahan pertandingan yang diperlukan.',
  },
  {
    key: 'keperluanPeralatan',
    label: 'Keperluan peralatan',
    placeholder:
      'Nyatakan keperluan peralatan bagi persediaan SUKMA 2028.',
  },
  {
    key: 'keperluanSainsSukan',
    label: 'Keperluan sains sukan',
    placeholder:
      'Nyatakan keperluan sokongan sains sukan yang diperlukan.',
  },
  {
    key: 'keperluanPerubatanRehabilitasi',
    label: 'Keperluan perubatan / rehabilitasi',
    placeholder:
      'Nyatakan keperluan perubatan, fisioterapi, rehabilitasi atau sokongan berkaitan.',
  },
]

const createDefaultData = () => {
  return DEFAULT_ITEMS.reduce(
    (result, item) => {
      result[item.key] = ''
      return result
    },
    {}
  )
}

const Section11Sukma2028 = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState(() => ({
    ...createDefaultData(),
    ...(initialData || {}),
  }))


  const handleChange = (key, value) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
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
          BAHAGIAN 11
        </div>

        <h2>
          Cadangan Program SUKMA 2028
        </h2>

        <p>
          Cadangan keperluan dan perancangan
          pasukan bagi persediaan menghadapi
          SUKMA 2028.
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
          Sila nyatakan cadangan berdasarkan
          penilaian pasukan selepas SUKMA serta
          keperluan persediaan untuk SUKMA 2028.
        </span>
      </div>

      {/* ITEMS */}
      {DEFAULT_ITEMS.map((item, index) => (
        <div
          key={item.key}
          className="postmortem-card"
          style={{
            marginBottom: '20px',
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              marginBottom: '14px',
            }}
          >

            <div
              style={{
                width: '34px',
                height: '34px',
                minWidth: '34px',
                borderRadius: '50%',
                background: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {index + 1}
            </div>

            <div>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: '17px',
                  color: '#1e293b',
                }}
              >
                {item.label}
              </h3>
            </div>

          </div>

          <div className="form-group">

            <textarea
              rows={6}
              value={formData[item.key] || ''}
              onChange={(e) =>
                handleChange(
                  item.key,
                  e.target.value
                )
              }
              placeholder={item.placeholder}
            />

          </div>

        </div>
      ))}

      {/* NAVIGATION */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          paddingTop: '24px',
          marginTop: '8px',
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
          Simpan & Seterusnya →
        </button>

      </div>

    </div>
  )
}

export default Section11Sukma2028