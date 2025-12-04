import { Request, Response, NextFunction } from 'express'
import { jwtVerify } from 'jose'
import { env } from '../config/env'
import { CustomError } from './errorHandler'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role?: string
  }
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError(401, 'UNAUTHORIZED', 'Authentication required')
    }

    const token = authHeader.slice(7)

    if (!env.JWT_SECRET) {
      throw new CustomError(500, 'CONFIG_ERROR', 'JWT secret not configured')
    }

    try {
      const secret = new TextEncoder().encode(env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      req.user = {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string | undefined
      }

      next()
    } catch {
      throw new CustomError(401, 'UNAUTHORIZED', 'Invalid or expired token')
    }
  } catch (error) {
    next(error)
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      next(new CustomError(403, 'FORBIDDEN', 'Insufficient permissions'))
      return
    }
    next()
  }
}
