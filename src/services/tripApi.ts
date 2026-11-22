import type { TripStatus } from '../store/tripStore'

export interface ApiTrip {
  id: string
  fisherId: string
  status: TripStatus
  active: boolean
  battery: number
  lastLocation: string
  lastLocationAt: string | null
  source: 'demo' | 'device' | 'server'
  startedAt: string | null
  lastUpdatedAt: string | null
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('matsya-api-token')
  const response = await fetch(`/api/trips${path}`, {
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

export function startTrip() {
  return request<{ trip: ApiTrip }>('', { method: 'POST' })
}

export function updateTripStatus(tripId: string, status: TripStatus, message?: string) {
  return request<{ trip: ApiTrip }>(`/${tripId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, message }),
  })
}

export function getCurrentTrip() {
  return request<{ trip: ApiTrip | null }>('/current')
}

export function getFamilyTrips() {
  return request<{ trips: ApiTrip[] }>('/family/current')
}

export function resetTrip() {
  return request<{ trip: ApiTrip | null }>('/current', { method: 'DELETE' })
}

export interface FamilyLink {
  fishermanId: string
  name: string
  phone: string
  boatName: string
}

export function linkFisherman(fishermanPhone: string) {
  return request<{ link: FamilyLink }>('/family-links', {
    method: 'POST',
    body: JSON.stringify({ fishermanPhone }),
  })
}

export function getFamilyLinks() {
  return request<{ links: FamilyLink[] }>('/family-links')
}
