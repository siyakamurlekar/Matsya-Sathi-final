import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'
import { FamilyLink } from '../models/FamilyLink.js'
import { Trip, TRIP_STATUSES } from '../models/Trip.js'
import { TripEvent } from '../models/TripEvent.js'
import { User } from '../models/User.js'
import { Notification } from '../models/Notification.js'
import { publishRealtime } from '../services/realtime.js'
import { JettyResponse } from '../models/JettyResponse.js'

export const tripsRouter = Router()

const statusSchema = z.object({
  status: z.enum(TRIP_STATUSES.filter((status) => status !== 'IDLE')),
  message: z.string().trim().max(500).optional(),
})

const locationSchema = z.object({
  location: z.string().trim().min(1).max(250),
  battery: z.number().int().min(0).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
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
    latitude: trip.latitude ?? null,
    longitude: trip.longitude ?? null,
    source: trip.source,
    startedAt: trip.createdAt?.toISOString() || null,
    lastUpdatedAt: trip.updatedAt?.toISOString() || null,
  }
}

function distanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (degrees: number) => degrees * Math.PI / 180
  const earthRadiusKm = 6371
  const latitudeDelta = toRadians(latitudeB - latitudeA)
  const longitudeDelta = toRadians(longitudeB - longitudeA)
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
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
  const jettyUsers = await User.find({ role: 'jetty' }).select('_id')
  for (const jetty of jettyUsers) recipients.add(String(jetty._id))

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
        latitude: 15.2993,
        longitude: 74.124,
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
    if (input.latitude !== undefined) trip.latitude = input.latitude
    if (input.longitude !== undefined) trip.longitude = input.longitude
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

tripsRouter.get('/jetty/overview', requireAuth, requireRole('jetty'), async (req: AuthRequest, res, next) => {
  try {
    const jetty = await User.findById(req.userId).select('profile')
    const jettyLatitude = jetty?.profile?.latitude
    const jettyLongitude = jetty?.profile?.longitude
    const radiusKm = jetty?.profile?.nearbyRadiusKm ?? 25
    const trips = await Trip.find({ active: true }).populate('fisherId', 'name phone profile village').sort({ updatedAt: -1 })
    const tripIds = trips.map((trip) => trip._id)
    const responses = await JettyResponse.find({ tripId: { $in: tripIds }, jettyId: req.userId })
    const responseByTrip = new Map(responses.map((response) => [String(response.tripId), response]))

    const visibleTrips = trips.filter((trip) => {
      const emergency = trip.status === 'SOS_SENT' || trip.status === 'EMERGENCY_ACTIVE'
      if (!jettyLatitude || !jettyLongitude) return emergency
      if (trip.latitude == null || trip.longitude == null) return emergency
      const distance = distanceKm(jettyLatitude, jettyLongitude, trip.latitude, trip.longitude)
      return emergency || distance <= radiusKm
    })

    return res.json({
      configured: jettyLatitude != null && jettyLongitude != null,
      radiusKm,
      totalActive: trips.length,
      trips: visibleTrips.map((trip) => {
        const fisherman = trip.fisherId as unknown as InstanceType<typeof User>
        const response = responseByTrip.get(String(trip._id))
        const locationStale =
          trip.lastLocationAt == null ||
          Date.now() - trip.lastLocationAt.getTime() > 30 * 60000
        const distance =
          jettyLatitude != null &&
          jettyLongitude != null &&
          trip.latitude != null &&
          trip.longitude != null
            ? Math.round(distanceKm(jettyLatitude, jettyLongitude, trip.latitude, trip.longitude) * 10) / 10
            : null
        return {
          ...publicTrip(trip),
          distanceKm: distance,
          locationStale,
          fisherman: {
            id: String(fisherman._id),
            name: fisherman.name,
            phone: fisherman.phone,
            village: fisherman.profile?.village || '',
            boatName: fisherman.profile?.boatName || '',
          },
          jettyResponse: response ? {
            status: response.status,
            acknowledgedAt: response.acknowledgedAt?.toISOString() || null,
            familyContactedAt: response.familyContactedAt?.toISOString() || null,
            resolvedAt: response.resolvedAt?.toISOString() || null,
          } : {
            status: 'PENDING',
            acknowledgedAt: null,
            familyContactedAt: null,
            resolvedAt: null,
          },
        }
      }),
    })
  } catch (error) {
    next(error)
  }
})

tripsRouter.patch('/:id/jetty-response', requireAuth, requireRole('jetty'), async (req: AuthRequest, res, next) => {
  try {
    const input = z.object({
      status: z.enum(['ACKNOWLEDGED', 'FAMILY_CONTACTED', 'RESOLVED']),
    }).parse(req.body)
    const trip = await Trip.findById(req.params.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const now = new Date()
    const response = await JettyResponse.findOneAndUpdate(
      { tripId: trip._id, jettyId: req.userId },
      {
        tripId: trip._id,
        jettyId: req.userId,
        status: input.status,
        ...(input.status === 'ACKNOWLEDGED' ? { acknowledgedAt: now } : {}),
        ...(input.status === 'FAMILY_CONTACTED' ? { familyContactedAt: now } : {}),
        ...(input.status === 'RESOLVED' ? { resolvedAt: now } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    await Notification.create({
      userId: trip.fisherId,
      tripId: trip._id,
      type: 'SYSTEM',
      title: 'Jetty response updated',
      message: `Jetty status changed to ${input.status}`,
      deliveryStatus: 'delivered',
    })
    publishRealtime(String(trip.fisherId), 'trip:update', { tripId: String(trip._id), status: trip.status, jettyResponse: input.status })

    return res.json({
      response: {
        status: response.status,
        acknowledgedAt: response.acknowledgedAt?.toISOString() || null,
        familyContactedAt: response.familyContactedAt?.toISOString() || null,
        resolvedAt: response.resolvedAt?.toISOString() || null,
      },
    })
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
