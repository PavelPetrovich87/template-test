import { Request, Response, NextFunction } from 'express'

interface RateLimitOptions {
  windowMs: number
  max: number
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const cleanup = (): void => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

setInterval(cleanup, 60000)

export const rateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max } = options

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      }
      next()
      return
    }

    if (store[key].count >= max) {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later'
        }
      })
      return
    }

    store[key].count++
    next()
  }
}
