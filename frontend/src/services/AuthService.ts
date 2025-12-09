import { supabase } from '@/src/config/supabase'

export const AuthService = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
  onAuthChange: (
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
  ) => supabase.auth.onAuthStateChange(callback),
}
