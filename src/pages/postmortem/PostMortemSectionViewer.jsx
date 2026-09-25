/* =========================================================
   HELPERS
========================================================= */

const isEmpty = (value) => {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  )
}

const displayValue = (value, fallback = '-') => {
  if (isEmpty(value)) {
    return fallback
  }

  return String(value)
}

const getRatingClass = (value) => {
  const rating = String(value || '').toLowerCase()

  if (rating.includes('sangat baik')) {
    return 'rating-excellent'
  }

  if (
    rating === 'baik' ||
    rating.includes(' baik')
  ) {
    return 'rating-good'
  }

  if (rating.includes('sederhana')) {
    return 'rating-medium'
  }

  if (rating.includes('kurang baik')) {
    return 'rating-low'
  }

  if (rating.includes('tidak baik')) {
    return 'rating-poor'
  }

  return ''
}

const getStatusClass = (value) => {
  const status = String(value || '').toLowerCase()

  if (
    status === 'capai' ||
    status.includes('berjaya')
  ) {
    return 'status-success'
  }

  if (
    status.includes('tidak capai') ||
    status.includes('gagal') ||
    status.includes('tidak berjaya')
  ) {
    return 'status-danger'
  }

  if (
    status.includes('sangat memerlukan')
  ) {
    return 'status-warning'
  }

  return ''
}

/* =========================================================
   COMMON UI
========================================================= */

const EmptyState = ({ text = 'Tiada maklumat direkodkan.' }) => {
  return (
    <div className="pm-report-empty">
      {text}
    </div>
  )
}

const Field = ({
  label,
  value,
  className = '',
}) => {
  return (
    <div
      className={`pm-report-field ${className}`}
    >
      <div className="pm-report-field-label">
        {label}
      </div>

      <div
        className={`pm-report-field-value ${
          getRatingClass(value) ||
          getStatusClass(value)
        }`}
      >
        {displayValue(value)}
      </div>
    </div>
  )
}

const TextBlock = ({
  label,
  value,
}) => {
  return (
    <div className="pm-report-block">
      <div className="pm-report-block-header">
        <div>
          <span>PERINCIAN</span>

          <h4>
            {label}
          </h4>
        </div>
      </div>

      <div className="pm-report-nested">
        <div className="pm-report-field">
          <div className="pm-report-field-value">
            {displayValue(value)}
          </div>
        </div>
      </div>
    </div>
  )
}

const SectionHeader = ({
  label,
  title,
}) => {
  return (
    <div className="pm-report-block-header">
      <div>
        <span>{label}</span>

        <h4>
          {title}
        </h4>
      </div>
    </div>
  )
}

/* =========================================================
   SECTION 1
   MAKLUMAT SUKAN
========================================================= */

const renderSection1 = (data) => {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    return <EmptyState />
  }

  const coaches = Array.isArray(data.jurulatih)
    ? data.jurulatih.filter(
        (item) => !isEmpty(item)
      )
    : []

  return (
    <div className="pm-report-special">

      <div className="pm-report-content">

        <div className="pm-report-grid">

          <Field
            label="Nama Pengurus Pasukan"
            value={data.pengurusPasukan}
          />

          <Field
            label="Nama Ketua Jurulatih"
            value={data.ketuaJurulatih}
          />

          <Field
            label="Bilangan Atlet Lelaki"
            value={data.atletLelaki}
          />

          <Field
            label="Bilangan Atlet Wanita"
            value={data.atletWanita}
          />

          <Field
            label="Tempoh Persediaan"
            value={data.tempohPersediaan}
          />

          <Field
            label="Tempat Pertandingan"
            value={data.tempatPertandingan}
          />

        </div>

        <div className="pm-report-block">

          <SectionHeader
            label="BARISAN KEJURULATIHAN"
            title="Senarai Jurulatih"
          />

          {coaches.length === 0 ? (
            <EmptyState text="Tiada jurulatih direkodkan." />
          ) : (
            <div className="pm-report-table-wrapper">

              <table className="pm-report-table">

                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>
                      Bil.
                    </th>

                    <th>
                      Nama Jurulatih
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coaches.map(
                    (coach, index) => (
                      <tr key={index}>
                        <td className="pm-report-number">
                          {index + 1}
                        </td>

                        <td>
                          {coach}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

/* =========================================================
   SECTION 2
   RINGKASAN PROGRAM PERSIAPAN
========================================================= */

const renderSection2 = (data) => {
  const componentLabels = {
    latihanPusat: 'Latihan Pusat',
    kejohanan: 'Kejohanan',
    ujianPenilaiPrestasi: 'Ujian/Penilai Prestasi',
    programSainsSukan: 'Program Sains Sukan',
    programPemulihanRehabilitasi: 'Program Pemulihan / Rehabilitasi',
  }

  const programs = Array.isArray(data)
    ? data
    : Object.entries(componentLabels).flatMap(([key, label]) =>
        (Array.isArray(data?.[key]) ? data[key] : []).map((row) => ({
          ...row,
          komponen: label,
        }))
      )

  const visiblePrograms = programs.filter((program) =>
    [
      program?.komponen,
      program?.bilanganAtlet,
      program?.lokasi,
      program?.tempoh,
      program?.pencapaian,
      program?.catatan,
    ].some((value) => !isEmpty(value))
  )

  if (visiblePrograms.length === 0) {
    return <EmptyState text="Tiada program persiapan direkodkan." />
  }

  return (
    <div className="pm-report-special">

      <div className="pm-report-block">

        <SectionHeader
          label="PROGRAM PERSIAPAN"
          title="Senarai Program Yang Dilaksanakan"
        />

        <div className="pm-report-table-wrapper">

          <table className="pm-report-table">

            <thead>
              <tr>
                <th style={{ width: '60px' }}>
                  Bil.
                </th>

                <th>
                  Komponen
                </th>

                <th>
                  Bilangan Atlet
                </th>

                <th>
                  Lokasi
                </th>

                <th>
                  Tempoh
                </th>

                <th>
                  Pencapaian / Rekod
                </th>

                <th>
                  Catatan
                </th>
              </tr>
            </thead>

            <tbody>

              {visiblePrograms.map(
                (program, index) => (
                  <tr key={index}>

                    <td className="pm-report-number">
                      {index + 1}
                    </td>

                    <td>
                      {displayValue(
                        program?.komponen
                      )}
                    </td>

                    <td>
                      {displayValue(
                        program?.bilanganAtlet
                      )}
                    </td>

                    <td>
                      {displayValue(
                        program?.lokasi
                      )}
                    </td>

                    <td>
                      {displayValue(
                        program?.tempoh
                      )}
                    </td>

                    <td>
                      {displayValue(
                        program?.pencapaian
                      )}
                    </td>

                    <td>
                      {displayValue(
                        program?.catatan
                      )}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

/* =========================================================
   SECTION 3
   SASARAN & PENCAPAIAN
========================================================= */

const renderSection3 = (data) => {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    return <EmptyState />
  }

  const acaraList = Array.isArray(
    data.acaraList
  )
    ? data.acaraList
    : []

  return (
    <div className="pm-report-special">

      <div className="pm-summary-cards">

        <div className="pm-summary-card">
          <span>
            JUMLAH ACARA
          </span>

          <strong>
            {acaraList.length}
          </strong>
        </div>

        <div className="pm-summary-card">
          <span>
            JUMLAH SASARAN
          </span>

          <strong>
            {data.jumlahSasaran ?? 0}
          </strong>
        </div>

        <div className="pm-summary-card">
          <span>
            JUMLAH PENCAPAIAN
          </span>

          <strong>
            {data.jumlahPencapaian ?? 0}
          </strong>
        </div>

      </div>

      <div className="pm-report-block">

        <SectionHeader
          label="PRESTASI PERTANDINGAN"
          title="Sasaran dan Pencapaian Mengikut Acara"
        />

        {acaraList.length === 0 ? (
          <EmptyState text="Tiada acara direkodkan." />
        ) : (
          <div className="pm-report-table-wrapper">

            <table className="pm-report-table">

              <thead>
                <tr>

                  <th style={{ width: '55px' }}>
                    Bil.
                  </th>

                  <th>
                    Acara
                  </th>

                  <th>
                    Atlet
                  </th>

                  <th>
                    Sasaran
                  </th>

                  <th>
                    Pencapaian
                  </th>

                  <th>
                    Pingat / Kedudukan
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Keputusan / Masa
                  </th>

                </tr>
              </thead>

              <tbody>

                {acaraList.map(
                  (item, index) => (
                    <tr key={index}>

                      <td className="pm-report-number">
                        {index + 1}
                      </td>

                      <td>
                        {displayValue(
                          item?.acara
                        )}
                      </td>

                      <td>
                        {displayValue(
                          item?.atlet
                        )}
                      </td>

                      <td>
                        {displayValue(
                          item?.sasaran
                        )}
                      </td>

                      <td>
                        {displayValue(
                          item?.pencapaian
                        )}
                      </td>

                      <td>
                        {displayValue(
                          item?.pingat
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            getStatusClass(
                              item?.status
                            )
                          }
                        >
                          {displayValue(
                            item?.status
                          )}
                        </span>
                      </td>

                      <td>
                        {displayValue(
                          item?.keputusan
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  )
}

/* =========================================================
   SECTION 4
   ANALISIS TEKNIKAL & TAKTIKAL
========================================================= */

const renderSection4 = (data) => {
  if (Array.isArray(data)) {
    if (data.length === 0) return <EmptyState />

    return (
      <div className="pm-rating-list">
        {data.map((item, index) => (
          <div className="pm-rating-row" key={item?.id || index}>
            <div className="pm-rating-info">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{displayValue(item?.title)}</strong>
                {item?.description && <small>{item.description}</small>}
                {item?.catatan && <small><strong>Catatan:</strong> {item.catatan}</small>}
              </div>
            </div>
            <div className={`pm-rating-value ${getRatingClass(item?.rating)}`}>
              {displayValue(item?.rating, 'Belum dinilai')}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || typeof data !== 'object') {
    return <EmptyState />
  }

  return (
    <div className="pm-report-grid">
      <Field label="Kekuatan Utama Atlet / Pasukan" value={data.kekuatanUtama} />
      <Field label="Kelemahan Utama" value={data.kelemahanUtama} />
      <Field label="Kesilapan Teknikal yang Dikenal Pasti" value={data.kesilapanTeknikal} />
      <Field label="Kesilapan Taktikal" value={data.kesilapanTaktikal} />
      <Field label="Strategi Pertandingan dan Keberkesanannya" value={data.strategiPertandingan} />
      <Field label="Perbandingan Prestasi dengan Atlet / Pasukan Lawan" value={data.perbandinganLawan} />
    </div>
  )
}

/* =========================================================
   SECTION 5
   PENILAIAN PROGRAM LATIHAN
========================================================= */

const renderSection5 = (data) => {
  const components = Array.isArray(data)
    ? data
    : Array.isArray(data?.components)
      ? data.components
      : []

  if (components.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="pm-rating-list">

      {components.map(
        (item, index) => {

          const rating =
            item?.rating ||
            'Belum dinilai'

          return (
            <div
              className="pm-rating-row"
              key={
                item?.id ||
                index
              }
            >

              <div className="pm-rating-info">

                <span>
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    '0'
                  )}
                </span>

                <div>

                  <strong>
                    {displayValue(
                      item?.title
                    )}
                  </strong>

                  {item?.description && (
                    <small>
                      {item.description}
                    </small>
                  )}

                  {item?.catatan && (
                    <small>
                      <strong>
                        Catatan:
                      </strong>{' '}
                      {item.catatan}
                    </small>
                  )}

                </div>

              </div>

              <div
                className={`pm-rating-value ${
                  getRatingClass(
                    rating
                  )
                }`}
              >
                {rating}
              </div>

            </div>
          )
        }
      )}

    </div>
  )
}

/* =========================================================
   SECTION 6
   FAKTOR KEJAYAAN / KEGAGALAN
========================================================= */

const renderFactorGroup = (
  title,
  items,
  type
) => {
  const list = Array.isArray(items)
    ? items
    : []

  return (
    <div className="pm-report-block">

      <SectionHeader
        label={
          type === 'success'
            ? 'FAKTOR KEJAYAAN'
            : 'FAKTOR KEGAGALAN'
        }
        title={title}
      />

      {list.length === 0 ? (
        <EmptyState text="Tiada faktor direkodkan." />
      ) : (
        <div className="pm-report-table-wrapper">

          <table className="pm-report-table">

            <thead>
              <tr>

                <th style={{ width: '60px' }}>
                  Bil.
                </th>

                <th>
                  Faktor
                </th>

                <th>
                  Huraian / Catatan
                </th>

              </tr>
            </thead>

            <tbody>

              {list.map(
                (item, index) => (
                  <tr key={index}>

                    <td className="pm-report-number">
                      {index + 1}
                    </td>

                    <td>
                      {displayValue(
                        typeof item === 'object'
                          ? item?.faktor
                          : item
                      )}
                    </td>

                    <td>
                      {displayValue(
                        typeof item === 'object'
                          ? item?.catatan
                          : ''
                      )}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  )
}

const renderSection6 = (data) => {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    return <EmptyState />
  }

  return (
    <div className="pm-report-special">

      {renderFactorGroup(
        'Faktor utama yang menyumbang kepada kejayaan pasukan',
        data.faktorKejayaan,
        'success'
      )}

      {renderFactorGroup(
        'Faktor utama yang menyebabkan sasaran tidak dicapai atau prestasi terjejas',
        data.faktorKegagalan,
        'failure'
      )}

    </div>
  )
}

/* =========================================================
   SECTION 7
   ISU TEKNIKAL PERTANDINGAN
========================================================= */

const renderSection7 = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState text="Tiada isu teknikal direkodkan." />
  }

  return (
    <div className="pm-report-block">

      <SectionHeader
        label="ISU PERTANDINGAN"
        title="Senarai Isu Teknikal"
      />

      <div className="pm-report-table-wrapper">

        <table className="pm-report-table">

          <thead>
            <tr>

              <th style={{ width: '55px' }}>
                Bil.
              </th>

              <th>
                Kategori Acara
              </th>

              <th>
                Tarikh / Acara
              </th>

              <th>
                Isu / Permasalahan
              </th>

              <th>
                Tindakan Pasukan
              </th>

              <th>
                Keputusan Rasmi
              </th>

              <th>
                Kesan Pada Atlet
              </th>

              <th>
                Cadangan
              </th>

            </tr>
          </thead>

          <tbody>

            {data.map(
              (issue, index) => (
                <tr key={index}>

                  <td className="pm-report-number">
                    {index + 1}
                  </td>

                    <td>
                      {displayValue(
                        issue?.kategori ?? issue?.kategoriAcara
                      )}
                    </td>

                    <td>
                      {displayValue(
                        issue?.tarikhAcara ?? issue?.negeriLawan
                      )}
                    </td>

                    <td>
                      {displayValue(
                        issue?.isuPermasalahan ?? issue?.sebab
                      )}
                    </td>

                    <td>
                      {displayValue(
                        issue?.tindakanBantahan ?? issue?.tindakan
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        getStatusClass(
                          issue?.keputusanRasmi
                        )
                      }
                    >
                      {displayValue(
                        issue?.keputusanRasmi
                      )}
                    </span>
                  </td>

                    <td>
                      {displayValue(
                        issue?.kesanAtletPasukan ?? issue?.kesanAtlet
                    )}
                  </td>

                  <td>
                    {displayValue(
                      issue?.cadangan
                    )}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

/* =========================================================
   SECTION 8
   BANTAHAN / PROTES RASMI
========================================================= */

const renderSection8 = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <EmptyState text="Tiada bantahan atau protes rasmi direkodkan." />
    )
  }

  return (
    <div className="pm-report-block">

      <SectionHeader
        label="BANTAHAN / PROTES"
        title="Rekod Bantahan atau Protes Rasmi"
      />

      <div className="pm-report-table-wrapper">

        <table className="pm-report-table">

          <thead>
            <tr>

              <th style={{ width: '55px' }}>
                Bil.
              </th>

              <th>
                Acara / Tarikh
              </th>

              <th>
                Asas Bantahan / Protes
              </th>

              <th>
                Pihak Yang Menerima
              </th>

              <th>
                Tindakan Pasukan
              </th>

              <th>
                Keputusan Rasmi
              </th>

              <th>
                Kesan Kepada Atlet / Pasukan
              </th>

              <th>
                Dokumen / Bukti Sokongan
              </th>

            </tr>
          </thead>

          <tbody>

            {data.map(
              (item, index) => (
                <tr key={index}>

                  <td className="pm-report-number">
                    {index + 1}
                  </td>

                  <td>
                    {displayValue(
                      item?.acaraTarikh
                    )}
                  </td>

                  <td>
                    {displayValue(
                      item?.asasBantahan
                    )}
                  </td>

                  <td>
                    {displayValue(
                      item?.pihakMenerima
                    )}
                  </td>

                  <td>
                    {displayValue(
                      item?.tindakanPasukan
                    )}
                  </td>

                  <td>
                    {displayValue(
                      item?.keputusanRasmi
                    )}
                  </td>

                  <td>
                    {displayValue(
                      item?.kesanAtletPasukan
                    )}
                  </td>

                  <td>
                    {displayValue(
                      item?.dokumenBukti
                    )}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

/* =========================================================
   SECTION 9
   PENILAIAN BARISAN KEJURULATIHAN
========================================================= */

const renderSection9 = (data) => {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    return <EmptyState />
  }

  return (
    <div className="pm-report-special">

      <div className="pm-report-content">

        <div className="pm-report-grid">

          <Field
            label="Keberkesanan Barisan Kejurulatihan"
            value={
              data.keberkesananBarisanKejurulatihan
            }
            className="full"
          />

          <Field
            label="Adakah Bilangan Jurulatih Mencukupi?"
            value={
              data.bilanganJurulatihMencukupi
            }
            className="full"
          />

          <Field
            label="Adakah Kepakaran Jurulatih Bersesuaian Dengan Keperluan Sukan?"
            value={
              data.kepakaranJurulatihBersesuaian
            }
            className="full"
          />

          <Field
            label="Cadangan Berkaitan Jurulatih"
            value={
              data.cadanganBerkaitanJurulatih
            }
            className="full"
          />

        </div>

      </div>

    </div>
  )
}

/* =========================================================
   SECTION 10
   STATUS ATLET SELEPAS SUKMA
========================================================= */

const renderSection10 = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState text="Tiada status atlet direkodkan." />
  }

  return (
    <div className="pm-report-block">

      <SectionHeader
        label="STATUS ATLET"
        title="Status Atlet Selepas SUKMA"
      />

      <div className="pm-report-table-wrapper">

        <table className="pm-report-table">

          <thead>
            <tr>

              <th style={{ width: '55px' }}>
                Bil.
              </th>

              <th>
                Nama Atlet
              </th>

              <th>
                Status
              </th>

              <th>
                Cadangan
              </th>

              <th>
                Catatan
              </th>

            </tr>
          </thead>

          <tbody>

            {data.map(
              (athlete, index) => (
                <tr key={index}>

                  <td className="pm-report-number">
                    {index + 1}
                  </td>

                  <td>
                    {displayValue(
                      athlete?.namaAtlet
                    )}
                  </td>

                  <td>
                    {displayValue(
                      athlete?.status
                    )}
                  </td>

                  <td>
                    {displayValue(
                      athlete?.cadangan
                    )}
                  </td>

                  <td>
                    {displayValue(
                      athlete?.catatan
                    )}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

/* =========================================================
   SECTION 11
   CADANGAN PROGRAM SUKMA 2028
========================================================= */

const renderSection11 = (data) => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const recommendationLabels = {
      atletDikekalkan: 'Atlet dikekalkan',
      atletDinaikkanProgramPrestasiTinggi: 'Atlet dinaikkan ke program prestasi tinggi',
      atletBaharuDiberiPeluang: 'Atlet baharu yang perlu diberi peluang',
      atletPerluIntervensi: 'Atlet yang memerlukan intervensi',
      keperluanJurulatih: 'Keperluan jurulatih',
      keperluanKemLatihan: 'Keperluan kem latihan',
      keperluanPertandingan: 'Keperluan pertandingan',
      keperluanPeralatan: 'Keperluan peralatan',
      keperluanSainsSukan: 'Keperluan sains sukan',
      keperluanPerubatanRehabilitasi: 'Keperluan perubatan / rehabilitasi',
    }

    return (
      <div className="pm-report-block">
        <SectionHeader
          label="PERANCANGAN SUKMA 2028"
          title="Cadangan Program SUKMA 2028"
        />
        <div className="pm-report-grid">
          {Object.entries(recommendationLabels).map(([key, label]) => (
            <Field key={key} label={label} value={data[key]} className="full" />
          ))}
        </div>
      </div>
    )
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <EmptyState text="Tiada cadangan Program SUKMA 2028 direkodkan." />
    )
  }

  return (
    <div className="pm-report-block">

      <SectionHeader
        label="PERANCANGAN SUKMA 2028"
        title="Cadangan Program SUKMA 2028"
      />

      <div className="pm-report-table-wrapper">

        <table className="pm-report-table">

          <thead>
            <tr>

              <th style={{ width: '55px' }}>
                Bil.
              </th>

              <th style={{ minWidth: '250px' }}>
                Perkara
              </th>

              <th>
                Keperluan
              </th>

              <th>
                Catatan
              </th>

            </tr>
          </thead>

          <tbody>

            {data.map(
              (item, index) => (
                <tr
                  key={
                    item?.id ||
                    index
                  }
                >

                  <td className="pm-report-number">
                    {index + 1}
                  </td>

                  <td>
                    <strong>
                      {displayValue(
                        item?.title
                      )}
                    </strong>

                    {item?.description && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '12px',
                          opacity: 0.75,
                        }}
                      >
                        {item.description}
                      </div>
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        getStatusClass(
                          item?.pilihan
                        )
                      }
                    >
                      {displayValue(
                        item?.pilihan
                      )}
                    </span>
                  </td>

                  <td>
                    {displayValue(
                      item?.catatan
                    )}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

/* =========================================================
   SECTION 12
   RUMUSAN PASUKAN
========================================================= */

const renderSection12 = (data) => {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    return <EmptyState />
  }

  /*
   * Sokong beberapa nama field yang mungkin digunakan
   * oleh versi borang terdahulu, tanpa mengubah data.
   */

  const perkaraList = Array.isArray(data.perkaraPerluDiperbaiki)
    ? data.perkaraPerluDiperbaiki
    : []

  const perkara1 =
    perkaraList[0] ??
    data.perkara1 ??
    data.perkaraPerluDiperbaiki1 ??
    data.perkaraUtama1 ??
    data.perkara1PerluDiperbaiki

  const perkara2 =
    perkaraList[1] ??
    data.perkara2 ??
    data.perkaraPerluDiperbaiki2 ??
    data.perkaraUtama2 ??
    data.perkara2PerluDiperbaiki

  const perkara3 =
    perkaraList[2] ??
    data.perkara3 ??
    data.perkaraPerluDiperbaiki3 ??
    data.perkaraUtama3 ??
    data.perkara3PerluDiperbaiki

  const sokongan =
    data.bentukSokonganMajlisSukanPahang ??
    data.bentukSokongan ??
    data.sokonganMajlisSukanPahang ??
    data.sokongan ??
    data.bentukSokonganMajlis

  const cadangan =
    data.cadanganUtama ??
    data.cadanganUtamaSukma2028 ??
    data.cadanganSukma2028 ??
    data.cadangan

  return (
    <div className="pm-report-special">

      <TextBlock
        label="Perkara 1 Yang Perlu Diperbaiki"
        value={perkara1}
      />

      <TextBlock
        label="Perkara 2 Yang Perlu Diperbaiki"
        value={perkara2}
      />

      <TextBlock
        label="Perkara 3 Yang Perlu Diperbaiki"
        value={perkara3}
      />

      <TextBlock
        label="Bentuk Sokongan Daripada Majlis Sukan Pahang"
        value={sokongan}
      />

      <TextBlock
        label="Cadangan Utama Persediaan SUKMA 2028"
        value={cadangan}
      />

    </div>
  )
}

/* =========================================================
   SECTION 13
   PENGESAHAN
========================================================= */

const renderSection13 = (data) => {
  if (
    !data ||
    typeof data !== 'object'
  ) {
    return <EmptyState />
  }

  const pernyataan =
    data.pernyataanPengesahan ??
    data.pernyataan ??
    (data.pengesahan
      ? 'Saya mengesahkan bahawa maklumat yang diberikan dalam laporan ini adalah benar berdasarkan pengetahuan dan rekod pasukan.'
      : 'Pengesahan belum dibuat.')

  const nama =
    data.namaPengurusJurulatih ??
    data.namaPengurus ??
    data.namaPengurusAtauJurulatih ??
    data.nama

  const tarikh =
    data.tarikh

  const penyelaras =
    data.disahkanOlehPenyelarasPasukan ??
    data.disahkanOlehPenyelaras ??
    data.penyelarasPasukan ??
    data.disahkanOleh

  return (
    <div className="pm-report-special">

      <TextBlock
        label="Pernyataan Pengesahan"
        value={pernyataan}
      />

      <div className="pm-report-content">

        <div className="pm-report-grid">

          <Field
            label="Nama Pengurus / Jurulatih"
            value={nama}
          />

          <Field
            label="Tarikh"
            value={tarikh}
          />

          <Field
            label="Disahkan Oleh Penyelaras Pasukan"
            value={penyelaras}
            className="full"
          />

        </div>

      </div>

    </div>
  )
}

/* =========================================================
   FALLBACK
========================================================= */

const renderFallback = (data) => {
  if (
    data === null ||
    data === undefined
  ) {
    return <EmptyState />
  }

  if (
    typeof data !== 'object'
  ) {
    return (
      <div className="pm-report-content">
        <Field
          label="Maklumat"
          value={data}
        />
      </div>
    )
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <EmptyState />
    }

    return (
      <div className="pm-report-table-wrapper">

        <table className="pm-report-table">

          <thead>
            <tr>
              <th style={{ width: '60px' }}>
                Bil.
              </th>

              <th>
                Maklumat
              </th>
            </tr>
          </thead>

          <tbody>

            {data.map(
              (item, index) => (
                <tr key={index}>

                  <td className="pm-report-number">
                    {index + 1}
                  </td>

                  <td>
                    {
                      typeof item === 'object'
                        ? JSON.stringify(
                            item
                          )
                        : displayValue(
                            item
                          )
                    }
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>
    )
  }

  return (
    <div className="pm-report-content">

      <div className="pm-report-grid">

        {Object.entries(data).map(
          ([key, value]) => (
            <Field
              key={key}
              label={key}
              value={
                typeof value === 'object'
                  ? JSON.stringify(
                      value
                    )
                  : value
              }
              className="full"
            />
          )
        )}

      </div>

    </div>
  )
}

/* =========================================================
   MAIN SECTION ROUTER
========================================================= */

const renderSection = (
  sectionNumber,
  data
) => {
  switch (sectionNumber) {

    case 1:
      return renderSection1(data)

    case 2:
      return renderSection2(data)

    case 3:
      return renderSection3(data)

    case 4:
      return renderSection4(data)

    case 5:
      return renderSection5(data)

    case 6:
      return renderSection6(data)

    case 7:
      return renderSection7(data)

    case 8:
      return renderSection8(data)

    case 9:
      return renderSection9(data)

    case 10:
      return renderSection10(data)

    case 11:
      return renderSection11(data)

    case 12:
      return renderSection12(data)

    case 13:
      return renderSection13(data)

    default:
      return renderFallback(data)
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function PostMortemSectionViewer({
  sectionNumber,
  data,
}) {
  return (
    <div className="pm-report-viewer">

      {renderSection(
        sectionNumber,
        data
      )}

    </div>
  )
}
