import type { Response } from 'express'
import { randomUUID } from 'node:crypto'

type RealtimeClient = {
  userId: string
  response: Response
}

const clients = new Map<string, RealtimeClient>()

export function subscribeRealtime(userId: string, response: Response) {
  const clientId = randomUUID()
  clients.set(clientId, { userId, response })
  response.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`)
  return () => clients.delete(clientId)
}

export function publishRealtime(userId: string, event: string, data: unknown) {
  for (const [clientId, client] of clients) {
    if (client.userId !== userId) continue
    try {
      client.response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    } catch {
      clients.delete(clientId)
    }
  }
}
