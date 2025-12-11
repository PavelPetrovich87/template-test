import { NextFunction, Request, Response } from 'express'

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime.bigint()

  res.on('finish', (): void => {
    const end = process.hrtime.bigint()
    const durationMs = Number(end - start) / 1_000_000
    const method = req.method
    const path = req.originalUrl
    const status = res.statusCode

    console.log(`[${method}] ${path} - ${durationMs.toFixed(0)}ms - ${status}`)
  })

  next()
}
