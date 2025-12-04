import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  isOperational?: boolean
}

export class CustomError extends Error implements AppError {
  statusCode: number
  code: string
  isOperational: boolean

  constructor(statusCode: number, code: string, message: string, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    Object.setPrototypeOf(this, CustomError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    })
    return
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  })
}
