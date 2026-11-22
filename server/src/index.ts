import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { ZodError } from 'zod'
import { config } from './config.js'
import { authRouter } from './routes/auth.js'
import { tripsRouter } from './routes/trips.js'
import { seaRouter } from './routes/sea.js'
import { schemesRouter } from './routes/schemes.js'
import { notificationsRouter } from './routes/notifications.js'
import { realtimeRouter } from './routes/realtime.js'
import { refreshOpenMeteoSeaReading } from './services/openMeteo.js'

const app = express()
app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})
app.use('/api/auth', authRouter)
app.use('/api/trips', tripsRouter)
app.use('/api/sea', seaRouter)
app.use('/api/schemes', schemesRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/realtime', realtimeRouter)

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _next
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Invalid request',
      details: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    })
  }
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    return res.status(409).json({ error: 'A matching record already exists' })
  }
  console.error(error)
  return res.status(500).json({ error: 'Internal server error' })
})

async function start() {
  await mongoose.connect(config.mongoUri)
  refreshOpenMeteoSeaReading().catch((error) => console.error('Initial Open-Meteo refresh failed', error))
  setInterval(() => {
    refreshOpenMeteoSeaReading().catch((error) => console.error('Scheduled Open-Meteo refresh failed', error))
  }, 30 * 60000)
  app.listen(config.port, () => {
    console.log(`Matsya Sathi API listening on http://localhost:${config.port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start API', error)
  process.exit(1)
})
