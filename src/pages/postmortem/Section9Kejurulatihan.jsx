import { useState } from 'react'

const DEFAULT_DATA = {
  keberkesananBarisanKejurulatihan: '',
  bilanganJurulatihMencukupi: '',
  kepakaranJurulatihBersesuaian: '',
  cadanganBerkaitanJurulatih: '',
}

const Section9Kejurulatihan = ({
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
          BAHAGIAN 9
        </div>

        <h2>
          Penilaian Barisan Kejurulatihan
        </h2>

        <p>
          Penilaian terhadap barisan kejurulatihan
          berdasarkan program persediaan dan
          pertandingan SUKMA.
        </p>
      </div>

      {/* FIELD 1 */}
      <div className="postmortem-card">
        <div className="form-group">

          <label>
            Keberkesanan barisan kejurulatihan
          </label>

          <textarea
            rows={7}
            value={
              formData.keberkesananBarisanKejurulatihan
            }
            onChange={(e) =>
              handleChange(
                'keberkesananBarisanKejurulatihan',
                e.target.value
              )
            }
            placeholder="Sila nyatakan penilaian terhadap keberkesanan barisan kejurulatihan."
          />

        </div>
      </div>

      {/* FIELD 2 */}
      <div className="postmortem-card">
        <div className="form-group">

          <label>
            Adakah bilangan jurulatih mencukupi?
          </label>

          <textarea
            rows={7}
            value={
              formData.bilanganJurulatihMencukupi
            }
            onChange={(e) =>
              handleChange(
                'bilanganJurulatihMencukupi',
                e.target.value
              )
            }
            placeholder="Sila nyatakan penilaian berkaitan kecukupan bilangan jurulatih."
          />

        </div>
      </div>

      {/* FIELD 3 */}
      <div className="postmortem-card">
        <div className="form-group">

          <label>
            Adakah kepakaran jurulatih bersesuaian
            dengan keperluan sukan?
          </label>

          <textarea
            rows={7}
            value={
              formData.kepakaranJurulatihBersesuaian
            }
            onChange={(e) =>
              handleChange(
                'kepakaranJurulatihBersesuaian',
                e.target.value
              )
            }
            placeholder="Sila nyatakan penilaian berkaitan kesesuaian kepakaran jurulatih dengan keperluan sukan."
          />

        </div>
      </div>

      {/* FIELD 4 */}
      <div className="postmortem-card">
        <div className="form-group">

          <label>
            Cadangan berkaitan jurulatih
          </label>

          <textarea
            rows={7}
            value={
              formData.cadanganBerkaitanJurulatih
            }
            onChange={(e) =>
              handleChange(
                'cadanganBerkaitanJurulatih',
                e.target.value
              )
            }
            placeholder="Sila nyatakan cadangan berkaitan jurulatih untuk penambahbaikan dan persediaan akan datang."
          />

        </div>
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

export default Section9Kejurulatihan