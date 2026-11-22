import mongoose, { InferSchemaType, Model } from 'mongoose'

const seaReadingSchema = new mongoose.Schema(
  {
    locationName: { type: String, required: true, trim: true, maxlength: 120 },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    windSpeedKph: { type: Number, required: true, min: 0 },
    waveHeightM: { type: Number, required: true, min: 0 },
    visibilityKm: { type: Number, required: true, min: 0 },
    sky: { type: String, required: true, trim: true, maxlength: 120 },
    advisory: { type: String, required: true, trim: true, maxlength: 500 },
    source: { type: String, required: true, trim: true, maxlength: 120 },
    sourceUrl: { type: String, trim: true, maxlength: 500 },
    observedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
)

seaReadingSchema.index({ latitude: 1, longitude: 1, observedAt: -1 })

export type SeaReadingDocument = InferSchemaType<typeof seaReadingSchema> & { _id: mongoose.Types.ObjectId }

export const SeaReading: Model<SeaReadingDocument> =
  mongoose.models.SeaReading || mongoose.model<SeaReadingDocument>('SeaReading', seaReadingSchema)
