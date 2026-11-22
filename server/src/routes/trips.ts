import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'
import { FamilyLink } from '../models/FamilyLink.js'
import { Trip, TRIP_STATUSES } from '../models/Trip.js'
import { TripEvent } from '../models/TripEvent.js'
import { User } from '../models/User.js'
import { Notification } from '../models/Notification.js'
import { publishRealtime } from '../services/realtime.js'

export const tripsRouter = Router()

const statusSchema = z.object({
  status: z.enum(TRIP_STATUSES.filter((status) => status !== 'IDLE')),
  message: z.string().trim().max(500).optional(),
})

const locationSchema = z.object({
  location: z.string().trim().min(1).max(250),
  battery: z.number().int().min(0).max(100).optional(),
})

const linkSchema = z.object({
  fishermanPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit fisherman phone number'),
})

function publicTrip(trip: InstanceType<typeof Trip>) {
  return {
    id: String(trip._id),
    fisherId: String(trip.fisherId),
    status: trip.status,
    active: trip.active,
    battery: trip.battery,
    lastLocation: trip.lastLocation,
    lastLocationAt: trip.lastLocationAt?.toISOString() || null,
    source: trip.source,
    startedAt: trip.createdAt?.toISOString() || null,
    lastUpdatedAt: trip.updatedAt?.toISOString() || null,
  }
}

async function addEvent(trip: InstanceType<typeof Trip>, type: typeof TRIP_STATUSES[number], message = '') {
  await TripEvent.create({
    tripId: trip._id,
    fisherId: trip.fisherId,
    type,
    message,
    battery: trip.battery,
    location: trip.lastLocation,
  })
}

async function publishTripUpdate(trip: InstanceType<typeof Trip>, message: string) {
  const emergency = trip.status === 'SOS_SENT' || trip.status === 'EMERGENCY_ACTIVE'
  const type = trip.status === 'SAFE_RETURN' ? 'SAFE_RETURN' : emergency ? 'EMERGENCY' : 'TRIP_UPDATE'
  const recipients = new Set<string>([String(trip.fisherId)])
  const links = await FamilyLink.find({ fisherId: trip.fisherId }).select('familyId')
  for (const link of links) recipients.add(String(link.familyId))

  await Notification.insertMany(
    [...recipients].map((userId) => ({
      userId,
      tripId: trip._id,
      type,
      title: emergency ? 'Emergency trip update' : trip.status === 'SAFE_RETURN' ? 'Fisherman returned safely' : 'Trip status updated',
      message,
      deliveryStatus: 'delivered',
    })),
  )

  for (const userId of recipients) {
    publishRealtime(userId, 'trip:update', {
      tripId: String(trip._id),
      fisherId: String(trip.fisherId),
      status: trip.status,
      battery: trip.battery,
      lastLocation: trip.lastLocation,
      lastLocationAt: trip.lastLocationAt?.toISOString() || null,
      lastUpdatedAt: trip.updatedAt?.toISOString() || null,
    })
  }
}

tripsRouter.post('/', requireAuth, requireRole('fisherman'), async (req: AuthRequest, res, next) => {
  try {
    let trip = await Trip.findOne({ fisherId: req.userId, active: true })
    if (!trip) {
      trip = await Trip.create({
        fisherId: req.userId,
        status: 'CHECK_IN',
        active: true,
        battery: 92,
        lastLocation: 'Demo point · Arabian Sea, Goa',
        lastLocationAt: new Date(),
        source: 'demo',
      })
      await addEvent(trip, 'CHECK_IN', 'Trip started in demo mode')
      await publishTripUpdate(trip, 'Trip started with check-in status')
    }
    return res.status(trip.status === 'CHECK_IN' ? 201 : 200).json({ trip: publicTrip(trip) })
  } catch (error) {
    next(error)
  }
})

tripsRouter.patch('/:id/status', requireAuth, requireRole('fisherman'), async (req: AuthRequest, res, next) => {
  try {
    const input = statusSchema.parse(req.body)
    const trip = await Trip.findOne({ _id: req.params.id, fisherId: req.userId, active: true })
    if (!trip) return res.status(404).json({ error: 'Active trip not found' })

    trip.status = input.status
    if (input.status === 'LORA_RELAY') trip.battery = 71
    if (input.status === 'SAFE_RETURN') trip.battery = 64
    trip.updatedAt = new Date()
    await trip.save()
    await addEvent(trip, input.status, input.message)

    if (input.status === 'SAFE_RETURN') {
      trip.active = false
      await trip.save()
    }
    await publishTripUpdate(trip, input.message || `Trip status changed to ${input.status}`)
    return res.json({ trip: publicTrip(trip) })
  } catch (error) {
    next(error)
  }
})

tripsRouter.post('/:id/location', requireAuth, requireRole('fisherman'), async (req: AuthRequest, res, next) => {
  try {
    const input = locationSchema.parse(req.body)
    const trip = await Trip.findOne({ _id: req.params.id, fisherId: req.userId, active: true })
    if (!trip) return res.status(404).json({ error: 'Active trip not found' })

    trip.lastLocation = input.location
    trip.lastLocationAt = new Date()
    if (input.battery !== undefined) trip.battery = input.battery
    await trip.save()
    await publishTripUpdate(trip, 'Trip location or beacon data updated')
    return res.json({ trip: publicTrip(trip) })
  } catch (error) {
    next(error)
  }
})

tripsRouter.get('/current', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const trip = await Trip.findOne({ fisherId: req.userId, active: true }).sort({ updatedAt: -1 })
    return res.json({ trip: trip ? publicTrip(trip) : null })
  } catch (error) {
    next(error)
  }
})

tripsRouter.get('/family/current', requireAuth, requireRole('family'), async (req: AuthRequest, res, next) => {
  try {
    const links = await FamilyLink.find({ familyId: req.userId }).select('fisherId')
    const fisherIds = links.map((link) => link.fisherId)
    if (!fisherIds.length) return res.json({ trips: [] })

    const trips = await Trip.find({ fisherId: { $in: fisherIds }, active: true }).sort({ updatedAt: -1 })
    return res.json({ trips: trips.map(publicTrip) })
  } catch (error) {
    next(error)
  }
})

tripsRouter.get('/:id/events', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const familyLink = await FamilyLink.exists({ familyId: req.userId, fisherId: trip.fisherId })
    if (String(trip.fisherId) !== req.userId && !familyLink) {
      return res.status(403).json({ error: 'Not authorised to view this trip' })
    }
    const events = await TripEvent.find({ tripId: trip._id }).sort({ createdAt: -1 }).limit(100)
    return res.json({
      events: events.map((event) => ({
        id: String(event._id),
        type: event.type,
        message: event.message,
        battery: event.battery,
        location: event.location,
        createdAt: event.createdAt?.toISOString() || null,
      })),
    })
  } catch (error) {
    next(error)
  }
})

tripsRouter.delete('/current', requireAuth, requireRole('fisherman'), async (req: AuthRequest, res, next) => {
  try {
    const trip = await Trip.findOne({ fisherId: req.userId, active: true })
    if (!trip) return res.json({ trip: null })
    trip.status = 'SAFE_RETURN'
    trip.active = false
    trip.battery = 64
    await trip.save()
    await addEvent(trip, 'SAFE_RETURN', 'Demo trip reset safely')
    await publishTripUpdate(trip, 'Demo trip reset with safe return')
    return res.json({ trip: publicTrip(trip) })
  } catch (error) {
    next(error)
  }
})

tripsRouter.post('/family-links', requireAuth, requireRole('family'), async (req: AuthRequest, res, next) => {
  try {
    const input = linkSchema.parse(req.body)
    const fisherman = await User.findOne({ phone: input.fishermanPhone, role: 'fisherman' })
    if (!fisherman) return res.status(404).json({ error: 'Fisherman account not found' })

    await FamilyLink.findOneAndUpdate(
      { familyId: req.userId, fisherId: fisherman._id },
      { familyId: req.userId, fisherId: fisherman._id },
      { upsert: true, new: true },
    )
    return res.status(201).json({
      link: {
        fishermanId: String(fisherman._id),
        name: fisherman.name,
        phone: fisherman.phone,
        boatName: fisherman.profile?.boatName || '',
      },
    })
  } catch (error) {
    next(error)
  }
})

tripsRouter.get('/family-links', requireAuth, requireRole('family'), async (req: AuthRequest, res, next) => {
  try {
    const links = await FamilyLink.find({ familyId: req.userId }).populate('fisherId', 'name phone profile')
    return res.json({
      links: links.map((link) => {
        const fisherman = link.fisherId as unknown as InstanceType<typeof User>
        return {
          fishermanId: String(fisherman._id),
          name: fisherman.name,
          phone: fisherman.phone,
          boatName: fisherman.profile?.boatName || '',
        }
      }),
    })
  } catch (error) {
    next(error)
  }
})
