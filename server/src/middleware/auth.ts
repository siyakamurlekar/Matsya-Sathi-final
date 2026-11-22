import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export interface AuthRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { sub: string }
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

export function requireRole(role: 'fisherman' | 'family' | 'jetty') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ error: 'Authentication required' })
    const { User } = await import('../models/User.js')
    const user = await User.findById(req.userId).select('role')
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.role !== role) return res.status(403).json({ error: `${role} role required` })
    next()
  }
}
