import { IApiResponse, ILeaderboardResponse, LeaderboardType } from '@/src/types/leaderboard'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

export class LeaderboardServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LeaderboardServiceError'
  }
}

export const LeaderboardService = {
  fetchLeaderboard: async (
    type: LeaderboardType,
    accessToken: string
  ): Promise<ILeaderboardResponse> => {
    if (!accessToken) {
      throw new LeaderboardServiceError('Authentication required: No access token provided')
    }

    const url = `${API_BASE_URL}/api/leaderboard/${type}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new LeaderboardServiceError(
        `Failed to fetch leaderboard: ${response.status} ${response.statusText}. ${errorText}`
      )
    }

    const json: IApiResponse<ILeaderboardResponse> = await response.json()

    if (!json.success) {
      throw new LeaderboardServiceError(
        json.error || 'Failed to fetch leaderboard: API returned success=false'
      )
    }

    if (!json.data) {
      throw new LeaderboardServiceError('Failed to fetch leaderboard: No data in response')
    }

    return json.data
  },
}
