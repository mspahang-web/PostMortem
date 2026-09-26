// Login IDs (e.g. OLAHRAGA) map to the Supabase Auth email of the account.
// Used both when logging in and when the admin creates an account, so the
// two always agree.
//
// Sport accounts use VITE_LOGIN_EMAIL_TEMPLATE ({id} = lowercase login ID).
// Keep it an inbox MSP owns (e.g. mspahang+{id}@gmail.com) so Supabase
// emails (reset / magic link) can't reach a stranger.
export function getLoginEmail(loginId) {
  const normalizedLoginId = String(loginId || '').trim().toUpperCase()

  if (normalizedLoginId === 'ADMIN') {
    return 'mspahang@gmail.com'
  }

  const loginEmailTemplate =
    import.meta.env.VITE_LOGIN_EMAIL_TEMPLATE ||
    '{id}@gmail.com'

  return loginEmailTemplate.replace(
    '{id}',
    normalizedLoginId.toLowerCase()
  )
}
