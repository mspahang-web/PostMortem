import { useEffect, useState } from 'react'

const defaultFormData = {
  pengurusPasukan: '',
  ketuaJurulatih: '',
  jurulatih: [''],
  atletLelaki: '',
  atletWanita: '',
  tempohPersediaan: '',
  tempatPertandingan: '',
}

const getFormData = (data) => ({
  ...defaultFormData,
  ...(data && typeof data === 'object' ? data : {}),
  jurulatih:
    Array.isArray(data?.jurulatih) && data.jurulatih.length > 0
      ? data.jurulatih
      : [''],
})

function Section1MaklumatSukan({
  userProfile,
  initialData,
  onNext,
  onBack,
}) {
  const [formData, setFormData] = useState(() => getFormData(initialData))

  useEffect(() => {
    setFormData(getFormData(initialData))
  }, [initialData])

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateJurulatih = (index, value) => {
    setFormData((prev) => {
      const jurulatih = [...(Array.isArray(prev.jurulatih) ? prev.jurulatih : [''])]

      jurulatih[index] = value

      return {
        ...prev,
        jurulatih,
      }
    })
  }

  const tambahJurulatih = () => {
    setFormData((prev) => ({
      ...prev,
      jurulatih: [
        ...prev.jurulatih,
        '',
      ],
    }))
  }

  const buangJurulatih = (index) => {
    setFormData((prev) => ({
      ...prev,
      jurulatih: prev.jurulatih.filter(
        (_, i) => i !== index
      ),
    }))
  }

  const handleNext = () => {
    onNext(formData)
  }

  return (
    <section className="postmortem-form-card">

      {/* HEADER */}
      <div className="postmortem-form-header">

        <div>

          <span>BAHAGIAN 1</span>

          <h2>
            Maklumat Sukan
          </h2>

          <p>
            Sila lengkapkan maklumat asas pasukan
            dan persediaan.
          </p>

        </div>

      </div>

      {/* FORM */}
      <div className="postmortem-form-body">

        {/* PENGURUS */}
        <div className="postmortem-field">

          <label>
            Nama Pengurus Pasukan
          </label>

          <input
            type="text"
            value={formData.pengurusPasukan}
            onChange={(e) =>
              updateField(
                'pengurusPasukan',
                e.target.value
              )
            }
            placeholder="Masukkan nama pengurus pasukan"
          />

        </div>

        {/* KETUA JURULATIH */}
        <div className="postmortem-field">

          <label>
            Nama Ketua Jurulatih
          </label>

          <input
            type="text"
            value={formData.ketuaJurulatih}
            onChange={(e) =>
              updateField(
                'ketuaJurulatih',
                e.target.value
              )
            }
            placeholder="Masukkan nama ketua jurulatih"
          />

        </div>

        {/* JURULATIH */}
        <div className="postmortem-field full">

          <div className="field-label-row">

            <label>
              Jurulatih
            </label>

            <button
              type="button"
              className="add-coach-button"
              onClick={tambahJurulatih}
            >
              + Tambah Jurulatih
            </button>

          </div>

          <div className="coach-list">

            {formData.jurulatih.map(
              (jurulatih, index) => (

                <div
                  className="coach-input-row"
                  key={index}
                >

                  <span>
                    {index + 1}
                  </span>

                  <input
                    type="text"
                    value={jurulatih}
                    onChange={(e) =>
                      updateJurulatih(
                        index,
                        e.target.value
                      )
                    }
                    placeholder={
                      `Nama jurulatih ${index + 1}`
                    }
                  />

                  {formData.jurulatih.length > 1 && (

                    <button
                      type="button"
                      className="remove-coach-button"
                      onClick={() =>
                        buangJurulatih(index)
                      }
                    >
                      ×
                    </button>

                  )}

                </div>

              )
            )}

          </div>

        </div>

        {/* ATLET LELAKI */}
        <div className="postmortem-field">

          <label>
            Bilangan Atlet Lelaki
          </label>

          <input
            type="number"
            min="0"
            value={formData.atletLelaki}
            onChange={(e) =>
              updateField(
                'atletLelaki',
                e.target.value
              )
            }
            placeholder="0"
          />

        </div>

        {/* ATLET WANITA */}
        <div className="postmortem-field">

          <label>
            Bilangan Atlet Wanita
          </label>

          <input
            type="number"
            min="0"
            value={formData.atletWanita}
            onChange={(e) =>
              updateField(
                'atletWanita',
                e.target.value
              )
            }
            placeholder="0"
          />

        </div>

        {/* TEMPOH */}
        <div className="postmortem-field">

          <label>
            Tempoh Persediaan
          </label>

          <input
            type="text"
            value={formData.tempohPersediaan}
            onChange={(e) =>
              updateField(
                'tempohPersediaan',
                e.target.value
              )
            }
            placeholder="Contoh: 12 bulan"
          />

        </div>

        {/* TEMPAT */}
        <div className="postmortem-field">

          <label>
            Tempat Pertandingan
          </label>

          <input
            type="text"
            value={formData.tempatPertandingan}
            onChange={(e) =>
              updateField(
                'tempatPertandingan',
                e.target.value
              )
            }
            placeholder="Contoh: Selangor"
          />

        </div>

      </div>

      {/* FOOTER */}
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

    </section>
  )
}

export default Section1MaklumatSukan
