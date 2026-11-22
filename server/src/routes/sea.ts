import { Router } from 'express'
import { z } from 'zod'
import { config } from '../config.js'
import { requireAuth } from '../middleware/auth.js'
import { SeaReading } from '../models/SeaReading.js'
import { refreshOpenMeteoSeaReading } from '../services/openMeteo.js'

export const seaRouter = Router()

const updateSchema = z.object({
  locationName: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  windSpeedKph: z.number().min(0),
  waveHeightM: z.number().min(0),
  visibilityKm: z.number().min(0),
  sky: z.string().trim().min(1).max(120),
  advisory: z.string().trim().min(1).max(500),
  source: z.string().trim().min(1).max(120),
  sourceUrl: z.string().url().max(500).optional(),
  observedAt: z.string().datetime(),
})

seaRouter.get('/current', requireAuth, async (req, res, next) => {
  try {
    const reading = await SeaReading.findOne().sort({ observedAt: -1 })
    const staleBeforeRefresh = !reading || Date.now() - reading.observedAt.getTime() > 180 * 60000
    let currentReading = reading
    if (staleBeforeRefresh) {
      try {
        currentReading = await refreshOpenMeteoSeaReading()
      } catch (error) {
        console.error('Open-Meteo refresh failed', error)
      }
    }
    if (!currentReading) {
      return res.json({
        reading: null,
        provenance: 'unavailable',
        stale: true,
        message: 'No verified sea-condition reading is available.',
      })
    }

    const ageMinutes = (Date.now() - currentReading.observedAt.getTime()) / 60000
    return res.json({
      reading: {
        locationName: currentReading.locationName,
        latitude: currentReading.latitude,
        longitude: currentReading.longitude,
        windSpeedKph: currentReading.windSpeedKph,
        waveHeightM: currentReading.waveHeightM,
        visibilityKm: currentReading.visibilityKm,
        sky: currentReading.sky,
        advisory: currentReading.advisory,
        source: currentReading.source,
        sourceUrl: currentReading.sourceUrl || null,
        observedAt: currentReading.observedAt.toISOString(),
      },
      provenance: currentReading.source === 'Demo adapter' ? 'demo' : 'provider',
      stale: ageMinutes > 180,
    })
  } catch (error) {
    next(error)
  }
})

seaRouter.post('/provider', async (req, res, next) => {
  try {
    if (config.seaProviderKey && req.header('X-Provider-Key') !== config.seaProviderKey) {
      return res.status(401).json({ error: 'Invalid sea provider credential' })
    }
    const input = updateSchema.parse(req.body)
    const reading = await SeaReading.create({
      ...input,
      observedAt: new Date(input.observedAt),
    })
    return res.status(201).json({ reading })
  } catch (error) {
    next(error)
  }
})

seaRouter.post('/refresh', requireAuth, async (_req, res, next) => {
  try {
    const reading = await refreshOpenMeteoSeaReading()
    return res.status(201).json({
      reading,
      provenance: 'provider',
      sourceUrl: 'https://open-meteo.com/',
    })
  } catch (error) {
    next(error)
  }
})
