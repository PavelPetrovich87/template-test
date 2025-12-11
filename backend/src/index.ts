import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { requestLogger } from './middleware/requestLogger'
import { env } from './config/env'

const app: Express = express()

app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
  credentials: true
}))
app.use(helmet())
app.use(express.json())
app.use(rateLimiter({ windowMs: 60000, max: 100 }))
app.use(requestLogger)

app.use(routes)

app.use(errorHandler)

const port: number = env.PORT

app.listen(port, (): void => {
  console.log(`Server is running on port ${port}`)
})





