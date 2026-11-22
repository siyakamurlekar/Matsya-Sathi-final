import mongoose, { InferSchemaType, Model } from 'mongoose'

export const TRIP_STATUSES = [
  'IDLE',
  'CHECK_IN',
  'TRIP_ACTIVE',
  'CONNECTIVITY_WEAK',
  'LORA_RELAY',
  'SOS_SENT',
  'EMERGENCY_ACTIVE',
  'SAFE_RETURN',
] as const

export type TripStatus = (typeof TRIP_STATUSES)[number]

const tripSchema = new mongoose.Schema(
  {
    fisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: TRIP_STATUSES, required: true, default: 'CHECK_IN' },
    active: { type: Boolean, required: true, default: true, index: true },
    battery: { type: Number, required: true, min: 0, max: 100, default: 92 },
    lastLocation: { type: String, trim: true, maxlength: 250, default: 'Not available' },
    lastLocationAt: { type: Date, default: null },
    source: { type: String, enum: ['demo', 'device', 'server'], default: 'demo' },
  },
  { timestamps: true },
)

tripSchema.index(
  { fisherId: 1, active: 1 },
  { unique: true, partialFilterExpression: { active: true } },
)

export type TripDocument = InferSchemaType<typeof tripSchema> & { _id: mongoose.Types.ObjectId }

export const Trip: Model<TripDocument> =
  mongoose.models.Trip || mongoose.model<TripDocument>('Trip', tripSchema)
