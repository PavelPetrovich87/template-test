import { Router } from 'express'
import healthRoutes from './health'
import leaderboardRoutes from './leaderboard'

const router = Router()

router.use('/api/health', healthRoutes)
router.use('/api/leaderboard', leaderboardRoutes)

export default router
