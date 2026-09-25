import { useEffect, useState } from 'react'

const defaultData = {
  kekuatanUtama: '',
  kelemahanUtama: '',
  kesilapanTeknikal: '',
  kesilapanTaktikal: '',
  strategiPertandingan: '',
  perbandinganLawan: '',
}

const questions = [
  {
    id: 'kekuatanUtama',
    number: '01',
    title: 'Kekuatan Utama Atlet / Pasukan',
    description:
      'Nyatakan kekuatan utama yang ditunjukkan oleh atlet atau pasukan sepanjang persediaan dan pertandingan.',
    placeholder:
      'Contoh: Atlet menunjukkan tahap kecergasan yang baik, disiplin tinggi dan konsisten dalam melaksanakan rutin latihan...',
  },
  {
    id: 'kelemahanUtama',
    number: '02',
    title: 'Kelemahan Utama',
    description:
      'Kenal pasti kelemahan utama atlet atau pasukan yang memberi kesan kepada prestasi.',
    placeholder:
      'Nyatakan kelemahan dari aspek prestasi, fizikal, mental, disiplin, komunikasi atau aspek lain yang berkaitan...',
  },
  {
    id: 'kesilapanTeknikal',
    number: '03',
    title: 'Kesilapan Teknikal yang Dikenal Pasti',
    description:
      'Huraikan kesilapan atau kelemahan teknikal yang berlaku semasa pertandingan.',
    placeholder:
      'Nyatakan kesilapan teknikal yang dikenal pasti serta situasi atau acara yang berkaitan...',
  },
  {
    id: 'kesilapanTaktikal',
    number: '04',
    title: 'Kesilapan Taktikal',
    description:
      'Huraikan kesilapan dari aspek taktikal yang berlaku semasa pertandingan.',
    placeholder:
      'Nyatakan kesilapan taktikal, keputusan yang dibuat semasa pertandingan dan kesannya terhadap prestasi...',
  },
  {
    id: 'strategiPertandingan',
    number: '05',
    title: 'Strategi Pertandingan yang Digunakan dan Tahap Keberkesanannya',
    description:
      'Terangkan strategi yang digunakan semasa pertandingan serta nilai keberkesanannya.',
    placeholder:
      'Huraikan strategi yang digunakan, sebab strategi tersebut dipilih dan sejauh mana strategi tersebut berkesan...',
  },
  {
    id: 'perbandinganLawan',
    number: '06',
    title: 'Perbandingan Prestasi dengan Atlet / Pasukan Lawan',
    description:
      'Bandingkan prestasi atlet atau pasukan dengan pihak lawan berdasarkan aspek yang berkaitan.',
    placeholder:
      'Huraikan perbandingan dari aspek teknikal, taktikal, fizikal, pengalaman, konsistensi atau faktor lain yang relevan...',
  },
]

function Section4Teknikal({
  initialData,
  onNext,
  onBack,
}) {
  const [formData, setFormData] = useState(
    initialData || defaultData
  )

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultData,
        ...initialData,
      })
    }
  }, [initialData])

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNext = () => {
    onNext(formData)
  }

  return (
    <section className="postmortem-form-card">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="postmortem-form-header">

        <div>
          <span>BAHAGIAN 4</span>

          <h2>
            Analisis Teknikal dan Taktikal
          </h2>

          <p>
            Huraikan prestasi atlet atau pasukan dari aspek
            teknikal, taktikal dan strategi pertandingan.
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
          Sila berikan analisis yang jelas berdasarkan
          pemerhatian semasa latihan dan pertandingan.
          Setiap ruang hendaklah mengandungi ulasan yang
          spesifik dan berkaitan dengan prestasi atlet atau
          pasukan.
        </p>
      </div>

      {/* =====================================================
          SIX ANALYSIS QUESTIONS
      ====================================================== */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >

        {questions.map((question) => (
          <div
            key={question.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              background: '#fff',
              overflow: 'hidden',
            }}
          >

            {/* QUESTION HEADER */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '18px 20px',
                borderBottom: '1px solid #e5e7eb',
                background: '#fafafa',
              }}
            >

              <div
                style={{
                  minWidth: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f1f1f1',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {question.number}
              </div>

              <div>
                <strong
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    marginBottom: '5px',
                  }}
                >
                  {question.title}
                </strong>

                <span
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#777',
                  }}
                >
                  {question.description}
                </span>
              </div>

            </div>

            {/* TEXTAREA */}
            <div
              style={{
                padding: '18px 20px 20px',
              }}
            >

              <textarea
                value={formData[question.id] || ''}
                onChange={(e) =>
                  updateField(
                    question.id,
                    e.target.value
                  )
                }
                placeholder={question.placeholder}
                rows={7}
                style={{
                  width: '100%',
                  minHeight: '170px',
                  padding: '14px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />

              <div
                style={{
                  marginTop: '7px',
                  fontSize: '12px',
                  color: '#999',
                  textAlign: 'right',
                }}
              >
                {(formData[question.id] || '').length} aksara
              </div>

            </div>

          </div>
        ))}

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

export default Section4Teknikal