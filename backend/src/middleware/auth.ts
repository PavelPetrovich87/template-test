import { Request, Response, NextFunction } from 'express'
import { jwtVerify, type JWTPayload } from 'jose'
import { env } from '../config/env'
import { CustomError } from './errorHandler'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role?: string
  }
}

export interface SupabaseJWTPayload extends JWTPayload {
  sub: string
  email: string
  role: string
  user_metadata: {
    username?: string
    role?: string
    [key: string]: unknown
  }
  app_metadata: {
    provider?: string
    [key: string]: unknown
  }
  iat: number
  exp: number
  aud: string
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

    if (!env.SUPABASE_JWT_SECRET) {
      throw new CustomError(500, 'CONFIG_ERROR', 'JWT secret not configured')
    }

    try {
      const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET)
      const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
      const supabasePayload = payload as SupabaseJWTPayload

      req.user = {
        userId: supabasePayload.sub,
        email: supabasePayload.email,
        role: supabasePayload.user_metadata?.role
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
