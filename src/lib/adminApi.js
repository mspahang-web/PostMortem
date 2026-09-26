import { supabase } from './supabase'

// Calls the "admin-manage" Edge Function (supabase/functions/admin-manage).
// Throws an Error with a readable Malay message when the action fails.
export async function adminManage(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('admin-manage', {
    body: { action, ...payload },
  })

  if (error) {
    // Non-2xx responses carry our { error } JSON in error.context.
    let message = error.message

    try {
      const body = await error.context?.json?.()
      if (body?.error) message = body.error
    } catch {
      // keep the generic message
    }

    // 404 = function not deployed; "Failed to send" = unreachable.
    if (
      error.context?.status === 404 ||
      /Failed to send a request/i.test(error.message)
    ) {
      message =
        'Fungsi "admin-manage" belum di-deploy di Supabase. ' +
        'Rujuk supabase/functions/admin-manage/index.ts.'
    }

    throw new Error(message)
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Ralat tidak diketahui.')
  }

  return data
}
