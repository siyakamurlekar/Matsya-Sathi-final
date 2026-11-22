import mongoose, { InferSchemaType, Model } from 'mongoose'
import { TRIP_STATUSES } from './Trip.js'

const tripEventSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    fisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: TRIP_STATUSES, required: true },
    message: { type: String, trim: true, maxlength: 500, default: '' },
    battery: { type: Number, min: 0, max: 100 },
    location: { type: String, trim: true, maxlength: 250 },
  },
  { timestamps: true },
)

tripEventSchema.index({ tripId: 1, createdAt: -1 })

export type TripEventDocument = InferSchemaType<typeof tripEventSchema> & { _id: mongoose.Types.ObjectId }

export const TripEvent: Model<TripEventDocument> =
  mongoose.models.TripEvent || mongoose.model<TripEventDocument>('TripEvent', tripEventSchema)
