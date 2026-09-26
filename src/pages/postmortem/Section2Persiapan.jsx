import { useState } from 'react'

const componentDefinitions = [
  {
    key: 'latihanPusat',
    label: 'Latihan Pusat',
  },
  {
    key: 'kejohanan',
    label: 'Kejohanan',
  },
  {
    key: 'ujianPenilaiPrestasi',
    label: 'Ujian/Penilai Prestasi',
  },
  {
    key: 'programSainsSukan',
    label: 'Program Sains Sukan',
  },
  {
    key: 'programPemulihanRehabilitasi',
    label: 'Program Pemulihan / Rehabilitasi',
  },
]

const createRow = () => ({
  bilanganAtlet: '',
  lokasi: '',
  tempoh: '',
  pencapaian: '',
  catatan: '',
})

const createDefaultData = () => ({
  latihanPusat: [createRow()],
  kejohanan: [createRow()],
  ujianPenilaiPrestasi: [createRow()],
  programSainsSukan: [createRow()],
  programPemulihanRehabilitasi: [createRow()],
})

function getInitialFormData(initialData) {
  if (!initialData) {
    return createDefaultData()
  }

  /*
   * Sokong format baharu:
   * {
   *   latihanPusat: [...],
   *   kejohanan: [...],
   *   ...
   * }
   */
  if (
    !Array.isArray(initialData) &&
    typeof initialData === 'object'
  ) {
    return {
      ...createDefaultData(),
      ...initialData,

      latihanPusat:
        Array.isArray(initialData.latihanPusat) &&
        initialData.latihanPusat.length > 0
          ? initialData.latihanPusat
          : [createRow()],

      kejohanan:
        Array.isArray(initialData.kejohanan) &&
        initialData.kejohanan.length > 0
          ? initialData.kejohanan
          : [createRow()],

      ujianPenilaiPrestasi:
        Array.isArray(
          initialData.ujianPenilaiPrestasi
        ) &&
        initialData.ujianPenilaiPrestasi.length > 0
          ? initialData.ujianPenilaiPrestasi
          : [createRow()],

      programSainsSukan:
        Array.isArray(initialData.programSainsSukan) &&
        initialData.programSainsSukan.length > 0
          ? initialData.programSainsSukan
          : [createRow()],

      programPemulihanRehabilitasi:
        Array.isArray(
          initialData.programPemulihanRehabilitasi
        ) &&
        initialData.programPemulihanRehabilitasi.length > 0
          ? initialData.programPemulihanRehabilitasi
          : [createRow()],
    }
  }

  /*
   * Sokongan untuk draft lama yang masih berbentuk:
   *
   * [
   *   {
   *     komponen: 'Latihan Pusat',
   *     ...
   *   }
   * ]
   *
   * Data lama tidak dibuang.
   */
  if (Array.isArray(initialData)) {
    const converted = createDefaultData()

    componentDefinitions.forEach((component) => {
      const oldRows = initialData.filter(
        (item) =>
          item?.komponen === component.label
      )

      if (oldRows.length > 0) {
        converted[component.key] = oldRows.map(
          (item) => ({
            bilanganAtlet:
              item.bilanganAtlet || '',
            lokasi:
              item.lokasi || '',
            tempoh:
              item.tempoh || '',
            pencapaian:
              item.pencapaian || '',
            catatan:
              item.catatan || '',
          })
        )
      }
    })

    return converted
  }

  return createDefaultData()
}

function Section2Persiapan({
  initialData,
  onNext,
  onBack,
}) {
  const [formData, setFormData] = useState(() =>
    getInitialFormData(initialData)
  )

  const updateRow = (
    componentKey,
    rowIndex,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [componentKey]: prev[
        componentKey
      ].map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              [field]: value,
            }
          : row
      ),
    }))
  }

  const tambahRow = (componentKey) => {
    setFormData((prev) => ({
      ...prev,
      [componentKey]: [
        ...prev[componentKey],
        createRow(),
      ],
    }))
  }

  const buangRow = (
    componentKey,
    rowIndex
  ) => {
    setFormData((prev) => {
      const currentRows =
        prev[componentKey]

      /*
       * Pastikan setiap komponen sentiasa
       * mempunyai sekurang-kurangnya satu row.
       */
      if (currentRows.length === 1) {
        return prev
      }

      return {
        ...prev,
        [componentKey]:
          currentRows.filter(
            (_, index) =>
              index !== rowIndex
          ),
      }
    })
  }

  const handleNext = () => {
    onNext(formData)
  }

  return (
    <section className="postmortem-form-card">

      {/* HEADER */}
      <div className="postmortem-form-header">

        <div>
          <span>BAHAGIAN 2</span>

          <h2>
            Ringkasan Program Persiapan
          </h2>

          <p>
            Rekodkan program persiapan yang
            telah dilaksanakan sebelum
            pertandingan.
          </p>
        </div>

      </div>

      {/* BODY */}
      <div className="postmortem-program-body">

        <div className="postmortem-program-intro">

          <div>
            <strong>
              Program Persiapan
            </strong>

            <p>
              Setiap komponen boleh mempunyai
              beberapa rekod atau aktiviti.
            </p>
          </div>

        </div>

        {/* COMPONENTS */}
        <div className="postmortem-program-list">

          {componentDefinitions.map(
            (component) => {

              const rows =
                formData[
                  component.key
                ] || [createRow()]

              return (
                <div
                  className="postmortem-program-card"
                  key={component.key}
                >

                  {/* COMPONENT HEADER */}
                  <div className="postmortem-program-card-header">

                    <div className="postmortem-program-number">
                      {componentDefinitions.findIndex(
                        (item) =>
                          item.key ===
                          component.key
                      ) + 1}
                    </div>

                    <div>
                      <strong>
                        {component.label}
                      </strong>

                      <small>
                        {rows.length}{' '}
                        rekod
                      </small>
                    </div>

                  </div>

                  {/* TABLE */}
                  <div className="postmortem-table-wrapper">

                    <table className="postmortem-program-table">

                      <thead>
                        <tr>
                          <th>
                            Bil.
                          </th>

                          <th>
                            Bilangan Atlet
                          </th>

                          <th>
                            Lokasi / Tempat
                          </th>

                          <th>
                            Tempoh
                          </th>

                          <th>
                            Pencapaian / Rekod
                          </th>

                          <th>
                            Maklumat / Catatan
                          </th>

                          <th>
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {rows.map(
                          (row, rowIndex) => (

                            <tr
                              key={rowIndex}
                            >

                              <td>
                                <div className="table-row-number">
                                  {rowIndex + 1}
                                </div>
                              </td>

                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    row.bilanganAtlet
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateRow(
                                      component.key,
                                      rowIndex,
                                      'bilanganAtlet',
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  value={
                                    row.lokasi
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateRow(
                                      component.key,
                                      rowIndex,
                                      'lokasi',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Contoh: Johor"
                                />
                              </td>

                              <td>
                                <input
                                  type="text"
                                  value={
                                    row.tempoh
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateRow(
                                      component.key,
                                      rowIndex,
                                      'tempoh',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Contoh: 2 minggu"
                                />
                              </td>

                              <td>
                                <textarea
                                  value={
                                    row.pencapaian
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateRow(
                                      component.key,
                                      rowIndex,
                                      'pencapaian',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Pencapaian / rekod"
                                  rows="2"
                                />
                              </td>

                              <td>
                                <textarea
                                  value={
                                    row.catatan
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateRow(
                                      component.key,
                                      rowIndex,
                                      'catatan',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Maklumat / catatan"
                                  rows="2"
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="remove-program-button"
                                  onClick={() =>
                                    buangRow(
                                      component.key,
                                      rowIndex
                                    )
                                  }
                                  disabled={
                                    rows.length ===
                                    1
                                  }
                                  title="Buang rekod"
                                >
                                  ×
                                </button>
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* ADD ROW */}
                  <div className="postmortem-component-footer">

                    <button
                      type="button"
                      className="add-coach-button"
                      onClick={() =>
                        tambahRow(
                          component.key
                        )
                      }
                    >
                      + Tambah Maklumat
                    </button>

                  </div>

                </div>
              )
            }
          )}

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

export default Section2Persiapan