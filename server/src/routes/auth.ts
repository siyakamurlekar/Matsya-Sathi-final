import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { config } from '../config.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'

export const authRouter = Router()

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian number')
const roleSchema = z.enum(['fisherman', 'family', 'jetty'])

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  password: z.string().min(8).max(72),
  role: roleSchema,
  village: z.string().trim().max(120).optional(),
  boatName: z.string().trim().max(120).optional(),
})

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1).max(72),
  role: roleSchema.optional(),
})

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  village: z.string().trim().max(120).optional(),
  boatName: z.string().trim().max(120).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  nearbyRadiusKm: z.number().min(1).max(500).optional(),
})

function publicUser(user: InstanceType<typeof User>) {
  return {
    id: String(user._id),
    name: user.name,
    phone: user.phone,
    role: user.role,
    village: user.profile?.village || '',
    boatName: user.profile?.boatName || '',
    latitude: user.profile?.latitude ?? null,
    longitude: user.profile?.longitude ?? null,
    nearbyRadiusKm: user.profile?.nearbyRadiusKm ?? 25,
  }
}

function createToken(userId: string) {
  return jwt.sign({}, config.jwtSecret, { subject: userId, expiresIn: '7d' })
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body)
    const exists = await User.exists({ phone: input.phone })
    if (exists) return res.status(409).json({ error: 'An account already exists for this phone number' })

    const passwordHash = await bcrypt.hash(input.password, 12)
    const user = await User.create({
      name: input.name,
      phone: input.phone,
      passwordHash,
      role: input.role,
      profile: { village: input.village || '', boatName: input.boatName || '' },
    })

    return res.status(201).json({ token: createToken(String(user._id)), user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body)
    const user = await User.findOne({ phone: input.phone }).select('+passwordHash')
    if (!user) return res.status(401).json({ error: 'Invalid phone number or password' })
    if (input.role && user.role !== input.role) {
      return res.status(403).json({ error: 'This account belongs to a different role' })
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid phone number or password' })

    return res.json({ token: createToken(String(user._id)), user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({ user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

authRouter.patch('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const input = updateSchema.parse(req.body)
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (input.name !== undefined) user.name = input.name
    if (input.village !== undefined) user.profile.village = input.village
    if (input.boatName !== undefined) user.profile.boatName = input.boatName
    if (input.latitude !== undefined) user.profile.latitude = input.latitude
    if (input.longitude !== undefined) user.profile.longitude = input.longitude
    if (input.nearbyRadiusKm !== undefined) user.profile.nearbyRadiusKm = input.nearbyRadiusKm
    await user.save()

    return res.json({ user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})
