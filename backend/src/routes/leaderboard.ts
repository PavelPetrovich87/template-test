import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { ILeaderboardEntry, ILeaderboardResponse, LeaderboardType } from '../types/leaderboard'

interface IApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const router = Router()

const mockLeaderboards: Record<LeaderboardType, ILeaderboardEntry[]> = {
  weekly: [
    { rank: 1, username: 'NeuralAce', value: 1200, isCurrentUser: false },
    { rank: 2, username: 'CipherStar', value: 1150, isCurrentUser: true },
    { rank: 3, username: 'QuantumBlade', value: 1080, isCurrentUser: false }
  ],
  accuracy: [
    { rank: 1, username: 'PrecisionPulse', value: 98.5, isCurrentUser: false },
    { rank: 2, username: 'LaserFocus', value: 96.2, isCurrentUser: false },
    { rank: 3, username: 'CipherStar', value: 95.1, isCurrentUser: true }
  ],
  streak: [
    { rank: 1, username: 'DailyDriver', value: 42, isCurrentUser: false },
    { rank: 2, username: 'CipherStar', value: 35, isCurrentUser: true },
    { rank: 3, username: 'Momentum', value: 28, isCurrentUser: false }
  ]
}

const isLeaderboardType = (value: string): value is LeaderboardType => {
  return (['weekly', 'accuracy', 'streak'] as const).includes(value as LeaderboardType)
}

router.use(authenticate)

router.get(
  '/:type',
  (req: Request<{ type: string }>, res: Response<IApiResponse<ILeaderboardResponse>>): void => {
    const { type } = req.params

    if (!isLeaderboardType(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid leaderboard type'
      })
      return
    }

    const entries = mockLeaderboards[type]
    const currentUserEntry = entries.find(entry => entry.isCurrentUser)

    const leaderboard: ILeaderboardResponse = {
      type,
      entries,
      currentUserRank: currentUserEntry ? currentUserEntry.rank : undefined
    }

    res.status(200).json({
      success: true,
      data: leaderboard
    })
  }
)

export default router
