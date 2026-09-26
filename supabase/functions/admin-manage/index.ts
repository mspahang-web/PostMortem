// Admin-only actions that need the service role (auth user changes) or
// must bypass row-level security: edit/delete users, add/edit/delete sports.
//
// Deploy: Supabase Dashboard -> Edge Functions -> Deploy a new function,
// name it "admin-manage" and paste this file. SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are provided to Edge Functions automatically.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function reply(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function fail(message: string, status = 400) {
  return reply({ success: false, error: message }, status)
}

const SPORT_STATUSES = ['active', 'inactive']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return fail('Kaedah tidak dibenarkan.', 405)
  }

  // Service key: legacy name first, then the newer SUPABASE_SECRET_KEYS.
  let serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!serviceKey) {
    try {
      const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}')
      serviceKey = keys.default || Object.values(keys)[0] || ''
    } catch {
      serviceKey = ''
    }
  }

  if (!serviceKey) {
    return fail(
      'Kunci pelayan Supabase tidak tersedia untuk fungsi ini. ' +
        'Semak Edge Functions → Secrets (SUPABASE_SERVICE_ROLE_KEY).',
      500
    )
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    String(serviceKey),
    { auth: { persistSession: false } }
  )

  // ---- caller must be a signed-in admin ----
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  const { data: callerData, error: callerError } = await admin.auth.getUser(jwt)

  if (callerError || !callerData?.user) {
    return fail('Sesi tidak sah. Sila log masuk semula.', 401)
  }

  const callerId = callerData.user.id

  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', callerId)
    .maybeSingle()

  if (callerProfile?.role !== 'admin') {
    return fail('Hanya pentadbir boleh melakukan tindakan ini.', 403)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return fail('Data permintaan tidak sah.')
  }

  const action = String(body.action || '')

  try {
    switch (action) {
      // ================= USERS =================
      case 'user.update': {
        const userId = String(body.userId || '')
        const name = String(body.name || '').trim()
        const sport = String(body.sport || '').trim().toUpperCase()
        const password = body.password ? String(body.password) : ''

        if (!userId) return fail('Pengguna tidak dinyatakan.')
        if (!name) return fail('Sila masukkan Nama Pengguna.')
        if (password && password.length < 6) {
          return fail('Kata laluan mestilah sekurang-kurangnya 6 aksara.')
        }

        const { data: target } = await admin
          .from('profiles')
          .select('id, role, sport')
          .eq('id', userId)
          .maybeSingle()

        if (!target) return fail('Pengguna tidak dijumpai.', 404)

        if (target.role !== 'admin') {
          if (!sport) return fail('Sila pilih Sukan.')

          const { data: sportRow } = await admin
            .from('sports')
            .select('sport_code')
            .eq('sport_code', sport)
            .maybeSingle()

          if (!sportRow) return fail(`Sukan "${sport}" tidak wujud.`)
        }

        const profileUpdate: Record<string, unknown> = { name }
        if (target.role !== 'admin') profileUpdate.sport = sport

        const { error: profileError } = await admin
          .from('profiles')
          .update(profileUpdate)
          .eq('id', userId)

        if (profileError) return fail(profileError.message)

        // Keep the user's reports and equipment under their new sport.
        if (target.role !== 'admin' && sport !== target.sport) {
          await admin.from('postmortem_reports').update({ sport }).eq('user_id', userId)
          await admin.from('equipment_2028').update({ sport }).eq('user_id', userId)
        }

        if (password) {
          const { error: passwordError } =
            await admin.auth.admin.updateUserById(userId, { password })

          if (passwordError) return fail(passwordError.message)
        }

        return reply({ success: true })
      }

      case 'user.delete': {
        const userId = String(body.userId || '')

        if (!userId) return fail('Pengguna tidak dinyatakan.')
        if (userId === callerId) {
          return fail('Anda tidak boleh memadam akaun anda sendiri.')
        }

        const { data: target } = await admin
          .from('profiles')
          .select('id, role')
          .eq('id', userId)
          .maybeSingle()

        if (target?.role === 'admin') {
          return fail('Akaun pentadbir tidak boleh dipadam di sini.')
        }

        // Reports and equipment are kept for the record.
        const { error: profileError } = await admin
          .from('profiles')
          .delete()
          .eq('id', userId)

        if (profileError) return fail(profileError.message)

        const { error: authError } = await admin.auth.admin.deleteUser(userId)

        if (authError && !/not found/i.test(authError.message)) {
          return fail(authError.message)
        }

        return reply({ success: true })
      }

      // ================= SPORTS =================
      case 'sport.create': {
        const code = String(body.sportCode || '').trim().toUpperCase()
        const name = String(body.sportName || '').trim()
        const status = String(body.status || 'active')

        if (!/^[A-Z0-9_-]{2,20}$/.test(code)) {
          return fail('Kod Sukan mestilah 2–20 aksara (huruf, nombor, - atau _).')
        }
        if (!name) return fail('Sila masukkan Nama Sukan.')
        if (!SPORT_STATUSES.includes(status)) return fail('Status tidak sah.')

        const { data: existing } = await admin
          .from('sports')
          .select('id')
          .eq('sport_code', code)
          .maybeSingle()

        if (existing) return fail(`Kod Sukan "${code}" telah digunakan.`)

        const { error } = await admin
          .from('sports')
          .insert({ sport_code: code, sport_name: name, status })

        if (error) return fail(error.message)

        return reply({ success: true })
      }

      case 'sport.update': {
        const id = body.sportId
        const name = String(body.sportName || '').trim()
        const status = String(body.status || 'active')

        if (!id) return fail('Sukan tidak dinyatakan.')
        if (!name) return fail('Sila masukkan Nama Sukan.')
        if (!SPORT_STATUSES.includes(status)) return fail('Status tidak sah.')

        // The code is not editable: users, reports and equipment refer to it.
        const { error } = await admin
          .from('sports')
          .update({ sport_name: name, status })
          .eq('id', id)

        if (error) return fail(error.message)

        return reply({ success: true })
      }

      case 'sport.delete': {
        const id = body.sportId

        if (!id) return fail('Sukan tidak dinyatakan.')

        const { data: sportRow } = await admin
          .from('sports')
          .select('sport_code, sport_name')
          .eq('id', id)
          .maybeSingle()

        if (!sportRow) return fail('Sukan tidak dijumpai.', 404)

        const code = sportRow.sport_code

        const counts = await Promise.all(
          ['profiles', 'postmortem_reports', 'equipment_2028'].map(
            async (table) => {
              const { count } = await admin
                .from(table)
                .select('*', { count: 'exact', head: true })
                .eq('sport', code)
              return count || 0
            }
          )
        )

        const [users, reports, equipment] = counts

        if (users + reports + equipment > 0) {
          return fail(
            `Sukan "${sportRow.sport_name}" masih digunakan ` +
              `(${users} pengguna, ${reports} laporan, ${equipment} item peralatan). ` +
              'Pindahkan atau padam rekod tersebut dahulu, atau tukar status kepada Tidak Aktif.'
          )
        }

        const { error } = await admin.from('sports').delete().eq('id', id)

        if (error) return fail(error.message)

        return reply({ success: true })
      }

      // ================= IMPORT (Excel) =================
      case 'report.import': {
        const userId = String(body.userId || '')
        const sections = (body.sections || {}) as Record<string, unknown>
        const equipment = Array.isArray(body.equipment) ? body.equipment : []
        const replaceEquipment = body.replaceEquipment === true
        const overwriteSubmitted = body.overwriteSubmitted === true

        if (!userId) return fail('Pengguna tidak dinyatakan.')

        const { data: target } = await admin
          .from('profiles')
          .select('id, role, login_id, sport')
          .eq('id', userId)
          .maybeSingle()

        if (!target) return fail('Pengguna tidak dijumpai.', 404)
        if (target.role === 'admin') return fail('Laporan tidak boleh diimport ke akaun pentadbir.')

        const sectionColumns: Record<string, unknown> = {}
        for (let n = 1; n <= 13; n++) {
          if (sections[n] !== undefined && sections[n] !== null) {
            sectionColumns[`section_${n}`] = sections[n]
          }
        }

        const { data: existing } = await admin
          .from('postmortem_reports')
          .select('id, status')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        let reportId = existing?.id || null
        const now = new Date().toISOString()

        if (existing) {
          if (existing.status !== 'draft' && !overwriteSubmitted) {
            return fail(
              `Laporan sukan ini berstatus "${existing.status}". ` +
                'Sahkan penulisan ganti jika mahu meneruskan import.'
            )
          }

          const { error } = await admin
            .from('postmortem_reports')
            .update({ ...sectionColumns, updated_at: now })
            .eq('id', existing.id)

          if (error) return fail(error.message)
        } else {
          const { data: created, error } = await admin
            .from('postmortem_reports')
            .insert({
              ...sectionColumns,
              user_id: userId,
              login_id: target.login_id || '',
              sport: target.sport || null,
              status: 'draft',
              updated_at: now,
            })
            .select('id')
            .single()

          if (error) return fail(error.message)
          reportId = created.id
        }

        let equipmentCount = 0

        if (equipment.length > 0) {
          let startBil = 1

          if (replaceEquipment) {
            const { error } = await admin.from('equipment_2028').delete().eq('user_id', userId)
            if (error) return fail(error.message)
          } else {
            const { count } = await admin
              .from('equipment_2028')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
            startBil = (count || 0) + 1
          }

          const rows = equipment.map((item: Record<string, unknown>, index: number) => ({
            user_id: userId,
            login_id: target.login_id || '',
            sport: target.sport || null,
            bil: startBil + index,
            peralatan: String(item.peralatan || '').trim(),
            kuantiti: Number(item.kuantiti) || 1,
            spesifikasi_jenama: String(item.spesifikasi_jenama || '').trim(),
            kegunaan: String(item.kegunaan || '').trim(),
            keutamaan: ['Tinggi', 'Sederhana', 'Rendah'].includes(String(item.keutamaan))
              ? String(item.keutamaan)
              : 'Sederhana',
            anggaran_harga_seunit: Number(item.anggaran_harga_seunit) || 0,
            justifikasi_keperluan: String(item.justifikasi_keperluan || '').trim(),
            updated_at: now,
          }))

          const { error } = await admin.from('equipment_2028').insert(rows)
          if (error) return fail(`Laporan diimport, tetapi peralatan gagal disimpan: ${error.message}`)
          equipmentCount = rows.length
        }

        return reply({ success: true, reportId, equipmentCount })
      }

      default:
        return fail(`Tindakan "${action}" tidak dikenali.`)
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Ralat tidak diketahui.', 500)
  }
})
