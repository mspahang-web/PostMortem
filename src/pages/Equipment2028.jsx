import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getEquipmentAmount } from '../lib/equipment'
import '../styles/Equipment2028.css'
import { UserPageHero } from '../components/UserLayout'

const EMPTY_FORM = {
  peralatan: '',
  kuantiti: 1,
  spesifikasi_jenama: '',
  kegunaan: '',
  keutamaan: 'Sederhana',
  anggaran_harga_seunit: '',
  justifikasi_keperluan: '',
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('ms-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function Equipment2028({
  userProfile,
  onBack,
}) {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)

  const sportName =
    userProfile?.sport ||
    'Sukan'

  const loginId =
    userProfile?.login_id ||
    ''

  const totalAmount = useMemo(() => {
    return equipment.reduce(
      (total, item) =>
        total + getEquipmentAmount(item),
      0
    )
  }, [equipment])

  useEffect(() => {
    Promise.resolve().then(loadEquipment)
    // Load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error(
        'GET CURRENT USER ERROR:',
        error
      )

      return null
    }

    return user
  }

  async function loadEquipment() {
    try {
      setLoading(true)

      const user = await getCurrentUser()

      if (!user) {
        alert(
          'Sesi pengguna tidak dijumpai. Sila log masuk semula.'
        )
        return
      }

      const { data, error } = await supabase
        .from('equipment_2028')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: true,
        })

      if (error) {
        console.error(
          'LOAD EQUIPMENT ERROR:',
          error
        )

        alert(error.message)
        return
      }

      setEquipment(data || [])
    } catch (error) {
      console.error(error)

      alert(
        'Gagal memuatkan data peralatan.'
      )
    } finally {
      setLoading(false)
    }
  }

  function openAddForm() {
    setEditingId(null)

    setForm({
      ...EMPTY_FORM,
    })

    setShowForm(true)
  }

  function openEditForm(item) {
    setEditingId(item.id)

    setForm({
      peralatan:
        item.peralatan || '',

      kuantiti:
        item.kuantiti || 1,

      spesifikasi_jenama:
        item.spesifikasi_jenama || '',

      kegunaan:
        item.kegunaan || '',

      keutamaan:
        item.keutamaan || 'Sederhana',

      anggaran_harga_seunit:
        item.anggaran_harga_seunit ?? '',

      justifikasi_keperluan:
        item.justifikasi_keperluan || '',
    })

    setShowForm(true)
  }

  function closeForm() {
    if (saving) {
      return
    }

    setShowForm(false)
    setEditingId(null)
    setForm({
      ...EMPTY_FORM,
    })
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSave(event) {
    event.preventDefault()

    if (!form.peralatan.trim()) {
      alert(
        'Sila masukkan nama peralatan.'
      )
      return
    }

    if (
      !form.kuantiti ||
      Number(form.kuantiti) <= 0
    ) {
      alert(
        'Kuantiti mestilah lebih daripada 0.'
      )
      return
    }

    if (
      form.anggaran_harga_seunit === '' ||
      Number(form.anggaran_harga_seunit) < 0
    ) {
      alert(
        'Sila masukkan anggaran harga seunit.'
      )
      return
    }

    try {
      setSaving(true)

      const user =
        await getCurrentUser()

      if (!user) {
        alert(
          'Sesi pengguna telah tamat. Sila log masuk semula.'
        )
        return
      }

      /*
       * Bil hanya digunakan sebagai nombor susunan.
       * Nilai sebenar akan disusun semula
       * berdasarkan urutan rekod selepas disimpan.
       */
      const existingItem =
        editingId
          ? equipment.find(
              (item) =>
                item.id === editingId
            )
          : null

      const payload = {
        user_id: user.id,

        login_id: loginId,

        sport: sportName,

        bil:
          existingItem?.bil ||
          equipment.length + 1,

        peralatan:
          form.peralatan.trim(),

        kuantiti:
          Number(form.kuantiti),

        spesifikasi_jenama:
          form.spesifikasi_jenama.trim(),

        kegunaan:
          form.kegunaan.trim(),

        keutamaan:
          form.keutamaan,

        anggaran_harga_seunit:
          Number(
            form.anggaran_harga_seunit
          ),

        justifikasi_keperluan:
          form.justifikasi_keperluan.trim(),

        updated_at:
          new Date().toISOString(),
      }

      if (editingId) {
        const { error } =
          await supabase
            .from('equipment_2028')
            .update(payload)
            .eq('id', editingId)
            .eq('user_id', user.id)

        if (error) {
          console.error(
            'UPDATE EQUIPMENT ERROR:',
            error
          )

          alert(error.message)
          return
        }
      } else {
        const { error } =
          await supabase
            .from('equipment_2028')
            .insert(payload)

        if (error) {
          console.error(
            'INSERT EQUIPMENT ERROR:',
            error
          )

          alert(error.message)
          return
        }
      }

      closeForm()

      await loadEquipment()
      await normaliseBil()
    } catch (error) {
      console.error(error)

      alert(
        'Gagal menyimpan cadangan peralatan.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    const confirmed =
      window.confirm(
        `Padam cadangan "${item.peralatan}"?`
      )

    if (!confirmed) {
      return
    }

    try {
      const user =
        await getCurrentUser()

      if (!user) {
        alert(
          'Sesi pengguna tidak dijumpai.'
        )
        return
      }

      const { error } =
        await supabase
          .from('equipment_2028')
          .delete()
          .eq('id', item.id)
          .eq('user_id', user.id)

      if (error) {
        console.error(
          'DELETE EQUIPMENT ERROR:',
          error
        )

        alert(error.message)
        return
      }

      await loadEquipment()

      await normaliseBil()
    } catch (error) {
      console.error(error)

      alert(
        'Gagal memadam peralatan.'
      )
    }
  }

  async function normaliseBil() {
    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser()

    if (!user) {
      return
    }

    const { data, error } =
      await supabase
        .from('equipment_2028')
        .select('id, bil, created_at')
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: true,
        })

    if (error) {
      console.error(
        'NORMALISE BIL LOAD ERROR:',
        error
      )
      return
    }

    if (!data || data.length === 0) {
      return
    }

    for (
      let index = 0;
      index < data.length;
      index++
    ) {
      const expectedBil =
        index + 1

      if (
        data[index].bil !==
        expectedBil
      ) {
        const { error: updateError } =
          await supabase
            .from('equipment_2028')
            .update({
              bil: expectedBil,
            })
            .eq(
              'id',
              data[index].id
            )
            .eq(
              'user_id',
              user.id
            )

        if (updateError) {
          console.error(
            'NORMALISE BIL UPDATE ERROR:',
            updateError
          )
        }
      }
    }

    await loadEquipment()
  }

  const estimatedItemTotal =
    Number(form.kuantiti || 0) *
    Number(
      form.anggaran_harga_seunit || 0
    )

  return (
    <>

          {/* HEADER */}

          <UserPageHero
            eyebrow="SUKMA 2028 • CADANGAN PERALATAN"
            title="Cadangan Peralatan 2028"
            description="Masukkan cadangan peralatan yang diperlukan oleh sukan anda bagi persediaan SUKMA 2028."
            meta={[
              'SUKMA 2028',
              sportName,
            ]}
          />

          {/* INFO */}

          <section
            className="ewcc-kpi-grid"
          >

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-blue">
                🏅
              </div>

              <div>
                <span>
                  Sukan
                </span>

                <strong>
                  {sportName}
                </strong>

                <small>
                  Sukan Pengguna
                </small>
              </div>

            </div>

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-green">
                📦
              </div>

              <div>
                <span>
                  Jumlah Item
                </span>

                <strong>
                  {equipment.length}
                </strong>

                <small>
                  Cadangan peralatan
                </small>
              </div>

            </div>

            <div className="ewcc-kpi-card">

              <div className="kpi-icon kpi-orange">
                💰
              </div>

              <div>
                <span>
                  Jumlah Anggaran
                </span>

                <strong>
                  RM {formatCurrency(
                    totalAmount
                  )}
                </strong>

                <small>
                  Keseluruhan cadangan
                </small>
              </div>

            </div>

          </section>

          {/* SENARAI */}

          <section className="ewcc-section">

            <div
              className="ewcc-section-title"
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >

              <div>

                <span>
                  SENARAI PERALATAN
                </span>

                <h2>
                  Cadangan Peralatan
                </h2>

              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                }}
              >

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
                  onClick={
                    openAddForm
                  }
                >
                  + Tambah Peralatan
                </button>

              </div>

            </div>

            <div className="ewcc-status-card">

              {loading ? (

                <div
                  style={{
                    padding: 50,
                    textAlign: 'center',
                    color: '#8995a7',
                  }}
                >
                  Memuatkan data
                  peralatan...
                </div>

              ) : equipment.length ===
                0 ? (

                <div
                  style={{
                    padding: 50,
                    textAlign: 'center',
                  }}
                >

                  <div
                    style={{
                      fontSize: 38,
                      marginBottom: 12,
                    }}
                  >
                    📦
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      color: '#34445c',
                    }}
                  >
                    Belum ada
                    cadangan peralatan
                  </h3>

                  <p
                    style={{
                      color: '#8995a7',
                      marginTop: 8,
                    }}
                  >
                    Klik "Tambah
                    Peralatan" untuk
                    memasukkan keperluan
                    sukan anda.
                  </p>

                </div>

              ) : (

                <div
                  className="equipment-table-wrap"
                  style={{
                    width: '100%',
                    overflowX: 'auto',
                  }}
                >

                  <table
                    className="equipment-table"
                    style={{
                      width: '100%',
                      minWidth: 1300,
                      borderCollapse:
                        'collapse',
                    }}
                  >

                    <thead>

                      <tr
                        style={{
                          background:
                            '#f5f7fa',
                        }}
                      >

                        <th>
                          Bil
                        </th>

                        <th>
                          Peralatan
                        </th>

                        <th>
                          Kuantiti
                        </th>

                        <th>
                          Spesifikasi /
                          Jenama
                        </th>

                        <th>
                          Kegunaan
                        </th>

                        <th>
                          Keutamaan
                        </th>

                        <th>
                          Anggaran Harga
                          Seunit
                        </th>

                        <th>
                          Jumlah Anggaran
                        </th>

                        <th>
                          Justifikasi /
                          Keperluan
                        </th>

                        <th>
                          Tindakan
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {equipment.map(
                        (item, index) => (
                          <tr
                            key={
                              item.id
                            }
                          >

                            <td>
                              {index + 1}
                            </td>

                            <td>
                              <strong>
                                {
                                  item.peralatan
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                item.kuantiti
                              }
                            </td>

                            <td>
                              {
                                item
                                  .spesifikasi_jenama ||
                                '-'
                              }
                            </td>

                            <td>
                              {
                                item.kegunaan ||
                                '-'
                              }
                            </td>

                            <td>

                              <span
                                style={{
                                  display:
                                    'inline-block',
                                  padding:
                                    '5px 10px',
                                  borderRadius:
                                    20,
                                  background:
                                    item.keutamaan ===
                                    'Tinggi'
                                      ? '#fff0ed'
                                      : item.keutamaan ===
                                          'Sederhana'
                                        ? '#fff7e6'
                                        : '#eef5ff',
                                  color:
                                    item.keutamaan ===
                                    'Tinggi'
                                      ? '#c84b35'
                                      : item.keutamaan ===
                                          'Sederhana'
                                        ? '#b27600'
                                        : '#416fa3',
                                  fontSize: 11,
                                  fontWeight: 800,
                                }}
                              >
                                {
                                  item.keutamaan
                                }
                              </span>

                            </td>

                            <td>
                              RM{' '}
                              {formatCurrency(
                                item.anggaran_harga_seunit
                              )}
                            </td>

                            <td>

                              <strong>
                                RM{' '}
                                {formatCurrency(
                                  getEquipmentAmount(item)
                                )}
                              </strong>

                            </td>

                            <td>
                              {
                                item
                                  .justifikasi_keperluan ||
                                '-'
                              }
                            </td>

                            <td>

                              <div
                                style={{
                                  display:
                                    'flex',
                                  gap: 6,
                                  flexWrap:
                                    'wrap',
                                }}
                              >

                                <button
                                  type="button"
                                  className="ewcc-secondary-button"
                                  onClick={() =>
                                    openEditForm(
                                      item
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="ewcc-secondary-button"
                                  onClick={() =>
                                    handleDelete(
                                      item
                                    )
                                  }
                                >
                                  Padam
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                    <tfoot>

                      <tr
                        style={{
                          background:
                            '#fbfcfe',
                        }}
                      >

                        <td
                          colSpan="7"
                          style={{
                            textAlign:
                              'right',
                            fontWeight: 800,
                          }}
                        >
                          JUMLAH KESELURUHAN
                        </td>

                        <td
                          style={{
                            fontWeight: 900,
                            color: '#d96b00',
                          }}
                        >
                          RM{' '}
                          {formatCurrency(
                            totalAmount
                          )}
                        </td>

                        <td
                          colSpan="2"
                        ></td>

                      </tr>

                    </tfoot>

                  </table>

                </div>

              )}

            </div>

          </section>

          {/* FORM */}

          {showForm && (

            <div
              className="ewcc-modal-overlay"
            >

              <div
                className="ewcc-modal"
                data-equipment-form="true"
                style={{
                  maxWidth: 850,
                }}
              >

                <div
                  className="ewcc-modal-header"
                >

                  <div>

                    <h2>
                      {editingId
                        ? 'Edit Peralatan'
                        : 'Tambah Peralatan'}
                    </h2>

                    <p>
                      Cadangan Peralatan
                      2028 •{' '}
                      {sportName}
                    </p>

                  </div>

                  <button
                    type="button"
                    className="ewcc-modal-close"
                    onClick={
                      closeForm
                    }
                  >
                    ×
                  </button>

                </div>

                <form
                  onSubmit={
                    handleSave
                  }
                >

                  <div
                    className="ewcc-modal-body"
                  >

                    <div
                      className="equipment-form-grid equipment-form-grid-primary"
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          '2fr 1fr',
                        gap: 16,
                      }}
                    >

                      <div
                        className="ewcc-form-group"
                      >

                        <label>
                          Peralatan *
                        </label>

                        <input
                          type="text"
                          name="peralatan"
                          value={
                            form.peralatan
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Contoh: Raket Badminton"
                        />

                      </div>

                      <div
                        className="ewcc-form-group"
                      >

                        <label>
                          Kuantiti *
                        </label>

                        <input
                          type="number"
                          name="kuantiti"
                          min="1"
                          value={
                            form.kuantiti
                          }
                          onChange={
                            handleChange
                          }
                        />

                      </div>

                    </div>

                    <div
                      className="ewcc-form-group"
                    >

                      <label>
                        Spesifikasi /
                        Jenama
                      </label>

                      <input
                        type="text"
                        name="spesifikasi_jenama"
                        value={
                          form.spesifikasi_jenama
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Contoh: Yonex Astrox 100 ZZ"
                      />

                    </div>

                    <div
                      className="ewcc-form-group"
                    >

                      <label>
                        Kegunaan
                      </label>

                      <textarea
                        name="kegunaan"
                        value={
                          form.kegunaan
                        }
                        onChange={
                          handleChange
                        }
                        rows="3"
                        placeholder="Contoh: Latihan dan pertandingan"
                      />

                    </div>

                    <div
                      className="equipment-form-grid"
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          '1fr 1fr',
                        gap: 16,
                      }}
                    >

                      <div
                        className="ewcc-form-group"
                      >

                        <label>
                          Keutamaan *
                        </label>

                        <select
                          name="keutamaan"
                          value={
                            form.keutamaan
                          }
                          onChange={
                            handleChange
                          }
                        >

                          <option value="Tinggi">
                            Tinggi
                          </option>

                          <option value="Sederhana">
                            Sederhana
                          </option>

                          <option value="Rendah">
                            Rendah
                          </option>

                        </select>

                      </div>

                      <div
                        className="ewcc-form-group"
                      >

                        <label>
                          Anggaran Harga
                          Seunit *
                        </label>

                        <input
                          type="number"
                          name="anggaran_harga_seunit"
                          min="0"
                          step="0.01"
                          value={
                            form.anggaran_harga_seunit
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Contoh: 500"
                        />

                      </div>

                    </div>

                    <div
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        background:
                          '#f5f7fa',
                        marginBottom: 18,
                      }}
                    >

                      <span
                        style={{
                          display:
                            'block',
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#7d8a9d',
                          marginBottom: 5,
                        }}
                      >
                        JUMLAH ANGGARAN
                      </span>

                      <strong
                        style={{
                          fontSize: 22,
                          color: '#d96b00',
                        }}
                      >
                        RM{' '}
                        {formatCurrency(
                          estimatedItemTotal
                        )}
                      </strong>

                      <small
                        style={{
                          display:
                            'block',
                          color: '#8995a7',
                          marginTop: 5,
                        }}
                      >
                        Kuantiti × Anggaran
                        Harga Seunit
                      </small>

                    </div>

                    <div
                      className="ewcc-form-group"
                    >

                      <label>
                        Justifikasi /
                        Keperluan
                      </label>

                      <textarea
                        name="justifikasi_keperluan"
                        value={
                          form.justifikasi_keperluan
                        }
                        onChange={
                          handleChange
                        }
                        rows="4"
                        placeholder="Terangkan mengapa peralatan ini diperlukan untuk persediaan SUKMA 2028."
                      />

                    </div>

                  </div>

                  <div
                    className="ewcc-modal-footer"
                  >

                    <button
                      type="button"
                      className="ewcc-secondary-button"
                      onClick={
                        closeForm
                      }
                      disabled={saving}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="ewcc-primary-button"
                      disabled={saving}
                    >
                      {saving
                        ? 'Menyimpan...'
                        : editingId
                          ? 'Simpan Perubahan'
                          : 'Tambah Peralatan'}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

    </>
  )
}
