import mongoose, { InferSchemaType, Model } from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    village: { type: String, trim: true, maxlength: 120, default: '' },
    boatName: { type: String, trim: true, maxlength: 120, default: '' },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
    nearbyRadiusKm: { type: Number, min: 1, max: 500, default: 25 },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['fisherman', 'family', 'jetty'] },
    profile: { type: profileSchema, default: () => ({}) },
  },
  { timestamps: true },
)

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId }

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', userSchema)
