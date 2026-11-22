import mongoose, { InferSchemaType, Model } from 'mongoose'

const jettyResponseSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    jettyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACKNOWLEDGED', 'FAMILY_CONTACTED', 'RESOLVED'],
      required: true,
      default: 'PENDING',
    },
    acknowledgedAt: { type: Date, default: null },
    familyContactedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

jettyResponseSchema.index({ tripId: 1, jettyId: 1 }, { unique: true })

export type JettyResponseDocument = InferSchemaType<typeof jettyResponseSchema> & { _id: mongoose.Types.ObjectId }

export const JettyResponse: Model<JettyResponseDocument> =
  mongoose.models.JettyResponse || mongoose.model<JettyResponseDocument>('JettyResponse', jettyResponseSchema)
