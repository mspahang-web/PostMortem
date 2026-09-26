import { useState, useEffect } from 'react'
import { UserPageHero } from '../../components/UserLayout'
import { supabase } from '../../lib/supabase'

import Section1MaklumatSukan from './Section1MaklumatSukan'
import Section2Persiapan from './Section2Persiapan'
import Section3Sasaran from './Section3Sasaran'
import Section4Teknikal from './Section4Teknikal'
import Section5Latihan from './Section5Latihan'
import Section6Faktor from './Section6Faktor'
import Section7Isu from './Section7Isu'
import Section8Bantahan from './Section8Bantahan'
import Section9Kejurulatihan from './Section9Kejurulatihan'
import Section10StatusAtlet from './Section10StatusAtlet'
import Section11Sukma2028 from './Section11Sukma2028'
import Section12Rumusan from './Section12Rumusan'
import Section13Pengesahan from './Section13Pengesahan'

import PostMortemReview from './PostMortemReview'


function PostMortem({
  userProfile,
  onBack,
}) {

  const [currentSection, setCurrentSection] = useState(1)

  const [section1Data, setSection1Data] = useState(null)
  const [section2Data, setSection2Data] = useState(null)
  const [section3Data, setSection3Data] = useState(null)
  const [section4Data, setSection4Data] = useState(null)
  const [section5Data, setSection5Data] = useState(null)
  const [section6Data, setSection6Data] = useState(null)
  const [section7Data, setSection7Data] = useState(null)
  const [section8Data, setSection8Data] = useState(null)
  const [section9Data, setSection9Data] = useState(null)
  const [section10Data, setSection10Data] = useState(null)
  const [section11Data, setSection11Data] = useState(null)
  const [section12Data, setSection12Data] = useState(null)
  const [section13Data, setSection13Data] = useState(null)

  const [reportId, setReportId] = useState(null)
  const [savingDraft, setSavingDraft] = useState(false)
  const [loadingDraft, setLoadingDraft] = useState(true)
  const [draftLoadError, setDraftLoadError] = useState(false)

  // =========================================================
  // SECTION 1
  // =========================================================

  const handleSection1Next = async (data) => {

    console.log('SECTION 1 DATA:', data)

    setSection1Data(data)

    const saved = await saveSection(1, data)

    if (!saved) return

    alert('Bahagian 1 berjaya disimpan.')

    setCurrentSection(2)
  }

  const handleSection1Back = () => {
    onBack()
  }


  // =========================================================
  // SECTION 2
  // =========================================================

  const handleSection2Next = async (data) => {

    console.log('SECTION 2 DATA:', data)

    setSection2Data(data)

    const saved = await saveSection(2, data)

    if (!saved) return

    alert('Bahagian 2 berjaya disimpan.')

    setCurrentSection(3)
  }

  const handleSection2Back = () => {
    setCurrentSection(1)
  }


  // =========================================================
  // SECTION 3
  // =========================================================

  const handleSection3Next = async (data) => {

    console.log('SECTION 3 DATA:', data)

    setSection3Data(data)

    const saved = await saveSection(3, data)

    if (!saved) return

    alert('Bahagian 3 berjaya disimpan.')

    setCurrentSection(4)
  }

  const handleSection3Back = () => {
    setCurrentSection(2)
  }


  // =========================================================
  // SECTION 4
  // =========================================================

  const handleSection4Next = async (data) => {

    console.log('SECTION 4 DATA:', data)

    setSection4Data(data)

    const saved = await saveSection(4, data)

    if (!saved) return

    alert('Bahagian 4 berjaya disimpan.')

    setCurrentSection(5)
  }

  const handleSection4Back = () => {
    setCurrentSection(3)
  }


  // =========================================================
  // SECTION 5
  // =========================================================

  const handleSection5Next = async (data) => {

    console.log('SECTION 5 DATA:', data)

    setSection5Data(data)

    const saved = await saveSection(5, data)

    if (!saved) return

    alert('Bahagian 5 berjaya disimpan.')

    setCurrentSection(6)
  }

  const handleSection5Back = () => {
    setCurrentSection(4)
  }


  // =========================================================
  // SECTION 6
  // =========================================================

  const handleSection6Next = async (data) => {

    console.log('SECTION 6 DATA:', data)

    setSection6Data(data)

    const saved = await saveSection(6, data)

    if (!saved) return

    alert('Bahagian 6 berjaya disimpan.')

    setCurrentSection(7)
  }

  const handleSection6Back = () => {
    setCurrentSection(5)
  }


  // =========================================================
  // SECTION 7
  // =========================================================

  const handleSection7Next = async (data) => {

    console.log('SECTION 7 DATA:', data)

    setSection7Data(data)

    const saved = await saveSection(7, data)

    if (!saved) return

    alert('Bahagian 7 berjaya disimpan.')

    setCurrentSection(8)
  }

  const handleSection7Back = () => {
    setCurrentSection(6)
  }


  // =========================================================
  // SECTION 8 - H
  // BANTAHAN / PROTES RASMI
  // =========================================================

  const handleSection8Next = async (data) => {

    console.log('SECTION 8 DATA:', data)

    setSection8Data(data)

    const saved = await saveSection(8, data)

    if (!saved) return

    alert('Bahagian 8 berjaya disimpan.')

    setCurrentSection(9)
  }

  const handleSection8Back = () => {
    setCurrentSection(7)
  }


  // =========================================================
  // SECTION 9 - I
  // PENILAIAN BARISAN KEJURULATIHAN
  // =========================================================

  const handleSection9Next = async (data) => {

    console.log('SECTION 9 DATA:', data)

    setSection9Data(data)

    const saved = await saveSection(9, data)

    if (!saved) return

    alert('Bahagian 9 berjaya disimpan.')

    setCurrentSection(10)
  }

  const handleSection9Back = () => {
    setCurrentSection(8)
  }


  // =========================================================
  // SECTION 10 - J
  // STATUS ATLET SELEPAS SUKMA
  // =========================================================

  const handleSection10Next = async (data) => {

    console.log('SECTION 10 DATA:', data)

    setSection10Data(data)

    const saved = await saveSection(10, data)

    if (!saved) return

    alert('Bahagian 10 berjaya disimpan.')

    setCurrentSection(11)
  }

  const handleSection10Back = () => {
    setCurrentSection(9)
  }


  // =========================================================
  // SECTION 11 - K
  // CADANGAN PROGRAM SUKMA 2028
  // =========================================================

  const handleSection11Next = async (data) => {

    console.log('SECTION 11 DATA:', data)

    setSection11Data(data)

    const saved = await saveSection(11, data)

    if (!saved) return

    alert('Bahagian 11 berjaya disimpan.')

    setCurrentSection(12)
  }

  const handleSection11Back = () => {
    setCurrentSection(10)
  }


  // =========================================================
  // SECTION 12 - L
  // RUMUSAN PASUKAN
  // =========================================================

  const handleSection12Next = async (data) => {

    console.log('SECTION 12 DATA:', data)

    setSection12Data(data)

    const saved = await saveSection(12, data)

    if (!saved) return

    alert('Bahagian 12 berjaya disimpan.')

    setCurrentSection(13)
  }

  const handleSection12Back = () => {
    setCurrentSection(11)
  }


  // =========================================================
  // SECTION 13 - M
  // PENGESAHAN
  // =========================================================

  const handleSection13Next = async (data) => {

    console.log('SECTION 13 DATA:', data)

    setSection13Data(data)

    const saved = await saveSection(13, data)

    if (!saved) return

    alert('Bahagian 13 berjaya disimpan.')

    setCurrentSection(14)
  }

  const handleSection13Back = () => {
    setCurrentSection(12)
  }


  // =========================================================
  // SAVE DRAFT
  // =========================================================

  const saveDraft = async () => {

    if (savingDraft) return

    setSavingDraft(true)

    try {

      const {
        data: {
          user
        },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {

        alert(
          'Sesi pengguna tidak sah. Sila log masuk semula.'
        )

        return
      }


      const payload = {

        user_id: user.id,

        login_id:
          userProfile?.login_id || '',

        sport:
          userProfile?.sport || null,

        status: 'draft',

        section_1: section1Data,
        section_2: section2Data,
        section_3: section3Data,
        section_4: section4Data,
        section_5: section5Data,
        section_6: section6Data,
        section_7: section7Data,
        section_8: section8Data,
        section_9: section9Data,
        section_10: section10Data,
        section_11: section11Data,
        section_12: section12Data,
        section_13: section13Data,

        updated_at:
          new Date().toISOString(),
      }


      let result


      if (reportId) {

        result = await supabase
          .from('postmortem_reports')
          .update(payload)
          .eq('id', reportId)
          .select()
          .single()

      } else {

        result = await supabase
          .from('postmortem_reports')
          .insert(payload)
          .select()
          .single()

      }


      if (result.error) {

        console.error(
          'SAVE DRAFT ERROR:',
          result.error
        )

        alert(
          'Gagal menyimpan laporan.\n\n' +
          result.error.message
        )

        return
      }


      setReportId(result.data.id)


      alert(
        'Draf laporan berjaya disimpan.'
      )

    } catch (error) {

      console.error(
        'SAVE DRAFT UNEXPECTED ERROR:',
        error
      )

      alert(
        'Berlaku masalah semasa menyimpan draf.'
      )

    } finally {

      setSavingDraft(false)

    }
  }


  // =========================================================
  // SUBMIT REPORT
  // =========================================================

  const submitReport = async () => {

    if (!reportId) {

      alert(
        'Laporan belum mempunyai rekod Draft. Sila simpan laporan terlebih dahulu.'
      )

      return
    }


    const sections = [

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

    ]


    const incompleteSection =
      sections.findIndex(
        (section) => !section
      )


    if (incompleteSection !== -1) {

      alert(
        `Bahagian ${incompleteSection + 1} belum lengkap.`
      )

      return
    }


    const confirmed =
      window.confirm(

        'Adakah anda pasti mahu menghantar laporan ini?\n\n' +

        'Selepas dihantar, laporan akan berstatus SUBMITTED dan tidak boleh diedit melalui akaun pengguna.'

      )


    if (!confirmed) {
      return
    }


    try {

      const {
        data: {
          user
        },
        error: userError
      } = await supabase.auth.getUser()


      if (userError || !user) {

        alert(
          'Sesi pengguna tidak sah. Sila log masuk semula.'
        )

        return
      }


      const {
        error
      } = await supabase.rpc(
        'submit_postmortem',
        {
          p_report_id: reportId,
        }
      )


      if (error) {

        console.error(
          'SUBMIT REPORT ERROR:',
          error
        )

        alert(
          'Gagal menghantar laporan.\n\n' +
          error.message
        )

        return
      }


      console.log(
        'LAPORAN BERJAYA DIHANTAR:',
        reportId
      )


      alert(
        'Laporan Post-Mortem berjaya dihantar.'
      )


      if (typeof onBack === 'function') {
        onBack()
      }


    } catch (error) {

      console.error(
        'SUBMIT REPORT UNEXPECTED ERROR:',
        error
      )

      alert(
        'Berlaku masalah semasa menghantar laporan.'
      )

    }
  }


  // =========================================================
  // LOAD DRAFT
  // =========================================================

  const loadDraft = async () => {

    try {

      const {
        data: {
          user
        },
        error: userError
      } = await supabase.auth.getUser()


      if (userError || !user) {

        console.error(
          'USER ERROR:',
          userError
        )

        setDraftLoadError(true)

        return
      }


      const {
        data,
        error
      } = await supabase

        .from('postmortem_reports')

        .select(`
          id,
          login_id,
          sport,
          status,
          section_1,
          section_2,
          section_3,
          section_4,
          section_5,
          section_6,
          section_7,
          section_8,
          section_9,
          section_10,
          section_11,
          section_12,
          section_13,
          created_at,
          updated_at
        `)

        .eq(
          'user_id',
          user.id
        )

        .eq(
          'status',
          'draft'
        )

        .order(
          'updated_at',
          {
            ascending: false
          }
        )

        .limit(1)

        .maybeSingle()


      if (error) {

        console.error(
          'LOAD DRAFT ERROR:',
          error
        )

        setDraftLoadError(true)

        return
      }


      if (!data) {

        console.log(
          'TIADA DRAFT'
        )

        return
      }


      console.log(
        'DRAFT DIJUMPAI:',
        data
      )


      setReportId(
        data.id
      )


      setSection1Data(
        data.section_1
      )

      setSection2Data(
        data.section_2
      )

      setSection3Data(
        data.section_3
      )

      setSection4Data(
        data.section_4
      )

      setSection5Data(
        data.section_5
      )

      setSection6Data(
        data.section_6
      )

      setSection7Data(
        data.section_7
      )

      setSection8Data(
        data.section_8
      )

      setSection9Data(
        data.section_9
      )

      setSection10Data(
        data.section_10
      )

      setSection11Data(
        data.section_11
      )

      setSection12Data(
        data.section_12
      )

      setSection13Data(
        data.section_13
      )


      setCurrentSection(1)


      return data


    } catch (error) {

      console.error(
        'LOAD DRAFT UNEXPECTED ERROR:',
        error
      )

      setDraftLoadError(true)

    } finally {
      setLoadingDraft(false)
    }
  }


  useEffect(() => {
    Promise.resolve().then(loadDraft)
  }, [])


  // =========================================================
  // SAVE INDIVIDUAL SECTION
  // =========================================================

  const saveSection = async (
    sectionNumber,
    data
  ) => {

    try {

      const {
        data: {
          user
        },
        error: userError
      } = await supabase.auth.getUser()


      if (userError || !user) {

        console.error(
          'USER ERROR:',
          userError
        )

        return false
      }


      const sectionColumn =
        `section_${sectionNumber}`


      const updateData = {

        [sectionColumn]: data,

        updated_at:
          new Date().toISOString(),

      }


      // =====================================================
      // REPORT ID SUDAH WUJUD
      // =====================================================

      if (reportId) {

        const {
          data: updatedReport,
          error
        } = await supabase

          .from('postmortem_reports')

          .update(updateData)

          .eq(
            'id',
            reportId
          )

          .eq(
            'user_id',
            user.id
          )
          .select('id')
          .maybeSingle()


        if (error || !updatedReport) {

          console.error(
            `SAVE SECTION ${sectionNumber} ERROR:`,
            error || 'Tiada rekod laporan dikemas kini.'
          )

          alert(
            error
              ? `Gagal menyimpan Bahagian ${sectionNumber}.\n\n${error.message}`
              : `Bahagian ${sectionNumber} tidak dikemas kini. Sila muat semula draf dan cuba lagi.`
          )

          return false
        }


        console.log(
          `BAHAGIAN ${sectionNumber} AUTO SAVED`
        )


        return true
      }


      // =====================================================
      // CARI DRAFT SEDIA ADA
      // =====================================================

      const {
        data: existingDraft,
        error: draftError
      } = await supabase

        .from('postmortem_reports')

        .select('id')

        .eq(
          'user_id',
          user.id
        )

        .eq(
          'status',
          'draft'
        )

        .order(
          'updated_at',
          {
            ascending: false
          }
        )

        .limit(1)

        .maybeSingle()


      if (draftError) {

        console.error(
          'CHECK EXISTING DRAFT ERROR:',
          draftError
        )

        return false
      }


      // =====================================================
      // UPDATE DRAFT SEDIA ADA
      // =====================================================

      if (existingDraft) {

        const {
          data: updatedReport,
          error
        } = await supabase

          .from('postmortem_reports')

          .update(updateData)

          .eq(
            'id',
            existingDraft.id
          )

          .eq(
            'user_id',
            user.id
          )
          .select('id')
          .maybeSingle()


        if (error || !updatedReport) {

          console.error(
            `UPDATE SECTION ${sectionNumber} ERROR:`,
            error || 'Tiada rekod laporan dikemas kini.'
          )

          alert(
            error
              ? `Bahagian ${sectionNumber} tidak dapat disimpan.\n\n${error.message}`
              : `Bahagian ${sectionNumber} tidak dikemas kini. Sila cuba semula.`
          )

          return false
        }


        setReportId(
          existingDraft.id
        )


        console.log(
          `BAHAGIAN ${sectionNumber} AUTO SAVED`
        )


        return true
      }


      // =====================================================
      // CIPTA DRAFT BARU
      // =====================================================

      const {
        data: newReport,
        error
      } = await supabase

        .from('postmortem_reports')

        .insert({

          user_id:
            user.id,

          login_id:
            userProfile?.login_id || '',

          sport:
            userProfile?.sport || null,

          status:
            'draft',

          [sectionColumn]:
            data,

        })

        .select('id')

        .single()


      if (error) {

        console.error(
          'CREATE DRAFT ERROR:',
          error
        )

        alert(
          'Gagal mencipta Draft.\n\n' +
          error.message
        )

        return false
      }


      setReportId(
        newReport.id
      )


      console.log(
        `DRAFT CREATED - SECTION ${sectionNumber}`
      )


      return true


    } catch (error) {

      console.error(
        `AUTO SAVE SECTION ${sectionNumber} ERROR:`,
        error
      )

      return false
    }
  }


  // =========================================================
  // JUMP TO SECTION
  // =========================================================

  const goToSection = (sectionNumber) => {

    if (sectionNumber === currentSection) return

    // Sections keep edits locally until "Simpan & Seterusnya",
    // so leaving one discards what hasn't been saved.
    if (currentSection <= 13) {
      const confirmed = window.confirm(
        `Pergi ke Bahagian ${sectionNumber}?\n\n` +
        `Maklumat yang belum disimpan dalam Bahagian ${currentSection} akan hilang. ` +
        'Tekan "Simpan & Seterusnya" dahulu jika mahu menyimpannya.'
      )

      if (!confirmed) return
    }

    setCurrentSection(sectionNumber)
  }


  // =========================================================
  // RENDER
  // =========================================================

  if (loadingDraft) {
    return (
      <div className="ewcc-loading-state" role="status" aria-live="polite">
        Memuatkan draf laporan...
      </div>
    )
  }

  if (draftLoadError) {
    return (
      <div className="ewcc-loading-state" role="alert">
        Draf tidak dapat dimuatkan. Kembali ke papan pemuka dan cuba lagi.
        <button className="ewcc-secondary-button" onClick={onBack}>
          Kembali ke papan pemuka
        </button>
      </div>
    )
  }

  return (

    <>

          <UserPageHero
            eyebrow="EWCC POST-MORTEM • BORANG LAPORAN"
            title="Laporan Post-Mortem"
            description="Lengkapkan laporan post-mortem secara berperingkat. Klik nombor bahagian untuk terus ke bahagian tersebut."
            meta={[
              'SUKMA XXII SELANGOR 2026 & PARA SUKMA SELANGOR 2026',
              userProfile?.sport || 'MAJLIS SUKAN PAHANG',
            ]}
          />


          {/* PROGRESS */}

          <div className="postmortem-progress">

            {Array.from(
              { length: 13 },
              (_, index) => {

                const sectionNumber =
                  index + 1

                return (

                  <button
                    type="button"
                    key={sectionNumber}
                    onClick={() =>
                      goToSection(sectionNumber)
                    }
                    aria-label={`Bahagian ${sectionNumber}`}
                    aria-current={
                      currentSection ===
                      sectionNumber
                        ? 'step'
                        : undefined
                    }
                    className={`
                      progress-mini-step
                      ${
                        currentSection >=
                        sectionNumber
                          ? 'active'
                          : ''
                      }
                      ${
                        currentSection ===
                        sectionNumber
                          ? 'current'
                          : ''
                      }
                    `}
                  >

                    <span>
                      {sectionNumber}
                    </span>

                  </button>

                )
              }
            )}

          </div>


          {/* SECTION 1 */}

          {currentSection === 1 && (

            <Section1MaklumatSukan
              userProfile={userProfile}
              initialData={section1Data}
              onNext={handleSection1Next}
              onBack={handleSection1Back}
            />

          )}


          {/* SECTION 2 */}

          {currentSection === 2 && (

            <Section2Persiapan
              initialData={section2Data}
              onNext={handleSection2Next}
              onBack={handleSection2Back}
            />

          )}


          {/* SECTION 3 */}

          {currentSection === 3 && (

            <Section3Sasaran
              initialData={section3Data}
              onNext={handleSection3Next}
              onBack={handleSection3Back}
            />

          )}


          {/* SECTION 4 */}

          {currentSection === 4 && (

            <Section4Teknikal
              initialData={section4Data}
              onNext={handleSection4Next}
              onBack={handleSection4Back}
            />

          )}


          {/* SECTION 5 */}

          {currentSection === 5 && (

            <Section5Latihan
              initialData={section5Data}
              onNext={handleSection5Next}
              onBack={handleSection5Back}
            />

          )}


          {/* SECTION 6 */}

          {currentSection === 6 && (

            <Section6Faktor
              initialData={section6Data}
              onNext={handleSection6Next}
              onBack={handleSection6Back}
            />

          )}


          {/* SECTION 7 */}

          {currentSection === 7 && (

            <Section7Isu
              initialData={section7Data}
              onNext={handleSection7Next}
              onBack={handleSection7Back}
            />

          )}


          {/* SECTION 8 - H */}

          {currentSection === 8 && (

            <Section8Bantahan
              initialData={section8Data}
              onNext={handleSection8Next}
              onBack={handleSection8Back}
            />

          )}


          {/* SECTION 9 - I */}

          {currentSection === 9 && (

            <Section9Kejurulatihan
              initialData={section9Data}
              onNext={handleSection9Next}
              onBack={handleSection9Back}
            />

          )}


          {/* SECTION 10 - J */}

          {currentSection === 10 && (

            <Section10StatusAtlet
              initialData={section10Data}
              onNext={handleSection10Next}
              onBack={handleSection10Back}
            />

          )}


          {/* SECTION 11 - K */}

          {currentSection === 11 && (

            <Section11Sukma2028
              initialData={section11Data}
              onNext={handleSection11Next}
              onBack={handleSection11Back}
            />

          )}


          {/* SECTION 12 - L */}

          {currentSection === 12 && (

            <Section12Rumusan
              initialData={section12Data}
              onNext={handleSection12Next}
              onBack={handleSection12Back}
            />

          )}


          {/* SECTION 13 - M */}

          {currentSection === 13 && (

            <Section13Pengesahan
              initialData={section13Data}
              onNext={handleSection13Next}
              onBack={handleSection13Back}
            />

          )}


          {/* SECTION 14 - REVIEW */}

          {currentSection === 14 && (

            <PostMortemReview

              userProfile={userProfile}

              section1Data={section1Data}
              section2Data={section2Data}
              section3Data={section3Data}
              section4Data={section4Data}
              section5Data={section5Data}
              section6Data={section6Data}
              section7Data={section7Data}
              section8Data={section8Data}
              section9Data={section9Data}
              section10Data={section10Data}
              section11Data={section11Data}
              section12Data={section12Data}
              section13Data={section13Data}

              onSaveDraft={saveDraft}
              savingDraft={savingDraft}

              onBack={() =>
                setCurrentSection(13)
              }

              onSubmit={submitReport}

              onComplete={onBack}

            />

          )}


    </>
  )
}

export default PostMortem
