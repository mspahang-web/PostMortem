import { useEffect, useState } from 'react'

const DEFAULT_DATA = {
  perkaraPerluDiperbaiki: ['', '', ''],
  bentukSokonganMajlisSukanPahang: '',
  cadanganUtamaSukma2028: '',
}

const Section12Rumusan = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState({
    ...DEFAULT_DATA,
    ...(initialData || {}),
  })

  useEffect(() => {
    setFormData({
      ...DEFAULT_DATA,
      ...(initialData || {}),
    })
  }, [initialData])

  const updatePerkara = (index, value) => {
    setFormData((current) => {
      const updated = [
        ...(current.perkaraPerluDiperbaiki || [
          '',
          '',
          '',
        ]),
      ]

      updated[index] = value

      return {
        ...current,
        perkaraPerluDiperbaiki: updated,
      }
    })
  }

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
          BAHAGIAN 12
        </div>

        <h2>
          Rumusan Pasukan
        </h2>

        <p>
          Rumusan keseluruhan pasukan berdasarkan
          penilaian dan pengalaman sepanjang
          persediaan serta penyertaan SUKMA.
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
          Sila nyatakan perkara utama yang perlu
          diperbaiki, bentuk sokongan yang diperlukan
          daripada Majlis Sukan Pahang serta cadangan
          utama bagi persediaan SUKMA 2028.
        </span>
      </div>

      {/* PERKARA 1 - 3 */}
      <div
        className="postmortem-card"
        style={{
          marginBottom: '24px',
        }}
      >

        <div
          style={{
            marginBottom: '22px',
          }}
        >

          <div
            style={{
              fontSize: '13px',
              color: '#64748b',
              fontWeight: 600,
              marginBottom: '5px',
            }}
          >
            PERKARA UTAMA
          </div>

          <h3
            style={{
              margin: 0,
              color: '#1e293b',
            }}
          >
            3 Perkara Utama Yang Perlu Diperbaiki
          </h3>

        </div>

        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="form-group"
            style={{
              marginBottom:
                index === 2 ? 0 : '22px',
            }}
          >

            <label>
              {index + 1}. Perkara yang perlu
              diperbaiki
            </label>

            <textarea
              rows={6}
              value={
                formData
                  .perkaraPerluDiperbaiki?.[
                  index
                ] || ''
              }
              onChange={(e) =>
                updatePerkara(
                  index,
                  e.target.value
                )
              }
              placeholder={
                index === 0
                  ? 'Nyatakan perkara utama pertama yang perlu diperbaiki.'
                  : index === 1
                    ? 'Nyatakan perkara utama kedua yang perlu diperbaiki.'
                    : 'Nyatakan perkara utama ketiga yang perlu diperbaiki.'
              }
            />

          </div>
        ))}

      </div>

      {/* SOKONGAN MSP */}
      <div
        className="postmortem-card"
        style={{
          marginBottom: '24px',
        }}
      >

        <div className="form-group">

          <label>
            Bentuk sokongan daripada Majlis Sukan
            Pahang
          </label>

          <textarea
            rows={8}
            value={
              formData
                .bentukSokonganMajlisSukanPahang ||
              ''
            }
            onChange={(e) =>
              handleChange(
                'bentukSokonganMajlisSukanPahang',
                e.target.value
              )
            }
            placeholder="Nyatakan bentuk sokongan yang diperlukan daripada Majlis Sukan Pahang seperti aspek program, latihan, pertandingan, peralatan, kewangan, sains sukan, perubatan atau sokongan lain yang berkaitan."
          />

        </div>

      </div>

      {/* CADANGAN SUKMA 2028 */}
      <div
        className="postmortem-card"
        style={{
          marginBottom: '24px',
        }}
      >

        <div className="form-group">

          <label>
            Cadangan utama persediaan SUKMA 2028
          </label>

          <textarea
            rows={10}
            value={
              formData
                .cadanganUtamaSukma2028 ||
              ''
            }
            onChange={(e) =>
              handleChange(
                'cadanganUtamaSukma2028',
                e.target.value
              )
            }
            placeholder="Nyatakan cadangan utama dan keutamaan pasukan bagi memastikan persediaan SUKMA 2028 dapat dilaksanakan dengan lebih terancang."
          />

        </div>

      </div>

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

export default Section12Rumusan