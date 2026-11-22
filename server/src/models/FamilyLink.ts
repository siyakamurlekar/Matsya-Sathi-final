import mongoose, { InferSchemaType, Model } from 'mongoose'

const familyLinkSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
)

familyLinkSchema.index({ familyId: 1, fisherId: 1 }, { unique: true })

export type FamilyLinkDocument = InferSchemaType<typeof familyLinkSchema> & { _id: mongoose.Types.ObjectId }

export const FamilyLink: Model<FamilyLinkDocument> =
  mongoose.models.FamilyLink || mongoose.model<FamilyLinkDocument>('FamilyLink', familyLinkSchema)
