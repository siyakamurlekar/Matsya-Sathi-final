import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { subscribeRealtime } from '../services/realtime.js'

export const realtimeRouter = Router()

realtimeRouter.get('/events', (req, res) => {
  const token = typeof req.query.token === 'string' ? req.query.token : ''
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  let userId: string
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string }
    userId = payload.sub
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const unsubscribe = subscribeRealtime(userId, res)
  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 25000)
  req.on('close', () => {
    clearInterval(heartbeat)
    unsubscribe()
  })
})
