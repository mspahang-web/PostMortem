function PostMortemReview({
  userProfile,
  onSaveDraft,
  savingDraft,
  section1Data,
  section2Data,
  section3Data,
  section4Data,
  section5Data,
  section6Data,
  section7Data,
  section8Data,
  section9Data,
  section10Data,
  section11Data,
  section12Data,
  section13Data,
  onBack,
  onSubmit,
  onComplete,
}) {
  const sectionData = [
    {
      number: 1,
      title: 'Maklumat Sukan',
      data: section1Data,
    },
    {
      number: 2,
      title: 'Ringkasan Program Persiapan',
      data: section2Data,
    },
    {
      number: 3,
      title: 'Sasaran & Pencapaian',
      data: section3Data,
    },
    {
      number: 4,
      title: 'Analisis Teknikal & Taktikal',
      data: section4Data,
    },
    {
      number: 5,
      title: 'Penilaian Program Latihan',
      data: section5Data,
    },
    {
      number: 6,
      title: 'Faktor Kejayaan / Kegagalan',
      data: section6Data,
    },
    {
      number: 7,
      title: 'Isu Teknikal Pertandingan',
      data: section7Data,
    },
    {
      number: 8,
      title: 'Bantahan / Protes Rasmi',
      data: section8Data,
    },
    {
      number: 9,
      title: 'Penilaian Barisan Kejurulatihan',
      data: section9Data,
    },
    {
      number: 10,
      title: 'Status Atlet Selepas SUKMA',
      data: section10Data,
    },
    {
      number: 11,
      title: 'Cadangan Program SUKMA 2028',
      data: section11Data,
    },
    {
      number: 12,
      title: 'Rumusan Pasukan',
      data: section12Data,
    },
    {
      number: 13,
      title: 'Pengesahan',
      data: section13Data,
    },
  ]

  const LABEL_MAP = {
    pengurusPasukan: 'Pengurus Pasukan',
    ketuaJurulatih: 'Ketua Jurulatih',
    jurulatih: 'Jurulatih',
    atletLelaki: 'Atlet Lelaki',
    atletWanita: 'Atlet Wanita',
    tempohPersediaan: 'Tempoh Persediaan',
    tempatPertandingan: 'Tempat Pertandingan',

    latihanPusat: 'Latihan Pusat',
    kejohanan: 'Kejohanan',
    ujianPenilaiPrestasi: 'Ujian Penilai Prestasi',
    programSainsSukan: 'Program Sains Sukan',
    programPemulihanRehabilitasi:
      'Program Pemulihan / Rehabilitasi',

    acaraList: 'Senarai Acara',
    jumlahSasaran: 'Jumlah Sasaran',
    jumlahPencapaian: 'Jumlah Pencapaian',
    sasaranEmas: 'Sasaran Emas',
    sasaranPerak: 'Sasaran Perak',
    sasaranGangsa: 'Sasaran Gangsa',
    pencapaianEmas: 'Pencapaian Emas',
    pencapaianPerak: 'Pencapaian Perak',
    pencapaianGangsa: 'Pencapaian Gangsa',

    kekuatanUtama: 'Kekuatan Utama',
    kelemahanUtama: 'Kelemahan Utama',
    kesilapanTeknikal: 'Kesilapan Teknikal',
    kesilapanTaktikal: 'Kesilapan Taktikal',
    strategiPertandingan: 'Strategi Pertandingan',
    perbandinganLawan: 'Perbandingan Lawan',

    components: 'Penilaian Komponen Latihan',

    faktorKejayaan: 'Faktor Kejayaan',
    faktorKegagalan: 'Faktor Kegagalan',

    issues: 'Senarai Isu',
    kategori: 'Kategori',
    tarikhAcara: 'Tarikh / Acara',
    isuPermasalahan: 'Isu / Permasalahan',
    tindakanBantahan: 'Tindakan / Bantahan',
    keputusanRasmi:
      'Keputusan Rasmi',
    keputusanPenganjur:
      'Keputusan Penganjur / Juri / Wasit',
    kesanAtletPasukan:
      'Kesan Kepada Atlet / Pasukan',
    cadangan: 'Cadangan',

    protests: 'Senarai Bantahan / Protes',
    acaraTarikh: 'Acara / Tarikh',
    asasBantahan: 'Asas Bantahan',
    pihakMenerima: 'Pihak Menerima',
    dokumenBukti: 'Dokumen / Bukti Sokongan',

    keberkesananBarisanKejurulatihan:
      'Keberkesanan Barisan Kejurulatihan',
    bilanganJurulatihMencukupi:
      'Adakah Bilangan Jurulatih Mencukupi?',
    kepakaranJurulatihBersesuaian:
      'Adakah Kepakaran Jurulatih Bersesuaian Dengan Keperluan Sukan?',
    cadanganBerkaitanJurulatih:
      'Cadangan Berkaitan Jurulatih',

    namaAtlet: 'Nama Atlet',
    status: 'Status',
    catatan: 'Catatan',

    atletDikekalkan: 'Atlet Dikekalkan',
    atletDinaikkanProgramPrestasiTinggi:
      'Atlet Dinaikkan Ke Program Prestasi Tinggi',
    atletBaharuDiberiPeluang:
      'Atlet Baharu Yang Perlu Diberi Peluang',
    atletPerluIntervensi:
      'Atlet Yang Memerlukan Intervensi',
    keperluanJurulatih:
      'Keperluan Jurulatih',
    keperluanKemLatihan:
      'Keperluan Kem Latihan',
    keperluanPertandingan:
      'Keperluan Pertandingan',
    keperluanPeralatan:
      'Keperluan Peralatan',
    keperluanSainsSukan:
      'Keperluan Sains Sukan',
    keperluanPerubatanRehabilitasi:
      'Keperluan Perubatan / Rehabilitasi',

    perkaraPerluDiperbaiki:
      '3 Perkara Utama Yang Perlu Diperbaiki',
    bentukSokonganMajlisSukanPahang:
      'Bentuk Sokongan Daripada Majlis Sukan Pahang',
    cadanganUtamaSukma2028:
      'Cadangan Utama Persediaan SUKMA 2028',

    pengesahan:
      'Pengesahan',
    namaPengurusJurulatih:
      'Nama Pengurus / Jurulatih',
    tarikh: 'Tarikh',
    disahkanOlehPenyelaras:
      'Disahkan Oleh Penyelaras Pasukan',
  }

  const formatLabel = (key) => {
    if (!key) return '-'

    if (LABEL_MAP[key]) {
      return LABEL_MAP[key]
    }

    return String(key)
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (char) =>
        char.toUpperCase()
      )
  }

  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '-'
    }

    if (typeof value === 'boolean') {
      return value ? 'Ya' : 'Tidak'
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      return String(value)
    }

    return null
  }

  const renderValue = (value) => {
    const simpleValue = formatValue(value)

    if (simpleValue !== null) {
      return (
        <div className="postmortem-review-value">
          {simpleValue}
        </div>
      )
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <div className="postmortem-review-empty">
            Tiada data
          </div>
        )
      }

      return (
        <div className="postmortem-review-array">
          {value.map((item, index) => (
            <div
              className="postmortem-review-item"
              key={index}
            >
              <div className="postmortem-review-item-number">
                {index + 1}
              </div>

              <div className="postmortem-review-item-content">
                {typeof item === 'object' &&
                item !== null
                  ? renderObject(item)
                  : renderValue(item)}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (typeof value === 'object') {
      return renderObject(value)
    }

    return (
      <div className="postmortem-review-value">
        {String(value)}
      </div>
    )
  }

  const renderObject = (object) => {
    if (
      !object ||
      typeof object !== 'object'
    ) {
      return renderValue(object)
    }

    const entries = Object.entries(object)

    if (entries.length === 0) {
      return (
        <div className="postmortem-review-empty">
          Tiada data
        </div>
      )
    }

    return (
      <div className="postmortem-review-grid">
        {entries.map(([key, value]) => (
          <div
            className="postmortem-review-field"
            key={key}
          >
            <div className="postmortem-review-label">
              {formatLabel(key)}
            </div>

            {renderValue(value)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="postmortem-form-card">

      {/* HEADER */}
      <div className="postmortem-form-header">

        <div>
          <span>SEMAKAN AKHIR</span>

          <h2>
            Semakan Laporan Post-Mortem
          </h2>

          <p>
            Sila semak semua maklumat sebelum
            menghantar laporan.
          </p>
        </div>

        <div className="postmortem-section-number">
          ✓
        </div>

      </div>

      {/* MAKLUMAT PENGGUNA */}
      <div className="postmortem-review-user">

        <div className="postmortem-review-user-field">
          <span>Nama Pengguna</span>
          <strong>
            {userProfile?.name || '-'}
          </strong>
        </div>

        <div className="postmortem-review-user-field">
          <span>ID Pengguna</span>
          <strong>
            {userProfile?.login_id || '-'}
          </strong>
        </div>

        <div className="postmortem-review-user-field">
          <span>Sukan</span>
          <strong>
            {userProfile?.sport || '-'}
          </strong>
        </div>

      </div>

      {/* SEMUA SECTION */}
      <div className="postmortem-review-page">

        {sectionData.map((section) => (

          <div
            className="postmortem-review-card"
            key={section.number}
          >

            {/* SECTION HEADER */}
            <div className="postmortem-review-card-header">

              <div className="postmortem-review-number">
                {section.number}
              </div>

              <div>
                <span>
                  BAHAGIAN {section.number}
                </span>

                <h3>
                  {section.title}
                </h3>
              </div>

            </div>

            {/* SECTION DATA */}
            {section.data ? (
              renderValue(section.data)
            ) : (
              <div className="postmortem-review-empty">
                Tiada data untuk bahagian ini.
              </div>
            )}

          </div>

        ))}

      </div>

      {/* NOTA */}
      <div className="postmortem-review-notice">

        <strong>
          Semakan Sebelum Hantar
        </strong>

        <p>
          Pastikan semua maklumat yang
          dimasukkan adalah tepat dan lengkap
          sebelum laporan dihantar.
        </p>

      </div>

      {/* BUTTON */}
      <div className="postmortem-review-footer">

        <button
          type="button"
          className="ewcc-secondary-button"
          onClick={onBack}
        >
          ← Kembali & Edit
        </button>

        <div className="postmortem-review-actions">

          <button
            type="button"
            className="ewcc-secondary-button"
            onClick={onSaveDraft}
            disabled={savingDraft}
          >
            {savingDraft
              ? 'Menyimpan...'
              : '💾 Simpan Draf'}
          </button>

          <button
            type="button"
            className="ewcc-primary-button"
            onClick={onSubmit}
          >
            ✓ Hantar Laporan
          </button>

        </div>

      </div>

    </section>
  )
}

export default PostMortemReview