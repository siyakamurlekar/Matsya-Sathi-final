async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('matsya-api-token')
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({ error: 'Unexpected server response' }))
  if (!response.ok) throw new Error(body.error || 'Request failed')
  return body as T
}

export interface SeaData {
  reading: {
    locationName: string
    latitude: number
    longitude: number
    windSpeedKph: number
    waveHeightM: number
    visibilityKm: number
    sky: string
    advisory: string
    source: string
    sourceUrl: string | null
    observedAt: string
  } | null
  provenance: 'demo' | 'provider' | 'unavailable'
  stale: boolean
  message?: string
}

export interface SchemeData {
  id: string
  code: string
  name: string
  summary: string
  office: string
  documents: string[]
  sourceUrl: string | null
  lastVerifiedAt: string
}

export interface AppNotification {
  id: string
  tripId: string | null
  type: 'TRIP_UPDATE' | 'EMERGENCY' | 'SYSTEM' | 'SAFE_RETURN'
  title: string
  message: string
  read: boolean
  readAt: string | null
  deliveryStatus: 'pending' | 'delivered' | 'acknowledged' | 'failed'
  createdAt: string | null
}

export function getSeaConditions() {
  return request<SeaData>('/sea/current')
}

export function refreshSeaConditions() {
  return request<{ reading: unknown }>('/sea/refresh', { method: 'POST' })
}

export function getSchemes(search = '') {
  return request<{ schemes: SchemeData[] }>(`/schemes${search ? `?search=${encodeURIComponent(search)}` : ''}`)
}

export function matchSchemes(answers: {
  goaResident: boolean
  fisherman: boolean
  ownsBoat: boolean
  alreadyInsured: boolean
}) {
  return request<{ matches: SchemeData[] }>('/schemes/match', {
    method: 'POST',
    body: JSON.stringify(answers),
  })
}

export function getNotifications() {
  return request<{ notifications: AppNotification[] }>('/notifications')
}

export function markNotificationRead(id: string) {
  return request(`/notifications/${id}/read`, { method: 'PATCH' })
}

export function markAllNotificationsRead() {
  return request<{ updated: number }>('/notifications/read-all', { method: 'POST' })
}
