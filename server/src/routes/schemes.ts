import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { Scheme } from '../models/Scheme.js'

export const schemesRouter = Router()

const answerSchema = z.object({
  goaResident: z.boolean(),
  fisherman: z.boolean(),
  ownsBoat: z.boolean(),
  alreadyInsured: z.boolean(),
})

async function ensureDemoSchemes() {
  if (await Scheme.exists({})) return
  await Scheme.insertMany([
    {
      code: 'pmmsy',
      name: 'Pradhan Mantri Matsya Sampada Yojana',
      summary: 'Indicative fisheries development assistance for eligible beneficiaries.',
      office: 'Department of Fisheries, Goa',
      documents: ['Identity proof', 'Residence proof', 'Fisher registration', 'Boat documents'],
      criteria: { goaResident: false, fisherman: true, ownsBoat: true, alreadyInsured: false },
      sourceUrl: 'https://dof.gov.in/',
      lastVerifiedAt: new Date(),
    },
    {
      code: 'goa-fisher',
      name: 'Goa Fisher Community Welfare Scheme',
      summary: 'Indicative welfare support for registered fishing community members in Goa.',
      office: 'Department of Fisheries, Goa',
      documents: ['Identity proof', 'Goa residence proof', 'Fisher registration'],
      criteria: { goaResident: true, fisherman: true, ownsBoat: false, alreadyInsured: false },
      sourceUrl: 'https://fisheries.goa.gov.in/',
      lastVerifiedAt: new Date(),
    },
    {
      code: 'fish-insurance',
      name: 'Fisher Insurance Support',
      summary: 'Indicative insurance support for eligible registered fishermen.',
      office: 'Scheme implementation office',
      documents: ['Identity proof', 'Fisher registration', 'Bank account details'],
      criteria: { goaResident: false, fisherman: true, ownsBoat: false, alreadyInsured: false },
      sourceUrl: null,
      lastVerifiedAt: new Date(),
    },
  ])
}

schemesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    await ensureDemoSchemes()
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    const filter: Record<string, unknown> = { active: true }
    if (search) Object.assign(filter, { $text: { $search: search } })
    const schemes = await Scheme.find(filter).sort({ name: 1 }).limit(100)
    return res.json({
      schemes: schemes.map((scheme) => ({
        id: String(scheme._id),
        code: scheme.code,
        name: scheme.name,
        summary: scheme.summary,
        office: scheme.office,
        documents: scheme.documents,
        criteria: scheme.criteria,
        sourceUrl: scheme.sourceUrl || null,
        lastVerifiedAt: scheme.lastVerifiedAt.toISOString(),
      })),
    })
  } catch (error) {
    next(error)
  }
})

schemesRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const scheme = /^[a-f\d]{24}$/i.test(id)
      ? await Scheme.findOne({ _id: id, active: true })
      : await Scheme.findOne({ code: id, active: true })
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' })
    return res.json({
      scheme: {
        id: String(scheme._id),
        code: scheme.code,
        name: scheme.name,
        summary: scheme.summary,
        office: scheme.office,
        documents: scheme.documents,
        criteria: scheme.criteria,
        sourceUrl: scheme.sourceUrl || null,
        lastVerifiedAt: scheme.lastVerifiedAt.toISOString(),
      },
    })
  } catch (error) {
    next(error)
  }
})

schemesRouter.post('/match', requireAuth, async (req, res, next) => {
  try {
    await ensureDemoSchemes()
    const answers = answerSchema.parse(req.body)
    const schemes = await Scheme.find({ active: true }).sort({ name: 1 })
    const matches = schemes.filter((scheme) => {
      const criteria = scheme.criteria || {
        goaResident: false,
        fisherman: false,
        ownsBoat: false,
        alreadyInsured: false,
      }
      if (criteria.goaResident && !answers.goaResident) return false
      if (criteria.fisherman && !answers.fisherman) return false
      if (criteria.ownsBoat && !answers.ownsBoat) return false
      if (criteria.alreadyInsured && answers.alreadyInsured) return false
      return true
    })
    return res.json({
      matches: matches.map((scheme) => ({
        id: String(scheme._id),
        code: scheme.code,
        name: scheme.name,
        summary: scheme.summary,
        office: scheme.office,
        documents: scheme.documents,
        sourceUrl: scheme.sourceUrl || null,
        lastVerifiedAt: scheme.lastVerifiedAt.toISOString(),
      })),
    })
  } catch (error) {
    next(error)
  }
})
