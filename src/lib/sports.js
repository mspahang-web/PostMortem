import { supabase } from './supabase'

// Reports and profiles store the sport code (e.g. ESK); screens show the
// sport name (Esports). Loaded once at login, before any page renders.
let sportNames = {}

export async function loadSportNames() {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('sport_code, sport_name')

    if (error) {
      console.error('LOAD SPORT NAMES ERROR:', error)
      return
    }

    sportNames = Object.fromEntries(
      (data || [])
        .filter((sport) => sport.sport_code)
        .map((sport) => [
          String(sport.sport_code).toUpperCase(),
          sport.sport_name || sport.sport_code,
        ])
    )
  } catch (error) {
    console.error('UNEXPECTED LOAD SPORT NAMES ERROR:', error)
  }
}

// Sport name for a code; falls back to the code itself when unknown.
export function getSportName(code) {
  if (!code) {
    return ''
  }

  return sportNames[String(code).toUpperCase()] || code
}
