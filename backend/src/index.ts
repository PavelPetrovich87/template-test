import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'
import { env } from './config/env'

const app: Express = express()

app.use(helmet())
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(routes)

app.use(errorHandler)

const port: number = env.PORT

app.listen(port, (): void => {
  console.log(`Server is running on port ${port}`)
})


