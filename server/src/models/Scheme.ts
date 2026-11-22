import mongoose, { InferSchemaType, Model } from 'mongoose'

const schemeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, required: true, trim: true, maxlength: 1000 },
    office: { type: String, required: true, trim: true, maxlength: 200 },
    documents: [{ type: String, trim: true, maxlength: 200 }],
    criteria: {
      goaResident: { type: Boolean, required: true, default: false },
      fisherman: { type: Boolean, required: true, default: false },
      ownsBoat: { type: Boolean, required: true, default: false },
      alreadyInsured: { type: Boolean, required: true, default: false },
    },
    sourceUrl: { type: String, trim: true, maxlength: 500 },
    lastVerifiedAt: { type: Date, required: true },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true },
)

schemeSchema.index({ name: 'text', summary: 'text', code: 'text' })

export type SchemeDocument = InferSchemaType<typeof schemeSchema> & { _id: mongoose.Types.ObjectId }

export const Scheme: Model<SchemeDocument> =
  mongoose.models.Scheme || mongoose.model<SchemeDocument>('Scheme', schemeSchema)
