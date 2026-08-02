import { supabase } from './supabaseClient'

export async function checkUrlReputation(url: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('check-url', {
      body: { url },
    })
    if (error) {
      console.warn('Safe Browsing check failed:', error.message)
      return false
    }
    return Boolean(data?.flagged)
  } catch (err) {
    console.warn('Safe Browsing check error:', err)
    return false
  }
}
