import { getSupabaseClient } from '../config/supabase'
import { CustomError } from '../middleware/errorHandler'
import type { Session } from '../types/training'

export const SessionRepository = {
  findByUserId: async (userId: string): Promise<Session[]> => {
    const { data, error } = await getSupabaseClient()
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (error) {
      throw new CustomError(500, 'SESSION_FETCH_FAILED', `Failed to fetch sessions for user ${userId}: ${error.message}`)
    }

    return (data as Session[]) ?? []
  },

  createMany: async (sessions: Session[]): Promise<Session[]> => {
    const { data, error } = await getSupabaseClient()
      .from('sessions')
      .insert(sessions)
      .select()

    if (error) {
      throw new CustomError(500, 'SESSION_INSERT_FAILED', `Failed to insert sessions: ${error.message}`)
    }

    return (data as Session[]) ?? []
  },

  findById: async (id: string): Promise<Session | null> => {
    const { data, error } = await getSupabaseClient()
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new CustomError(500, 'SESSION_FETCH_FAILED', `Failed to fetch session ${id}: ${error.message}`)
    }

    return data as Session | null
  }
}
