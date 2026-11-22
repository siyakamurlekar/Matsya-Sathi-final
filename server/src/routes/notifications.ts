import { Router } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { Notification } from '../models/Notification.js'

export const notificationsRouter = Router()

notificationsRouter.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(100)
    return res.json({
      notifications: notifications.map((notification) => ({
        id: String(notification._id),
        tripId: notification.tripId ? String(notification.tripId) : null,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.readAt !== null,
        readAt: notification.readAt?.toISOString() || null,
        deliveryStatus: notification.deliveryStatus,
        createdAt: notification.createdAt?.toISOString() || null,
      })),
    })
  } catch (error) {
    next(error)
  }
})

notificationsRouter.patch('/:id/read', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { readAt: new Date(), deliveryStatus: 'acknowledged' },
      { new: true },
    )
    if (!notification) return res.status(404).json({ error: 'Notification not found' })
    return res.json({ notification: { id: String(notification._id), read: true, deliveryStatus: notification.deliveryStatus } })
  } catch (error) {
    next(error)
  }
})

notificationsRouter.post('/read-all', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.userId, readAt: null },
      { readAt: new Date(), deliveryStatus: 'acknowledged' },
    )
    return res.json({ updated: result.modifiedCount })
  } catch (error) {
    next(error)
  }
})
