import { getSupabaseClient } from '../config/supabase'
import { CustomError } from '../middleware/errorHandler'
import type { Trial } from '../types/training'

export const TrialRepository = {
  createMany: async (trials: Trial[]): Promise<Trial[]> => {
    const { data, error } = await getSupabaseClient()
      .from('trials')
      .insert(trials)
      .select()

    if (error) {
      throw new CustomError(500, 'TRIAL_INSERT_FAILED', `Failed to insert trials: ${error.message}`)
    }

    return (data as Trial[]) ?? []
  },

  findBySessionId: async (sessionId: string): Promise<Trial[]> => {
    const { data, error } = await getSupabaseClient()
      .from('trials')
      .select('*')
      .eq('session_id', sessionId)

    if (error) {
      throw new CustomError(500, 'TRIAL_FETCH_FAILED', `Failed to fetch trials for session ${sessionId}: ${error.message}`)
    }

    return (data as Trial[]) ?? []
  }
}
