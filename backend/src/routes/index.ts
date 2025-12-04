import { Router } from 'express'
import healthRoutes from './health'

const router = Router()

router.use('/api/health', healthRoutes)

export default router
