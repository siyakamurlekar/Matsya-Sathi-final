import mongoose, { InferSchemaType, Model } from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    type: {
      type: String,
      enum: ['TRIP_UPDATE', 'EMERGENCY', 'SYSTEM', 'SAFE_RETURN'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    readAt: { type: Date, default: null, index: true },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered', 'acknowledged', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

notificationSchema.index({ userId: 1, createdAt: -1 })

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & { _id: mongoose.Types.ObjectId }

export const Notification: Model<NotificationDocument> =
  mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', notificationSchema)
