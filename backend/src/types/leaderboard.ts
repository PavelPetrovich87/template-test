export type LeaderboardType = 'weekly' | 'accuracy' | 'streak'

export interface ILeaderboardEntry {
  rank: number
  username: string
  value: number
  isCurrentUser: boolean
}

export interface ILeaderboardResponse {
  type: LeaderboardType
  entries: ILeaderboardEntry[]
  currentUserRank?: number
}
