export interface Session {
  id: string
  user_id: string
  started_at: string
}

export interface Trial {
  id: string
  session_id: string
}
